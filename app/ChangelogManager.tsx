'use client'

import { useState, useEffect, useMemo } from 'react'

interface Project {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  category: string | null
  repoUrl: string | null
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'APPS',       label: 'Apps' },
  { key: 'EXTENSOES',  label: 'Extensões' },
  { key: 'PORTAL_LMS', label: 'Portal / LMS' },
  { key: 'PLUGINS',    label: 'Plugins' },
  { key: 'SITES',      label: 'Sites' },
]

interface ChangelogEntry {
  id: string
  version: string
  type: 'feature' | 'fix' | 'breaking' | 'chore' | 'docs' | 'refactor' | 'perf' | 'test'
  title: string
  description: string
  author: string
  date: string
  commitHash: string | null
  prUrl: string | null
  issueUrl: string | null
  tags: string[]
  projectId: string
}

const typeConfig = {
  feature:  { label: 'Feature',     color: '#10b981' },
  fix:      { label: 'Fix',         color: '#f43f5e' },
  breaking: { label: 'Breaking',    color: '#f97316' },
  chore:    { label: 'Chore',       color: '#3b82f6' },
  docs:     { label: 'Docs',        color: '#a855f7' },
  refactor: { label: 'Refactor',    color: '#06b6d4' },
  perf:     { label: 'Performance', color: '#eab308' },
  test:     { label: 'Test',        color: '#22c55e' },
}

