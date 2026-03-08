import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { VscHeart, VscStarEmpty, VscStarFull } from "react-icons/vsc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, Film, MapPin, MessageSquareText, UserPlus, Clapperboard, Heart, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAvatarUrl } from "@/lib/e2/avatars";
import { getPrivateImageUrl } from "@/lib/e2/actions";
import Image from "next/image";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  }
    = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }


  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows found, which is fine
    console.error("Error fetching profile:", error);
  }

  let avatar_url = "/default-avatar.png"
  if (profile?.avatar_url) {
    avatar_url = await getAvatarUrl(profile.avatar_url)
  }

  const [
    { count: watchedCount },
    { data: reviewsData },
    { count: followingCount },
    { count: followersCount },
    { count: watchlistCount },
    { data: favouriteMoviesData },
    { data: favouritePeopleData },
    { data: recentReviews },
    { data: watchedGenresData },
  ] = await Promise.all([
    supabase.from("watched").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("movie_reviews").select("rating").eq("user_id", user.id),
    supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
    supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("followed_id", user.id),
    supabase.from("watchlist").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("favourite_movies").select(`
      id,
      movie_id,
      movies ( id, title, slug, poster_url, release_date )
    `).eq("user_id", user.id),
    supabase.from("favourite_people").select(`
      id,
      actor_id,
      director_id,
      actors ( id, name, photo_url ),
      directors ( id, name, photo_url )
    `).eq("user_id", user.id),
    supabase.from("movie_reviews")
      .select("id, rating, comment, created_at, movie:movies(id, title, slug, poster_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("watched")
      .select("review_id, movie_reviews(movie_id, movies(movie_genres(genres(name))))")
      .eq("user_id", user.id),
  ])

  const reviewCount = reviewsData?.length ?? 0
  const avgRating = reviewCount > 0
    ? (reviewsData!.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount).toFixed(1)
    : "—"

  const genreCounts: Record<string, number> = {}
  let totalGenreEntries = 0
    ; (watchedGenresData ?? []).forEach((w: any) => {
      const movieGenres = w.movie_reviews?.movies?.movie_genres ?? []
      movieGenres.forEach((mg: any) => {
        const name = mg.genres?.name
        if (name) {
          genreCounts[name] = (genreCounts[name] || 0) + 1
          totalGenreEntries++
        }
      })
    })
  const genreBreakdown = Object.entries(genreCounts)
    .map(([name, count]) => ({ name, percentage: totalGenreEntries > 0 ? Math.round((count / totalGenreEntries) * 100) : 0 }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)

  const favouriteMovies = await Promise.all(
    (favouriteMoviesData ?? []).map(async (fav: any) => ({
      ...fav,
      movies: fav.movies
        ? { ...fav.movies, poster_url: fav.movies.poster_url ? await getPrivateImageUrl(fav.movies.poster_url) : null }
        : null,
    }))
  )

  const favouritePeople = await Promise.all(
    (favouritePeopleData ?? []).map(async (fav: any) => ({
      ...fav,
      actors: fav.actors
        ? { ...fav.actors, photo_url: fav.actors.photo_url ? await getPrivateImageUrl(fav.actors.photo_url) : null }
        : null,
      directors: fav.directors
        ? { ...fav.directors, photo_url: fav.directors.photo_url ? await getPrivateImageUrl(fav.directors.photo_url) : null }
        : null,
    }))
  )

  const recentActivity = await Promise.all(
    (recentReviews ?? []).map(async (review: any) => ({
      ...review,
      movie: review.movie
        ? { ...review.movie, poster_url: review.movie.poster_url ? await getPrivateImageUrl(review.movie.poster_url) : null }
        : null,
    }))
  )

  const favouriteActors = favouritePeople.filter((f: any) => f.actor_id !== null)
  const favouriteDirectors = favouritePeople.filter((f: any) => f.director_id !== null)
  const hasFavourites = favouriteMovies.length > 0 || favouritePeople.length > 0

  return (
    <div className="min-h-screen bg-background max-w-full">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container px-4 py-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={avatar_url} alt="Profile" />
              </Avatar>
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{profile.username}</h1>
                  <p className="text-lg text-muted-foreground">{profile.full_name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profile.location ?
                    (
                      <div className="flex items-center gap-1.5">
                        < MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    ) :
                    (<></>)
                  }
                  {profile.created_at && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(profile.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.genres ?
                    (
                      profile.genres.map((genre: String, index: any) => (
                        <Badge variant="secondary" key={index}>{genre}</Badge>
                      ))
                    ) : <></>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Stats & Info */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    Movies Watched
                  </CardDescription>
                  <CardTitle className="text-3xl">{watchedCount ?? 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <VscStarEmpty />
                    Average Rating
                  </CardDescription>
                  <CardTitle className="text-3xl">{avgRating}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4" />
                    Reviews Written
                  </CardDescription>
                  <CardTitle className="text-3xl">{reviewCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <VscHeart />
                    Following
                  </CardDescription>
                  <CardTitle className="text-3xl">{followingCount ?? 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Followers
                  </CardDescription>
                  <CardTitle className="text-3xl">{followersCount ?? 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Watchlist
                  </CardDescription>
                  <CardTitle className="text-3xl">{watchlistCount ?? 0}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Genre Preferences */}
            {genreBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Genre Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {genreBreakdown.map((genre) => (
                      <div key={genre.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{genre.name}</span>
                          <span className="text-muted-foreground">{genre.percentage}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div className="h-full bg-primary" style={{ width: `${genre.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className={`grid w-full ${profile.bio ? "grid-cols-3" : "grid-cols-2"}`}>
                {profile.bio && (
                  <TabsTrigger value="about">About</TabsTrigger>
                )}
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              {profile.bio && (
                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="leading-relaxed text-foreground">
                        {profile.bio}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="favorites" className="space-y-6">
                {/* Favourite Movies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Favourite Movies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favouriteMovies.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {favouriteMovies.map((fav: any) => {
                          const movie = fav.movies
                          if (!movie) return null
                          const year = movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : null
                          return (
                            <Link
                              key={fav.id}
                              href={`/movies/${movie.slug || ""}`}
                              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md"
                            >
                              <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
                                {movie.poster_url ? (
                                  <Image
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    width={44}
                                    height={64}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Film className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-sm">{movie.title}</p>
                                {year && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{year}</p>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Film className="h-12 w-12 text-muted-foreground/20 mb-3" />
                        <p className="text-muted-foreground text-sm">
                          No favourite movies yet. Add some from Settings!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Favourite People */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Favourite People
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {favouritePeople.length > 0 ? (
                      <>
                        {/* Actors */}
                        {favouriteActors.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <UserPlus className="h-4 w-4" />
                              Actors ({favouriteActors.length})
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {favouriteActors.map((fav: any) => {
                                const person = fav.actors
                                if (!person) return null
                                return (
                                  <div
                                    key={fav.id}
                                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md"
                                  >
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                                      {person.photo_url ? (
                                        <Image
                                          src={person.photo_url}
                                          alt={person.name}
                                          width={48}
                                          height={48}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                                          {person.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate font-medium text-sm">{person.name}</p>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        Actor
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Directors */}
                        {favouriteDirectors.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <Clapperboard className="h-4 w-4" />
                              Directors ({favouriteDirectors.length})
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {favouriteDirectors.map((fav: any) => {
                                const person = fav.directors
                                if (!person) return null
                                return (
                                  <div
                                    key={fav.id}
                                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md"
                                  >
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                                      {person.photo_url ? (
                                        <Image
                                          src={person.photo_url}
                                          alt={person.name}
                                          width={48}
                                          height={48}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                                          {person.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate font-medium text-sm">{person.name}</p>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        Director
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <UserPlus className="h-12 w-12 text-muted-foreground/20 mb-3" />
                        <p className="text-muted-foreground text-sm">
                          No favourite people yet. Add some from Settings!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((review: any) => {
                        const movie = review.movie
                        if (!movie) return null
                        const timeAgo = review.created_at
                          ? new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : null
                        return (
                          <div key={review.id} className="flex gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                            <Link href={`/movies/${movie.slug || ""}`} className="shrink-0">
                              <div className="h-[80px] w-[60px] rounded overflow-hidden bg-muted">
                                {movie.poster_url ? (
                                  <Image
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    width={60}
                                    height={80}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Film className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <VscStarFull className="text-yellow-500" />
                                <span className="font-semibold">Rated {review.rating.toFixed(1)}</span>
                              </div>
                              <Link href={`/movies/${movie.slug || ""}`}>
                                <p className="text-sm font-medium hover:text-primary transition-colors">{movie.title}</p>
                              </Link>
                              {review.comment && (
                                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                                  {review.comment}
                                </p>
                              )}
                              {timeAgo && (
                                <p className="text-xs text-muted-foreground">{timeAgo}</p>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageSquareText className="h-12 w-12 text-muted-foreground/20 mb-3" />
                        <p className="text-muted-foreground text-sm">
                          No activity yet. Start reviewing movies!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}