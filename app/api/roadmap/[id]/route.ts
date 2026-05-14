import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const data: any = { ...body }
    if (body.startDate) data.startDate = new Date(body.startDate)
    if (body.targetDate) data.targetDate = new Date(body.targetDate)
    if (body.status === 'completed' && !body.completedAt) data.completedAt = new Date()
    if (body.status && body.status !== 'completed') data.completedAt = null

    const item = await prisma.roadmapItem.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(item)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update', detail: e.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.roadmapItem.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete', detail: e.message }, { status: 500 })
  }
}
