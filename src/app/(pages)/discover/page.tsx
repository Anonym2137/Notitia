import { createClient } from "@/lib/supabase/server";
import { getPrivateImageUrl } from "@/lib/e2/actions";
import MovieSwiper from "@/components/MovieSwiper";

export default async function DiscoverPage() {
    const supabase = await createClient()
    let watchlistIds: number[] = []

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: watchlistData } = await supabase.from("watchlist").select("movie_id").eq("user_id", user.id)
        watchlistIds = watchlistData?.map(w => w.movie_id) ?? []
    }

    const { data: movies, error: moviesError } = await supabase.rpc('get_discovery_batch_page', {
        p_user_id: user?.id ?? null
    })

    if (moviesError) {
        console.error("Error fetching movies for discover: ", moviesError)
        return null
    }

    if (!movies || movies.length === 0) {
        return <div>No data</div>
    }

    const moviesWithFullUrls = await Promise.all(
        movies.map(async (movie: any) => {
            const fullUrl = movie.out_poster_url ? await getPrivateImageUrl(movie.out_poster_url) : ""

            const genresArray = Array.isArray(movie.out_genres) ? movie.out_genres : []

            const directors = Array.isArray(movie.out_directors)
                ? movie.out_directors.map((d: any) => ({ name: d.name, photo_url: d.photo_url }))
                : []

            const actors = Array.isArray(movie.out_actors)
                ? movie.out_actors.map((a: any) => ({ name: a.name, photo_url: a.photo_url, role: a.role }))
                : []

            const ratingObject = movie.out_rating
                ? { global_rating: movie.out_rating.global_rating || 0, global_search_count: movie.out_rating.global_search_count || null }
                : { global_rating: 0, global_search_count: null }

            return {
                id: movie.out_id,
                title: movie.out_title,
                slug: movie.out_slug,
                poster_url: fullUrl,
                description: movie.out_description || "",
                release_date: movie.out_release_date,
                duration: movie.out_duration || 0,
                rating: ratingObject,
                genres: genresArray,
                directors,
                actors,
                isInWatchlist: watchlistIds.includes(movie.out_id),
                whereToWatch: [],
            }
        })
    )

    return (
        <div className="flex flex-col">
            <main className="flex-1">
                <MovieSwiper movies={moviesWithFullUrls} />
            </main>
        </div>
    )
}

