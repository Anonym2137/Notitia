'use client'

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Film, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import ProfileForm from "@/components/ProfileForm"
import { UpdateMoviePreferences, updateProfile } from "../profile/actions"
import MoviePreferencesForm from "@/components/MoviePreferencesForm"
import FavouritePeopleForm from "@/components/FavouritePeopleForm"
import FavouriteMoviesForm from "@/components/FavouriteMoviesForm"

export default function SettingsPage() {

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        const { data: profileData, error } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
        setLoading(false)
      }
      else {
        router.push('/login')
      }
    }
    fetchUser()
  }, [supabase, router])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="favourites" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favourites</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <ProfileForm user={user} profile={profile} onSave={updateProfile} />

          {/* Movie Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <MoviePreferencesForm profile={profile} onSave={UpdateMoviePreferences} />
          </TabsContent>

          {/* Favourites */}
          <TabsContent value="favourites" className="space-y-6">
            <FavouritePeopleForm />
            <FavouriteMoviesForm />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}
