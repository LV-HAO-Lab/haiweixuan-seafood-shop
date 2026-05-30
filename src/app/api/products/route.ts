import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  const where: any = { isPublished: true }

  if (category) where.category = category
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } }
    ]
  }

  const orderBy: any = {
    sales: { salesCount: 'desc' },
    price_asc: { basePrice: 'asc' },
    price_desc: { basePrice: 'desc' },
    newest: { createdAt: 'desc' }
  }[sort] || { createdAt: 'desc' }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { skus: { where: { isDefault: true }, take: 1 } },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ])

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) })
}
