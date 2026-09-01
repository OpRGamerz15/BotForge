import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Swords, Pickaxe, Puzzle, Skull, Gamepad2, Wrench } from 'lucide-react'
import { createProject } from '../db/hooks'

const TEMPLATES = [
  {
    id: 'vanilla-smp',
    name: 'Vanilla SMP',
    icon: Pickaxe,
    blurb: 'Unmodified survival, one server address.',
  },
  {
    id: 'survival-smp',
    name: 'Survival SMP',
    icon: Swords,
    blurb: 'Survival with a small curated mod list.',
  },
  {
    id: 'modded-smp',
    name: 'Modded SMP',
    icon: Puzzle,
    blurb: 'Heavier modpack, Forge or NeoForge.',
  },
  {
    id: 'pvp-network',
    name: 'PvP Network',
    icon: Skull,
    blurb: 'Multiple servers, competitive focus.',
  },
  {
    id: 'minigame-network',
    name: 'Minigame Network',
    icon: Gamepad2,
    blurb: 'Lobby + minigame server selector.',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: Wrench,
    blurb: 'Start from a blank configuration.',
  },
]

export default function NewProjectDialog({ onClose }) {
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('custom')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    const project = await createProject(name.trim(), template)
    setCreating(false)
    onClose()
    navigate(`/projects/${project.id}/identity`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-lg border border-forge-border bg-forge-panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-forge-border-soft">
          <h2 className="font-display font-semibold text-[15px]">New launcher</h2>
          <button onClick={onClose} className="text-forge-text-dim hover:text-forge-text">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-[12.5px] text-forge-text-dim mb-1.5">
              Launcher name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Ashfall Network"
              className="w-full rounded-md border border-forge-border bg-forge-bg px-3 py-2 text-sm outline-none focus:border-forge-ember-bright"
            />
          </div>

          <div>
            <label className="block text-[12.5px] text-forge-text-dim mb-1.5">
              Starting template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(({ id, name: tName, icon: Icon, blurb }) => (
                <button
                  key={id}
                  onClick={() => setTemplate(id)}
                  className={`text-left rounded-md border px-3 py-2.5 transition-colors ${
                    template === id
                      ? 'border-forge-ember-bright bg-forge-ember/10'
                      : 'border-forge-border hover:border-forge-text-faint'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className="text-forge-ember-bright" />
                    <span className="text-[13px] font-medium">{tName}</span>
                  </div>
                  <p className="text-[11.5px] text-forge-text-faint leading-snug">
                    {blurb}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11.5px] text-forge-text-faint">
              Templates set starting defaults only — nothing is pre-built for you.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-forge-border-soft">
          <button
            onClick={onClose}
            className="rounded-md px-3.5 py-2 text-sm text-forge-text-dim hover:text-forge-text"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="rounded-md bg-forge-ember px-3.5 py-2 text-sm font-medium text-forge-bg disabled:opacity-40"
          >
            {creating ? 'Creating…' : 'Create launcher'}
          </button>
        </div>
      </div>
    </div>
  )
}
