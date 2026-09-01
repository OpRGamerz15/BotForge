import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Plus, MoreVertical, Copy, Archive, Trash2, Download, ArchiveRestore } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/Shared'
import { useProjects, duplicateProject, archiveProject, deleteProject } from '../db/hooks'
import NewProjectDialog from '../components/NewProjectDialog'

export default function Projects() {
  const projects = useProjects()
  const [showNewProject, setShowNewProject] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const navigate = useNavigate()

  const loading = !projects
  const visible = (projects || []).filter((p) => (showArchived ? p.archived : !p.archived))

  async function handleExport(project) {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.vynix.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Every launcher you're building, with full configuration control."
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

      <div className="px-8 py-6">
        <div className="flex items-center gap-1 mb-4">
          <TabButton active={!showArchived} onClick={() => setShowArchived(false)}>
            Active
          </TabButton>
          <TabButton active={showArchived} onClick={() => setShowArchived(true)}>
            Archived
          </TabButton>
        </div>

        {!loading && visible.length === 0 && (
          <EmptyState
            icon={FolderKanban}
            title={showArchived ? 'No archived launchers' : 'Create your first launcher'}
            description={
              showArchived
                ? 'Launchers you archive will show up here.'
                : 'Every launcher starts as a project you can customize, build, and export.'
            }
            action={
              !showArchived && (
                <button
                  onClick={() => setShowNewProject(true)}
                  className="text-sm font-medium text-forge-ember-bright hover:underline"
                >
                  New launcher →
                </button>
              )
            }
          />
        )}

        {visible.length > 0 && (
          <div className="border border-forge-border-soft rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-forge-border-soft text-left text-[11.5px] text-forge-text-faint">
                  <th className="font-normal px-4 py-2.5">Name</th>
                  <th className="font-normal px-4 py-2.5">Minecraft</th>
                  <th className="font-normal px-4 py-2.5">Loader</th>
                  <th className="font-normal px-4 py-2.5">Template</th>
                  <th className="font-normal px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forge-border-soft">
                {visible.map((p) => (
                  <tr key={p.id} className="hover:bg-forge-panel">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/projects/${p.id}/identity`)}
                        className="font-medium text-left hover:text-forge-ember-bright"
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-forge-text-dim">
                      {p.minecraft?.version || '—'}
                    </td>
                    <td className="px-4 py-3 text-forge-text-dim capitalize">
                      {p.minecraft?.loader || '—'}
                    </td>
                    <td className="px-4 py-3 text-forge-text-dim capitalize">
                      {p.template.replace('-', ' ')}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                        className="text-forge-text-dim hover:text-forge-text p-1"
                      >
                        <MoreVertical size={15} />
                      </button>
                      {menuOpenId === p.id && (
                        <div className="absolute right-4 top-9 z-10 w-44 rounded-md border border-forge-border bg-forge-panel-raised shadow-lg py-1">
                          <MenuItem
                            icon={Copy}
                            label="Duplicate"
                            onClick={async () => {
                              await duplicateProject(p.id)
                              setMenuOpenId(null)
                            }}
                          />
                          <MenuItem
                            icon={Download}
                            label="Export config"
                            onClick={() => {
                              handleExport(p)
                              setMenuOpenId(null)
                            }}
                          />
                          <MenuItem
                            icon={p.archived ? ArchiveRestore : Archive}
                            label={p.archived ? 'Unarchive' : 'Archive'}
                            onClick={async () => {
                              await archiveProject(p.id, !p.archived)
                              setMenuOpenId(null)
                            }}
                          />
                          <MenuItem
                            icon={Trash2}
                            label="Delete"
                            danger
                            onClick={async () => {
                              if (confirm(`Delete "${p.name}"? This can't be undone.`)) {
                                await deleteProject(p.id)
                              }
                              setMenuOpenId(null)
                            }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNewProject && <NewProjectDialog onClose={() => setShowNewProject(false)} />}
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

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-forge-panel ${
        danger ? 'text-forge-danger' : 'text-forge-text'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}
