import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Maps keep-a-changelog headers to internal types
const TYPE_MAP: Record<string, string> = {
  'added': 'feature',
  'changed': 'refactor',
  'deprecated': 'breaking',
  'removed': 'breaking',
  'fixed': 'fix',
  'security': 'fix',
  // Common alternatives
  'feature': 'feature',
  'features': 'feature',
  'bug fixes': 'fix',
  'bugfix': 'fix',
  'fixes': 'fix',
  'docs': 'docs',
  'documentation': 'docs',
  'chore': 'chore',
  'perf': 'perf',
  'performance': 'perf',
  'refactor': 'refactor',
  'breaking': 'breaking',
  'breaking changes': 'breaking',
  'tests': 'test',
}

interface ParsedEntry {
  version: string
  date: string | null
  type: string
  title: string
  description: string
  tags: string[]
}

function parseChangelogMarkdown(content: string): ParsedEntry[] {
  const entries: ParsedEntry[] = []
  const lines = content.split('\n')

  let currentVersion: string | null = null
  let currentDate: string | null = null
  let currentType: string | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Match version headers: ## [1.0.0] - 2024-01-15  or  ## 1.0.0 (2024-01-15)
    const versionMatch =
      line.match(/^##\s*\[?v?(\d+\.\d+\.\d+[^\]\s]*)\]?\s*[-(]?\s*(\d{4}-\d{2}-\d{2})?/i) ||
      line.match(/^##\s+v?(\d+\.\d+\.\d+)/i)

    if (versionMatch) {
      currentVersion = versionMatch[1]
      currentDate = versionMatch[2] || null
      currentType = null
      continue
    }

    // Match section headers: ### Added, ### Fixed, etc.
    const sectionMatch = line.match(/^###\s+(.+?)$/)
    if (sectionMatch && currentVersion) {
      const sectionKey = sectionMatch[1].toLowerCase().trim()
      currentType = TYPE_MAP[sectionKey] || 'chore'
      continue
    }

    // Match list items: - Item description  or  * Item description
    const itemMatch = line.match(/^[-*]\s+(.+)$/)
    if (itemMatch && currentVersion && currentType) {
      const text = itemMatch[1].trim()
      // Skip empty links like [Unreleased]
      if (text.startsWith('[') && text.endsWith(']')) continue

      // First sentence is the title, rest is description
      const sentences = text.split(/(?<=[.!?])\s+/)
      const title = sentences[0].slice(0, 200)
      const description = sentences.slice(1).join(' ').slice(0, 1000) || ''

      entries.push({
        version: currentVersion,
        date: currentDate,
        type: currentType,
        title,
        description,
        tags: ['imported'],
      })
    }
  }

  return entries
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { projectId, content, author } = body

    if (!projectId || !content) {
      return NextResponse.json({ error: 'projectId and content required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const parsed = parseChangelogMarkdown(content)
    if (parsed.length === 0) {
      return NextResponse.json({
        error: 'Nenhuma entrada encontrada no formato keep-a-changelog',
        hint: 'Use headers ## [versão] - data e ### Added/Fixed/Changed/etc',
      }, { status: 400 })
    }

    const created = await prisma.$transaction(
      parsed.map(entry => prisma.changelogEntry.create({
        data: {
          projectId,
          version: entry.version,
          type: entry.type,
          title: entry.title,
          description: entry.description,
          author: author || 'Imported',
          tags: entry.tags,
          date: entry.date ? new Date(entry.date) : new Date(),
        },
      }))
    )

    return NextResponse.json({
      ok: true,
      imported: created.length,
      preview: parsed.slice(0, 5).map(e => ({ version: e.version, type: e.type, title: e.title })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to import', detail: e.message }, { status: 500 })
  }
}

// Preview endpoint (parse without saving)
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { content } = body
    if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

    const parsed = parseChangelogMarkdown(content)
    return NextResponse.json({
      total: parsed.length,
      entries: parsed,
      versions: [...new Set(parsed.map(e => e.version))],
      types: [...new Set(parsed.map(e => e.type))],
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to preview', detail: e.message }, { status: 500 })
  }
}
