"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { X, Heart, RotateCcw, ArrowLeft, BookmarkPlus, ChevronRight, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SwipeCard from "@/components/SwipeCard"
import { cn } from "@/lib/utils"
import { Movie } from "@/types"
import { addToWatchlist, removeFromWatchlist } from "@/app/(pages)/watchlist/actions"
import { toast } from "sonner"
import Link from "next/link"

type MovieSwiperProps = {
  movies: Movie[]
}

export default function MovieSwiper({ movies }: MovieSwiperProps) {
  const router = useRouter()

  const handleClose = () => {
    router.push("/")
  }

  const [initialWatchlist] = useState(() => movies.filter((m) => m.isInWatchlist))
  const [newMovies] = useState(() => movies.filter((m) => !m.isInWatchlist))

  const [currentIndex, setCurrentIndex] = useState(0)
  const [watchlist, setWatchlist] = useState<Movie[]>(initialWatchlist)
  const [skipped, setSkipped] = useState<Movie[]>([])
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [lastAction, setLastAction] = useState<"added" | "skipped" | null>(null)
  const [isPending, startTransition] = useTransition()

  const remainingMovies = newMovies.slice(currentIndex)
  const isDone = currentIndex >= newMovies.length

  const handleSwipeRight = useCallback(() => {
    const movie = newMovies[currentIndex]
    if (movie) {
      setWatchlist((prev) => [...prev, movie])
      setLastAction("added")
      setTimeout(() => setLastAction(null), 1500)

      startTransition(async () => {
        try {
          await addToWatchlist(movie.id)
        } catch (err) {
          console.error("Failed to add to watchlist:", err)
          toast.error("Failed to save to watchlist")
          setWatchlist((prev) => prev.filter((m) => m.id !== movie.id))
        }
      })
    }
    setCurrentIndex((prev) => prev + 1)
  }, [currentIndex, newMovies])

  const handleSwipeLeft = useCallback(() => {
    const movie = newMovies[currentIndex]
    if (movie) {
      setSkipped((prev) => [...prev, movie])
      setLastAction("skipped")
      setTimeout(() => setLastAction(null), 1500)
    }
    setCurrentIndex((prev) => prev + 1)
  }, [currentIndex, newMovies])

  const handleUndo = () => {
    if (currentIndex === 0) return
    const prevIndex = currentIndex - 1
    const prevMovie = newMovies[prevIndex]

    const wasInWatchlist = watchlist.some((m) => m.id === prevMovie.id)

    setWatchlist((prev) => prev.filter((m) => m.id !== prevMovie.id))
    setSkipped((prev) => prev.filter((m) => m.id !== prevMovie.id))
    setCurrentIndex(prevIndex)

    if (wasInWatchlist) {
      startTransition(async () => {
        try {
          await removeFromWatchlist(prevMovie.id)
        } catch (err) {
          console.error("Failed to undo watchlist add:", err)
          toast.error("Failed to undo")
        }
      })
    }
  }

  const handleRemoveFromWatchlist = (movie: Movie) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== movie.id))

    startTransition(async () => {
      try {
        await removeFromWatchlist(movie.id)
        toast.success(`Removed "${movie.title}" from watchlist`)
      } catch (err) {
        console.error("Failed to remove from watchlist:", err)
        toast.error("Failed to remove from watchlist")
        setWatchlist((prev) => [...prev, movie])
      }
    })
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setWatchlist(initialWatchlist)
    setSkipped([])
    setShowWatchlist(false)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 glass-effect">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold text-foreground"
            >
              Discover
            </span>
            {!isDone && (
              <Badge variant="secondary" className="text-xs font-mono">
                {currentIndex + 1} / {newMovies.length}
              </Badge>
            )}
            {isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWatchlist(!showWatchlist)}
            className="gap-1.5 text-muted-foreground hover:text-foreground relative"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {watchlist.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center h-full pt-14 pb-24">
        {showWatchlist ? (
          <WatchlistPanel
            watchlist={watchlist}
            onClose={() => setShowWatchlist(false)}
            onRemove={handleRemoveFromWatchlist}
          />
        ) : isDone ? (
          <DoneScreen
            watchlist={watchlist}
            onRestart={handleRestart}
            onShowWatchlist={() => setShowWatchlist(true)}
            onClose={handleClose}
          />
        ) : (
          <div className="relative w-full max-w-sm h-[520px] sm:h-[580px] mx-4">
            {/* Stack of cards (show up to 3) */}
            {remainingMovies.slice(0, 3).map((movie, i) => {
              const isTop = i === 0
              return (
                <div
                  key={movie.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: 3 - i,
                    transform: `scale(${1 - i * 0.04}) translateY(${i * 12}px)`,
                    opacity: isTop ? 1 : 0.6 - i * 0.2,
                    transition: "transform 0.3s ease, opacity 0.3s ease",
                  }}
                >
                  {isTop ? (
                    <SwipeCard
                      movie={movie}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      isTop
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden bg-secondary">
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-background/40" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Action toast */}
      {lastAction && (
        <div
          className={cn(
            "fixed top-20 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 rounded-full text-sm font-semibold animate-fade-in-up",
            lastAction === "added"
              ? "bg-[oklch(0.65_0.2_145)] text-[oklch(0.15_0.005_260)]"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {lastAction === "added" ? "Added to watchlist!" : "Skipped"}
        </div>
      )}

      {/* Bottom controls */}
      {!isDone && !showWatchlist && (
        <div className="absolute bottom-0 left-0 right-0 z-50 pb-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full bg-card border-border hover:bg-secondary hover:border-muted-foreground transition-all"
              onClick={handleUndo}
              disabled={currentIndex === 0}
            >
              <RotateCcw className="w-5 h-5" />
              <span className="sr-only">Undo</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full bg-card border-destructive/40 hover:bg-destructive/10 hover:border-destructive text-destructive transition-all"
              onClick={handleSwipeLeft}
            >
              <X className="w-7 h-7" />
              <span className="sr-only">Skip</span>
            </Button>

            <Button
              size="icon"
              className="w-16 h-16 rounded-full bg-[oklch(0.65_0.2_145)] hover:bg-[oklch(0.6_0.2_145)] text-[oklch(0.15_0.005_260)] border-0 transition-all shadow-lg shadow-[oklch(0.65_0.2_145_/_0.3)]"
              onClick={handleSwipeRight}
            >
              <Heart className="w-7 h-7" />
              <span className="sr-only">Add to watchlist</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full bg-card border-border hover:bg-secondary hover:border-muted-foreground transition-all"
              onClick={() => setShowWatchlist(true)}
            >
              <BookmarkPlus className="w-5 h-5" />
              <span className="sr-only">View watchlist</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function WatchlistPanel({
  watchlist,
  onClose,
  onRemove,
}: {
  watchlist: Movie[]
  onClose: () => void
  onRemove: (movie: Movie) => void
}) {
  return (
    <div className="w-full max-w-lg mx-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-bold text-foreground"
        >
          Your Watchlist ({watchlist.length})
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-16">
          <BookmarkPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No movies yet. Swipe right to add some!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlist.map((movie, index) => {
            const durationFormatted = movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : null
            return (
              <div
                key={movie.id}
                className="flex gap-4 p-3 rounded-xl bg-card border border-border animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-16 h-24 rounded-lg overflow-hidden bg-secondary shrink-0">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {movie.release_date}
                    {durationFormatted && <> &middot; {durationFormatted}</>}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-4 h-4 fill-primary text-primary">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {movie.rating.global_rating.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {movie.genres.slice(0, 2).map((genre) => (
                      <Badge
                        key={genre}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 self-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => onRemove(movie)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Remove from watchlist</span>
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DoneScreen({
  watchlist,
  onRestart,
  onShowWatchlist,
  onClose,
}: {
  watchlist: Movie[]
  onRestart: () => void
  onShowWatchlist: () => void
  onClose: () => void
}) {
  return (
    <div className="text-center px-6 max-w-md animate-fade-in-up">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Heart className="w-10 h-10 text-primary" />
      </div>
      <h2
        className="text-3xl font-bold text-foreground"
      >
        {"You've seen them all!"}
      </h2>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        You added <span className="text-primary font-bold">{watchlist.length}</span>{" "}
        movies to your watchlist. Time to start watching!
      </p>

      <div className="flex flex-col gap-3 mt-8">
        {watchlist.length > 0 && (
          <Button
            size="lg"
            className="gap-2 font-semibold"
            onClick={onShowWatchlist}
          >
            View Watchlist
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        <Link href="/watchlist">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 font-semibold w-full bg-secondary/50"
          >
            <BookmarkPlus className="w-4 h-4" />
            Full Watchlist Page
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          className="gap-2 font-semibold bg-secondary/50"
          onClick={onRestart}
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </Button>
        <Button variant="ghost" size="lg" onClick={onClose}>
          Back to Home
        </Button>
      </div>
    </div>
  )
}