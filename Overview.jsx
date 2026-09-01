import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  FolderKanban,
  Server,
  Hammer,
  HardDrive,
  Plus,
  ArrowUpRight,
  Flame,
} from 'lucide-react'
import { PageHeader, EmptyState, StatBlock, Panel } from '../components/Shared'
import { useProjects, useAllServers, useAllBuilds } from '../db/hooks'
import NewProjectDialog from '../components/NewProjectDialog'

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function estimateStorage(projects, files) {
  // Rough, honest estimate based on serialized config size only — Vynix Forge
  // doesn't store binary mod files, so this is not a real disk-usage figure.
  const bytes = JSON.stringify(projects).length + JSON.stringify(files).length
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default function Overview() {
  const projects = useProjects()
  const servers = useAllServers()
  const builds = useAllBuilds()
  const [showNewProject, setShowNewProject] = useState(false)
  const navigate = useNavigate()

  const loading = !projects || !servers || !builds
  const activeProjects = (projects || []).filter((p) => !p.archived)
  const recentBuilds = (builds || []).slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Everything happening across your launcher projects, in one place."
        action={
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-1.5 rounded-md bg-forge-ember px-3.5 py-2 text-sm font-medium text-forge-bg"
          >
            <Plus size={15} strokeWidth={2.5} />
            New launcher
          </button>
        }
      />

      <div className="px-8 py-6 space-y-8">
        {!loading && (
          <div className="grid grid-cols-4 gap-3">
            <StatBlock label="Active launchers" value={activeProjects.length} />
            <StatBlock label="Servers configured" value={(servers || []).length} />
            <StatBlock
              label="Builds run"
              value={(builds || []).length}
            />
            <StatBlock
              label="Local storage used"
              value={estimateStorage(projects || [], [])}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <Panel
            title="Recent projects"
            action={
              <button
                onClick={() => navigate('/projects')}
                className="text-[12.5px] text-forge-text-dim hover:text-forge-text flex items-center gap-1"
              >
                View all <ArrowUpRight size={12} />
              </button>
            }
          >
            {activeProjects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="Create your first launcher"
                description="Every launcher starts as a project you can customize, build, and export."
                action={
                  <button
                    onClick={() => setShowNewProject(true)}
                    className="text-sm font-medium text-forge-ember-bright hover:underline"
                  >
                    New launcher →
                  </button>
                }
              />
            ) : (
              <ul className="divide-y divide-forge-border-soft">
                {activeProjects.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => navigate(`/projects/${p.id}/identity`)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-forge-panel"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-[11.5px] text-forge-text-faint">
                          {p.minecraft?.version || 'No Minecraft version set'} ·{' '}
                          {p.minecraft?.loader}
                        </p>
                      </div>
                      <span className="text-[11.5px] text-forge-text-faint">
                        {timeAgo(p.updatedAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Recent builds"
            action={
              <button
                onClick={() => navigate('/builds')}
                className="text-[12.5px] text-forge-text-dim hover:text-forge-text flex items-center gap-1"
              >
                View all <ArrowUpRight size={12} />
              </button>
            }
          >
            {recentBuilds.length === 0 ? (
              <EmptyState
                icon={Hammer}
                title="No builds yet"
                description="Builds appear here once you generate and build a launcher project."
              />
            ) : (
              <ul className="divide-y divide-forge-border-soft">
                {recentBuilds.map((b) => (
                  <li key={b.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusDot status={b.status} />
                      <span className="text-sm">{b.id}</span>
                    </div>
                    <span className="text-[11.5px] text-forge-text-faint capitalize">
                      {b.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel title="Quick actions">
          <div className="grid grid-cols-3 divide-x divide-forge-border-soft">
            <QuickAction
              icon={Plus}
              label="New launcher"
              onClick={() => setShowNewProject(true)}
            />
            <QuickAction
              icon={Server}
              label="Configure a server"
              onClick={() => navigate('/servers')}
            />
            <QuickAction
              icon={Hammer}
              label="Open Build Center"
              onClick={() => navigate('/builds')}
            />
          </div>
        </Panel>

        <div className="flex items-start gap-2.5 text-[12px] text-forge-text-faint border border-forge-border-soft rounded-lg px-4 py-3">
          <Flame size={14} className="mt-0.5 shrink-0" />
          <p>
            Vynix Forge stores your projects locally in this browser (IndexedDB).
            Nothing is uploaded anywhere unless you connect GitHub for builds or
            export a project yourself.
          </p>
        </div>
      </div>

      {showNewProject && <NewProjectDialog onClose={() => setShowNewProject(false)} />}
    </div>
  )
}

function StatusDot({ status }) {
  const color =
    status === 'succeeded'
      ? 'bg-forge-copper-bright'
      : status === 'failed'
      ? 'bg-forge-danger'
      : status === 'running' || status === 'validating'
      ? 'bg-forge-warn'
      : 'bg-forge-text-faint'
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 px-4 py-4 hover:bg-forge-panel text-left"
    >
      <Icon size={16} className="text-forge-ember-bright" />
      <span className="text-[13px]">{label}</span>
    </button>
  )
}
