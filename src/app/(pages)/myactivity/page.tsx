import { createClient } from "@/lib/supabase/server"
import { getPrivateImageUrl } from "@/lib/e2/actions"
import { redirect } from "next/navigation"
import Link from "next/link"
import { removeFromWatched } from "./actions"
import { Eye, Clock, Star, Calendar, Trash2, Compass, Film, ArrowLeft } from "lucide-react"

export const metadata = {
    title: "My Activity",
    description: "View all the movies you've watched, with dates and ratings.",
}

export default async function MyActivityPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/login")
    }

    const { data: watchedData, error: watchedError } = await supabase
        .from("watched")
        .select("id, watched_at, review_id, movie_reviews(id, rating, comment, movie_id, movies(id, title, slug, poster_url, description, release_date, duration, genres: movie_genres(genres(name)), directors: movie_directors(directors(name, photo_url)), rating: media_stats(global_rating, global_search_count)))")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false })

    if (watchedError) {
        console.error("Error fetching watched movies: ", watchedError)
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Something went wrong loading your activity.</p>
            </div>
        )
    }

    if (!watchedData || watchedData.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-40 glass-effect border-b border-border">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">My Activity</h1>
                                <p className="text-sm text-muted-foreground">0 movies watched</p>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="container mx-auto px-4 py-6">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <Eye className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">No watched movies yet</h2>
                        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                            Rate movies and mark them as watched to see them here. Your viewing history will build up over time!
                        </p>
                        <Link
                            href="/discover"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                        >
                            <Compass className="w-5 h-5" />
                            Start Discovering
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    const movies = await Promise.all(
        watchedData.map(async (entry: any) => {
            const review = entry.movie_reviews
            if (!review) return null

            const movie = review.movies
            if (!movie) return null

            const fullUrl = movie.poster_url
                ? await getPrivateImageUrl(movie.poster_url)
                : "/poster/default"

            const ratingFromDb = (Array.isArray(movie.rating) && movie.rating.length > 0)
                ? movie.rating[0]
                : null

            const ratingObject = {
                global_rating: ratingFromDb?.global_rating || 0,
                global_search_count: ratingFromDb?.global_search_count || null,
            }

            const genresArray = Array.isArray(movie.genres)
                ? movie.genres.map((g: any) => g.genres?.name).filter(Boolean)
                : []

            const directors = Array.isArray(movie.directors)
                ? movie.directors.flatMap((dir: any) => dir.directors).map((d: any) => ({ name: d.name, photo_url: d.photo_url }))
                : []

            return {
                ...movie,
                poster_url: fullUrl,
                rating: ratingObject,
                genres: genresArray,
                directors,
                watchedId: entry.movie_reviews.id,
                watchedAt: entry.watched_at,
                userRating: review.rating,
                userComment: review.comment,
            }
        })
    )

    const filteredMovies = movies.filter(Boolean)

    const totalDuration = filteredMovies.reduce((acc: number, m: any) => acc + (m.duration || 0), 0)
    const totalHours = Math.floor(totalDuration / 60)
    const totalMinutes = totalDuration % 60
    const avgUserRating = filteredMovies.length > 0
        ? (filteredMovies.reduce((acc: number, m: any) => acc + (m.userRating || 0), 0) / filteredMovies.length).toFixed(1)
        : "0.0"

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-effect border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">My Activity</h1>
                                <p className="text-sm text-muted-foreground">
                                    {filteredMovies.length} {filteredMovies.length === 1 ? "movie" : "movies"} watched
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/discover"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                        >
                            <Compass className="w-4 h-4" />
                            <span className="hidden sm:inline">Discover More</span>
                        </Link>
                    </div>

                    {/* Stats bar */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Eye className="w-4 h-4" />
                            <span><span className="font-semibold text-foreground">{filteredMovies.length}</span> watched</span>
                        </div>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span><span className="font-semibold text-foreground">{totalHours}h {totalMinutes}m</span> total</span>
                        </div>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Star className="w-4 h-4" />
                            <span><span className="font-semibold text-foreground">{avgUserRating}</span> avg rating</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMovies.map((movie: any, index: number) => {
                        const durationFormatted = movie.duration
                            ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`
                            : null

                        const watchedDate = movie.watchedAt
                            ? new Date(movie.watchedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })
                            : null

                        return (
                            <div
                                key={movie.watchedId}
                                className="group relative flex gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.03}s` }}
                            >
                                {/* Poster */}
                                <Link href={`/movies/${movie.slug}`} className="shrink-0">
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

                                        {/* User Rating */}
                                        {movie.userRating != null && movie.userRating > 0 && (
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => {
                                                        const starValue = (i + 1) * 2
                                                        const filled = movie.userRating >= starValue
                                                        const halfFilled = movie.userRating >= starValue - 1 && !filled
                                                        return (
                                                            <div key={i} className="relative">
                                                                <Star
                                                                    className={`w-3.5 h-3.5 ${filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
                                                                />
                                                                {halfFilled && (
                                                                    <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                                                                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <span className="text-xs font-medium text-foreground">
                                                    {movie.userRating.toFixed(1)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Genres */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {movie.genres.slice(0, 3).map((genre: string) => (
                                                <span
                                                    key={genre}
                                                    className="text-[10px] px-1.5 py-0 rounded-md border border-border text-muted-foreground"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Watched date */}
                                    {watchedDate && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <Calendar className="w-3 h-3 text-primary/70" />
                                            <p className="text-[11px] text-muted-foreground">
                                                Watched {watchedDate}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Remove button */}
                                <form action={async () => {
                                    "use server"
                                    await removeFromWatched(movie.watchedId)
                                }}>
                                    <button
                                        type="submit"
                                        className="shrink-0 self-start p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all duration-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="sr-only">Remove from watched</span>
                                    </button>
                                </form>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
