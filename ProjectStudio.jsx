import { useParams, NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Flame } from 'lucide-react'
import { useProject } from '../db/hooks'
import StudioIdentity from './studio/StudioIdentity'
import StudioBranding from './studio/StudioBranding'
import StudioMinecraft from './studio/StudioMinecraft'
import StudioMods from './studio/StudioMods'
import StudioLayout from './studio/StudioLayout'
import StudioPreview from './studio/StudioPreview'
import StudioBuild from './studio/StudioBuild'

const TABS = [
  { to: 'identity', label: 'Identity' },
  { to: 'branding', label: 'Branding' },
  { to: 'layout', label: 'Layout & features' },
  { to: 'minecraft', label: 'Minecraft & server' },
  { to: 'mods', label: 'Mods' },
  { to: 'preview', label: 'Preview' },
  { to: 'build', label: 'Generate & build' },
]

export default function ProjectStudio() {
  const { projectId } = useParams()
  const project = useProject(projectId)
  const navigate = useNavigate()

  if (project === undefined) {
    return <div className="p-8 text-forge-text-dim text-sm">Loading project…</div>
  }
  if (project === null) {
    return (
      <div className="p-8 text-sm">
        <p className="text-forge-text-dim">This project doesn't exist.</p>
        <button onClick={() => navigate('/projects')} className="text-forge-ember-bright mt-2 hover:underline">
          Back to projects
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="w-56 shrink-0 border-r border-forge-border-soft flex flex-col">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-forge-border-soft">
          <button
            onClick={() => navigate('/projects')}
            className="text-forge-text-dim hover:text-forge-text p-1 -ml-1"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate">{project.name}</p>
            <p className="text-[11px] text-forge-text-faint">Launcher studio</p>
          </div>
        </div>
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-[13px] transition-colors ${
                  isActive
                    ? 'bg-forge-panel-raised text-forge-text'
                    : 'text-forge-text-dim hover:text-forge-text hover:bg-forge-panel'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-forge-border-soft flex items-center gap-1.5">
          <Flame size={12} className="text-forge-ember-bright" />
          <span className="text-[11px] text-forge-text-faint">Vynix Forge</span>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-y-auto">
        <Routes>
          <Route path="identity" element={<StudioIdentity project={project} />} />
          <Route path="branding" element={<StudioBranding project={project} />} />
          <Route path="layout" element={<StudioLayout project={project} />} />
          <Route path="minecraft" element={<StudioMinecraft project={project} />} />
          <Route path="mods" element={<StudioMods project={project} />} />
          <Route path="preview" element={<StudioPreview project={project} />} />
          <Route path="build" element={<StudioBuild project={project} />} />
          <Route path="*" element={<Navigate to="identity" replace />} />
        </Routes>
      </div>
    </div>
  )
}
