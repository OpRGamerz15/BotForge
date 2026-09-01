import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  FolderKanban,
  Server,
  Hammer,
  FileBox,
  RefreshCw,
  Settings as SettingsIcon,
  Flame,
  Plus,
} from 'lucide-react'
import { useState } from 'react'
import NewProjectDialog from './NewProjectDialog'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/servers', label: 'Servers', icon: Server },
  { to: '/builds', label: 'Build Center', icon: Hammer },
  { to: '/files', label: 'Files', icon: FileBox },
  { to: '/updates', label: 'Updates', icon: RefreshCw },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function AppShell() {
  const [showNewProject, setShowNewProject] = useState(false)
  const location = useLocation()
  const inStudio = location.pathname.startsWith('/projects/') && location.pathname !== '/projects/'

  return (
    <div className="flex h-screen bg-forge-bg text-forge-text font-body">
      {!inStudio && (
        <aside className="w-60 shrink-0 border-r border-forge-border-soft flex flex-col">
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-forge-border-soft">
            <div className="w-7 h-7 rounded-md bg-forge-ember/15 flex items-center justify-center">
              <Flame size={16} className="text-forge-ember-bright" strokeWidth={2.25} />
            </div>
            <span className="font-display font-semibold text-[15px] tracking-tight">
              Vynix Forge
            </span>
          </div>

          <div className="px-3 pt-4">
            <button
              onClick={() => setShowNewProject(true)}
              className="w-full flex items-center gap-2 rounded-md bg-forge-ember/90 hover:bg-forge-ember text-forge-bg font-medium text-sm px-3 py-2 transition-colors"
            >
              <Plus size={16} strokeWidth={2.5} />
              New launcher
            </button>
          </div>

          <nav className="flex-1 px-3 pt-5 space-y-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] transition-colors ${
                    isActive
                      ? 'bg-forge-panel-raised text-forge-text'
                      : 'text-forge-text-dim hover:text-forge-text hover:bg-forge-panel'
                  }`
                }
              >
                <Icon size={16} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="px-5 py-4 border-t border-forge-border-soft">
            <p className="text-[11px] text-forge-text-faint leading-relaxed">
              Runs entirely in your browser. Projects are stored locally
              until you export or connect GitHub.
            </p>
          </div>
        </aside>
      )}

      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>

      {showNewProject && (
        <NewProjectDialog onClose={() => setShowNewProject(false)} />
      )}
    </div>
  )
}
