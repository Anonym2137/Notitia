'use server'

import { createClient } from "@/lib/supabase/server";
import { Movie, MovieReview, WhereToWatch } from "@/types";
import { revalidatePath } from "next/cache";


export default async function getDataFromSlug(slug: Movie['slug']) {
  const supabase = await createClient()

  const cleanSlug = decodeURIComponent(String(slug ?? '')).replace(/\s+/g, ' ').trim()

  const { data, error } = await supabase.from('movies').select(`id, title, slug, poster_url, description, genres: movie_genres(genres(name)), actors: movie_actors(role, actors(id, name, photo_url)), directors: movie_directors(directors(id, name, photo_url)), release_date, duration, rating: media_stats(global_rating, global_search_count)`).eq('slug', cleanSlug).maybeSingle()

  if (error) {
    console.error("Error fetching movie data from supabase: ", error)
    return null
  }

  if (!data) {
    return null
  }

  const { data: { user } } = await supabase.auth.getUser()
  let userRating = 0
  let isInWatchlist = false

  if (user) {
    const { data: ratingData } = await supabase.from("movie_reviews").select("rating").eq("movie_id", data.id).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()

    if (ratingData) {
      userRating = ratingData.rating
    }

    const { data: watchlistData, error: watchlistError } = await supabase.from("watchlist").select("id").eq("user_id", user.id).eq("movie_id", data.id).maybeSingle()

    if (watchlistError) {
      console.error('Error checking watchlist: ', watchlistError)
    }
    if (watchlistData) {
      isInWatchlist = true
    }
  }

  const genres = data.genres.flatMap((g: { genres: { name: string }[] }) => g.genres).map((genre: { name: string }) => genre.name)
  const actors = data.actors.map((actor: any) => ({
    id: actor.actors.id,
    ...actor.actors,
    role: actor.role
  }))
  const directors = data.directors.flatMap((dir: any) => dir.directors).map((d: any) => ({
    id: d.id,
    name: d.name,
    photo_url: d.photo_url
  }))

  const ratingDetails = Array.isArray(data.rating) && data.rating.length > 0 ? data.rating[0] : { global_rating: null, global_search_count: 0 }

  const formattedSearchCount = formatCount(ratingDetails.global_search_count)

  const releaseYear = new Date(data.release_date).getFullYear()
  const tmdbId = await getMovieId(data.title, releaseYear)
  let whereToWatch: WhereToWatch[] = []
  if (tmdbId) {
    const providers = await getWatchProviders(tmdbId)
    if (providers) {
      whereToWatch = providers
    }
  }

  const reviews = await getMovieReviews(data.id, 3)

  const movieResult: Movie = {
    ...data,
    genres,
    actors,
    directors,
    rating: {
      global_rating: ratingDetails.global_rating,
      global_search_count: formattedSearchCount,
    },
    userRating: userRating,
    isInWatchlist: isInWatchlist,
    whereToWatch: whereToWatch,
    reviews: reviews,
  }

  return movieResult
}

async function getMovieId(title: string, year: number): Promise<number | null> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error("TMDB_API_KEY is not set in your environment variables.");
    return null;
  }

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&primary_release_year=${year}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      return data.results[0].id
    }
    return null
  }
  catch (error) {
    console.error("Could not fetch TMDB id: ", error)
    return null
  }
}

async function getWatchProviders(movieId: number): Promise<WhereToWatch[] | null> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error("TMDB_API_KEY is not set in your environment variables.");
    return null;
  }

  const url = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return null
    }

    const data = await response.json()
    const providers = data.results?.US?.flatrate || []
    return providers.map((provider: any) => ({
      name: provider.provider_name,
      logo_path: provider.logo_path,
      provider_id: provider.provider_id,
    }))
  }
  catch (error) {
    console.error(`Could not fetch watch providers: ${error}`)
    return null
  }
}

export async function toggleWatchlist(movieId: number): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in')
  }

  const { error: insertError } = await supabase.from("watchlist").insert({ user_id: user.id, movie_id: movieId })

  if (insertError) {
    if (insertError.code === '23505') {
      const { error: deleteError } = await supabase.from("watchlist").delete().eq("user_id", user.id).eq("movie_id", movieId)

      if (deleteError) {
        console.error('Error removing from watchlist: ', deleteError)
        throw new Error('Failed to remove from watchlist')
      }

      revalidatePath('/')
      revalidatePath('/search')
      return false
    }

    console.error('Error adding to watchlist: ', insertError)
    throw new Error('Failed to add to watchlist')
  }

  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath('/movies/[slug]', 'page')
  return true
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' mln'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + ' k'
  return n.toString()
}

export async function getMovieReviews(movieId: number, limit?: number): Promise<MovieReview[]> {
  const supabase = await createClient()

  let query = supabase
    .from("movie_reviews")
    .select("id, rating, comment, created_at, user:users(user_id, username, avatar_url)")
    .eq("movie_id", movieId)
    .order("created_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching movie reviews: ", error)
    return []
  }

  if (!data) return []

  return data.map((review: any) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.created_at,
    user: {
      user_id: review.user.user_id,
      username: review.user.username,
      avatar_url: review.user.avatar_url,
    }
  }))
}