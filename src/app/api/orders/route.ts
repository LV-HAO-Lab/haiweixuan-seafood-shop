import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createOrderSchema } from '@/lib/validators'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }
  const userId = (session.user as any).id

  const body = await req.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { addressId, items, notes } = parsed.data

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify all SKUs have sufficient stock
      for (const item of items) {
        const sku = await tx.productSKU.findUnique({
          where: { id: item.skuId },
          include: { product: true }
        })
        if (!sku) throw new Error(`SKU ${item.skuId} 不存在`)
        if (sku.stock < item.quantity) {
          throw new Error(`"${sku.product.name} - ${sku.sku}" 库存不足，当前库存: ${sku.stock}`)
        }
      }

      // 2. Deduct stock for all SKUs
      for (const item of items) {
        await tx.productSKU.update({
          where: { id: item.skuId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      // 3. Calculate total and prepare order items
      let totalAmount = 0
      const orderItemsData = []

      for (const item of items) {
        const sku = await tx.productSKU.findUnique({
          where: { id: item.skuId },
          include: { product: true }
        })
        const price = Number(sku!.price)
        const lineTotal = price * item.quantity
        totalAmount += lineTotal
        orderItemsData.push({
          productId: sku!.productId,
          skuId: sku!.id,
          productName: sku!.product.name,
          skuLabel: sku!.sku,
          price,
          quantity: item.quantity
        })
      }

      // 4. Create order with items
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          totalAmount,
          notes,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true,
          address: true
        }
      })

      // 5. Update product sales counts
      for (const item of items) {
        await tx.product.update({
          where: { id: orderItemsData.find(oi => oi.skuId === item.skuId)!.productId },
          data: { salesCount: { increment: item.quantity } }
        })
      }

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '下单失败' }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }
  const userId = (session.user as any).id

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(orders)
}
