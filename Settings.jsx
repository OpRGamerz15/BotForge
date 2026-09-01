import { useState } from 'react'
import { GitBranch, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/Shared'
import { db } from '../db/db'

const SECTIONS = ['Account', 'Appearance', 'Security', 'Integrations', 'Build configuration']

export default function Settings() {
  const [active, setActive] = useState('Integrations')
  const [confirming, setConfirming] = useState(false)

  async function clearAllData() {
    await db.projects.clear()
    await db.servers.clear()
    await db.files.clear()
    await db.builds.clear()
    await db.releases.clear()
    setConfirming(false)
  }

  return (
    <div>
      <PageHeader title="Settings" description="Account, appearance, and integration preferences." />
      <div className="flex px-8 py-6 gap-8">
        <nav className="w-48 shrink-0 space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`w-full text-left rounded-md px-3 py-2 text-[13px] ${
                active === s ? 'bg-forge-panel-raised text-forge-text' : 'text-forge-text-dim hover:text-forge-text'
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        <div className="flex-1 max-w-xl">
          {active === 'Integrations' && (
            <div className="space-y-4">
              <div className="border border-forge-border-soft rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch size={16} />
                  <h3 className="font-display font-medium text-sm">GitHub</h3>
                </div>
                <p className="text-[12.5px] text-forge-text-dim mb-3">
                  Not connected. Connect GitHub to push generated launcher source and
                  run GitHub Actions workflows that produce real Windows, Linux, and
                  macOS build artifacts.
                </p>
                <button
                  disabled
                  className="text-[12.5px] rounded-md border border-forge-border px-3 py-2 text-forge-text-faint cursor-not-allowed"
                  title="GitHub integration isn't wired up in this build of Vynix Forge yet."
                >
                  Connect GitHub
                </button>
              </div>
              <div className="border border-forge-border-soft rounded-lg p-4">
                <h3 className="font-display font-medium text-sm mb-2">Modrinth</h3>
                <p className="text-[12.5px] text-forge-text-dim">
                  Search and import happen directly against Modrinth's public API —
                  no account connection needed.
                </p>
              </div>
            </div>
          )}

          {active === 'Account' && (
            <div className="space-y-4">
              <p className="text-[13px] text-forge-text-dim">
                Vynix Forge doesn't require an account for the free browser-based
                builder — all project data lives in this browser.
              </p>
              <div className="border border-forge-border-soft rounded-lg p-4">
                <h3 className="font-display font-medium text-sm mb-2">Local data</h3>
                <p className="text-[12.5px] text-forge-text-dim mb-3">
                  Clear every project, server, file record, build, and release stored
                  in this browser. This can't be undone.
                </p>
                {!confirming ? (
                  <button
                    onClick={() => setConfirming(true)}
                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-forge-danger"
                  >
                    <Trash2 size={13} /> Clear all local data
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={clearAllData} className="text-[12.5px] font-medium text-forge-danger">
                      Confirm — delete everything
                    </button>
                    <button onClick={() => setConfirming(false)} className="text-[12.5px] text-forge-text-dim">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {active === 'Appearance' && (
            <p className="text-[13px] text-forge-text-dim">
              Vynix Forge's own dashboard theme is fixed for now. Your generated
              launcher's appearance is configured per-project in the Branding tab.
            </p>
          )}

          {active === 'Security' && (
            <p className="text-[13px] text-forge-text-dim">
              No account credentials are stored — Vynix Forge runs entirely
              client-side. Security settings will apply once optional
              backend features (like GitHub builds) are connected.
            </p>
          )}

          {active === 'Build configuration' && (
            <p className="text-[13px] text-forge-text-dim">
              Default build behavior (target platforms, artifact naming) is
              configured per-project from that project's Generate & Build tab.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
