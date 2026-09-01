export function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[12.5px] text-forge-text-dim mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-forge-text-faint">{hint}</p>}
    </div>
  )
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-forge-border bg-forge-bg px-3 py-2 text-sm outline-none focus:border-forge-ember-bright"
    />
  )
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className="w-full rounded-md border border-forge-border bg-forge-bg px-3 py-2 text-sm outline-none focus:border-forge-ember-bright resize-none"
    />
  )
}

export function Select({ options, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-md border border-forge-border bg-forge-bg px-3 py-2 text-sm outline-none focus:border-forge-ember-bright"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 rounded-md border border-forge-border bg-forge-bg cursor-pointer"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-md border border-forge-border bg-forge-bg px-3 py-2 text-sm outline-none focus:border-forge-ember-bright font-mono"
      />
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between rounded-md border border-forge-border-soft px-3 py-2.5 hover:border-forge-text-faint"
    >
      <span className="text-[13px]">{label}</span>
      <span
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? 'bg-forge-ember' : 'bg-forge-panel-raised'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-forge-text transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function StudioPage({ title, description, children, sidebar }) {
  return (
    <div className="flex">
      <div className="flex-1 min-w-0 max-w-2xl px-8 py-8 space-y-6">
        <div>
          <h1 className="font-display font-semibold text-lg tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-[13px] text-forge-text-dim">{description}</p>
          )}
        </div>
        {children}
      </div>
      {sidebar && (
        <div className="w-72 shrink-0 border-l border-forge-border-soft px-6 py-8">
          {sidebar}
        </div>
      )}
    </div>
  )
}

export function SaveBar({ dirty, onSave, onDiscard }) {
  if (!dirty) return null
  return (
    <div className="flex items-center gap-2 sticky bottom-0 bg-forge-bg pt-3 pb-1 border-t border-forge-border-soft">
      <button
        onClick={onSave}
        className="rounded-md bg-forge-ember px-3.5 py-2 text-sm font-medium text-forge-bg"
      >
        Save changes
      </button>
      <button onClick={onDiscard} className="text-sm text-forge-text-dim hover:text-forge-text">
        Discard
      </button>
    </div>
  )
}
