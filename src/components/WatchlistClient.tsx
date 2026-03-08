"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookmarkPlus, Clock, Film, Search, Trash2, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Movie } from "@/types"
import { removeFromWatchlist } from "../app/(pages)/watchlist/actions"
import { toast } from "sonner"

type WatchlistMovie = Movie & { addedAt?: string }

type WatchlistClientProps = {
    movies: WatchlistMovie[]
}

export default function WatchlistClient({ movies: initialMovies }: WatchlistClientProps) {
    const router = useRouter()
    const [movies, setMovies] = useState<WatchlistMovie[]>(initialMovies)
    const [searchQuery, setSearchQuery] = useState("")
    const [isPending, startTransition] = useTransition()
    const [removingId, setRemovingId] = useState<number | null>(null)

    const filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleRemove = (movie: WatchlistMovie) => {
        setRemovingId(movie.id)

        setMovies((prev) => prev.filter((m) => m.id !== movie.id))

        startTransition(async () => {
            try {
                await removeFromWatchlist(movie.id)
                toast.success(`Removed "${movie.title}" from watchlist`)
            } catch (err) {
                console.error("Failed to remove from watchlist:", err)
                toast.error("Failed to remove from watchlist")
                setMovies((prev) => [...prev, movie])
            } finally {
                setRemovingId(null)
            }
        })
    }

    const totalDuration = movies.reduce((acc, m) => acc + (m.duration || 0), 0)
    const totalHours = Math.floor(totalDuration / 60)
    const totalMinutes = totalDuration % 60

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-effect border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    My Watchlist
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {movies.length} {movies.length === 1 ? "movie" : "movies"} saved
                                </p>
                            </div>
                        </div>
                        <Link href="/discover">
                            <Button className="gap-2 font-semibold">
                                <Compass className="w-4 h-4" />
                                <span className="hidden sm:inline">Discover More</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Stats bar */}
                    {movies.length > 0 && (
                        <div className="flex items-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Film className="w-4 h-4" />
                                <span><span className="font-semibold text-foreground">{movies.length}</span> movies</span>
                            </div>
                            <div className="w-px h-4 bg-border" />
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span><span className="font-semibold text-foreground">{totalHours}h {totalMinutes}m</span> total</span>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    {movies.length > 0 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search your watchlist..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-secondary/50 border-border"
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-6">
                {movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <BookmarkPlus className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Your watchlist is empty
                        </h2>
                        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                            Start discovering movies and swipe right on the ones you want to watch.
                            They{"'"}ll show up here!
                        </p>
                        <Link href="/discover">
                            <Button size="lg" className="gap-2 font-semibold">
                                <Compass className="w-5 h-5" />
                                Start Discovering
                            </Button>
                        </Link>
                    </div>
                ) : filteredMovies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Search className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                            No matches found
                        </h3>
                        <p className="text-muted-foreground">
                            Try a different search term
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMovies.map((movie, index) => {
                            const durationFormatted = movie.duration
                                ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`
                                : null

                            const addedDate = movie.addedAt
                                ? new Date(movie.addedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                                : null

                            return (
                                <div
                                    key={movie.id}
                                    className={cn(
                                        "group relative flex gap-4 p-4 rounded-2xl bg-card border border-border",
                                        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                                        "transition-all duration-300 animate-fade-in-up"
                                    )}
                                    style={{ animationDelay: `${index * 0.03}s` }}
                                >
                                    {/* Poster */}
                                    <Link
                                        href={`/movies/${movie.slug}`}
                                        className="shrink-0"
                                    >
                                        <div className="w-20 h-[120px] rounded-xl overflow-hidden bg-secondary relative">
                                            <img
                                                src={movie.poster_url}
                                                alt={movie.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <Link href={`/movies/${movie.slug}`}>
                                                <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                                                    {movie.title}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {movie.release_date}
                                                {durationFormatted && <> &middot; {durationFormatted}</>}
                                            </p>

                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mt-1.5">
                                                <div className="w-4 h-4 fill-primary text-primary">
                                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                    {movie.rating.global_rating.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Genres */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {movie.genres.slice(0, 3).map((genre) => (
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

                                        {/* Added date */}
                                        {addedDate && (
                                            <p className="text-[11px] text-muted-foreground mt-2">
                                                Added {addedDate}
                                            </p>
                                        )}
                                    </div>

                                    {/* Remove button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "shrink-0 self-start",
                                            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                                            "opacity-0 group-hover:opacity-100 transition-all duration-200",
                                            "sm:opacity-100"
                                        )}
                                        onClick={() => handleRemove(movie)}
                                        disabled={removingId === movie.id}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="sr-only">Remove from watchlist</span>
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
