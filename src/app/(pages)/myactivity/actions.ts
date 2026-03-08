'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function removeFromWatched(watchedId: number): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('You must be logged in')
    }

    const { error } = await supabase
        .from("movie_reviews")
        .delete()
        .eq("id", watchedId)

    if (error) {
        console.error('Error removing from watched: ', error)
        throw new Error('Failed to remove from watched list')
    }

    revalidatePath('/')
    revalidatePath('/myactivity')
    return true
}
