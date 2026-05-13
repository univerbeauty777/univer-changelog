import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

const typeEmojis: Record<string, string> = {
  feature: '✨',
  fix: '🐛',
  breaking: '💥',
  chore: '🔧',
  docs: '📝',
  refactor: '♻️',
  perf: '⚡',
  test: '✅'
}

const typeLabels: Record<string, string> = {
  feature: 'Features',
  fix: 'Bug Fixes',
  breaking: 'BREAKING CHANGES',
  chore: 'Chores',
  docs: 'Documentation',
  refactor: 'Refactoring',
  perf: 'Performance',
  test: 'Tests'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const format_type = searchParams.get('format') || 'markdown'

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        entries: {
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (format_type === 'json') {
      return NextResponse.json(project.entries)
    }

    // Group by version
    const byVersion: Record<string, any[]> = {}
    project.entries.forEach(entry => {
      const ver = entry.version || 'Unreleased'
      if (!byVersion[ver]) byVersion[ver] = []
      byVersion[ver].push(entry)
    })

    // Generate markdown
    let markdown = `# Changelog — ${project.name}\n\n`
    markdown += `> ${project.description || 'Changelog history'}\n\n`

    for (const [version, entries] of Object.entries(byVersion)) {
      const latestDate = entries[0].date
      markdown += `## [${version}] - ${format(new Date(latestDate), 'yyyy-MM-dd')}\n\n`

      // Group by type
      const byType: Record<string, any[]> = {}
      entries.forEach(entry => {
        if (!byType[entry.type]) byType[entry.type] = []
        byType[entry.type].push(entry)
      })

      // Sort types (breaking first, then alphabetical)
      const sortedTypes = Object.keys(byType).sort((a, b) => {
        if (a === 'breaking') return -1
        if (b === 'breaking') return 1
        return a.localeCompare(b)
      })

      for (const type of sortedTypes) {
        const typeEntries = byType[type]
        markdown += `### ${typeEmojis[type] || '•'} ${typeLabels[type] || type.toUpperCase()}\n\n`

        for (const entry of typeEntries) {
          markdown += `- **${entry.title}**`
          if (entry.description) {
            markdown += `\n  ${entry.description.split('\n').join('\n  ')}`
          }
          if (entry.commitHash) {
            markdown += ` ([${entry.commitHash.substring(0, 7)}])`
          }
          if (entry.prUrl) {
            markdown += ` [PR](${entry.prUrl})`
          }
          if (entry.tags && entry.tags.length > 0) {
            markdown += ` \`${entry.tags.join('` `')}\``
          }
          markdown += '\n'
        }
        markdown += '\n'
      }
    }

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${project.slug}-changelog.md"`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export changelog' }, { status: 500 })
  }
}
