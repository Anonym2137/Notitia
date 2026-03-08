'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addToWatchlist(movieId: number): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('You must be logged in')
    }

    const { error } = await supabase
        .from("watchlist")
        .insert({ user_id: user.id, movie_id: movieId })

    if (error) {
        if (error.code === '23505') {
            return true
        }
        console.error('Error adding to watchlist: ', error)
        throw new Error('Failed to add to watchlist')
    }

    revalidatePath('/')
    revalidatePath('/watchlist')
    return true
}

export async function removeFromWatchlist(movieId: number): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('You must be logged in')
    }

    const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("movie_id", movieId)

    if (error) {
        console.error('Error removing from watchlist: ', error)
        throw new Error('Failed to remove from watchlist')
    }

    revalidatePath('/')
    revalidatePath('/watchlist')
    return true
}
