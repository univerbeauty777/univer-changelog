'use client'

import { useState } from 'react'

interface Props {
  projectId: string
  projectName: string
  onImported?: () => void
}

interface PreviewEntry {
  version: string
  date: string | null
  type: string
  title: string
  description: string
  tags: string[]
}

const SAMPLE = `# Changelog

## [1.2.0] - 2026-05-10

### Added
- Suporte completo a Markdown nos cards
- Botão de exportar em JSON

### Fixed
- Corrigido bug na filtragem por tag

## [1.1.0] - 2026-04-22

### Changed
- Layout do header reformulado para melhor mobile UX

### Performance
- Reduzido bundle JS em 30%
`

export default function ImportView({ projectId, projectName, onImported }: Props) {
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState<{ total: number; entries: PreviewEntry[]; versions: string[]; types: string[] } | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ imported: number; preview: any[] } | null>(null)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setContent(text)
    }
    reader.readAsText(file)
  }

  const doPreview = async () => {
    setError('')
    setPreview(null)
    setPreviewing(true)
    try {
      const res = await fetch('/api/import', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (res.ok) {
        setPreview(data)
      } else {
        setError(data.error || 'Erro ao processar')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setPreviewing(false)
    }
  }

  const doImport = async () => {
    setError('')
    setImporting(true)
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, content, author: 'Imported via Claude' }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ imported: data.imported, preview: data.preview })
        setContent('')
        setPreview(null)
        if (onImported) onImported()
      } else {
        setError(data.error || 'Erro ao importar')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="import-view">
      <div className="roadmap-header">
        <div>
          <h1 className="rv-title">Importar changelog</h1>
          <p className="rv-sub">Cole ou anexe um arquivo CHANGELOG.md (formato keep-a-changelog) · {projectName}</p>
        </div>
      </div>

      {result && (
        <div className="import-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <strong>{result.imported} entradas importadas com sucesso!</strong>
            <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 4 }}>
              Primeiras: {result.preview.map(p => `v${p.version} ${p.title.slice(0, 30)}`).join(' · ')}
            </div>
          </div>
          <button onClick={() => setResult(null)} className="btn-secondary">OK</button>
        </div>
      )}

      <div className="import-grid">
        <div className="import-input">
          <div className="import-section-title">
            <span className="step-num">1</span>
            <span>Cole o conteúdo ou anexe um arquivo</span>
          </div>

          <div className="file-drop">
            <input
              type="file"
              accept=".md,.markdown,.txt"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              id="file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="file-drop-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Escolher arquivo .md
            </label>
            <button onClick={() => setContent(SAMPLE)} className="btn-link">Carregar exemplo</button>
          </div>

          <textarea
            className="import-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Changelog

## [1.0.0] - 2026-05-10

### Added
- Nova feature X

### Fixed
- Corrigido bug Y"
            rows={18}
          />

          <div className="import-actions">
            <button onClick={doPreview} disabled={!content || previewing} className="btn-secondary">
              {previewing ? 'Processando…' : 'Visualizar antes de importar'}
            </button>
          </div>

          {error && <div className="login-error" style={{ marginTop: 12 }}>{error}</div>}
        </div>

        <div className="import-preview">
          <div className="import-section-title">
            <span className="step-num">2</span>
            <span>Revisar e importar</span>
          </div>

          {!preview ? (
            <div className="preview-empty">
              <p>Visualize antes de importar.</p>
              <p className="hint">Detectamos seções <code>### Added</code>, <code>### Fixed</code>, <code>### Changed</code>, <code>### Removed</code>, <code>### Deprecated</code>, <code>### Security</code> e mapeamos para tipos internos.</p>
            </div>
          ) : (
            <>
              <div className="preview-stats">
                <div className="preview-stat">
                  <div className="ps-num">{preview.total}</div>
                  <div className="ps-label">entradas</div>
                </div>
                <div className="preview-stat">
                  <div className="ps-num">{preview.versions.length}</div>
                  <div className="ps-label">versões</div>
                </div>
                <div className="preview-stat">
                  <div className="ps-num">{preview.types.length}</div>
                  <div className="ps-label">tipos</div>
                </div>
              </div>

              <div className="preview-list">
                {preview.entries.slice(0, 20).map((e, i) => (
                  <div key={i} className="preview-item">
                    <div className="pi-left">
                      <span className="pi-version">v{e.version}</span>
                      <span className="pi-type">{e.type}</span>
                    </div>
                    <div className="pi-title">{e.title}</div>
                  </div>
                ))}
                {preview.entries.length > 20 && (
                  <div className="preview-more">… + {preview.entries.length - 20} entradas</div>
                )}
              </div>

              <button onClick={doImport} disabled={importing} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {importing ? 'Importando…' : `Importar ${preview.total} entradas`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
