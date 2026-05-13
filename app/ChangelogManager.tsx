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

const typeIcons = {
  feature: '✨',
  fix: '🐛',
  breaking: '💥',
  chore: '🔧',
  docs: '📝',
  refactor: '♻️',
  perf: '⚡',
  test: '✅'
};

const typeLabels = {
  feature: 'Features',
  fix: 'Bug Fixes',
  breaking: 'Breaking Changes',
  chore: 'Chores',
  docs: 'Documentation',
  refactor: 'Refactoring',
  perf: 'Performance',
  test: 'Tests'
};

const typeColors = {
  feature: 'text-emerald-400',
  fix: 'text-rose-400',
  breaking: 'text-orange-400',
  chore: 'text-blue-400',
  docs: 'text-purple-400',
  refactor: 'text-cyan-400',
  perf: 'text-yellow-400',
  test: 'text-green-400'
};

export default function ChangelogManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Group entries by version
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.version]) {
      acc[entry.version] = [];
    }
    acc[entry.version].push(entry);
    return acc;
  }, {} as Record<string, ChangelogEntry[]>);

  const versions = Object.keys(groupedEntries).sort((a, b) => {
    // Sort versions descending
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const diff = (bParts[i] || 0) - (aParts[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });

  // Auto-select first version when entries change
  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      setSelectedVersion(versions[0]);
    }
  }, [versions, selectedVersion]);

  // Fetch projects
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setLoading(false);
      });
  }, []);

  // Fetch entries when project changes
  useEffect(() => {
    if (!selectedProject) return;
    
    fetch(`/api/changelog?projectId=${selectedProject.id}`)
      .then(res => res.json())
      .then(data => {
        setEntries(data);
      })
      .catch(err => {
        console.error('Error fetching entries:', err);
      });
  }, [selectedProject]);

  const currentEntries = selectedVersion ? groupedEntries[selectedVersion] : [];
  const latestEntry = currentEntries[0];

  // Group current entries by type
  const entriesByType = currentEntries.reduce((acc, entry) => {
    if (!acc[entry.type]) {
      acc[entry.type] = [];
    }
    acc[entry.type].push(entry);
    return acc;
  }, {} as Record<string, ChangelogEntry[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-zinc-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Project Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Changelog</h1>
                  <p className="text-xs text-zinc-500">UniverBeauty Updates</p>
                </div>
              </div>

              {/* Project Selector */}
              <div className="ml-8">
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const project = projects.find(p => p.id === e.target.value);
                    setSelectedProject(project || null);
                    setSelectedVersion(null);
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm font-medium hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all cursor-pointer min-w-[200px]"
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.icon} {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>+</span>
                Nova Entrada
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar - Version List */}
          <aside className="col-span-3">
            <div className="sticky top-24">
              <div className="mb-4">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Versões
                </h2>
              </div>
              
              <div className="space-y-1">
                {versions.map(version => {
                  const versionEntries = groupedEntries[version];
                  const versionDate = versionEntries[0]?.date;
                  const isSelected = selectedVersion === version;
                  
                  return (
                    <button
                      key={version}
                      onClick={() => setSelectedVersion(version)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-violet-600/10 border border-violet-600/30'
                          : 'hover:bg-zinc-900/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isSelected ? 'text-violet-400' : 'text-zinc-300'}`}>
                          v{version}
                        </span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {new Date(versionDate).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>

              {versions.length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Nenhuma versão ainda
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="col-span-9">
            {selectedVersion && latestEntry ? (
              <div>
                {/* Version Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600/10 border border-violet-600/30 rounded-lg">
                      <span className="text-lg">🚀</span>
                      <span className="font-bold text-xl text-violet-400">v{selectedVersion}</span>
                    </span>
                    <span className="text-sm text-zinc-500">
                      {new Date(latestEntry.date).toLocaleDateString('pt-BR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    Latest updates and improvements to {selectedProject?.name}
                  </p>
                </div>

                {/* Entries by Type */}
                <div className="space-y-8">
                  {Object.entries(entriesByType).map(([type, typeEntries]) => (
                    <div key={type}>
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <span className={typeColors[type as keyof typeof typeColors]}>
                          {typeIcons[type as keyof typeof typeIcons]}
                        </span>
                        {typeLabels[type as keyof typeof typeLabels]}
                      </h3>
                      
                      <ul className="space-y-3">
                        {typeEntries.map(entry => (
                          <li key={entry.id} className="flex gap-3">
                            <span className="text-zinc-500 mt-1">•</span>
                            <div className="flex-1">
                              <div className="font-medium text-zinc-200">{entry.title}</div>
                              {entry.description && (
                                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                                  {entry.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                {entry.tags && entry.tags.length > 0 && (
                                  <div className="flex gap-1.5">
                                    {entry.tags.map((tag, idx) => (
                                      <span 
                                        key={idx}
                                        className="text-xs px-2 py-0.5 bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-400"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {entry.author && (
                                  <span className="text-xs text-zinc-500">
                                    by {entry.author}
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma versão selecionada</h3>
                <p className="text-zinc-500 text-sm">
                  Selecione uma versão na lista ao lado ou crie uma nova entrada
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Nova Entrada no Changelog</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="text-center py-8 text-zinc-500">
              Formulário de criação será implementado aqui
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
