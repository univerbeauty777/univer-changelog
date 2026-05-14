'use client'

import { useState, useEffect } from 'react'

interface RoadmapItem {
  id: string
  projectId: string
  title: string
  description: string | null
  status: string
  priority: string | null
  sprint: string | null
  startDate: string | null
  targetDate: string | null
  completedAt: string | null
  tags: string[]
  order: number
}

interface Props {
  projectId: string
  projectName: string
}

const COLUMNS = [
  { key: 'planned',     label: 'Planejado',    color: '#71717a' },
  { key: 'in_progress', label: 'Em progresso', color: '#3b82f6' },
  { key: 'completed',   label: 'Concluído',    color: '#10b981' },
]

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#71717a',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function RoadmapView({ projectId, projectName }: Props) {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<RoadmapItem | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', status: 'planned', priority: 'medium',
    sprint: '', targetDate: '', tags: '',
  })

  const load = () => {
    setLoading(true)
    fetch(`/api/roadmap?projectId=${projectId}`)
      .then(r => r.json())
      .then(setItems)
      .finally(() => setLoading(false))
  }

  useEffect(load, [projectId])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', status: 'planned', priority: 'medium', sprint: '', targetDate: '', tags: '' })
    setShowModal(true)
  }

  const openEdit = (item: RoadmapItem) => {
    setEditing(item)
    setForm({
      title: item.title,
      description: item.description || '',
      status: item.status,
      priority: item.priority || 'medium',
      sprint: item.sprint || '',
      targetDate: item.targetDate ? item.targetDate.split('T')[0] : '',
      tags: item.tags.join(', '),
    })
    setShowModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...(editing ? {} : { projectId }),
      title: form.title,
      description: form.description || null,
      status: form.status,
      priority: form.priority || null,
      sprint: form.sprint || null,
      targetDate: form.targetDate || null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    const url = editing ? `/api/roadmap/${editing.id}` : '/api/roadmap'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setShowModal(false)
      load()
    }
  }

  const moveTo = async (item: RoadmapItem, status: string) => {
    await fetch(`/api/roadmap/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir este item do roadmap?')) return
    await fetch(`/api/roadmap/${id}`, { method: 'DELETE' })
    load()
  }

  const sprints = [...new Set(items.map(i => i.sprint).filter(Boolean) as string[])]

  return (
    <div className="roadmap-view">
      <div className="roadmap-header">
        <div>
          <h1 className="rv-title">Roadmap & Sprints</h1>
          <p className="rv-sub">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
            {sprints.length > 0 && <> · {sprints.length} {sprints.length === 1 ? 'sprint' : 'sprints'}</>}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar item
        </button>
      </div>

      {sprints.length > 0 && (
        <div className="sprint-chips">
          <span className="sprint-chip-label">SPRINTS:</span>
          {sprints.map(s => (
            <span key={s} className="sprint-chip">{s}</span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="rv-loading">Carregando…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11H1l3-9 9 9-9 9-3-9z"/><path d="M22 12h-9l-3 9 9-9-9-9 3 9z"/></svg>
          </div>
          <h2>Nenhum item no roadmap</h2>
          <p>Adicione o primeiro item planejado de {projectName}</p>
          <button onClick={openCreate} className="btn-primary" style={{ marginTop: 16 }}>+ Adicionar primeiro item</button>
        </div>
      ) : (
        <div className="kanban">
          {COLUMNS.map(col => {
            const colItems = items.filter(i => i.status === col.key)
            return (
              <div key={col.key} className="kanban-column">
                <div className="kanban-col-header">
                  <span className="kanban-col-dot" style={{ background: col.color }} />
                  <span className="kanban-col-label">{col.label}</span>
                  <span className="kanban-col-count">{colItems.length}</span>
                </div>
                <div className="kanban-items">
                  {colItems.length === 0 && (
                    <div className="kanban-empty">Sem itens</div>
                  )}
                  {colItems.map(item => (
                    <div key={item.id} className="kanban-card">
                      <div className="kc-top">
                        {item.priority && (
                          <span className="kc-priority" style={{ background: `${PRIORITY_COLOR[item.priority]}20`, color: PRIORITY_COLOR[item.priority] }}>
                            {item.priority}
                          </span>
                        )}
                        {item.sprint && <span className="kc-sprint">{item.sprint}</span>}
                      </div>
                      <div className="kc-title" onClick={() => openEdit(item)}>{item.title}</div>
                      {item.description && <div className="kc-desc">{item.description}</div>}
                      {item.tags.length > 0 && (
                        <div className="kc-tags">
                          {item.tags.map(t => <span key={t} className="kc-tag">{t}</span>)}
                        </div>
                      )}
                      <div className="kc-footer">
                        {item.targetDate && (
                          <span className="kc-date">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            {formatDate(item.targetDate)}
                          </span>
                        )}
                        <div className="kc-actions">
                          {COLUMNS.filter(c => c.key !== item.status).map(c => (
                            <button key={c.key} onClick={() => moveTo(item, c.key)} title={`Mover para ${c.label}`} className="kc-action">→ {c.label}</button>
                          ))}
                          <button onClick={() => remove(item.id)} className="kc-action danger" title="Excluir">×</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editing ? 'Editar item' : 'Novo item de roadmap'}</h2>
                <p>{projectName}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={save} className="modal-form">
              <div className="form-field">
                <label>Título *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Descrição</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="planned">Planejado</option>
                    <option value="in_progress">Em progresso</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Prioridade</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Sprint <span className="hint">(ex: S1, Q1 2026)</span></label>
                  <input type="text" value={form.sprint} onChange={e => setForm({ ...form, sprint: e.target.value })} placeholder="S1" />
                </div>
                <div className="form-field">
                  <label>Data alvo</label>
                  <input type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Tags <span className="hint">(separadas por vírgula)</span></label>
                <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="frontend, performance" />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
