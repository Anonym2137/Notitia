"use client"

import { useState, useTransition } from "react"
import { Eye, Star, Clock, ArrowRight, Plus, Check, Bell, TrendingUp, Loader2 } from "lucide-react"
import { Shuffle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { addToWatchlist, removeFromWatchlist } from "@/app/(pages)/watchlist/actions"
import { toast } from "sonner"

type DashboardMovie = {
    id: number
    title: string
    slug: string
    poster_url: string
    release_date: number
    rating: {
        global_rating: number
        global_search_count: string | null
    }
    genres: string[]
    isInWatchlist: boolean
}

type UserStats = {
    watchedCount: number
    avgRating: number
    watchlistCount: number
}

type UserProfile = {
    full_name: string | null
    username: string | null
    avatar_url: string | null
}

interface HomeDashboardProps {
    user: {
        email: string
    }
    profile: UserProfile | null
    stats: UserStats
    recommendedMovies: DashboardMovie[]
    trendingMovies: DashboardMovie[]
    avatarUrl: string | null
}

export default function HomeDashboard({ user, profile, stats, recommendedMovies, trendingMovies, avatarUrl }: HomeDashboardProps) {
    const displayName = profile?.full_name || profile?.username || user.email.split("@")[0]
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="flex flex-col pb-24 lg:pb-8">
            {/* Welcome Header */}
            <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30 shrink-0">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={displayName}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-sm sm:text-base font-bold text-primary">{initials}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Welcome back</p>
                            <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">{displayName}</h2>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
                        <Bell className="w-5 h-5" />
                    </Button>
                </div>
            </section>

            {/* Discover CTA Card */}
            <section className="px-4 sm:px-6 lg:px-8 py-3">
                <div className="max-w-7xl mx-auto">
                    <Link href="/discover" className="block">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border border-primary/20 p-4 sm:p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                                    <Shuffle className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-foreground text-base sm:text-lg">Find Your Next Movie</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">Swipe through picks tailored for you</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-primary shrink-0 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Stats Row */}
            <section className="px-4 sm:px-6 lg:px-8 py-3">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl bg-card border border-border transition-all duration-200 hover:border-primary/30">
                            <Eye className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xl sm:text-2xl font-bold text-foreground">{stats.watchedCount}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground tracking-wider uppercase font-medium">Watched</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl bg-card border border-border transition-all duration-200 hover:border-primary/30">
                            <Star className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xl sm:text-2xl font-bold text-foreground">{stats.avgRating.toFixed(1)}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground tracking-wider uppercase font-medium">Avg Rating</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl bg-card border border-border transition-all duration-200 hover:border-primary/30">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xl sm:text-2xl font-bold text-foreground">{stats.watchlistCount}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground tracking-wider uppercase font-medium">Watchlist</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recommended For You - Horizontal Scroll */}
            <section className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground">Recommended For You</h3>
                        <Link href="/search" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                            See All
                        </Link>
                    </div>

                    {/* Mobile: horizontal scroll / Desktop: grid */}
                    <div className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:overflow-x-visible">
                        {recommendedMovies.slice(0, 6).map((movie, index) => (
                            <div
                                key={movie.id}
                                className="shrink-0 w-[140px] sm:w-[160px] lg:w-auto snap-start animate-fade-in-up group"
                                style={{ animationDelay: `${index * 0.06}s` }}
                            >
                                <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-secondary">
                                    <Link href={`/movies/${movie.slug}`}>
                                        <Image
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            width={240}
                                            height={360}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </Link>
                                    {/* Rating badge */}
                                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                                        <Star className="w-3 h-3 fill-primary text-primary" />
                                        <span className="text-[10px] sm:text-xs font-semibold text-foreground">
                                            {movie.rating.global_rating.toFixed(1)}
                                        </span>
                                    </div>
                                    {/* Add to watchlist button */}
                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <WatchlistIconBtn movieId={movie.id} initialInWatchlist={movie.isInWatchlist} />
                                    </div>
                                </div>
                                <div className="mt-2 space-y-0.5">
                                    <Link href={`/movies/${movie.slug}`}>
                                        <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                            {movie.title}
                                        </h4>
                                    </Link>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">{movie.release_date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending This Week */}
            <section className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="text-lg sm:text-xl font-bold text-foreground">Trending This Week</h3>
                    </div>

                    <div className="space-y-3">
                        {trendingMovies.slice(0, 5).map((movie, index) => (
                            <Link
                                key={movie.id}
                                href={`/movies/${movie.slug}`}
                                className={cn(
                                    "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card border border-border",
                                    "hover:border-primary/30 hover:shadow-md hover:shadow-primary/5",
                                    "transition-all duration-300 animate-fade-in-up group"
                                )}
                                style={{ animationDelay: `${index * 0.06}s` }}
                            >
                                {/* Rank number */}
                                <span className="text-lg sm:text-xl font-bold text-muted-foreground w-6 text-center shrink-0">
                                    {index + 1}
                                </span>

                                {/* Poster thumbnail */}
                                <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                                    <Image
                                        src={movie.poster_url}
                                        alt={movie.title}
                                        width={56}
                                        height={80}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>

                                {/* Movie info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                        {movie.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex items-center gap-0.5">
                                            <Star className="w-3 h-3 fill-primary text-primary" />
                                            <span className="text-xs sm:text-sm font-medium text-foreground">
                                                {movie.rating.global_rating.toFixed(1)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{movie.release_date}</span>
                                    </div>
                                    <div className="flex gap-1 mt-1.5 flex-wrap">
                                        {movie.genres.slice(0, 2).map((genre) => (
                                            <Badge
                                                key={genre}
                                                variant="outline"
                                                className="text-[9px] sm:text-[10px] px-1.5 py-0"
                                            >
                                                {genre}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Add button */}
                                <WatchlistIconBtn movieId={movie.id} initialInWatchlist={movie.isInWatchlist} inLink />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

function WatchlistIconBtn({ movieId, initialInWatchlist, inLink = false }: { movieId: number; initialInWatchlist: boolean; inLink?: boolean }) {
    const [isInWatchlist, setIsInWatchlist] = useState(initialInWatchlist)
    const [isPending, startTransition] = useTransition()

    const toggle = (e: React.MouseEvent) => {
        if (inLink) {
            e.preventDefault()
            e.stopPropagation()
        }
        const was = isInWatchlist
        setIsInWatchlist(!was)

        startTransition(async () => {
            try {
                if (was) {
                    await removeFromWatchlist(movieId)
                    toast.success("Removed from watchlist")
                } else {
                    await addToWatchlist(movieId)
                    toast.success("Added to watchlist")
                }
            } catch (err) {
                console.error("Failed to update watchlist:", err)
                setIsInWatchlist(was)
                toast.error("Failed to update watchlist")
            }
        })
    }

    return (
        <button
            className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                isInWatchlist
                    ? "bg-primary text-primary-foreground"
                    : inLink
                        ? "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        : "bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
            )}
            onClick={toggle}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isInWatchlist ? (
                <Check className="w-4 h-4" />
            ) : (
                <Plus className="w-4 h-4" />
            )}
        </button>
    )
}
