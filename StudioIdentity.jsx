import { useEffect, useState } from 'react'
import { updateProject } from '../../db/hooks'
import { Field, TextInput, TextArea, StudioPage, SaveBar } from './StudioField'

export default function StudioIdentity({ project }) {
  const [form, setForm] = useState(project.identity)
  const [name, setName] = useState(project.name)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setForm(project.identity)
    setName(project.name)
    setDirty(false)
  }, [project.id])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  async function save() {
    await updateProject(project.id, { identity: form, name: form.launcherName || name })
    setDirty(false)
  }

  return (
    <StudioPage
      title="Identity"
      description="How your launcher identifies itself — shown in the window title, about screen, and update checks."
    >
      <Field label="Launcher name">
        <TextInput
          value={form.launcherName}
          onChange={(e) => set('launcherName', e.target.value)}
          placeholder="Ashfall Network Launcher"
        />
      </Field>

      <Field label="Version" hint="Semantic version, e.g. 1.0.0. Used for update checks.">
        <TextInput
          value={form.version}
          onChange={(e) => set('version', e.target.value)}
          placeholder="0.1.0"
        />
      </Field>

      <Field label="Publisher">
        <TextInput
          value={form.publisher}
          onChange={(e) => set('publisher', e.target.value)}
          placeholder="Your name or organization"
        />
      </Field>

      <Field label="Description">
        <TextArea
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="A short description shown on the about screen."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Website">
          <TextInput
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="Discord invite">
          <TextInput
            value={form.discord}
            onChange={(e) => set('discord', e.target.value)}
            placeholder="https://discord.gg/…"
          />
        </Field>
      </div>

      <SaveBar dirty={dirty} onSave={save} onDiscard={() => { setForm(project.identity); setDirty(false) }} />
    </StudioPage>
  )
}
