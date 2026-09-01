import { useState } from 'react'
import { Search, Upload, Trash2, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { useFilesForProject, addFile, deleteFile } from '../../db/hooks'
import { StudioPage } from './StudioField'

const CATEGORIES = [
  { key: 'required', label: 'Required mods' },
  { key: 'optional', label: 'Optional mods' },
  { key: 'resourcepack', label: 'Resource packs' },
  { key: 'shaderpack', label: 'Shaderpacks' },
  { key: 'config', label: 'Configs' },
]

export default function StudioMods({ project }) {
  const [activeCategory, setActiveCategory] = useState('required')
  const [showModrinth, setShowModrinth] = useState(false)
  const files = useFilesForProject(project.id, activeCategory)

  async function handleUpload(fileList) {
    for (const file of fileList) {
      await addFile(project.id, {
        category: activeCategory,
        name: file.name,
        size: file.size,
        source: 'upload',
      })
    }
  }

  return (
    <StudioPage
      title="Mods & files"
      description="Manage the files bundled with this launcher — mods, resource packs, shaderpacks, and configs."
    >
      <div className="flex items-center gap-1 border-b border-forge-border-soft pb-3 -mt-1 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`px-3 py-1.5 rounded-md text-[13px] transition-colors ${
              activeCategory === c.key
                ? 'bg-forge-panel-raised text-forge-text'
                : 'text-forge-text-dim hover:text-forge-text'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 rounded-md border border-forge-border px-3 py-2 text-[12.5px] cursor-pointer hover:border-forge-text-faint">
          <Upload size={13} />
          Upload .jar
          <input
            type="file"
            accept=".jar"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))}
          />
        </label>
        <button
          onClick={() => setShowModrinth(true)}
          className="flex items-center gap-1.5 rounded-md border border-forge-border px-3 py-2 text-[12.5px] hover:border-forge-text-faint"
        >
          <Search size={13} />
          Search Modrinth
        </button>
      </div>

      {(!files || files.length === 0) ? (
        <p className="text-[13px] text-forge-text-faint py-8 text-center border border-dashed border-forge-border-soft rounded-lg">
          No files in this category yet.
        </p>
      ) : (
        <ul className="border border-forge-border-soft rounded-lg divide-y divide-forge-border-soft">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-[13px] truncate">{f.name}</p>
                <p className="text-[11px] text-forge-text-faint">
                  {f.version ? `${f.version} · ` : ''}
                  {f.source === 'modrinth' ? 'Imported from Modrinth' : 'Uploaded'}
                </p>
              </div>
              <button onClick={() => deleteFile(f.id)} className="text-forge-text-faint hover:text-forge-danger shrink-0">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModrinth && (
        <ModrinthSearchModal
          projectId={project.id}
          category={activeCategory}
          loader={project.minecraft.loader}
          version={project.minecraft.version}
          onClose={() => setShowModrinth(false)}
        />
      )}
    </StudioPage>
  )
}

function ModrinthSearchModal({ projectId, category, loader, version, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function search(q) {
    setLoading(true)
    setError(null)
    try {
      const facets = []
      if (loader && loader !== 'vanilla') facets.push([`categories:${loader}`])
      if (version) facets.push([`versions:${version}`])
      const params = new URLSearchParams({
        query: q,
        limit: '20',
      })
      if (facets.length) params.set('facets', JSON.stringify(facets))
      const res = await fetch(`https://api.modrinth.com/v2/search?${params.toString()}`)
      if (!res.ok) throw new Error(`Modrinth API returned ${res.status}`)
      const data = await res.json()
      setResults(data.hits || [])
    } catch (e) {
      setError(e.message || 'Failed to reach Modrinth.')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  async function importHit(hit) {
    await addFile(projectId, {
      category,
      name: hit.title,
      version: hit.latest_version || undefined,
      source: 'modrinth',
      modrinthId: hit.project_id || hit.slug,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl h-[36rem] rounded-lg border border-forge-border bg-forge-panel flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-forge-border-soft">
          <Search size={15} className="text-forge-text-faint shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search(query)}
            placeholder="Search Modrinth…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={() => search(query)}
            className="text-[12.5px] font-medium text-forge-ember-bright hover:underline shrink-0"
          >
            Search
          </button>
          <button onClick={onClose} className="text-forge-text-dim hover:text-forge-text text-sm shrink-0">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-full gap-2 text-forge-text-dim text-sm">
              <Loader2 size={15} className="animate-spin" /> Searching Modrinth…
            </div>
          )}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-8">
              <AlertCircle size={18} className="text-forge-danger" />
              <p className="text-[13px] text-forge-text">Modrinth request failed</p>
              <p className="text-[12px] text-forge-text-faint">{error}</p>
            </div>
          )}
          {!loading && !error && results === null && (
            <p className="text-[13px] text-forge-text-faint text-center py-16">
              Search for mods, modpacks, or resource packs on Modrinth.
            </p>
          )}
          {!loading && !error && results && results.length === 0 && (
            <p className="text-[13px] text-forge-text-faint text-center py-16">No results found.</p>
          )}
          {!loading && !error && results && results.length > 0 && (
            <ul className="divide-y divide-forge-border-soft">
              {results.map((hit) => (
                <li key={hit.project_id} className="flex items-center gap-3 px-4 py-3">
                  {hit.icon_url && (
                    <img src={hit.icon_url} alt="" className="w-8 h-8 rounded shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate">{hit.title}</p>
                    <p className="text-[11.5px] text-forge-text-faint truncate">{hit.description}</p>
                  </div>
                  <a
                    href={`https://modrinth.com/mod/${hit.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-forge-text-faint hover:text-forge-text shrink-0"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => importHit(hit)}
                    className="text-[12px] font-medium text-forge-ember-bright hover:underline shrink-0"
                  >
                    Import
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
