import { useLiveQuery } from 'dexie-react-hooks'
import { db, newId, createProjectSkeleton } from './db'

export function useProjects() {
  return useLiveQuery(
    () => db.projects.orderBy('updatedAt').reverse().toArray(),
    [],
    []
  )
}

export function useProject(id) {
  return useLiveQuery(() => (id ? db.projects.get(id) : undefined), [id])
}

export function useServersForProject(projectId) {
  return useLiveQuery(
    () =>
      projectId
        ? db.servers.where('projectId').equals(projectId).toArray()
        : [],
    [projectId],
    []
  )
}

export function useAllServers() {
  return useLiveQuery(() => db.servers.toArray(), [], [])
}

export function useFilesForProject(projectId, category) {
  return useLiveQuery(() => {
    if (!projectId) return []
    let q = db.files.where('projectId').equals(projectId)
    return q.toArray().then((rows) =>
      category ? rows.filter((r) => r.category === category) : rows
    )
  }, [projectId, category], [])
}

export function useBuildsForProject(projectId) {
  return useLiveQuery(
    () =>
      projectId
        ? db.builds
            .where('projectId')
            .equals(projectId)
            .reverse()
            .sortBy('createdAt')
        : [],
    [projectId],
    []
  )
}

export function useAllBuilds() {
  return useLiveQuery(
    () => db.builds.orderBy('createdAt').reverse().toArray(),
    [],
    []
  )
}

export function useReleasesForProject(projectId) {
  return useLiveQuery(
    () =>
      projectId
        ? db.releases.where('projectId').equals(projectId).toArray()
        : [],
    [projectId],
    []
  )
}

export async function createProject(name, template) {
  const id = newId('proj')
  const project = createProjectSkeleton({ id, name, template })
  await db.projects.add(project)
  return project
}

export async function duplicateProject(id) {
  const original = await db.projects.get(id)
  if (!original) return null
  const newProjectId = newId('proj')
  const now = Date.now()
  const copy = {
    ...original,
    id: newProjectId,
    name: `${original.name} copy`,
    createdAt: now,
    updatedAt: now,
    archived: false,
  }
  await db.projects.add(copy)

  const servers = await db.servers.where('projectId').equals(id).toArray()
  for (const s of servers) {
    await db.servers.add({ ...s, id: newId('srv'), projectId: newProjectId })
  }
  const files = await db.files.where('projectId').equals(id).toArray()
  for (const f of files) {
    await db.files.add({ ...f, id: newId('file'), projectId: newProjectId })
  }
  return copy
}

export async function archiveProject(id, archived = true) {
  await db.projects.update(id, { archived, updatedAt: Date.now() })
}

export async function deleteProject(id) {
  await db.transaction('rw', db.projects, db.servers, db.files, db.builds, db.releases, async () => {
    await db.projects.delete(id)
    await db.servers.where('projectId').equals(id).delete()
    await db.files.where('projectId').equals(id).delete()
    await db.builds.where('projectId').equals(id).delete()
    await db.releases.where('projectId').equals(id).delete()
  })
}

export async function updateProject(id, patch) {
  await db.projects.update(id, { ...patch, updatedAt: Date.now() })
}

export async function addServer(projectId, server) {
  const id = newId('srv')
  await db.servers.add({
    id,
    projectId,
    name: '',
    address: '',
    port: 25565,
    minecraftVersion: '',
    loader: 'vanilla',
    javaRequirement: '',
    ram: { min: 2048, max: 4096 },
    autoConnect: false,
    isDefault: false,
    updatedAt: Date.now(),
    ...server,
  })
  return id
}

export async function updateServer(id, patch) {
  await db.servers.update(id, { ...patch, updatedAt: Date.now() })
}

export async function deleteServer(id) {
  await db.servers.delete(id)
}

export async function addFile(projectId, file) {
  const id = newId('file')
  await db.files.add({
    id,
    projectId,
    category: 'required', // required | optional | resourcepack | shaderpack | config
    name: '',
    updatedAt: Date.now(),
    ...file,
  })
  return id
}

export async function deleteFile(id) {
  await db.files.delete(id)
}

export async function requestBuild(projectId) {
  const id = newId('build')
  await db.builds.add({
    id,
    projectId,
    createdAt: Date.now(),
    status: 'queued', // queued | validating | running | succeeded | failed
    log: ['Build queued.'],
    artifactName: null,
  })
  return id
}

export async function appendBuildLog(id, line, status) {
  const build = await db.builds.get(id)
  if (!build) return
  const patch = { log: [...build.log, line] }
  if (status) patch.status = status
  await db.builds.update(id, patch)
}
