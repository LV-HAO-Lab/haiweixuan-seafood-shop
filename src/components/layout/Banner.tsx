'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slide {
  title: string
  subtitle: string
  bg: string
  emoji: string
}

const slides: Slide[] = [
  {
    title: '深海珍品 · 源头直供',
    subtitle: '精选优质海参，每一口都是大海的馈赠',
    bg: 'from-ocean-700 to-ocean-900',
    emoji: '🦪',
  },
  {
    title: '佛跳墙礼盒 · 馈赠佳品',
    subtitle: '传统工艺熬制，浓汤鲍汁，宴客首选',
    bg: 'from-amber-600 to-amber-800',
    emoji: '🍲',
  },
  {
    title: '鲜食水饺 · 家的味道',
    subtitle: '手工包制，皮薄馅大，鲜美多汁',
    bg: 'from-ocean-600 to-ocean-800',
    emoji: '🥟',
  },
]

export default function Banner() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 500)
    },
    [isTransitioning],
  )

  const prev = useCallback(() => {
    goTo(current === 0 ? slides.length - 1 : current - 1)
  }, [current, goTo])

  const next = useCallback(() => {
    goTo(current === slides.length - 1 ? 0 : current + 1)
  }, [current, goTo])

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]

  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Slide background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r transition-opacity duration-500',
          slide.bg,
        )}
      />

      {/* Slide content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4">
        <div className="flex flex-col items-start gap-4 text-white max-w-lg">
          <span className="text-5xl md:text-6xl">{slide.emoji}</span>
          <h2 className="text-2xl md:text-4xl font-bold leading-tight">
            {slide.title}
          </h2>
          <p className="text-sm md:text-lg text-white/80">
            {slide.subtitle}
          </p>
          <Link
            href="/products"
            className="mt-2 inline-flex items-center rounded-btn bg-white px-6 py-2.5 text-sm font-medium text-ocean-800 transition-colors hover:bg-gray-100"
          >
            立即选购
          </Link>
        </div>
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        aria-label="上一张"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        aria-label="下一张"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`切换到第 ${i + 1} 张`}
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-all',
              i === current
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/80',
            )}
          />
        ))}
      </div>
    </section>
  )
}
