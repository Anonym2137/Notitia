import { createClient } from "@/lib/supabase/server"
import { getPrivateImageUrl } from "@/lib/e2/actions"
import { redirect } from "next/navigation"
import WatchlistClient from "@/components/WatchlistClient"

export const metadata = {
    title: "My Watchlist",
    description: "Your personal movie watchlist. Browse and manage all the movies you've saved to watch later.",
}

export default async function WatchlistPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/login")
    }

    const { data: watchlistData, error: watchlistError } = await supabase
        .from("watchlist")
        .select("movie_id, added_at, movies(id, title, slug, poster_url, description, release_date, duration, genres: movie_genres(genres(name)), directors: movie_directors(directors(name, photo_url)), rating: media_stats(global_rating, global_search_count))")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false })

    if (watchlistError) {
        console.error("Error fetching watchlist: ", watchlistError)
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Something went wrong loading your watchlist.</p>
            </div>
        )
    }

    if (!watchlistData || watchlistData.length === 0) {
        return <WatchlistClient movies={[]} />
    }

    const movies = await Promise.all(
        watchlistData.map(async (entry: any) => {
            const movie = entry.movies
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
                actors: [],
                isInWatchlist: true,
                whereToWatch: [],
                addedAt: entry.created_at,
            }
        })
    )

    const filteredMovies = movies.filter(Boolean)

    return <WatchlistClient movies={filteredMovies} />
}
