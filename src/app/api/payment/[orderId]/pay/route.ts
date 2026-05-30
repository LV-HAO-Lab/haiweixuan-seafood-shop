import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }
  const userId = (session.user as any).id

  const { orderId } = params

  const body = await req.json()
  const { paymentMethod } = body as { paymentMethod: string }

  // Validate paymentMethod
  if (!paymentMethod || !['ALIPAY', 'WECHAT'].includes(paymentMethod)) {
    return NextResponse.json({ error: '无效的支付方式' }, { status: 400 })
  }

  // Verify order exists, belongs to user, and is PENDING
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 })
  }
  if (order.userId !== userId) {
    return NextResponse.json({ error: '无权操作此订单' }, { status: 403 })
  }
  if (order.status !== 'PENDING') {
    return NextResponse.json({ error: '订单状态不允许支付' }, { status: 400 })
  }

  // Simulate 1.5 second processing delay
  await new Promise((r) => setTimeout(r, 1500))

  // Update order: set status PAID, paymentMethod, paidAt now
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'PAID',
      paymentMethod: paymentMethod as 'ALIPAY' | 'WECHAT',
      paidAt: new Date()
    },
    include: {
      items: true,
      address: true
    }
  })

  return NextResponse.json({ success: true, order: updatedOrder })
}
