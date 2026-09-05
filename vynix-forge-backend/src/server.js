require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { router: authRouter } = require('./routes/auth');
const { requireAuth } = require('./middleware/requireAuth');
const db = require('./lib/db');
const { getPlan } = require('./lib/plans');
const { getOwnerUserId } = require('./lib/ownerAuth');

const app = express();

// CRITICAL ORDERING: the Stripe webhook needs the raw request body to verify
// its signature, so it must be registered with express.raw() BEFORE the
// global express.json() middleware below -- otherwise json() would already
// have consumed/parsed the stream and signature verification would fail.
const { webhookHandler } = require('./routes/billing');
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), webhookHandler);

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
}));

app.use('/auth', authRouter);

// Sanity check at boot -- makes a misconfigured OWNER_USER_ID loudly visible
// rather than silently insecure.
if(!getOwnerUserId()){
  console.warn('=====================================================');
  console.warn(' OWNER_USER_ID is not set. No account will be Owner.');
  console.warn(' This is the SAFE default -- set it in .env once you');
  console.warn(' know your own GitHub numeric user ID.');
  console.warn('=====================================================');
}

app.get('/api/me', requireAuth, (req, res) => {
  const plan = getPlan(req.user.plan);
  res.json({
    githubLogin: req.user.githubLogin,
    plan: req.user.plan,
    storedPlan: req.user.storedPlan,
    isOwnerOverride: req.user.plan === 'owner' && req.user.storedPlan !== 'owner',
    limits: plan
  });
});

const projectsRouter = require('./routes/projects');
const buildsRouter = require('./routes/builds');
const { router: billingRouter } = require('./routes/billing');
const adminRouter = require('./routes/admin');
const webhooksRouter = require('./routes/webhooks');
const devApiKeyRouter = require('./routes/devApiKey');
app.use('/api/projects', projectsRouter);
app.use('/api/builds', buildsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/dev', devApiKeyRouter);

const swept = db.sweepInterruptedBuilds();
if(swept > 0) console.log(`Swept ${swept} build(s) interrupted by a previous restart into failed.`);

if(require.main === module){
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Vynix Forge backend listening on :${PORT}`));
}

module.exports = app;
