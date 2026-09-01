import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hammer, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/Shared'
import { useAllBuilds, useProjects, requestBuild } from '../db/hooks'

export default function Builds() {
  const builds = useAllBuilds()
  const projects = useProjects()
  const [expanded, setExpanded] = useState(null)
  const navigate = useNavigate()
  const loading = !builds || !projects

  function projectFor(projectId) {
    return (projects || []).find((p) => p.id === projectId)
  }

  return (
    <div>
      <PageHeader
        title="Build Center"
        description="Build history across all your launcher projects."
      />
      <div className="px-8 py-6">
        {!loading && builds.length === 0 && (
          <EmptyState
            icon={Hammer}
            title="No builds yet"
            description="Generate a launcher from a project's Build tab to see it appear here."
          />
        )}
        {!loading && builds.length > 0 && (
          <div className="border border-forge-border-soft rounded-lg divide-y divide-forge-border-soft">
            {builds.map((b) => {
              const project = projectFor(b.projectId)
              const isOpen = expanded === b.id
              return (
                <div key={b.id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : b.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-forge-panel text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <div>
                        <p className="text-sm font-medium">
                          {project ? project.name : 'Unknown project'}{' '}
                          <span className="text-forge-text-faint font-normal">· {b.id}</span>
                        </p>
                        <p className="text-[11.5px] text-forge-text-faint">
                          {new Date(b.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={b.status} />
                      {b.status === 'failed' && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            project && navigate(`/projects/${project.id}/build`)
                          }}
                          className="flex items-center gap-1 text-[12px] text-forge-ember-bright hover:underline"
                        >
                          <RotateCcw size={12} /> Retry
                        </span>
                      )}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pl-10">
                      <div className="rounded-md bg-forge-bg border border-forge-border-soft p-3 font-mono text-[11.5px] text-forge-text-dim space-y-1">
                        {b.log.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    succeeded: 'text-forge-copper-bright bg-forge-copper/10',
    failed: 'text-forge-danger bg-forge-danger/10',
    running: 'text-forge-warn bg-forge-warn/10',
    validating: 'text-forge-warn bg-forge-warn/10',
    queued: 'text-forge-text-faint bg-forge-panel-raised',
  }
  return (
    <span className={`text-[11px] capitalize px-2 py-0.5 rounded-full ${styles[status] || styles.queued}`}>
      {status}
    </span>
  )
}
