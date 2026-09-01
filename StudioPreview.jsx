import { useServersForProject, useFilesForProject } from '../../db/hooks'
import { StudioPage } from './StudioField'

export default function StudioPreview({ project }) {
  const servers = useServersForProject(project.id)
  const requiredMods = useFilesForProject(project.id, 'required')
  const { identity, branding, layout, features, minecraft } = project

  return (
    <StudioPage
      title="Preview"
      description="This reflects your saved configuration — go back and save changes on other tabs to see them here."
    >
      <div
        className="rounded-lg border border-forge-border overflow-hidden aspect-video"
        style={{
          backgroundColor: '#0d0c0b',
          backgroundImage: branding.background ? `url(${branding.background})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex h-full">
          {layout.sidebar && (
            <div className="w-40 shrink-0 border-r border-white/10 flex flex-col p-3 gap-1">
              <div className="flex items-center gap-2 mb-3">
                {branding.icon && <img src={branding.icon} className="w-5 h-5 rounded" />}
                <span className="text-[11px] font-medium truncate" style={{ color: branding.textColor }}>
                  {identity.launcherName || project.name}
                </span>
              </div>
              {layout.home && <SidebarItem label="Home" active />}
              {layout.news && <SidebarItem label="News" />}
              {layout.serverSelector && <SidebarItem label="Servers" />}
              {features.modManager && <SidebarItem label="Mods" />}
              {layout.profile && <SidebarItem label="Profile" />}
              {layout.settings && <SidebarItem label="Settings" />}
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
            {branding.logo ? (
              <img src={branding.logo} className="h-10 object-contain" />
            ) : (
              <p className="font-display font-semibold text-lg" style={{ color: branding.textColor }}>
                {identity.launcherName || project.name}
              </p>
            )}

            {features.serverStatus && (
              <p className="text-[11px]" style={{ color: branding.textColor, opacity: 0.7 }}>
                {servers && servers.length > 0
                  ? `${servers[0].name || servers[0].address} — status unavailable in preview`
                  : 'No servers configured'}
              </p>
            )}

            <button
              className="text-[12px] px-6 py-2 rounded-md font-medium"
              style={{ backgroundColor: branding.accentColor, color: branding.textColor }}
            >
              Play
            </button>

            <p className="text-[10px]" style={{ color: branding.textColor, opacity: 0.5 }}>
              {minecraft.version || 'No version set'} · {minecraft.loader}
              {requiredMods && requiredMods.length > 0 && ` · ${requiredMods.length} required mods`}
            </p>
          </div>

          {layout.footer && (
            <div
              className="absolute bottom-0 left-0 right-0 h-6 border-t border-white/10 flex items-center px-3"
              style={{ color: branding.textColor, opacity: 0.6 }}
            >
              <span className="text-[10px]">v{identity.version}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-[12.5px]">
        <SummaryRow label="Publisher" value={identity.publisher || '—'} />
        <SummaryRow label="Servers" value={(servers || []).length} />
        <SummaryRow label="Required mods" value={(requiredMods || []).length} />
        <SummaryRow label="Discord" value={features.discord ? 'Enabled' : 'Disabled'} />
      </div>
    </StudioPage>
  )
}

function SidebarItem({ label, active }) {
  return (
    <div
      className={`text-[10.5px] px-2 py-1.5 rounded ${active ? 'bg-white/10 text-white' : 'text-white/60'}`}
    >
      {label}
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-forge-border-soft py-2">
      <span className="text-forge-text-faint">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
