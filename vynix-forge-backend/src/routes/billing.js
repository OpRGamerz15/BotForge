const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const db = require('../lib/db');
const { getPlan } = require('../lib/plans');

const router = express.Router();

function getStripe(){
  if(!process.env.STRIPE_SECRET_KEY) return null;
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// ---- Checkout: FREE -> PRO, FREE -> DEV, PRO -> DEV ----
// Creates a REAL Stripe Checkout Session and returns its real URL. Does NOT
// change the user's plan -- that only happens in the webhook below, once
// Stripe confirms real payment.
router.post('/checkout/:targetPlan', requireAuth, async (req, res) => {
  const targetPlan = req.params.targetPlan;
  if(!['pro','dev'].includes(targetPlan)){
    return res.status(400).json({ error: 'Invalid target plan. Owner is never purchasable.' });
  }
  if(req.user.plan === 'owner'){
    return res.status(400).json({ error: 'Owner accounts do not need or use billing.' });
  }
  const plan = getPlan(targetPlan);
  const stripe = getStripe();
  if(!stripe || !plan.stripePriceId){
    return res.status(501).json({
      error: 'billing_not_configured',
      message: `Real checkout for ${plan.label} isn't live yet -- this deploy is missing STRIPE_SECRET_KEY and/or STRIPE_PRICE_ID_${targetPlan.toUpperCase()}. No payment can be faked here; this must be configured with a real Stripe account before ${plan.label} is purchasable.`
    });
  }

  try{
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      client_reference_id: String(req.user.id),
      success_url: (process.env.APP_URL || 'http://localhost:3000') + '/billing/success',
      cancel_url: (process.env.APP_URL || 'http://localhost:3000') + '/billing/cancel',
      metadata: { vynixUserId: String(req.user.id), targetPlan }
    });
    res.json({ checkoutUrl: session.url });
  }catch(e){
    res.status(502).json({ error: 'stripe_error', message: e.message });
  }
});

// ---- Customer portal: manage/cancel an existing subscription ----
router.post('/portal', requireAuth, async (req, res) => {
  const stripe = getStripe();
  if(!stripe) return res.status(501).json({ error: 'billing_not_configured' });
  const sub = db.db.prepare('SELECT * FROM subscriptions WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
  if(!sub || !sub.stripe_customer_id){
    return res.status(404).json({ error: 'No billing account on file for this user.' });
  }
  try{
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: (process.env.APP_URL || 'http://localhost:3000') + '/settings/billing'
    });
    res.json({ portalUrl: portal.url });
  }catch(e){
    res.status(502).json({ error: 'stripe_error', message: e.message });
  }
});

// ---- Real entitlement status (what the dashboard shows) ----
router.get('/status', requireAuth, (req, res) => {
  const sub = db.db.prepare('SELECT * FROM subscriptions WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
  res.json({
    plan: req.user.plan,
    storedPlan: req.user.storedPlan,
    subscription: sub ? {
      status: sub.status,
      billingPeriod: sub.billing_period,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end
    } : null
  });
});

// ---- Stripe webhook: the ONLY place a paid plan is actually granted ----
// Exported separately (not as part of `router`) because it MUST be mounted
// with express.raw({type:'application/json'}) BEFORE the global
// express.json() middleware in server.js -- Stripe's signature check needs
// the exact raw request bytes, and express.json() would have already
// consumed/parsed the stream by the time a route-level handler saw it.
async function webhookHandler(req, res){
  const stripe = getStripe();
  if(!stripe) return res.status(501).send('Billing not configured.');
  const sig = req.headers['stripe-signature'];
  let event;
  try{
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }catch(e){
    console.warn('[SECURITY] Rejected webhook with invalid signature:', e.message);
    return res.status(400).send('Invalid signature.');
  }

  try{
    if(event.type === 'checkout.session.completed'){
      const session = event.data.object;
      const userId = Number(session.client_reference_id || session.metadata.vynixUserId);
      const targetPlan = session.metadata.targetPlan;
      db.db.prepare(`INSERT INTO subscriptions (user_id, plan, stripe_customer_id, stripe_subscription_id, status, billing_period, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?)`).run(userId, targetPlan, session.customer, session.subscription, 'active', 'monthly', Date.now(), Date.now());
      db.setUserPlan(userId, targetPlan, userId, 'stripe checkout completed');
    }
    else if(event.type === 'customer.subscription.updated'){
      const sub = event.data.object;
      const row = db.db.prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id=?').get(sub.id);
      if(row){
        db.db.prepare('UPDATE subscriptions SET status=?, cancel_at_period_end=?, current_period_end=?, updated_at=? WHERE id=?')
          .run(sub.status, sub.cancel_at_period_end?1:0, sub.current_period_end*1000, Date.now(), row.id);
        if(sub.status !== 'active'){
          db.setUserPlan(row.user_id, 'free', 0, 'stripe subscription no longer active: '+sub.status);
        }
      }
    }
    else if(event.type === 'customer.subscription.deleted'){
      const sub = event.data.object;
      const row = db.db.prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id=?').get(sub.id);
      if(row){
        db.db.prepare('UPDATE subscriptions SET status=?, updated_at=? WHERE id=?').run('canceled', Date.now(), row.id);
        db.setUserPlan(row.user_id, 'free', 0, 'subscription canceled');
      }
    }
    res.json({ received: true });
  }catch(e){
    console.error('Webhook handling error:', e);
    res.status(500).send('Webhook handler error.');
  }
}

module.exports = { router, webhookHandler };
