import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Film, Users, UserPlus, Clapperboard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getFollowedActors, getFollowedDirectors, getMoviesFromFollowedPeople, getReviewsFromFollowedUsers } from "./actions"
import { getAvatarUrl } from "@/lib/e2/avatars"
import { getPrivateImageUrl } from "@/lib/e2/actions"
import FollowPersonButton from "@/components/FollowPersonButton"
import FollowingTabs from "./FollowingTabs"

export default async function FollowingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/login")
    }

    const [followedActors, followedDirectors, movies, feedReviews] = await Promise.all([
        getFollowedActors(),
        getFollowedDirectors(),
        getMoviesFromFollowedPeople(),
        getReviewsFromFollowedUsers(),
    ])

    const reviewsWithAvatars = await Promise.all(
        feedReviews.map(async (review: any) => {
            const avatarUrl = review.user?.avatar_url
                ? await getAvatarUrl(review.user.avatar_url)
                : null
            return {
                ...review,
                user: { ...review.user, avatar_url: avatarUrl },
            }
        })
    )

    const moviesWithPosters = await Promise.all(
        movies.map(async (movie: any) => {
            const posterUrl = movie.poster_url
                ? await getPrivateImageUrl(movie.poster_url)
                : null
            return { ...movie, poster_url: posterUrl }
        })
    )

    const actorsWithPhotos = await Promise.all(
        followedActors.map(async (follow: any) => {
            const photoUrl = follow.actors?.photo_url
                ? await getPrivateImageUrl(follow.actors.photo_url)
                : null
            return {
                ...follow,
                actors: { ...follow.actors, photo_url: photoUrl },
            }
        })
    )

    const directorsWithPhotos = await Promise.all(
        followedDirectors.map(async (follow: any) => {
            const photoUrl = follow.directors?.photo_url
                ? await getPrivateImageUrl(follow.directors.photo_url)
                : null
            return {
                ...follow,
                directors: { ...follow.directors, photo_url: photoUrl },
            }
        })
    )

    const peopleContent = (
        <div className="space-y-8">
            {/* Actors */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Actors
                    <Badge variant="secondary" className="text-xs">{actorsWithPhotos.length}</Badge>
                </h3>

                {actorsWithPhotos.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                        <UserPlus className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">
                            No actors followed yet. Follow actors from movie pages or search results.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {actorsWithPhotos.map((follow: any) => {
                            const person = follow.actors
                            if (!person) return null
                            return (
                                <div
                                    key={follow.actor_id}
                                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-primary/30"
                                >
                                    <Link href={`/people/${follow.actor_id}?type=actor`} className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-border">
                                        {person.photo_url ? (
                                            <Image
                                                src={person.photo_url}
                                                alt={person.name}
                                                width={40}
                                                height={40}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary/60">
                                                {person.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                        )}
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        <Link href={`/people/${follow.actor_id}?type=actor`} className="hover:text-primary transition-colors duration-200">
                                            <p className="truncate font-medium text-sm">{person.name}</p>
                                        </Link>
                                    </div>
                                    <FollowPersonButton
                                        personId={follow.actor_id}
                                        type="actor"
                                        initialFollowed={true}
                                        size="sm"
                                        showLabel={false}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Directors */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clapperboard className="h-4 w-4 text-primary" />
                    Directors
                    <Badge variant="secondary" className="text-xs">{directorsWithPhotos.length}</Badge>
                </h3>

                {directorsWithPhotos.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                        <Clapperboard className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">
                            No directors followed yet. Follow directors from movie pages.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {directorsWithPhotos.map((follow: any) => {
                            const person = follow.directors
                            if (!person) return null
                            return (
                                <div
                                    key={follow.director_id}
                                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-primary/30"
                                >
                                    <Link href={`/people/${follow.director_id}?type=director`} className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-border">
                                        {person.photo_url ? (
                                            <Image
                                                src={person.photo_url}
                                                alt={person.name}
                                                width={40}
                                                height={40}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary/60">
                                                {person.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                        )}
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        <Link href={`/people/${follow.director_id}?type=director`} className="hover:text-primary transition-colors duration-200">
                                            <p className="truncate font-medium text-sm">{person.name}</p>
                                        </Link>
                                    </div>
                                    <FollowPersonButton
                                        personId={follow.director_id}
                                        type="director"
                                        initialFollowed={true}
                                        size="sm"
                                        showLabel={false}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )

    const moviesContent = moviesWithPosters.length === 0 ? (
        <Card className="p-10">
            <div className="text-center">
                <Users className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">No movies yet</h3>
                <p className="text-muted-foreground text-sm">
                    Follow actors or directors to discover their movies here!
                </p>
            </div>
        </Card>
    ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {moviesWithPosters.map((movie: any) => {
                const year = movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : null

                return (
                    <Link key={movie.id} href={`/movies/${movie.slug || movie.id}`} className="group">
                        <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-0.5">
                            <div className="relative aspect-[2/3] bg-muted overflow-hidden">
                                {movie.poster_url ? (
                                    <Image
                                        src={movie.poster_url}
                                        alt={movie.title}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Film className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                )}

                                {movie.rating > 0 && (
                                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-1.5 py-0.5">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-[11px] font-bold text-white">
                                            {movie.rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-2 space-y-1">
                                <h3 className="font-semibold text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                                    {movie.title}
                                </h3>
                                {year && (
                                    <p className="text-[11px] text-muted-foreground">{year}</p>
                                )}

                                <div className="flex flex-wrap gap-1">
                                    {movie.followed_actors?.slice(0, 2).map((actor: any) => (
                                        <Badge
                                            key={`actor-${actor.id}`}
                                            variant="outline"
                                            className="text-[9px] py-0 px-1 gap-0.5"
                                        >
                                            <UserPlus className="h-2 w-2" />
                                            {actor.name}
                                        </Badge>
                                    ))}
                                    {movie.followed_directors?.slice(0, 2).map((director: any) => (
                                        <Badge
                                            key={`director-${director.id}`}
                                            variant="outline"
                                            className="text-[9px] py-0 px-1 gap-0.5"
                                        >
                                            <Clapperboard className="h-2 w-2" />
                                            {director.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </Link>
                )
            })}
        </div>
    )

    const reviewsContent = reviewsWithAvatars.length > 0 ? (
        <div className="space-y-3">
            {reviewsWithAvatars.map((review: any) => (
                <Card key={review.id} className="p-3 sm:p-4 card-glow">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <Link href={`/profile/${review.user.user_id}`}>
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-border hover:border-primary transition-colors">
                                    {review.user.avatar_url ? (
                                        <Image
                                            src={review.user.avatar_url}
                                            alt={review.user.username}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-semibold text-primary">
                                            {review.user.username.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-0.5">
                                <Link href={`/profile/${review.user.user_id}`} className="hover:text-primary transition-colors">
                                    <span className="font-bold text-sm text-foreground hover:text-primary">
                                        {review.user.username}
                                    </span>
                                </Link>
                                <span className="text-muted-foreground text-xs">reviewed</span>
                                <Link href={`/movies/${review.movie?.slug || ""}`} className="hover:text-primary transition-colors">
                                    <span className="font-semibold text-sm text-foreground hover:text-primary">
                                        {review.movie?.title || "Unknown Movie"}
                                    </span>
                                </Link>
                            </div>

                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => {
                                        const starValue = (i + 1) * 2
                                        const filled = review.rating >= starValue
                                        const halfFilled = review.rating >= starValue - 1 && !filled
                                        return (
                                            <div key={i} className="relative">
                                                <Star className={`w-3.5 h-3.5 ${filled ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
                                                {halfFilled && (
                                                    <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                                                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <span className="text-xs font-bold text-foreground">{review.rating}/10</span>
                                <span className="text-[11px] text-muted-foreground">
                                    · {new Date(review.created_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>

                            {review.comment ? (
                                <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">No written review.</p>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    ) : (
        <Card className="p-10 card-glow">
            <div className="text-center">
                <Users className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">No reviews yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                    Follow other users to see their reviews here!
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Discover Movies
                </Link>
            </div>
        </Card>
    )

    return (
        <div className="min-h-screen bg-background">
            <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 relative">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Following</h1>
                    <p className="text-sm text-muted-foreground">
                        Your followed people, their movies, and reviews from your network
                    </p>
                </div>

                <FollowingTabs
                    peopleCounts={{ actors: actorsWithPhotos.length, directors: directorsWithPhotos.length }}
                    moviesCount={moviesWithPosters.length}
                    reviewsCount={reviewsWithAvatars.length}
                    peopleContent={peopleContent}
                    moviesContent={moviesContent}
                    reviewsContent={reviewsContent}
                />
            </div>
        </div>
    )
}