// SVG icons for entry types (replaces emojis)
const TypeIcon = ({ type, size = 14 }: { type: string; size?: number }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'feature':  return <svg {...props}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    case 'fix':      return <svg {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    case 'breaking': return <svg {...props}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    case 'chore':    return <svg {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    case 'docs':     return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    case 'refactor': return <svg {...props}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
    case 'perf':     return <svg {...props}><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    case 'test':     return <svg {...props}><polyline points="20 6 9 17 4 12"/></svg>
    default:         return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>
  }
}

const Icon = {
  Search:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  ChevronDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Sun: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>,
  Moon: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  PanelLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>,
  Logout: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Calendar: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Inbox: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Sparkles: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>,
  PinAngle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z"/></svg>,
}

// Generate gradient avatar for project (based on color)
function ProjectAvatar({ project, size = 22 }: { project: Project; size?: number }) {
  const letter = project.name.charAt(0).toUpperCase()
  const color = project.color || '#6366F1'
  return (
    <div
      className="proj-avatar"
      style={{
        width: size, height: size, borderRadius: size * 0.27,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        fontSize: size * 0.5,
      }}
    >
      {letter}
    </div>
  )
}

function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default function ChangelogManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [workspaceMenu, setWorkspaceMenu] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    version: '', type: 'feature' as ChangelogEntry['type'],
    title: '', description: '', author: 'Diego Kennedy', tags: '',
  })

  // ─── Persistence
  useEffect(() => {
    const t = (localStorage.getItem('uc-theme') as 'dark' | 'light') || 'dark'
    const c = localStorage.getItem('uc-sidebar-collapsed') === '1'
    const cats = localStorage.getItem('uc-collapsed-cats')
    setTheme(t)
    setSidebarCollapsed(c)
    if (cats) {
      try { setCollapsedCats(JSON.parse(cats)) } catch {}
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('uc-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('uc-sidebar-collapsed', sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  useEffect(() => {
    localStorage.setItem('uc-collapsed-cats', JSON.stringify(collapsedCats))
  }, [collapsedCats])

  // ─── Data
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        const lastSlug = localStorage.getItem('uc-last-project')
        const initial = data.find((p: Project) => p.slug === lastSlug) || data[0]
        if (initial) setSelectedProject(initial)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    localStorage.setItem('uc-last-project', selectedProject.slug)
    fetch(`/api/changelog?projectId=${selectedProject.id}`)
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error)
  }, [selectedProject])

  // ─── Derived
  const groupedEntries = useMemo(() => entries.reduce((acc, entry) => {
    if (!acc[entry.version]) acc[entry.version] = []
    acc[entry.version].push(entry)
    return acc
  }, {} as Record<string, ChangelogEntry[]>), [entries])

  const versions = useMemo(() => Object.keys(groupedEntries).sort((a, b) => {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const diff = (bParts[i] || 0) - (aParts[i] || 0)
      if (diff !== 0) return diff
    }
    return 0
  }), [groupedEntries])

  const filteredVersions = useMemo(() => versions.filter(v => {
    if (!search) return true
    const items = groupedEntries[v]
    return v.includes(search) || items.some(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
    )
  }), [versions, search, groupedEntries])

  useEffect(() => {
    if (versions.length > 0 && (!selectedVersion || !versions.includes(selectedVersion))) {
      setSelectedVersion(versions[0])
    }
  }, [versions, selectedVersion])

  const currentEntries = selectedVersion ? groupedEntries[selectedVersion] || [] : []
  const entriesByType = currentEntries.reduce((acc, entry) => {
    if (!acc[entry.type]) acc[entry.type] = []
    acc[entry.type].push(entry)
    return acc
  }, {} as Record<string, ChangelogEntry[]>)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = { ...formData, tags: tagsArray, projectId: selectedProject.id, date: new Date().toISOString() }
    try {
      const res = await fetch('/api/changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const newEntry = await res.json()
        setEntries([newEntry, ...entries])
        setSelectedVersion(formData.version)
        setShowModal(false)
        setFormData({ version: '', type: 'feature', title: '', description: '', author: 'Diego Kennedy', tags: '' })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    document.cookie = 'uc_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="workspace-loading">
        <div className="spinner" />
        <span>Carregando workspace…</span>
      </div>
    )
  }

  return (
    <div className={`workspace-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className="workspace-sidebar">
        {/* Workspace Switcher (estilo Notion) */}
        <div className="ws-switcher-wrap">
          <button
            className="ws-switcher"
            onClick={() => setWorkspaceMenu(!workspaceMenu)}
            title={sidebarCollapsed ? 'UniverBeauty Workspace' : undefined}
          >
            <div className="ws-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
              </svg>
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="ws-info">
                  <div className="ws-name">UniverBeauty</div>
                  <div className="ws-plan">Internal · {projects.length} projetos</div>
                </div>
                <Icon.ChevronDown />
              </>
            )}
          </button>

          {workspaceMenu && !sidebarCollapsed && (
            <>
              <div className="ws-menu-backdrop" onClick={() => setWorkspaceMenu(false)} />
              <div className="ws-menu">
                <div className="ws-menu-header">diego@univerbeauty.com</div>
                <div className="ws-menu-item active">
                  <div className="ws-mark sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="ws-menu-item-info">
                    <div className="ws-menu-item-name">UniverBeauty</div>
                    <div className="ws-menu-item-sub">Internal Plan · {projects.length} projetos</div>
                  </div>
                  <Icon.Check />
                </div>
                <div className="ws-menu-divider" />
                <button className="ws-menu-action" onClick={handleLogout}>
                  <Icon.Logout />
                  <span>Sair</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="sidebar-search">
            <Icon.Search />
            <input
              type="text"
              placeholder="Buscar projeto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Section: Workspaces grouped by category */}
        <div className="sidebar-section">
          <nav className="sidebar-nav">
            {CATEGORIES.map(cat => {
              const filteredProjects = projects
                .filter(p => (p.category || 'APPS') === cat.key)
                .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
              
              const isCollapsed = collapsedCats[cat.key]
              
              // Skip category if empty AND searching
              if (filteredProjects.length === 0 && search) return null
              
              return (
                <div key={cat.key} className="cat-group">
                  {!sidebarCollapsed && (
                    <button
                      className="cat-header"
                      onClick={() => setCollapsedCats({ ...collapsedCats, [cat.key]: !isCollapsed })}
                    >
                      <span className={`cat-chevron ${isCollapsed ? 'collapsed' : ''}`}>
                        <Icon.ChevronDown />
                      </span>
                      <span className="cat-label">{cat.label}</span>
                      <span className="cat-count">{filteredProjects.length}</span>
                    </button>
                  )}
                  {sidebarCollapsed && filteredProjects.length > 0 && (
                    <div className="cat-divider-collapsed" title={cat.label} />
                  )}
                  {(!isCollapsed || sidebarCollapsed) && (
                    <div className="cat-items">
                      {filteredProjects.map(project => {
                        const isActive = selectedProject?.id === project.id
                        return (
                          <button
                            key={project.id}
                            onClick={() => { setSelectedProject(project); setSelectedVersion(null); }}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            title={sidebarCollapsed ? project.name : undefined}
                          >
                            <ProjectAvatar project={project} />
                            {!sidebarCollapsed && (
                              <>
                                <span className="nav-label">{project.name}</span>
                                {isActive && <span className="nav-active-dot" />}
                              </>
                            )}
                          </button>
                        )
                      })}
                      {filteredProjects.length === 0 && !sidebarCollapsed && (
                        <div className="cat-empty">Em breve</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="footer-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? <Icon.Sun /> : <Icon.Moon />}
            {!sidebarCollapsed && <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>}
          </button>
          <button
            className="footer-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <Icon.PanelLeft />
            {!sidebarCollapsed && <span>Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="breadcrumb">
            {selectedProject && <ProjectAvatar project={selectedProject} size={18} />}
            <span className="crumb-text">{selectedProject?.name}</span>
            <Icon.ChevronRight />
            <span className="crumb-text muted">Changelog</span>
            {selectedVersion && (
              <>
                <Icon.ChevronRight />
                <span className="version-pill">v{selectedVersion}</span>
              </>
            )}
          </div>

          <div className="topbar-actions">
            <a href={`/api/export?projectId=${selectedProject?.id}`} className="btn-secondary">
              <Icon.Download />
              Export
            </a>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Icon.Plus />
              Nova entrada
            </button>
          </div>
        </header>

        <div className="workspace-body">
          <aside className="versions-panel">
            <div className="versions-header">
              <div className="versions-title">Versões</div>
              <span className="badge">{versions.length}</span>
            </div>

            <div className="versions-search">
              <Icon.Search />
              <input
                type="text"
                placeholder="Filtrar versões…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="versions-list">
              {filteredVersions.length === 0 && (
                <div className="versions-empty">
                  <div className="empty-icon">
                    <Icon.Inbox />
                  </div>
                  <p>Nenhuma versão ainda</p>
                  <button onClick={() => setShowModal(true)} className="btn-link">
                    Criar primeira entrada →
                  </button>
                </div>
              )}
              {filteredVersions.map((version, idx) => {
                const versionEntries = groupedEntries[version]
                const latestDate = versionEntries[0]?.date
                const isActive = selectedVersion === version
                const isLatest = idx === 0
                return (
                  <button
                    key={version}
                    onClick={() => setSelectedVersion(version)}
                    className={`version-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="version-left">
                      <div className="version-tag">
                        <span className="version-number">v{version}</span>
                        {isLatest && <span className="latest-badge">Latest</span>}
                      </div>
                      <div className="version-date">{formatDate(latestDate)}</div>
                    </div>
                    <span className="version-count">{versionEntries.length}</span>
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="content-area">
            {!selectedVersion ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Icon.Sparkles />
                </div>
                <h2>Selecione uma versão</h2>
                <p>Escolha uma versão no painel lateral para ver os detalhes</p>
              </div>
            ) : (
              <article className="version-article">
                <header className="article-header">
                  <div className="article-meta">
                    <span className="version-pill large">v{selectedVersion}</span>
                    <span className="article-date">
                      <Icon.Calendar />
                      {formatDate(currentEntries[0]?.date)}
                    </span>
                    <span className="article-author">
                      <span className="mini-avatar">{getInitials(currentEntries[0]?.author || 'DK')}</span>
                      {currentEntries[0]?.author}
                    </span>
                  </div>
                  <h1 className="article-title">
                    {selectedProject?.name} — Release {selectedVersion}
                  </h1>
                  <p className="article-summary">
                    {currentEntries.length} {currentEntries.length === 1 ? 'mudança nesta release' : 'mudanças nesta release'}
                  </p>

                  <div className="type-chips">
                    {Object.entries(entriesByType).map(([type, items]) => {
                      const cfg = typeConfig[type as keyof typeof typeConfig]
                      return (
                        <div key={type} className="type-chip" style={{ borderColor: `${cfg.color}40`, background: `${cfg.color}15`, color: cfg.color }}>
                          <TypeIcon type={type} size={11} />
                          <span style={{ fontWeight: 600 }}>{cfg.label}</span>
                          <span className="type-chip-count">{items.length}</span>
                        </div>
                      )
                    })}
                  </div>
                </header>

                <div className="entries-groups">
                  {Object.entries(entriesByType).map(([type, items]) => {
                    const cfg = typeConfig[type as keyof typeof typeConfig]
                    return (
                      <div key={type} className="entry-group">
                        <div className="entry-group-header">
                          <div className="entry-group-icon" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                            <TypeIcon type={type} size={13} />
                          </div>
                          <h3 className="entry-group-title">{cfg.label}</h3>
                          <span className="entry-group-divider" />
                          <span className="entry-group-count">{items.length}</span>
                        </div>
                        <div className="entry-cards">
                          {items.map(entry => (
                            <div key={entry.id} className="entry-card">
                              <div className="entry-card-marker" style={{ background: cfg.color }} />
                              <div className="entry-card-body">
                                <div className="entry-card-title">{entry.title}</div>
                                {entry.description && <div className="entry-card-desc">{entry.description}</div>}
                                {entry.tags && entry.tags.length > 0 && (
                                  <div className="entry-card-tags">
                                    {entry.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            )}
          </section>
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Nova entrada de changelog</h2>
                <p>Adicione uma mudança ao projeto {selectedProject?.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <Icon.X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Versão *</label>
                  <input type="text" placeholder="1.0.0" value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Tipo *</label>
                  <select value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ChangelogEntry['type'] })}>
                    {Object.entries(typeConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Título *</label>
                <input type="text" placeholder="O que mudou nesta versão" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>

              <div className="form-field">
                <label>Descrição</label>
                <textarea placeholder="Detalhes adicionais (Markdown suportado)" rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Autor</label>
                  <input type="text" value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Tags <span className="hint">(separadas por vírgula)</span></label>
                  <input type="text" placeholder="frontend, ui" value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Criar entrada</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
