import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { name, description, category, images, basePrice, skus } = parsed.data
  const isPublished = typeof body.isPublished === 'boolean' ? body.isPublished : true

  try {
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
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

      return newProduct
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '创建商品失败' }, { status: 500 })
  }
}
