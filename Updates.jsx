import { useState } from 'react'
import { RefreshCw, Plus } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/Shared'
import { useProjects } from '../db/hooks'
import { db, newId } from '../db/db'
import { useLiveQuery } from 'dexie-react-hooks'

const CHANNELS = ['stable', 'beta', 'development']

export default function Updates() {
  const projects = useProjects()
  const releases = useLiveQuery(() => db.releases.orderBy('createdAt').reverse().toArray(), [], [])
  const [projectId, setProjectId] = useState('')
  const [version, setVersion] = useState('')
  const [channel, setChannel] = useState('stable')
  const [notes, setNotes] = useState('')
  const loading = !projects || !releases

  const activeProjects = (projects || []).filter((p) => !p.archived)

  async function publish() {
    if (!projectId || !version.trim()) return
    await db.releases.add({
      id: newId('rel'),
      projectId,
      version: version.trim(),
      channel,
      notes,
      createdAt: Date.now(),
    })
    setVersion('')
    setNotes('')
  }

  function projectFor(id) {
    return (projects || []).find((p) => p.id === id)
  }

  return (
    <div>
      <PageHeader
        title="Updates"
        description="Publish release notes and manage version history for your launchers."
      />
      <div className="px-8 py-6 grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {!loading && (!releases || releases.length === 0) && (
            <EmptyState
              icon={RefreshCw}
              title="No releases published"
              description="Publish your first release using the form to the right."
            />
          )}
          {!loading && releases && releases.length > 0 && (
            <ul className="border border-forge-border-soft rounded-lg divide-y divide-forge-border-soft">
              {releases.map((r) => {
                const project = projectFor(r.projectId)
                return (
                  <li key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {project ? project.name : 'Unknown project'} · v{r.version}
                      </p>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-forge-panel-raised capitalize">
                        {r.channel}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-forge-text-faint mt-0.5">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                    {r.notes && <p className="text-[13px] mt-1.5">{r.notes}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border border-forge-border-soft rounded-lg p-4 space-y-3 h-fit">
          <h3 className="font-display font-medium text-sm">Publish a release</h3>
          {activeProjects.length === 0 ? (
            <p className="text-[12.5px] text-forge-text-faint">Create a launcher project first.</p>
          ) : (
            <>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-md border border-forge-border bg-forge-bg px-3 py-2 text-sm"
              >
                <option value="">Select a project…</option>
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Version, e.g. 1.1.0"
                className="w-full rounded-md border border-forge-border bg-forge-bg px-3 py-2 text-sm"
              />
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-md border border-forge-border bg-forge-bg px-3 py-2 text-sm capitalize"
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Release notes"
                rows={4}
                className="w-full rounded-md border border-forge-border bg-forge-bg px-3 py-2 text-sm resize-none"
              />
              <button
                onClick={publish}
                disabled={!projectId || !version.trim()}
                className="w-full flex items-center justify-center gap-1.5 rounded-md bg-forge-ember px-3 py-2 text-sm font-medium text-forge-bg disabled:opacity-40"
              >
                <Plus size={14} /> Publish release
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
