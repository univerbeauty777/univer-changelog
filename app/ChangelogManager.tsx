'use client';

import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  repoUrl: string | null;
}

interface ChangelogEntry {
  id: string;
  version: string;
  type: 'feature' | 'fix' | 'breaking' | 'chore' | 'docs' | 'refactor' | 'perf' | 'test';
  title: string;
  description: string;
  author: string;
  date: string;
  commitHash: string | null;
  prUrl: string | null;
  issueUrl: string | null;
  tags: string[];
  projectId: string;
}

const typeConfig = {
  feature:  { label: 'Feature',     icon: '✨', dot: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)' },
  fix:      { label: 'Fix',         icon: '🐛', dot: '#f43f5e', bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.25)' },
  breaking: { label: 'Breaking',    icon: '💥', dot: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.25)' },
  chore:    { label: 'Chore',       icon: '🔧', dot: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)' },
  docs:     { label: 'Docs',        icon: '📝', dot: '#a855f7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.25)' },
  refactor: { label: 'Refactor',    icon: '♻️', dot: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.25)' },
  perf:     { label: 'Performance', icon: '⚡', dot: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.25)' },
  test:     { label: 'Test',        icon: '✅', dot: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)' },
};

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function ChangelogManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');

  const [formData, setFormData] = useState({
    version: '',
    type: 'feature' as ChangelogEntry['type'],
    title: '',
    description: '',
    author: 'Diego Kennedy',
    tags: '',
  });

  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.version]) acc[entry.version] = [];
    acc[entry.version].push(entry);
    return acc;
  }, {} as Record<string, ChangelogEntry[]>);

  const versions = Object.keys(groupedEntries).sort((a, b) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const diff = (bParts[i] || 0) - (aParts[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });

  const filteredVersions = versions.filter(v => {
    if (!search) return true;
    const items = groupedEntries[v];
    return v.includes(search) || items.some(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const filteredProjects = projects.filter(p =>
    !sidebarSearch || p.name.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      setSelectedVersion(versions[0]);
    }
  }, [versions, selectedVersion]);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    fetch(`/api/changelog?projectId=${selectedProject.id}`)
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error);
  }, [selectedProject]);

  const currentEntries = selectedVersion ? groupedEntries[selectedVersion] : [];

  const entriesByType = currentEntries.reduce((acc, entry) => {
    if (!acc[entry.type]) acc[entry.type] = [];
    acc[entry.type].push(entry);
    return acc;
  }, {} as Record<string, ChangelogEntry[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      ...formData,
      tags: tagsArray,
      projectId: selectedProject.id,
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newEntry = await res.json();
        setEntries([newEntry, ...entries]);
        setSelectedVersion(formData.version);
        setShowModal(false);
        setFormData({ version: '', type: 'feature', title: '', description: '', author: 'Diego Kennedy', tags: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="workspace-loading">
        <div className="spinner" />
        <span>Carregando workspace...</span>
      </div>
    );
  }

  return (
    <div className="workspace-shell">
      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="15" y2="17"/>
              </svg>
            </div>
            <div className="brand-text">
              <div className="brand-name">UniverChangelog</div>
              <div className="brand-sub">UniverBeauty Workspace</div>
            </div>
          </div>
        </div>

        <div className="sidebar-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar workspace..."
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
          <kbd>⌘K</kbd>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">
            <span>WORKSPACES</span>
            <span className="badge">{projects.length}</span>
          </div>
          <nav className="sidebar-nav">
            {filteredProjects.map(project => {
              const isActive = selectedProject?.id === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setSelectedVersion(null);
                  }}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{project.icon}</span>
                  <span className="nav-label">{project.name}</span>
                  {isActive && <span className="nav-dot" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">DK</div>
            <div className="user-info">
              <div className="user-name">Diego Kennedy</div>
              <div className="user-role">Owner</div>
            </div>
            <button className="user-action" title="Configurações">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="breadcrumb">
            <span className="crumb-icon">{selectedProject?.icon}</span>
            <span className="crumb-text">{selectedProject?.name}</span>
            <svg className="crumb-sep" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span className="crumb-text muted">Changelog</span>
            {selectedVersion && (
              <>
                <svg className="crumb-sep" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span className="version-pill">v{selectedVersion}</span>
              </>
            )}
          </div>

          <div className="topbar-actions">
            <a href={`/api/export?projectId=${selectedProject?.id}`} className="btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </a>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Filtrar versões..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="versions-list">
              {filteredVersions.length === 0 && (
                <div className="versions-empty">
                  <div className="empty-icon">📋</div>
                  <p>Nenhuma versão ainda</p>
                  <button onClick={() => setShowModal(true)} className="btn-link">
                    Criar primeira entrada →
                  </button>
                </div>
              )}
              {filteredVersions.map((version, idx) => {
                const versionEntries = groupedEntries[version];
                const latestDate = versionEntries[0]?.date;
                const isActive = selectedVersion === version;
                const isLatest = idx === 0;
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
                    <div className="version-right">
                      <span className="version-count">{versionEntries.length}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="content-area">
            {!selectedVersion ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h2>Selecione uma versão</h2>
                <p>Escolha uma versão no painel lateral para ver os detalhes</p>
              </div>
            ) : (
              <article className="version-article">
                <header className="article-header">
                  <div className="article-meta">
                    <span className="version-pill large">v{selectedVersion}</span>
                    <span className="article-date">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
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
                      const cfg = typeConfig[type as keyof typeof typeConfig];
                      return (
                        <div key={type} className="type-chip" style={{ borderColor: cfg.border, background: cfg.bg }}>
                          <span className="type-chip-dot" style={{ background: cfg.dot }} />
                          <span style={{ color: cfg.dot, fontWeight: 600 }}>{cfg.label}</span>
                          <span className="type-chip-count">{items.length}</span>
                        </div>
                      );
                    })}
                  </div>
                </header>

                <div className="entries-groups">
                  {Object.entries(entriesByType).map(([type, items]) => {
                    const cfg = typeConfig[type as keyof typeof typeConfig];
                    return (
                      <div key={type} className="entry-group">
                        <div className="entry-group-header">
                          <span className="entry-group-icon">{cfg.icon}</span>
                          <h3 className="entry-group-title">{cfg.label}</h3>
                          <span className="entry-group-divider" />
                          <span className="entry-group-count">{items.length}</span>
                        </div>
                        <div className="entry-cards">
                          {items.map(entry => (
                            <div key={entry.id} className="entry-card">
                              <div className="entry-card-marker" style={{ background: cfg.dot }} />
                              <div className="entry-card-body">
                                <div className="entry-card-title">{entry.title}</div>
                                {entry.description && (
                                  <div className="entry-card-desc">{entry.description}</div>
                                )}
                                {entry.tags && entry.tags.length > 0 && (
                                  <div className="entry-card-tags">
                                    {entry.tags.map(tag => (
                                      <span key={tag} className="tag">{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="entry-card-side">
                                {entry.commitHash && (
                                  <code className="commit-hash">{entry.commitHash.slice(0, 7)}</code>
                                )}
                                {entry.prUrl && (
                                  <a href={entry.prUrl} target="_blank" rel="noreferrer" className="entry-link" title="Ver PR">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="18" cy="18" r="3"/>
                                      <circle cx="6" cy="6" r="3"/>
                                      <path d="M13 6h3a2 2 0 0 1 2 2v7"/>
                                      <line x1="6" y1="9" x2="6" y2="21"/>
                                    </svg>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
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
                <p>Adicione uma mudança ao workspace {selectedProject?.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Versão *</label>
                  <input
                    type="text"
                    placeholder="1.0.0"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ChangelogEntry['type'] })}
                  >
                    {Object.entries(typeConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Título *</label>
                <input
                  type="text"
                  placeholder="O que mudou nesta versão"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Descrição</label>
                <textarea
                  placeholder="Detalhes adicionais (Markdown suportado)"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Autor</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Tags <span className="hint">(separadas por vírgula)</span></label>
                  <input
                    type="text"
                    placeholder="frontend, ui"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
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
  );
}
