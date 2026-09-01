import Dexie from 'dexie'

// Vynix Forge is free-first: all project data lives in the browser via
// IndexedDB. Nothing here is synced to a server unless the user explicitly
// connects GitHub for builds/distribution.
export const db = new Dexie('vynix-forge')

db.version(1).stores({
  // Launcher projects. Each row is one launcher the user is building.
  projects: 'id, name, updatedAt',
  // Server configs, one-to-many with projects.
  servers: 'id, projectId, updatedAt',
  // Mod/file entries (mods, resourcepacks, shaderpacks, configs) per project.
  files: 'id, projectId, category, updatedAt',
  // Build records per project. Status is never fabricated — a build only
  // exists here once the user actually triggers one.
  builds: 'id, projectId, createdAt, status',
  // Release/update entries per project.
  releases: 'id, projectId, createdAt, channel',
})

export function newId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}${rand}`
}

export const defaultBranding = {
  primaryColor: '#c4632e',
  accentColor: '#5b7065',
  textColor: '#ede8e1',
  icon: null,
  logo: null,
  background: null,
  splash: null,
}

export const defaultIdentity = {
  launcherName: '',
  version: '0.1.0',
  publisher: '',
  description: '',
  website: '',
  discord: '',
}

export const defaultLayout = {
  sidebar: true,
  home: true,
  news: true,
  serverSelector: true,
  profile: true,
  settings: true,
  footer: true,
}

export const defaultFeatures = {
  news: true,
  serverStatus: true,
  discord: false,
  modManager: true,
  settings: true,
  updates: true,
  accountManagement: true,
}

export function createProjectSkeleton({ id, name, template }) {
  const now = Date.now()
  return {
    id,
    name,
    template: template || 'custom',
    createdAt: now,
    updatedAt: now,
    archived: false,
    identity: { ...defaultIdentity, launcherName: name },
    branding: { ...defaultBranding },
    layout: { ...defaultLayout },
    features: { ...defaultFeatures },
    minecraft: {
      version: '',
      loader: 'vanilla', // vanilla | fabric | forge | neoforge
      javaRequirement: '',
      ram: { min: 2048, max: 4096 },
    },
  }
}
