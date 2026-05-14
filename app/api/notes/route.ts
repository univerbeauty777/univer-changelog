import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where: any = {}
    if (projectId) where.projectId = projectId

    const notes = await prisma.note.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    })
    return NextResponse.json(notes)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch notes', detail: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const note = await prisma.note.create({
      data: {
        projectId: body.projectId,
        title: body.title || 'Sem título',
        content: body.content || '',
        pinned: body.pinned || false,
        color: body.color || null,
        tags: body.tags || [],
      },
    })
    return NextResponse.json(note, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create note', detail: e.message }, { status: 500 })
  }
}
