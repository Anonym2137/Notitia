import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Star, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getAvatarUrl } from "@/lib/e2/avatars"

export default async function ReviewsFeedPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect("/login")
    }

    const { data: follows } = await supabase
        .from("user_follows")
        .select("followed_id")
        .eq("follower_id", user.id)

    const followedUserIds = follows?.map(f => f.followed_id) || []

    let feedReviews: any[] = []

    if (followedUserIds.length > 0) {
        const { data: reviews } = await supabase
            .from("movie_reviews")
            .select("id, rating, comment, created_at, user:users(user_id, username, avatar_url), movie:movies(id, title, slug)")
            .in("user_id", followedUserIds)
            .order("created_at", { ascending: false })
            .limit(50)

        feedReviews = reviews || []
    }

    const reviewsWithAvatars = await Promise.all(
        feedReviews.map(async (review) => {
            const avatarUrl = review.user?.avatar_url
                ? await getAvatarUrl(review.user.avatar_url)
                : null
            return {
                ...review,
                user: {
                    ...review.user,
                    avatar_url: avatarUrl,
                },
            }
        })
    )

    return (
        <div className="min-h-screen bg-background">
            <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-3xl mx-auto px-4 py-8 relative">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Reviews Feed</h1>
                    <p className="text-muted-foreground">
                        Latest reviews from people you follow
                    </p>
                </div>

                <div className="space-y-6">
                    {reviewsWithAvatars.length > 0 ? (
                        reviewsWithAvatars.map((review) => (
                            <Card key={review.id} className="p-4 sm:p-6 card-glow animate-fade-in-up">
                                <div className="flex gap-3 sm:gap-4">
                                    <div className="flex-shrink-0 hidden sm:block">
                                        <Link href={`/profile/${review.user.user_id}`}>
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-border hover:border-primary transition-colors duration-200">
                                                {review.user.avatar_url ? (
                                                    <Image
                                                        src={review.user.avatar_url}
                                                        alt={review.user.username}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-semibold text-primary">
                                                        {review.user.username.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-1">
                                            <Link href={`/profile/${review.user.user_id}`} className="flex-shrink-0">
                                                <div className="sm:hidden w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-border inline-flex mr-1">
                                                    {review.user.avatar_url ? (
                                                        <Image
                                                            src={review.user.avatar_url}
                                                            alt={review.user.username}
                                                            width={24}
                                                            height={24}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-semibold text-primary">
                                                            {review.user.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                            <Link href={`/profile/${review.user.user_id}`} className="hover:text-primary transition-colors duration-200">
                                                <span className="font-bold text-foreground hover:text-primary transition-colors duration-200">
                                                    {review.user.username}
                                                </span>
                                            </Link>
                                            <span className="text-muted-foreground text-sm">reviewed</span>
                                            <Link href={`/movies/${review.movie?.slug || ""}`} className="hover:text-primary transition-colors duration-200">
                                                <span className="font-semibold text-foreground hover:text-primary transition-colors duration-200">
                                                    {review.movie?.title || "Unknown Movie"}
                                                </span>
                                            </Link>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(review.created_at).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => {
                                                        const starValue = (i + 1) * 2
                                                        const filled = review.rating >= starValue
                                                        const halfFilled = review.rating >= starValue - 1 && !filled
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
                                                        )
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
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-12 card-glow">
                            <div className="text-center">
                                <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
                                <p className="text-muted-foreground mb-6">
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
                    )}
                </div>
            </div>
        </div>
    )
}
