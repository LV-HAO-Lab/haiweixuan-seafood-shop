import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const shipSchema = z.object({
  trackingNumber: z.string().min(1, '请输入物流单号'),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = params

  const body = await req.json()
  const parsed = shipSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { trackingNumber } = parsed.data

  const order = await prisma.order.findUnique({ where: { id } })

  if (!order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 })
  }

  if (order.status !== 'PAID') {
    return NextResponse.json({ error: '只能对已付款的订单进行发货' }, { status: 400 })
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: 'SHIPPED',
      trackingNumber,
      shippedAt: new Date(),
    },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  })

  return NextResponse.json(updatedOrder)
}
