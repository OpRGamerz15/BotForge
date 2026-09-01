import { useEffect, useState } from 'react'
import { AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { updateProject, useServersForProject, addServer, updateServer, deleteServer } from '../../db/hooks'
import { Field, TextInput, Select, StudioPage, SaveBar } from './StudioField'

const LOADERS = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'forge', label: 'Forge' },
  { value: 'neoforge', label: 'NeoForge' },
]

function validateVersion(v) {
  if (!v) return null
  return /^\d+\.\d+(\.\d+)?$/.test(v) ? null : 'Doesn\u2019t look like a valid Minecraft version (e.g. 1.20.4).'
}

function validateAddress(addr) {
  if (!addr) return null
  return /^[a-zA-Z0-9.-]+$/.test(addr) ? null : 'Address should be a hostname or IP, without protocol or port.'
}

export default function StudioMinecraft({ project }) {
  const [mc, setMc] = useState(project.minecraft)
  const [dirty, setDirty] = useState(false)
  const servers = useServersForProject(project.id)

  useEffect(() => {
    setMc(project.minecraft)
    setDirty(false)
  }, [project.id])

  async function save() {
    await updateProject(project.id, { minecraft: mc })
    setDirty(false)
  }

  const versionError = validateVersion(mc.version)

  return (
    <StudioPage
      title="Minecraft & server"
      description="Which Minecraft version and mod loader this launcher targets, and the servers it connects to."
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Minecraft version" hint={versionError ? undefined : 'e.g. 1.20.4'}>
          <TextInput
            value={mc.version}
            onChange={(e) => { setMc((m) => ({ ...m, version: e.target.value })); setDirty(true) }}
            placeholder="1.20.4"
          />
          {versionError && <InlineError message={versionError} />}
        </Field>
        <Field label="Mod loader">
          <Select
            options={LOADERS}
            value={mc.loader}
            onChange={(e) => { setMc((m) => ({ ...m, loader: e.target.value })); setDirty(true) }}
          />
        </Field>
      </div>

      <Field label="Java requirement" hint="Only advertise a Java version your build actually bundles or requires.">
        <TextInput
          value={mc.javaRequirement}
          onChange={(e) => { setMc((m) => ({ ...m, javaRequirement: e.target.value })); setDirty(true) }}
          placeholder="Java 17+"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Minimum RAM (MB)">
          <TextInput
            type="number"
            value={mc.ram.min}
            onChange={(e) => { setMc((m) => ({ ...m, ram: { ...m.ram, min: Number(e.target.value) } })); setDirty(true) }}
          />
        </Field>
        <Field label="Maximum RAM (MB)">
          <TextInput
            type="number"
            value={mc.ram.max}
            onChange={(e) => { setMc((m) => ({ ...m, ram: { ...m.ram, max: Number(e.target.value) } })); setDirty(true) }}
          />
        </Field>
      </div>
      {mc.ram.max < mc.ram.min && (
        <InlineError message="Maximum RAM is lower than minimum RAM." />
      )}

      <SaveBar dirty={dirty} onSave={save} onDiscard={() => { setMc(project.minecraft); setDirty(false) }} />

      <div className="pt-2 border-t border-forge-border-soft">
        <div className="flex items-center justify-between mb-3 pt-6">
          <h3 className="font-display font-medium text-sm">Servers</h3>
          <button
            onClick={() => addServer(project.id, {})}
            className="flex items-center gap-1.5 text-[12.5px] text-forge-ember-bright hover:underline"
          >
            <Plus size={13} /> Add server
          </button>
        </div>

        {(!servers || servers.length === 0) && (
          <p className="text-[13px] text-forge-text-faint py-6 text-center border border-dashed border-forge-border-soft rounded-lg">
            No servers configured.
          </p>
        )}

        <div className="space-y-3">
          {(servers || []).map((s) => (
            <ServerCard key={s.id} server={s} />
          ))}
        </div>
      </div>
    </StudioPage>
  )
}

function ServerCard({ server }) {
  const [form, setForm] = useState(server)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setForm(server)
    setDirty(false)
  }, [server.id])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  async function save() {
    await updateServer(server.id, form)
    setDirty(false)
  }

  const addrError = validateAddress(form.address)

  return (
    <div className="border border-forge-border-soft rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Server name">
          <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Main SMP" />
        </Field>
        <Field label="Address">
          <TextInput value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="play.example.net" />
          {addrError && <InlineError message={addrError} />}
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Port">
          <TextInput type="number" value={form.port} onChange={(e) => set('port', Number(e.target.value))} />
        </Field>
        <Field label="Loader">
          <Select options={LOADERS} value={form.loader} onChange={(e) => set('loader', e.target.value)} />
        </Field>
      </div>
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 text-[12.5px] text-forge-text-dim">
          <input type="checkbox" checked={form.autoConnect} onChange={(e) => set('autoConnect', e.target.checked)} />
          Auto-connect on launch
        </label>
        <label className="flex items-center gap-2 text-[12.5px] text-forge-text-dim">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} />
          Default server
        </label>
        <div className="flex items-center gap-3">
          {dirty && (
            <button onClick={save} className="text-[12.5px] font-medium text-forge-ember-bright hover:underline">
              Save
            </button>
          )}
          <button onClick={() => deleteServer(server.id)} className="text-forge-text-faint hover:text-forge-danger">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function InlineError({ message }) {
  return (
    <div className="mt-1.5 flex items-start gap-1.5 text-[11.5px] text-forge-warn">
      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
