import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Fetch order by id with items and address. Verify order belongs to user.
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }
  const userId = (session.user as any).id

  const { id } = params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      address: true
    }
  })

  if (!order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 })
  }

  if (order.userId !== userId) {
    return NextResponse.json({ error: '无权访问此订单' }, { status: 403 })
  }

  return NextResponse.json(order)
}

// PATCH: Handle order actions (cancel, confirm receipt)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }
  const userId = (session.user as any).id

  const { id } = params

  const body = await req.json()
  const { action } = body as { action: string }

  // Cancel order
  if (action === 'cancel') {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }
    if (order.userId !== userId) {
      return NextResponse.json({ error: '无权操作此订单' }, { status: 403 })
    }
    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: '只能取消待付款订单' }, { status: 400 })
    }

    // In transaction: set status CANCELLED, restore stock for each item
    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.productSKU.update({
          where: { id: item.skuId },
          data: { stock: { increment: item.quantity } }
        })
      }

      return tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          items: true,
          address: true
        }
      })
    })

    return NextResponse.json(updatedOrder)
  }

  // Confirm receipt
  if (action === 'confirm') {
    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }
    if (order.userId !== userId) {
      return NextResponse.json({ error: '无权操作此订单' }, { status: 403 })
    }
    if (order.status !== 'SHIPPED') {
      return NextResponse.json({ error: '只能确认已发货的订单' }, { status: 400 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      },
      include: {
        items: true,
        address: true
      }
    })

    return NextResponse.json(updatedOrder)
  }

  return NextResponse.json({ error: '无效的操作' }, { status: 400 })
}
