'use client'

import { useState, useEffect } from 'react'

interface Note {
  id: string
  projectId: string
  title: string
  content: string
  pinned: boolean
  color: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface Props {
  projectId: string
  projectName: string
}

const COLORS = [
  { key: null,        label: 'Padrão', bg: 'var(--bg-secondary)' },
  { key: '#fef3c7',   label: 'Amarelo', bg: '#fef3c7' },
  { key: '#dbeafe',   label: 'Azul',    bg: '#dbeafe' },
  { key: '#d1fae5',   label: 'Verde',   bg: '#d1fae5' },
  { key: '#fce7f3',   label: 'Rosa',    bg: '#fce7f3' },
  { key: '#e9d5ff',   label: 'Roxo',    bg: '#e9d5ff' },
]

function formatRelative(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} dias`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function NotesView({ projectId, projectName }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Note | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', color: null as string | null, tags: '' })

  const load = () => {
    setLoading(true)
    fetch(`/api/notes?projectId=${projectId}`)
      .then(r => r.json())
      .then(setNotes)
      .finally(() => setLoading(false))
  }

  useEffect(load, [projectId])

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', content: '', color: null, tags: '' })
    setShowEditor(true)
  }

  const openEdit = (note: Note) => {
    setEditing(note)
    setForm({
      title: note.title,
      content: note.content,
      color: note.color,
      tags: note.tags.join(', '),
    })
    setShowEditor(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...(editing ? {} : { projectId }),
      title: form.title || 'Sem título',
      content: form.content,
      color: form.color,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    const url = editing ? `/api/notes/${editing.id}` : '/api/notes'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setShowEditor(false)
      load()
    }
  }

  const togglePin = async (note: Note) => {
    await fetch(`/api/notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !note.pinned }),
    })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir esta nota?')) return
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="notes-view">
      <div className="roadmap-header">
        <div>
          <h1 className="rv-title">Anotações</h1>
          <p className="rv-sub">{notes.length} {notes.length === 1 ? 'nota' : 'notas'} · {projectName}</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova nota
        </button>
      </div>

      {loading ? (
        <div className="rv-loading">Carregando…</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h2>Nenhuma nota ainda</h2>
          <p>Crie a primeira anotação de {projectName}</p>
          <button onClick={openNew} className="btn-primary" style={{ marginTop: 16 }}>+ Criar primeira nota</button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <div
              key={note.id}
              className="note-card"
              style={note.color ? { background: note.color, color: '#1a1a1a' } : {}}
            >
              <div className="note-header">
                <h3 onClick={() => openEdit(note)}>{note.title}</h3>
                <button onClick={() => togglePin(note)} className={`note-pin ${note.pinned ? 'pinned' : ''}`} title={note.pinned ? 'Desafixar' : 'Fixar'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="17" x2="12" y2="22"/>
                    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z"/>
                  </svg>
                </button>
              </div>
              <div className="note-content" onClick={() => openEdit(note)}>{note.content || <em style={{ opacity: 0.5 }}>Sem conteúdo</em>}</div>
              {note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}
              <div className="note-footer">
                <span className="note-date">{formatRelative(note.updatedAt)}</span>
                <button onClick={() => remove(note.id)} className="note-delete" title="Excluir">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <div className="modal-backdrop" onClick={() => setShowEditor(false)}>
          <div className="modal-panel large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editing ? 'Editar nota' : 'Nova nota'}</h2>
                <p>{projectName}</p>
              </div>
              <button onClick={() => setShowEditor(false)} className="modal-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={save} className="modal-form">
              <div className="form-field">
                <label>Título</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título da nota" />
              </div>
              <div className="form-field">
                <label>Conteúdo <span className="hint">(Markdown suportado)</span></label>
                <textarea rows={10} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Escreva sua nota…" />
              </div>
              <div className="form-field">
                <label>Cor de fundo</label>
                <div className="color-picker">
                  {COLORS.map(c => (
                    <button
                      key={c.key || 'default'}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.key })}
                      className={`color-swatch ${form.color === c.key ? 'active' : ''}`}
                      style={{ background: c.bg }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <div className="form-field">
                <label>Tags <span className="hint">(separadas por vírgula)</span></label>
                <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="reunião, decisões" />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditor(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editing ? 'Salvar' : 'Criar nota'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
