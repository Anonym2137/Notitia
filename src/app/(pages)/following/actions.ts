"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"


export async function getFollowedActors() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("actor_follows")
        .select(`
            actor_id,
            created_at,
            actors ( id, name, photo_url )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching followed actors:", error)
        return []
    }
    return data ?? []
}


export async function getFollowedDirectors() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("director_follows")
        .select(`
            director_id,
            created_at,
            directors ( id, name, photo_url )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching followed directors:", error)
        return []
    }
    return data ?? []
}


export async function toggleFollowActor(actorId: number): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: existing } = await supabase
        .from("actor_follows")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("actor_id", actorId)
        .maybeSingle()

    if (existing) {
        const { error } = await supabase
            .from("actor_follows")
            .delete()
            .eq("user_id", user.id)
            .eq("actor_id", actorId)

        if (error) {
            console.error("Error unfollowing actor:", error)
            throw new Error("Failed to unfollow actor")
        }

        revalidatePath("/following")
        return false
    } else {
        const { error } = await supabase
            .from("actor_follows")
            .insert({ user_id: user.id, actor_id: actorId })

        if (error) {
            console.error("Error following actor:", error)
            throw new Error("Failed to follow actor")
        }

        revalidatePath("/following")
        return true
    }
}


export async function toggleFollowDirector(directorId: number): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: existing } = await supabase
        .from("director_follows")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("director_id", directorId)
        .maybeSingle()

    if (existing) {
        const { error } = await supabase
            .from("director_follows")
            .delete()
            .eq("user_id", user.id)
            .eq("director_id", directorId)

        if (error) {
            console.error("Error unfollowing director:", error)
            throw new Error("Failed to unfollow director")
        }

        revalidatePath("/following")
        return false
    } else {
        const { error } = await supabase
            .from("director_follows")
            .insert({ user_id: user.id, director_id: directorId })

        if (error) {
            console.error("Error following director:", error)
            throw new Error("Failed to follow director")
        }

        revalidatePath("/following")
        return true
    }
}


export async function getMoviesFromFollowedPeople() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: actorFollows } = await supabase
        .from("actor_follows")
        .select("actor_id")
        .eq("user_id", user.id)

    const { data: directorFollows } = await supabase
        .from("director_follows")
        .select("director_id")
        .eq("user_id", user.id)

    const actorIds = actorFollows?.map(f => f.actor_id) || []
    const directorIds = directorFollows?.map(f => f.director_id) || []

    if (actorIds.length === 0 && directorIds.length === 0) return []

    let actorMovieIds: number[] = []
    if (actorIds.length > 0) {
        const { data: actorMovies } = await supabase
            .from("movie_actors")
            .select("movie_id")
            .in("actor_id", actorIds)

        actorMovieIds = actorMovies?.map(m => m.movie_id) || []
    }

    let directorMovieIds: number[] = []
    if (directorIds.length > 0) {
        const { data: directorMovies } = await supabase
            .from("movie_directors")
            .select("movie_id")
            .in("director_id", directorIds)

        directorMovieIds = directorMovies?.map(m => m.movie_id) || []
    }

    const allMovieIds = [...new Set([...actorMovieIds, ...directorMovieIds])]

    if (allMovieIds.length === 0) return []

    const { data: movies, error } = await supabase
        .from("movies")
        .select(`
            id,
            title,
            poster_url,
            release_date,
            rating,
            slug,
            movie_actors ( actor_id, role, actors ( id, name ) ),
            movie_directors ( director_id, directors ( id, name ) )
        `)
        .in("id", allMovieIds)
        .order("release_date", { ascending: false })
        .limit(50)

    if (error) {
        console.error("Error fetching movies from followed people:", error)
        return []
    }

    return (movies ?? []).map(movie => {
        const relevantActors = (movie.movie_actors || [])
            .filter((ma: any) => actorIds.includes(ma.actor_id))
            .map((ma: any) => ({ ...ma.actors, role: ma.role }))

        const relevantDirectors = (movie.movie_directors || [])
            .filter((md: any) => directorIds.includes(md.director_id))
            .map((md: any) => md.directors)

        return {
            ...movie,
            followed_actors: relevantActors,
            followed_directors: relevantDirectors,
        }
    })
}


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
    return data ?? []
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
    return data ?? []
}


export async function getReviewsFromFollowedUsers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: follows } = await supabase
        .from("user_follows")
        .select("followed_id")
        .eq("follower_id", user.id)

    const followedUserIds = follows?.map(f => f.followed_id) || []

    if (followedUserIds.length === 0) return []

    const { data: reviews, error } = await supabase
        .from("movie_reviews")
        .select("id, rating, comment, created_at, user:users(user_id, username, avatar_url), movie:movies(id, title, slug)")
        .in("user_id", followedUserIds)
        .order("created_at", { ascending: false })
        .limit(50)

    if (error) {
        console.error("Error fetching reviews from followed users:", error)
        return []
    }

    return reviews ?? []
}
