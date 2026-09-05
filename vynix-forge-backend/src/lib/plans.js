// Centralized plan configuration. Every part of the backend that needs to
// know what a plan can do reads from here -- nothing about limits should
// ever be hardcoded elsewhere (routes, middleware, admin tools all import
// this module).

const PLANS = {
  free: {
    id: 'free',
    label: 'Free',
    priceUsdPerMonth: 0,
    maxActiveProjects: 1,
    sourceExport: true,     // download the generated source folder
    cloudBuild: false,      // Vynix-run build via GitHub Actions
    productionExe: false,   // Dev-tier "production" Windows build
    apiAccess: false,
    webhooks: false,
    buildAutomation: false,
    priorityQueue: false,
    privateProjects: false,
    launcherHosting: false,
    storageMb: 0,
    maxBuildsPerDay: 3,       // still rate-limited even for the free "generate source" action
    purchasable: true,
    stripePriceId: null
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    priceUsdPerMonth: 4.99,
    maxActiveProjects: 10,          // "configurable" per spec -- this is the current default
    sourceExport: true,
    cloudBuild: true,
    productionExe: false,
    apiAccess: false,
    webhooks: false,
    buildAutomation: false,
    priorityQueue: true,
    privateProjects: true,
    launcherHosting: true,
    storageMb: 2048,
    maxBuildsPerDay: 30,
    purchasable: true,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || null
  },
  dev: {
    id: 'dev',
    label: 'Dev',
    priceUsdPerMonth: 9.99,
    maxActiveProjects: Infinity,
    sourceExport: true,
    cloudBuild: true,
    productionExe: true,
    apiAccess: true,
    webhooks: true,
    buildAutomation: true,
    priorityQueue: true,
    privateProjects: true,
    launcherHosting: true,
    storageMb: 10240,
    maxBuildsPerDay: 200,   // "unlimited... with infrastructure protection" -- this IS the protection
    purchasable: true,
    stripePriceId: process.env.STRIPE_PRICE_ID_DEV || null
  },
  owner: {
    id: 'owner',
    label: 'Owner',
    priceUsdPerMonth: null, // "$∞/sec" -- never charged, never purchasable
    maxActiveProjects: Infinity,
    sourceExport: true,
    cloudBuild: true,
    productionExe: true,
    apiAccess: true,
    webhooks: true,
    buildAutomation: true,
    priorityQueue: true,
    privateProjects: true,
    launcherHosting: true,
    storageMb: Infinity,
    maxBuildsPerDay: Infinity,
    purchasable: false,     // CANNOT be bought, ever, by anyone, at any price
    stripePriceId: null,
    isAdmin: true
  }
};

function getPlan(planId){
  return PLANS[planId] || PLANS.free;
}

function planAllows(planId, feature){
  const plan = getPlan(planId);
  return !!plan[feature];
}

module.exports = { PLANS, getPlan, planAllows };
