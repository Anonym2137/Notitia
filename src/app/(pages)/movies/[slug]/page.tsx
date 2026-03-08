import { Star, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPrivateImageUrl } from "@/lib/e2/actions";
import { Movie } from "@/types";
import { notFound } from "next/navigation";
import getDataFromSlug from "./actions";
import WatchlistBtn from "@/components/WatchlistBtn";
import { createClient } from "@/lib/supabase/server";
import { RatingDialog } from "@/components/RatingDialog";
import { getAvatarUrl } from "@/lib/e2/avatars";
import FollowPersonButton from "@/components/FollowPersonButton";

export default async function MovieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data: Movie | null = await getDataFromSlug(slug)

  if (!data) {
    notFound()
  }

  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  let followedActorIds: number[] = []
  let followedDirectorIds: number[] = []

  if (user.data.user) {
    const [actorFollows, directorFollows] = await Promise.all([
      supabase
        .from("actor_follows")
        .select("actor_id")
        .eq("user_id", user.data.user.id),
      supabase
        .from("director_follows")
        .select("director_id")
        .eq("user_id", user.data.user.id),
    ])

    followedActorIds = actorFollows.data?.map((f: any) => f.actor_id) || []
    followedDirectorIds = directorFollows.data?.map((f: any) => f.director_id) || []
  }

  const poster = await getPrivateImageUrl(data.poster_url)

  const castWithImageUrl = await Promise.all(
    data.actors
      .filter((actor) => actor.photo_url)
      .map(async (actor) => {
        const imageUrl = await getPrivateImageUrl(actor.photo_url)
        return {
          ...actor,
          image: imageUrl
        }
      })
  )

  const reviewsWithAvatars = data.reviews
    ? await Promise.all(
      data.reviews.map(async (review) => {
        const avatarUrl = review.user.avatar_url
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
    : []

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient background behind header */}
      <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Poster */}
          <div className="flex justify-center md:block flex-shrink-0 pt-8 animate-fade-in-up">
            <div className="w-48 rounded-lg overflow-hidden shadow-2xl border border-border glow-on-hover transition-all duration-500 hover:shadow-primary/20">
              <Image
                src={poster || "/placeholder.svg"}
                alt={data.title}
                width={192}
                height={288}
                className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Movie Info */}
          <div className="flex-1 pt-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <h1 className="text-4xl font-bold text-foreground mb-2">{data.title}</h1>
            <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4 flex-wrap">
              <span>• Directed by</span>
              {data.directors.map((d, i) => (
                <span key={d.id} className="inline-flex items-center gap-1.5">
                  <Link href={`/people/${d.id}?type=director`} className="hover:text-primary transition-colors duration-200">{d.name}</Link>
                  <FollowPersonButton
                    personId={d.id}
                    type="director"
                    initialFollowed={followedDirectorIds.includes(d.id)}
                    size="sm"
                    showLabel={false}
                  />
                  {i < data.directors.length - 1 && <span>,</span>}
                </span>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]" />
                <span className="text-2xl font-bold text-foreground">{data.rating.global_rating.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">({data.rating.global_search_count} reviews)</span>
              </div>
              {data.userRating != 0 && (
                <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 border border-primary/30">
                  <span className="text-2xl text-primary font-bold">{data.userRating || 0} / 10</span>
                  <Star className="w-5 h-5 fill-primary text-primary" />
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {data.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="transition-all duration-200 hover:bg-primary/20 hover:text-primary cursor-default">
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-border/50">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-primary" /> {data.duration} minutes
                </p>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.30s' }}>
                <p className="text-xs text-muted-foreground mb-1">Release Date</p>
                <p className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-4 h-4 text-primary" /> {data.release_date}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <RatingDialog movieId={data.id} movieTitle={data.title} />
              <WatchlistBtn movieId={data.id} isInWatchlist={data.isInWatchlist} isLoggedIn={!!user.data.user} />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="items-center mt-8 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview" className="transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="cast" className="transition-all duration-200">Cast</TabsTrigger>
            <TabsTrigger value="watch" className="transition-all duration-200">Watch</TabsTrigger>
            <TabsTrigger value="reviews" className="transition-all duration-200">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="p-4 card-glow">
              <p className="text-xl font-bold text-foreground mb-3">Summary</p>
              <p className="text-base text-foreground leading-relaxed">{data.description}</p>
            </Card>
          </TabsContent>

          {/* Cast Tab */}
          <TabsContent value="cast" className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {castWithImageUrl.map((actor, index) => (
                <div
                  key={index}
                  className="text-center group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <Link href={`/people/${actor.id}?type=actor`} className="block mb-3 rounded-lg overflow-hidden bg-card border border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <Image
                      src={actor.image}
                      alt={actor.name}
                      width={160}
                      height={240}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <Link href={`/people/${actor.id}?type=actor`} className="hover:text-primary transition-colors duration-200">
                    <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors duration-200">{actor.name}</h4>
                  </Link>
                  <p className="text-xs text-muted-foreground mb-2">{actor.role}</p>
                  <FollowPersonButton
                    personId={actor.id}
                    type="actor"
                    initialFollowed={followedActorIds.includes(actor.id)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Where to Watch Tab */}
          <TabsContent value="watch" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Watch on</h3>
              {data.whereToWatch && data.whereToWatch.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.whereToWatch.map((platform) => (
                    <a
                      key={platform.provider_id}
                      href="#"
                      className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary hover:bg-accent/10 transition-all duration-300 group card-glow hover:-translate-y-0.5"
                    >
                      <div className="w-12 h-12 relative">
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${platform.logo_path}`}
                          alt={platform.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                          {platform.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Watch now</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Not available for streaming in your region.</p>
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {reviewsWithAvatars && reviewsWithAvatars.length > 0 ? (
                <>
                  {reviewsWithAvatars.map((review) => (
                    < Card key={review.id} className="p-4 card-glow" >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <Link href={`/profile/${review.user.user_id}`}>
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-border hover:border-primary transition-colors duration-200">
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
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link href={`/profile/${review.user.user_id}`} className="hover:text-primary transition-colors duration-200">
                                <h4 className="font-semibold text-foreground hover:text-primary transition-colors duration-200">{review.user.username}</h4>
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
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
                              <span className="text-sm font-semibold text-foreground ml-1">
                                {review.rating}/10
                              </span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  <div className="flex justify-center pt-2">
                    <Link
                      href={`/movies/${data.slug}/reviews`}
                      className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                    >
                      See all reviews →
                    </Link>
                  </div>
                </>
              ) : (
                <Card className="p-8 card-glow">
                  <div className="text-center">
                    <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this movie!</p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  )
}