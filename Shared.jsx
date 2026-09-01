export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b border-forge-border-soft">
      <div>
        <h1 className="font-display font-semibold text-xl tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-[13.5px] text-forge-text-dim max-w-lg">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {Icon && (
        <div className="w-11 h-11 rounded-lg bg-forge-panel-raised flex items-center justify-center mb-4">
          <Icon size={20} className="text-forge-text-faint" strokeWidth={1.75} />
        </div>
      )}
      <p className="font-display font-medium text-[15px]">{title}</p>
      {description && (
        <p className="mt-1.5 text-[13px] text-forge-text-faint max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function StatBlock({ label, value }) {
  return (
    <div className="border border-forge-border-soft rounded-lg px-4 py-3.5">
      <p className="text-[11.5px] text-forge-text-faint mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

export function Panel({ title, action, children, className = '' }) {
  return (
    <div className={`border border-forge-border-soft rounded-lg ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-forge-border-soft">
          {title && <h3 className="font-display font-medium text-[13.5px]">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
