import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const sprint = searchParams.get('sprint')

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status
    if (sprint) where.sprint = sprint

    const items = await prisma.roadmapItem.findMany({
      where,
      orderBy: [{ order: 'asc' }, { targetDate: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(items)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch roadmap', detail: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.roadmapItem.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        description: body.description || null,
        status: body.status || 'planned',
        priority: body.priority || null,
        sprint: body.sprint || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        completedAt: body.status === 'completed' ? new Date() : null,
        tags: body.tags || [],
        order: body.order || 0,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create roadmap item', detail: e.message }, { status: 500 })
  }
}
