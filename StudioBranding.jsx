import { useEffect, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { updateProject } from '../../db/hooks'
import { Field, ColorInput, StudioPage, SaveBar } from './StudioField'

export default function StudioBranding({ project }) {
  const [form, setForm] = useState(project.branding)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setForm(project.branding)
    setDirty(false)
  }, [project.id])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  async function save() {
    await updateProject(project.id, { branding: form })
    setDirty(false)
  }

  function handleImage(key, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set(key, reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <StudioPage
      title="Branding"
      description="Colors and imagery applied across the generated launcher."
      sidebar={<LivePreview form={form} launcherName={project.identity.launcherName || project.name} />}
    >
      <div className="grid grid-cols-3 gap-4">
        <Field label="Primary color">
          <ColorInput value={form.primaryColor} onChange={(v) => set('primaryColor', v)} />
        </Field>
        <Field label="Accent color">
          <ColorInput value={form.accentColor} onChange={(v) => set('accentColor', v)} />
        </Field>
        <Field label="Text color">
          <ColorInput value={form.textColor} onChange={(v) => set('textColor', v)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ImageUpload label="Icon" hint="Square, 256×256 recommended." value={form.icon} onChange={(f) => handleImage('icon', f)} />
        <ImageUpload label="Logo" hint="Shown in the sidebar header." value={form.logo} onChange={(f) => handleImage('logo', f)} />
        <ImageUpload label="Background" hint="Fills the main window." value={form.background} onChange={(f) => handleImage('background', f)} />
        <ImageUpload label="Splash screen" hint="Shown while the launcher loads." value={form.splash} onChange={(f) => handleImage('splash', f)} />
      </div>

      <SaveBar dirty={dirty} onSave={save} onDiscard={() => { setForm(project.branding); setDirty(false) }} />
    </StudioPage>
  )
}

function ImageUpload({ label, hint, value, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <label className="flex items-center gap-3 rounded-md border border-dashed border-forge-border px-3 py-2.5 cursor-pointer hover:border-forge-text-faint">
        {value ? (
          <img src={value} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded bg-forge-panel-raised flex items-center justify-center shrink-0">
            <ImageIcon size={15} className="text-forge-text-faint" />
          </div>
        )}
        <span className="text-[12.5px] text-forge-text-dim truncate">
          {value ? 'Replace image' : 'Upload image'}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0])}
        />
      </label>
    </Field>
  )
}

function LivePreview({ form, launcherName }) {
  return (
    <div>
      <p className="text-[11.5px] text-forge-text-faint mb-2">Live preview</p>
      <div
        className="rounded-lg border border-forge-border overflow-hidden"
        style={{
          backgroundColor: '#0d0c0b',
          backgroundImage: form.background ? `url(${form.background})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="h-8 flex items-center gap-1.5 px-3"
          style={{ backgroundColor: form.primaryColor }}
        >
          {form.icon && <img src={form.icon} alt="" className="w-3.5 h-3.5 rounded-sm" />}
          <span className="text-[10.5px] font-medium truncate" style={{ color: form.textColor }}>
            {launcherName || 'Your Launcher'}
          </span>
        </div>
        <div className="h-40 flex flex-col items-center justify-center gap-2 px-4">
          {form.logo ? (
            <img src={form.logo} alt="" className="h-8 object-contain" />
          ) : (
            <p
              className="font-display font-semibold text-sm text-center"
              style={{ color: form.textColor }}
            >
              {launcherName || 'Your Launcher'}
            </p>
          )}
          <button
            className="text-[11px] px-4 py-1.5 rounded-md font-medium"
            style={{ backgroundColor: form.accentColor, color: form.textColor }}
          >
            Play
          </button>
        </div>
      </div>
    </div>
  )
}
