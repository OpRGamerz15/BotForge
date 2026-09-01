import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileBox } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/Shared'
import { useProjects } from '../db/hooks'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

const CATEGORY_LABELS = {
  required: 'Required mod',
  optional: 'Optional mod',
  resourcepack: 'Resource pack',
  shaderpack: 'Shaderpack',
  config: 'Config',
}

export default function Files() {
  const projects = useProjects()
  const allFiles = useLiveQuery(() => db.files.toArray(), [], [])
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()
  const loading = !projects || !allFiles

  function projectFor(projectId) {
    return (projects || []).find((p) => p.id === projectId)
  }

  const filtered = filter === 'all' ? allFiles || [] : (allFiles || []).filter((f) => f.category === filter)

  return (
    <div>
      <PageHeader
        title="Files"
        description="Mods, resource packs, shaderpacks, and configs across all projects."
      />
      <div className="px-8 py-6">
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          <TabButton active={filter === 'all'} onClick={() => setFilter('all')}>All</TabButton>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <TabButton key={key} active={filter === key} onClick={() => setFilter(key)}>
              {label}s
            </TabButton>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <EmptyState
            icon={FileBox}
            title="No files yet"
            description="Upload mods or import from Modrinth inside a launcher project's Mods tab."
          />
        )}

        {!loading && filtered.length > 0 && (
          <ul className="border border-forge-border-soft rounded-lg divide-y divide-forge-border-soft">
            {filtered.map((f) => {
              const project = projectFor(f.projectId)
              return (
                <li key={f.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm">{f.name}</p>
                    <p className="text-[11.5px] text-forge-text-faint">
                      {CATEGORY_LABELS[f.category] || f.category} ·{' '}
                      {f.source === 'modrinth' ? 'Modrinth' : 'Uploaded'}
                    </p>
                  </div>
                  <button
                    onClick={() => project && navigate(`/projects/${project.id}/mods`)}
                    className="text-[12.5px] text-forge-text-dim hover:text-forge-ember-bright"
                  >
                    {project ? project.name : 'Unknown project'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-[13px] transition-colors ${
        active ? 'bg-forge-panel-raised text-forge-text' : 'text-forge-text-dim hover:text-forge-text'
      }`}
    >
      {children}
    </button>
  )
}
