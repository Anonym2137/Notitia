'use server'

import { createClient } from "@/lib/supabase/server"
import { getPrivateImageUrl } from "@/lib/e2/actions"

export type PersonMovie = {
    id: number
    title: string
    slug: string
    poster_url: string
    release_date: number
    role?: string
    rating: {
        global_rating: number
        global_search_count: string | null
    }
    genres: string[]
}

export type PersonDetail = {
    id: number
    name: string
    photo_url: string
    type: "actor" | "director" | "both"
    moviesAsActor: PersonMovie[]
    moviesAsDirector: PersonMovie[]
}

export async function getPersonById(id: number, preferredType?: "actor" | "director"): Promise<PersonDetail | null> {
    const supabase = await createClient()

    // Look up the person by the URL id in the appropriate table(s)
    let actor: { id: number; name: string; photo_url: string } | null = null
    let director: { id: number; name: string; photo_url: string } | null = null

    if (preferredType === "director") {
        // URL id refers to the directors table
        const { data } = await supabase.from("directors").select("id, name, photo_url").eq("id", id).maybeSingle()
        director = data
        if (director) {
            // Find the same person (by name) in the actors table
            const { data: actorData } = await supabase.from("actors").select("id, name, photo_url").eq("name", director.name).maybeSingle()
            actor = actorData
        }
    } else if (preferredType === "actor") {
        // URL id refers to the actors table
        const { data } = await supabase.from("actors").select("id, name, photo_url").eq("id", id).maybeSingle()
        actor = data
        if (actor) {
            // Find the same person (by name) in the directors table
            const { data: directorData } = await supabase.from("directors").select("id, name, photo_url").eq("name", actor.name).maybeSingle()
            director = directorData
        }
    } else {
        // No preferred type — try both tables by id, then cross-reference by name
        const [actorResult, directorResult] = await Promise.all([
            supabase.from("actors").select("id, name, photo_url").eq("id", id).maybeSingle(),
            supabase.from("directors").select("id, name, photo_url").eq("id", id).maybeSingle(),
        ])
        actor = actorResult.data
        director = directorResult.data

        // If found only in one table, try to find them in the other by name
        if (actor && !director) {
            const { data: directorData } = await supabase.from("directors").select("id, name, photo_url").eq("name", actor.name).maybeSingle()
            director = directorData
        } else if (director && !actor) {
            const { data: actorData } = await supabase.from("actors").select("id, name, photo_url").eq("name", director.name).maybeSingle()
            actor = actorData
        } else if (actor && director && actor.name !== director.name) {
            // Both IDs exist but are different people — only keep the one we intended
            director = null
        }
    }

    if (!actor && !director) {
        return null
    }

    let type: "actor" | "director" | "both" = actor && director ? "both" : actor ? "actor" : "director"
    const person = (actor && director)
        ? (preferredType === "director" ? director : actor)
        : (actor || director)

    let moviesAsActor: PersonMovie[] = []
    let moviesAsDirector: PersonMovie[] = []

    if (actor) {
        const { data: actorMovies, error: actorMoviesError } = await supabase
            .from("movie_actors")
            .select(`
        role,
        movies (
          id, title, slug, poster_url, release_date,
          genres: movie_genres(genres(name)),
          rating: media_stats(global_rating, global_search_count)
        )
      `)
            .eq("actor_id", actor.id)

        if (actorMoviesError) {
            console.error("Error fetching actor movies:", actorMoviesError)
        }

        if (actorMovies) {
            moviesAsActor = await Promise.all(
                actorMovies
                    .filter((m: any) => m.movies)
                    .map(async (m: any) => {
                        const movie = m.movies
                        const posterUrl = await getPrivateImageUrl(movie.poster_url)
                        const ratingArr = Array.isArray(movie.rating) && movie.rating.length > 0
                            ? movie.rating[0]
                            : { global_rating: 0, global_search_count: null }
                        const genres = (movie.genres || [])
                            .flatMap((g: any) => g.genres)
                            .map((g: any) => g.name)
                            .filter(Boolean)

                        return {
                            id: movie.id,
                            title: movie.title,
                            slug: movie.slug,
                            poster_url: posterUrl,
                            release_date: movie.release_date,
                            role: m.role,
                            rating: {
                                global_rating: ratingArr.global_rating || 0,
                                global_search_count: ratingArr.global_search_count || null,
                            },
                            genres,
                        }
                    })
            )
        }
    }

    if (director) {
        const { data: directorMovies, error: directorMoviesError } = await supabase
            .from("movie_directors")
            .select(`
        movies (
          id, title, slug, poster_url, release_date,
          genres: movie_genres(genres(name)),
          rating: media_stats(global_rating, global_search_count)
        )
      `)
            .eq("director_id", director.id)

        if (directorMoviesError) {
            console.error("Error fetching director movies:", directorMoviesError)
        }

        if (directorMovies) {
            moviesAsDirector = await Promise.all(
                directorMovies
                    .filter((m: any) => m.movies)
                    .map(async (m: any) => {
                        const movie = m.movies
                        const posterUrl = await getPrivateImageUrl(movie.poster_url)
                        const ratingArr = Array.isArray(movie.rating) && movie.rating.length > 0
                            ? movie.rating[0]
                            : { global_rating: 0, global_search_count: null }
                        const genres = (movie.genres || [])
                            .flatMap((g: any) => g.genres)
                            .map((g: any) => g.name)
                            .filter(Boolean)

                        return {
                            id: movie.id,
                            title: movie.title,
                            slug: movie.slug,
                            poster_url: posterUrl,
                            release_date: movie.release_date,
                            rating: {
                                global_rating: ratingArr.global_rating || 0,
                                global_search_count: ratingArr.global_search_count || null,
                            },
                            genres,
                        }
                    })
            )
        }
    }

    moviesAsActor.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    moviesAsDirector.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())

    const photoUrl = person!.photo_url
        ? await getPrivateImageUrl(person!.photo_url)
        : "/default-avatar.png"

    return {
        id: person!.id,
        name: person!.name,
        photo_url: photoUrl,
        type,
        moviesAsActor,
        moviesAsDirector,
    }
}
