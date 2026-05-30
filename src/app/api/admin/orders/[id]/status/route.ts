import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = params

  const body = await req.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '无效的订单状态' }, { status: 400 })
  }

  const { status } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 })
  }

  try {
    // If cancelling, restore stock in transaction
    if (status === 'CANCELLED') {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.productSKU.update({
            where: { id: item.skuId },
            data: { stock: { increment: item.quantity } },
          })
        }

        return tx.order.update({
          where: { id },
          data: { status },
          include: {
            items: true,
            user: { select: { name: true, email: true } },
          },
        })
      })

      return NextResponse.json(updatedOrder)
    }

    // For other status changes, just update
    const updateData: any = { status }
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '更新订单状态失败' }, { status: 500 })
  }
}
