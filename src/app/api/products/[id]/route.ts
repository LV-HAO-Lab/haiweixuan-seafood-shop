import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const product = await prisma.product.findUnique({
    where: { id, isPublished: true },
    include: {
      skus: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!product) {
    return NextResponse.json({ error: '商品不存在' }, { status: 404 })
  }

  return NextResponse.json(product)
}
