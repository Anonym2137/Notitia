import { Star, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Movie } from "@/types"
import TrendingWatchlistBtn from "@/components/TrendingWatchlistBtn"

interface TrendingSectionProps {
  movies: Pick<Movie, "id" | "title" | "slug" | "poster_url" | "rating" | "genres" | "release_date" | "isInWatchlist">[]
}

export default function TrendingSection({ movies }: TrendingSectionProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2
              className="text-3xl lg:text-4xl font-bold text-foreground"
            >
              Trending This Week
            </h2>
            <p className="text-muted-foreground mt-2">
              The most popular films everyone is talking about
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:flex gap-1 text-primary hover:text-primary"
            asChild
          >
            <Link href="/search">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
          {movies.slice(0, 6).map((movie, index) => (
            <div
              key={movie.id}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-secondary">
                <Link href={`/movies/${movie.slug}`}>
                  <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Rating badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {movie.rating.global_rating.toFixed(2)}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <TrendingWatchlistBtn movieId={movie.id} initialInWatchlist={movie.isInWatchlist} />
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <Link href={`/movies/${movie.slug}`}>
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{movie.release_date}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <div className="flex gap-1">
                    {movie.genres.slice(0, 2).map((genre) => (
                      <Badge
                        key={genre}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}