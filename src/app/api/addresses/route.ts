import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { addressSchema } from '@/lib/validators'

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const userId = (session.user as any).id

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(addresses)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const userId = (session.user as any).id

  const body = await req.json()
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: '地址信息不完整', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const data = parsed.data

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    return tx.address.create({
      data: {
        userId,
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

  return NextResponse.json(address, { status: 201 })
}
