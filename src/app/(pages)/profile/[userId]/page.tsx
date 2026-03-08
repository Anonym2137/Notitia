import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, MessageSquareText, Star, ArrowLeft, Heart, UserPlus, Clapperboard, Film } from "lucide-react";
import { VscStarEmpty } from "react-icons/vsc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAvatarUrl } from "@/lib/e2/avatars";
import { getPrivateImageUrl } from "@/lib/e2/actions";
import Image from "next/image";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser && currentUser.id === userId) {
        return redirect("/profile")
    }

    const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single()

    if (error || !profile) {
        notFound()
    }

    let avatarUrl = "/default-avatar.png"
    if (profile.avatar_url) {
        avatarUrl = await getAvatarUrl(profile.avatar_url)
    }

    const { data: reviews } = await supabase
        .from("movie_reviews")
        .select("id, rating, comment, created_at, movie:movies(id, title, slug)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    const userReviews = reviews || []

    const reviewCount = userReviews.length
    const avgRating = reviewCount > 0
        ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
        : "—"

    let isFollowing = false
    if (currentUser) {
        const { data: followData } = await supabase
            .from("user_follows")
            .select("id")
            .eq("follower_id", currentUser.id)
            .eq("followed_id", userId)
            .maybeSingle()
        isFollowing = !!followData
    }

    const { data: favouriteMoviesData } = await supabase
        .from("favourite_movies")
        .select(`
            id,
            movie_id,
            movies ( id, title, slug, poster_url, release_date )
        `)
        .eq("user_id", userId)

    const favouriteMovies = await Promise.all(
        (favouriteMoviesData ?? []).map(async (fav: any) => ({
            ...fav,
            movies: fav.movies
                ? { ...fav.movies, poster_url: fav.movies.poster_url ? await getPrivateImageUrl(fav.movies.poster_url) : null }
                : null,
        }))
    )

    const { data: favouritePeopleData } = await supabase
        .from("favourite_people")
        .select(`
            id,
            actor_id,
            director_id,
            actors ( id, name, photo_url ),
            directors ( id, name, photo_url )
        `)
        .eq("user_id", userId)

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

    const favouriteActors = favouritePeople.filter((f: any) => f.actor_id !== null)
    const favouriteDirectors = favouritePeople.filter((f: any) => f.director_id !== null)
    const hasFavourites = favouriteMovies.length > 0 || favouritePeople.length > 0

    let tabCount = 1
    if (profile.bio) tabCount++
    if (hasFavourites) tabCount++

    return (
        <div className="min-h-screen bg-background max-w-full">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container px-4 py-6">
                    <div className="mb-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back
                        </Link>
                    </div>
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <Avatar className="h-24 w-24 border-2 border-primary">
                                <AvatarImage src={avatarUrl} alt={profile.username} />
                            </Avatar>
                            <div className="space-y-3">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">{profile.username}</h1>
                                    {profile.full_name && (
                                        <p className="text-lg text-muted-foreground">{profile.full_name}</p>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {profile.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            <span>{profile.location}</span>
                                        </div>
                                    )}
                                    {profile.created_at && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Joined {new Date(profile.created_at).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.genres && profile.genres.map((genre: string, index: number) => (
                                        <Badge variant="secondary" key={index}>{genre}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <FollowButton userId={userId} isFollowing={isFollowing} isLoggedIn={!!currentUser} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Stats */}
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
                                        <VscStarEmpty />
                                        Average Rating
                                    </CardDescription>
                                    <CardTitle className="text-3xl">{avgRating}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue={profile.bio ? "about" : hasFavourites ? "favorites" : "reviews"} className="space-y-6">
                            <TabsList className={`grid w-full grid-cols-${tabCount}`}>
                                {profile.bio && (
                                    <TabsTrigger value="about">About</TabsTrigger>
                                )}
                                {hasFavourites && (
                                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                                )}
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>

                            {/* About Tab */}
                            {profile.bio && (
                                <TabsContent value="about" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>About</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="leading-relaxed text-foreground">{profile.bio}</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {/* Favorites Tab */}
                            {hasFavourites && (
                                <TabsContent value="favorites" className="space-y-6">
                                    {/* Favourite Movies */}
                                    {favouriteMovies.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Heart className="h-5 w-5 text-red-500" />
                                                    Favourite Movies
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
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
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Favourite People */}
                                    {favouritePeople.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Star className="h-5 w-5 text-yellow-500" />
                                                    Favourite People
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
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
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>
                            )}

                            {/* Reviews Tab */}
                            <TabsContent value="reviews" className="space-y-6">
                                {userReviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {userReviews.map((review) => (
                                            <Card key={review.id} className="p-5 card-glow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <Link
                                                            href={`/movies/${(review.movie as any)?.slug || ""}`}
                                                            className="hover:text-primary transition-colors duration-200"
                                                        >
                                                            <h4 className="font-semibold text-foreground text-lg hover:text-primary transition-colors duration-200">
                                                                {(review.movie as any)?.title || "Unknown Movie"}
                                                            </h4>
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(review.created_at).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => {
                                                                const starValue = (i + 1) * 2;
                                                                const filled = review.rating >= starValue;
                                                                const halfFilled = review.rating >= starValue - 1 && !filled;
                                                                return (
                                                                    <div key={i} className="relative">
                                                                        <Star
                                                                            className={`w-4 h-4 ${filled ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                                                                        />
                                                                        {halfFilled && (
                                                                            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                                                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <span className="text-sm font-bold text-foreground ml-1">
                                                            {review.rating}/10
                                                        </span>
                                                    </div>
                                                </div>
                                                {review.comment ? (
                                                    <p className="text-foreground leading-relaxed text-sm">{review.comment}</p>
                                                ) : (
                                                    <p className="text-muted-foreground italic text-sm">No written review.</p>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="p-12 card-glow">
                                        <div className="text-center">
                                            <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
                                            <p className="text-muted-foreground">
                                                {profile.username} hasn&apos;t written any reviews yet.
                                            </p>
                                        </div>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    )
}
