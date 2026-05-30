'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Star, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  content: string
  createdAt: string | Date
}

interface ReviewSectionProps {
  productId: string
  initialReviews: Review[]
}

function StarRating({
  rating,
  interactive = false,
  onChange,
}: {
  rating: number
  interactive?: boolean
  onChange?: (rating: number) => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={
            interactive
              ? 'cursor-pointer hover:scale-110 transition-transform'
              : 'cursor-default'
          }
        >
          <Star
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default function ReviewSection({
  productId,
  initialReviews,
}: ReviewSectionProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('请输入评价内容')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content: content.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '提交失败')
        return
      }

      const newReview: Review = await res.json()
      setReviews((prev) => [newReview, ...prev])
      setRating(5)
      setContent('')
    } catch {
      setError('提交评价失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0'

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        商品评价
        {reviews.length > 0 && (
          <span className="ml-2 text-base font-normal text-gray-500">
            ({reviews.length}条评价，平均 {averageRating} 分)
          </span>
        )}
      </h2>

      {/* Review form (only when logged in) */}
      {session?.user ? (
        <div className="card mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">发表评价</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">评分：</span>
              <StarRating
                rating={rating}
                interactive
                onChange={setRating}
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享您的购买体验..."
              rows={3}
              className="input-field resize-none"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="btn-primary text-sm"
            >
              {submitting ? '提交中...' : '提交评价'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-6">
          登录后可发表评价
        </p>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>暂无评价，成为第一个评价的人吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-ocean-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-ocean-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      {review.userName}
                    </span>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">
                    {review.content}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
