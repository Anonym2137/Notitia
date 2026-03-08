"use client"

import { useRef, useState, useCallback } from "react"
import { Star, Clock, Clapperboard, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Movie } from "@/types"

interface SwipeCardProps {
  movie: Movie
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
}

export default function SwipeCard({
  movie,
  onSwipeLeft,
  onSwipeRight,
  isTop,
}: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    currentX: 0,
  })
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const threshold = 100

  const handleStart = useCallback(
    (clientX: number) => {
      if (!isTop) return
      setDragState({ isDragging: true, startX: clientX, currentX: 0 })
    },
    [isTop]
  )

  const handleMove = useCallback(
    (clientX: number) => {
      if (!dragState.isDragging) return
      const diff = clientX - dragState.startX
      setDragState((prev) => ({ ...prev, currentX: diff }))
    },
    [dragState.isDragging, dragState.startX]
  )

  const handleEnd = useCallback(() => {
    if (!dragState.isDragging) return
    const diff = dragState.currentX

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setSwipeDirection("right")
        setTimeout(onSwipeRight, 350)
      } else {
        setSwipeDirection("left")
        setTimeout(onSwipeLeft, 350)
      }
    }

    setDragState({ isDragging: false, startX: 0, currentX: 0 })
  }, [dragState, onSwipeLeft, onSwipeRight])

  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX)
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX)
  const handleMouseUp = () => handleEnd()
  const handleMouseLeave = () => {
    if (dragState.isDragging) handleEnd()
  }

  const handleTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX)
  const handleTouchEnd = () => handleEnd()

  const rotation = dragState.isDragging ? dragState.currentX * 0.06 : 0
  const opacity = dragState.isDragging
    ? Math.max(0.5, 1 - Math.abs(dragState.currentX) / 400)
    : 1

  const rightIndicatorOpacity = dragState.isDragging
    ? Math.min(1, Math.max(0, dragState.currentX / threshold))
    : 0

  const leftIndicatorOpacity = dragState.isDragging
    ? Math.min(1, Math.max(0, -dragState.currentX / threshold))
    : 0

  const durationFormatted = movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : null

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute inset-0 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none swipe-card-shadow",
        swipeDirection === "right" && "animate-swipe-right",
        swipeDirection === "left" && "animate-swipe-left",
        !swipeDirection && isTop && "animate-card-enter"
      )}
      style={{
        transform: dragState.isDragging
          ? `translateX(${dragState.currentX}px) rotate(${rotation}deg)`
          : undefined,
        opacity,
        transition: dragState.isDragging ? "none" : "transform 0.3s ease",
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Movie poster */}
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="w-full h-full object-cover"
        draggable={false}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

      {/* Swipe indicators */}
      <div
        className="absolute top-8 right-8 border-4 border-[oklch(0.65_0.2_145)] rounded-xl px-4 py-2 rotate-12 pointer-events-none"
        style={{ opacity: rightIndicatorOpacity }}
      >
        <span className="text-2xl font-black text-[oklch(0.65_0.2_145)]">
          WATCHLIST
        </span>
      </div>

      <div
        className="absolute top-8 left-8 border-4 border-destructive rounded-xl px-4 py-2 -rotate-12 pointer-events-none"
        style={{ opacity: leftIndicatorOpacity }}
      >
        <span className="text-2xl font-black text-destructive">
          SKIP
        </span>
      </div>

      {/* Movie info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {/* Genres */}
        <div className="flex flex-wrap gap-2 mb-3">
          {movie.genres.map((genre) => (
            <Badge
              key={genre}
              variant="secondary"
              className="bg-foreground/10 text-foreground backdrop-blur-sm border-foreground/20 text-xs"
            >
              {genre}
            </Badge>
          ))}
        </div>

        <h2
          className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
        >
          {movie.title}
        </h2>

        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-semibold text-foreground">{movie.rating.global_rating.toFixed(2)}</span>
          </div>
          {durationFormatted && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{durationFormatted}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clapperboard className="w-4 h-4" />
            <span>{movie.release_date}</span>
          </div>
        </div>

        {/* Expandable details */}
        <button
          className="flex items-center gap-1 mt-3 text-xs text-primary font-medium"
          onClick={(e) => {
            e.stopPropagation()
            setShowDetails(!showDetails)
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {showDetails ? "Hide details" : "Show details"}
          {showDetails ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        {showDetails && (
          <div className="mt-3 animate-fade-in-up rounded-xl bg-background/80 backdrop-blur-md border border-border/50 p-4 space-y-2">
            <p className="text-sm text-foreground leading-relaxed">
              {movie.description}
            </p>
            {movie.directors.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Directed by{" "}
                <span className="text-foreground font-medium">
                  {movie.directors.map(d => d.name).join(", ")}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}