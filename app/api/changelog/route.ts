import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const type = searchParams.get('type')
    const version = searchParams.get('version')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (type) where.type = type
    if (version) where.version = version
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const entries = await prisma.changelogEntry.findMany({
      where,
      include: { project: true },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const entry = await prisma.changelogEntry.create({
      data: body,
      include: { project: true }
    })
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const entry = await prisma.changelogEntry.update({
      where: { id },
      data,
      include: { project: true }
    })
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    await prisma.changelogEntry.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
