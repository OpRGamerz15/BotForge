import { useNavigate } from 'react-router-dom'
import { Server } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/Shared'
import { useAllServers, useProjects } from '../db/hooks'

export default function Servers() {
  const servers = useAllServers()
  const projects = useProjects()
  const navigate = useNavigate()
  const loading = !servers || !projects

  function projectFor(projectId) {
    return (projects || []).find((p) => p.id === projectId)
  }

  return (
    <div>
      <PageHeader
        title="Servers"
        description="Every server configured across your launcher projects."
      />
      <div className="px-8 py-6">
        {!loading && servers.length === 0 && (
          <EmptyState
            icon={Server}
            title="No servers configured"
            description="Add a server from within a launcher project's Minecraft & server tab."
          />
        )}
        {!loading && servers.length > 0 && (
          <div className="border border-forge-border-soft rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-forge-border-soft text-left text-[11.5px] text-forge-text-faint">
                  <th className="font-normal px-4 py-2.5">Server</th>
                  <th className="font-normal px-4 py-2.5">Project</th>
                  <th className="font-normal px-4 py-2.5">Address</th>
                  <th className="font-normal px-4 py-2.5">Loader</th>
                  <th className="font-normal px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forge-border-soft">
                {servers.map((s) => {
                  const project = projectFor(s.projectId)
                  return (
                    <tr key={s.id} className="hover:bg-forge-panel">
                      <td className="px-4 py-3 font-medium">{s.name || 'Unnamed server'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => project && navigate(`/projects/${project.id}/minecraft`)}
                          className="text-forge-text-dim hover:text-forge-ember-bright"
                        >
                          {project ? project.name : 'Unknown project'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-forge-text-dim font-mono text-[12.5px]">
                        {s.address ? `${s.address}:${s.port}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-forge-text-dim capitalize">{s.loader}</td>
                      <td className="px-4 py-3 text-forge-text-faint text-[12px]">
                        Not checked
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[11.5px] text-forge-text-faint">
          Vynix Forge doesn't ping servers for live status — status is only shown
          when a real check has been run.
        </p>
      </div>
    </div>
  )
}
