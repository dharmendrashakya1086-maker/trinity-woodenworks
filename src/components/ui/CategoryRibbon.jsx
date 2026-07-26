import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function CategoryRibbon({ categories = [] }) {
  const scrollRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const speedRef = useRef(0.5)
  const rafRef = useRef(null)
  const posRef = useRef(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || categories.length < 6) return

    // Duplicate for infinite effect
    const totalWidth = el.scrollWidth / 2

    function animate() {
      if (!isPaused) {
        posRef.current += speedRef.current
        if (posRef.current >= totalWidth) posRef.current = 0
        el.scrollLeft = posRef.current
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [categories, isPaused])

  if (categories.length < 1) return null

  // Duplicate categories for infinite scroll
  const items = [...categories, ...categories, ...categories]

  return (
    <section className="overflow-hidden py-4">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {items.map((c, i) => (
          <Link
            key={`${c.id}-${i}`}
            to={`/shop/${c.id}`}
            className="flex-shrink-0 flex items-center gap-2 glass rounded-xl px-4 py-2.5 hover:bg-gold-dim transition-all no-underline group"
            style={{ minWidth: 160 }}
          >
            {c.image && (
              <img src={c.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
            )}
            <span className="text-xs text-text-muted group-hover:text-gold whitespace-nowrap transition-colors">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
