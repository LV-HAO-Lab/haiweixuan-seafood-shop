import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { addressSchema } from '@/lib/validators'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const { id } = params

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '地址不存在' }, { status: 404 })
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: '无权修改此地址' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: '地址信息不完整', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const data = parsed.data

  const updated = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    return tx.address.update({
      where: { id },
      data: {
        recipientName: data.recipientName,
        phone: data.phone,
        province: data.province,
        city: data.city,
        district: data.district,
        detail: data.detail,
        isDefault: data.isDefault ?? false,
      },
    })
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const { id } = params

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '地址不存在' }, { status: 404 })
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: '无权删除此地址' }, { status: 403 })
  }

  await prisma.address.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
