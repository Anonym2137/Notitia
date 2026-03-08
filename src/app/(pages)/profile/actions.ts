"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: true, message: "You must be logged in to update your profile." };
  }

  const username = formData.get("username") as string;
  const full_name = formData.get("full_name") as string;
  const location = formData.get("location") as string;
  const bio = formData.get("bio") as string;
  const avatar_key = formData.get("avatar_key") as string | null;

  let updateData: {
    username: string;
    full_name: string;
    location: string;
    bio: string;
    avatar_url?: string;
  } = { username, full_name, location, bio }

  if (avatar_key) {
    updateData.avatar_url = avatar_key
  }

  const { error: updateError } = await supabase
    .from("users")
    .update(updateData)
    .eq("user_id", user.id)

  if (updateError) {
    console.error("Error updating profile: ", updateError)
    return { error: true, message: "Failed to update profile." }
  }

  revalidatePath("/profile")
  revalidatePath("/settings")

  return { error: false, message: "Profile updated successfully." }
}

export async function UpdateMoviePreferences(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: true, message: "You must be logged in to update your profile!" }
  }

  const genres = formData.get("genres") as string

  const { error: updateError } = await supabase
    .from("users")
    .update({ genres: JSON.parse(genres) })
    .eq("user_id", user.id)

  if (updateError) {
    console.error("Error updating movie preferences: ", updateError)
    return { error: true, message: "Failed to update movie preferences." }
  }

  revalidatePath("/profile")
  revalidatePath("/settings")

  return { error: false, message: "Movie preferences updated successfully." }
}

// CREATE TABLE follows(
//   id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

//   --The user who is doing the following
//     follower_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,

//   --The ID of the entity being followed(cannot be a foreign key)
//     followed_id UUID NOT NULL,

//   --The type of entity being followed
//     followed_type TEXT NOT NULL CHECK(followed_type IN('user', 'actor', 'director')),

//   created_at TIMESTAMPTZ DEFAULT NOW(),

//   --Ensures a user can't follow the same entity twice
//     UNIQUE(follower_id, followed_id, followed_type)
// );

// --Add an index for fast lookups
// CREATE INDEX ON follows(follower_id);
// CREATE INDEX ON follows(followed_id, followed_type);