import { useEffect, useState } from 'react'
import { updateProject } from '../../db/hooks'
import { StudioPage, SaveBar, Toggle } from './StudioField'

const LAYOUT_LABELS = {
  sidebar: 'Sidebar navigation',
  home: 'Home screen',
  news: 'News feed',
  serverSelector: 'Server selector',
  profile: 'Player profile panel',
  settings: 'Settings screen',
  footer: 'Footer bar',
}

const FEATURE_LABELS = {
  news: 'News',
  serverStatus: 'Live server status',
  discord: 'Discord widget',
  modManager: 'In-launcher mod manager',
  settings: 'Settings screen',
  updates: 'Automatic updates',
  accountManagement: 'Account management',
}

export default function StudioLayout({ project }) {
  const [layout, setLayout] = useState(project.layout)
  const [features, setFeatures] = useState(project.features)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setLayout(project.layout)
    setFeatures(project.features)
    setDirty(false)
  }, [project.id])

  async function save() {
    await updateProject(project.id, { layout, features })
    setDirty(false)
  }

  return (
    <StudioPage
      title="Layout & features"
      description="Choose which screens and capabilities the generated launcher includes."
    >
      <div>
        <h3 className="font-display font-medium text-sm mb-2.5">Layout sections</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(LAYOUT_LABELS).map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              checked={layout[key]}
              onChange={(v) => {
                setLayout((l) => ({ ...l, [key]: v }))
                setDirty(true)
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-medium text-sm mb-2.5">Launcher features</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(FEATURE_LABELS).map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              checked={features[key]}
              onChange={(v) => {
                setFeatures((f) => ({ ...f, [key]: v }))
                setDirty(true)
              }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-forge-text-faint">
          Discord widget requires a Discord invite link set on the Identity page.
        </p>
      </div>

      <SaveBar
        dirty={dirty}
        onSave={save}
        onDiscard={() => {
          setLayout(project.layout)
          setFeatures(project.features)
          setDirty(false)
        }}
      />
    </StudioPage>
  )
}
