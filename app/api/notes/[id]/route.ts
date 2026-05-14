import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const note = await prisma.note.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(note)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update note', detail: e.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.note.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete', detail: e.message }, { status: 500 })
  }
}
