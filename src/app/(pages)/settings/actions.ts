"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getPrivateImageUrl } from "@/lib/e2/actions"


export async function searchActors(query: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("actors")
        .select("id, name, photo_url")
        .ilike("name", `%${query}%`)
        .limit(20)

    if (error) {
        console.error("Error searching actors:", error)
        return []
    }
    const resolved = await Promise.all(
        (data ?? []).map(async (actor) => ({
            ...actor,
            photo_url: actor.photo_url ? await getPrivateImageUrl(actor.photo_url) : null,
        }))
    )
    return resolved
}

export async function searchDirectors(query: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("directors")
        .select("id, name, photo_url")
        .ilike("name", `%${query}%`)
        .limit(20)

    if (error) {
        console.error("Error searching directors:", error)
        return []
    }
    const resolved = await Promise.all(
        (data ?? []).map(async (director) => ({
            ...director,
            photo_url: director.photo_url ? await getPrivateImageUrl(director.photo_url) : null,
        }))
    )
    return resolved
}

export async function searchMovies(query: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("movies")
        .select("id, title, poster_url, release_date")
        .ilike("title", `%${query}%`)
        .limit(20)

    if (error) {
        console.error("Error searching movies:", error)
        return []
    }
    const resolved = await Promise.all(
        (data ?? []).map(async (movie) => ({
            ...movie,
            poster_url: movie.poster_url ? await getPrivateImageUrl(movie.poster_url) : null,
        }))
    )
    return resolved
}


export async function getFavouritePeople() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("favourite_people")
        .select(`
      id,
      actor_id,
      director_id,
      actors ( id, name, photo_url ),
      directors ( id, name, photo_url )
    `)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error fetching favourite people:", error)
        return []
    }
    const resolved = await Promise.all(
        (data ?? []).map(async (fav: any) => ({
            ...fav,
            actors: fav.actors
                ? { ...fav.actors, photo_url: fav.actors.photo_url ? await getPrivateImageUrl(fav.actors.photo_url) : null }
                : null,
            directors: fav.directors
                ? { ...fav.directors, photo_url: fav.directors.photo_url ? await getPrivateImageUrl(fav.directors.photo_url) : null }
                : null,
        }))
    )
    return resolved
}

export async function addFavouritePerson(type: "actor" | "director", personId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: true, message: "Not authenticated" }

    const insertData: { user_id: string; actor_id?: number; director_id?: number } = {
        user_id: user.id,
    }

    if (type === "actor") {
        insertData.actor_id = personId
    } else {
        insertData.director_id = personId
    }

    let query = supabase
        .from("favourite_people")
        .select("id")
        .eq("user_id", user.id)

    if (type === "actor") {
        query = query.eq("actor_id", personId)
    } else {
        query = query.eq("director_id", personId)
    }

    const { data: existing } = await query.maybeSingle()
    if (existing) {
        return { error: true, message: "Already in your favourites" }
    }

    const { error } = await supabase
        .from("favourite_people")
        .insert(insertData)

    if (error) {
        console.error("Error adding favourite person:", error)
        return { error: true, message: "Failed to add favourite" }
    }

    revalidatePath("/settings")
    return { error: false, message: "Added to favourites!" }
}

export async function removeFavouritePerson(favouriteId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: true, message: "Not authenticated" }

    const { error } = await supabase
        .from("favourite_people")
        .delete()
        .eq("id", favouriteId)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error removing favourite person:", error)
        return { error: true, message: "Failed to remove favourite" }
    }

    revalidatePath("/settings")
    return { error: false, message: "Removed from favourites" }
}


export async function getFavouriteMovies() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("favourite_movies")
        .select(`
      id,
      movie_id,
      movies ( id, title, poster_url, release_date )
    `)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error fetching favourite movies:", error)
        return []
    }
    const resolved = await Promise.all(
        (data ?? []).map(async (fav: any) => ({
            ...fav,
            movies: fav.movies
                ? { ...fav.movies, poster_url: fav.movies.poster_url ? await getPrivateImageUrl(fav.movies.poster_url) : null }
                : null,
        }))
    )
    return resolved
}

export async function addFavouriteMovie(movieId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: true, message: "Not authenticated" }

    const { data: existing } = await supabase
        .from("favourite_movies")
        .select("id")
        .eq("user_id", user.id)
        .eq("movie_id", movieId)
        .maybeSingle()

    if (existing) {
        return { error: true, message: "Already in your favourites" }
    }

    const { error } = await supabase
        .from("favourite_movies")
        .insert({ user_id: user.id, movie_id: movieId })

    if (error) {
        console.error("Error adding favourite movie:", error)
        return { error: true, message: "Failed to add favourite movie" }
    }

    revalidatePath("/settings")
    return { error: false, message: "Added to favourite movies!" }
}

export async function removeFavouriteMovie(favouriteId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: true, message: "Not authenticated" }

    const { error } = await supabase
        .from("favourite_movies")
        .delete()
        .eq("id", favouriteId)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error removing favourite movie:", error)
        return { error: true, message: "Failed to remove favourite movie" }
    }

    revalidatePath("/settings")
    return { error: false, message: "Removed from favourite movies" }
}
