import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validators'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = params

  const product = await prisma.product.findUnique({
    where: { id },
    include: { skus: true },
  })

  if (!product) {
    return NextResponse.json({ error: '商品不存在' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = params

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '商品不存在' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { name, description, category, images, basePrice, skus } = parsed.data
  // Allow isPublished override from body (not in productSchema)
  const isPublished = typeof body.isPublished === 'boolean' ? body.isPublished : existing.isPublished

  try {
    const product = await prisma.$transaction(async (tx) => {
      // Delete existing SKUs
      await tx.productSKU.deleteMany({ where: { productId: id } })

      // Update product and create new SKUs
      const updated = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          category,
          images,
          basePrice,
          isPublished,
          skus: {
            create: skus.map((sku) => ({
              sku: sku.sku,
              price: sku.price,
              stock: sku.stock,
              image: sku.image || null,
              isDefault: sku.isDefault || false,
            })),
          },
        },
        include: { skus: true },
      })

      return updated
    })

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '更新商品失败' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = params

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '商品不存在' }, { status: 404 })
  }

  // Soft delete: set isPublished = false
  await prisma.product.update({
    where: { id },
    data: { isPublished: false },
  })

  return NextResponse.json({ success: true })
}
