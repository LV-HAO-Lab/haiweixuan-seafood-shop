import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1, '请输入评价内容').max(1000),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const reviews = await prisma.review.findMany({
    where: { productId: id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reviews)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { id: productId } = params

    const product = await prisma.product.findUnique({
      where: { id: productId, isPublished: true },
    })
    if (!product) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { rating, content } = parsed.data
    const userId = (session.user as any).id
    const userName = session.user.name || '匿名用户'

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        userName,
        rating,
        content,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: '提交评价失败，请稍后重试' }, { status: 500 })
  }
}
