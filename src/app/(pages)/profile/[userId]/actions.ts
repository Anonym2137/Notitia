'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleFollow(followedId: string): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('You must be logged in to follow users')
    }

    const { data: existing } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("followed_id", followedId)
        .maybeSingle()

    if (existing) {
        const { error } = await supabase
            .from("user_follows")
            .delete()
            .eq("id", existing.id)

        if (error) {
            console.error("Error unfollowing user: ", error)
            throw new Error("Failed to unfollow user")
        }

        revalidatePath(`/profile/${followedId}`)
        revalidatePath('/reviews')
        return false
    } else {
        const { error } = await supabase
            .from("user_follows")
            .insert({
                follower_id: user.id,
                followed_id: followedId,
            })

        if (error) {
            console.error("Error following user: ", error)
            throw new Error("Failed to follow user")
        }

        revalidatePath(`/profile/${followedId}`)
        revalidatePath('/reviews')
        return true
    }
}
