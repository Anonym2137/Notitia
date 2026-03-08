import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Movie } from "@/types"
import HeroButtons from "@/components/HeroButtons"

interface HeroSectionProps {
  movies: Pick<Movie, "id" | "title" | "poster_url" | "rating" | "release_date">[]
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const featured = movies[0]

  return (
    <section className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-20 py-8 sm:py-0">
        {/* Left content */}
        <div className="flex-1 max-w-2xl space-y-4 sm:space-y-6 text-center lg:text-left">

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-balance">
            Discover Movies
            <span className="block text-primary">You&apos;ll Love</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
            Browse curated films, find hidden gems, and build your
            perfect watchlist.
          </p>

          {/* Mobile poster strip */}
          <div className="flex lg:hidden justify-center gap-3 py-2">
            {movies.slice(0, 3).map((movie, i) => (
              <div
                key={movie.id}
                className="relative rounded-xl overflow-hidden shadow-xl"
                style={{
                  width: i === 0 ? "120px" : "100px",
                  height: i === 0 ? "180px" : "150px",
                  transform: `rotate(${(i - 1) * 3}deg)`,
                  opacity: 1 - i * 0.1,
                  marginTop: i === 0 ? "0" : "15px",
                }}
              >
                <Image
                  src={movie.poster_url}
                  alt={movie.title}
                  width={120}
                  height={180}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-[10px] text-muted-foreground">{movie.rating.global_rating.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center lg:justify-start">
            <HeroButtons />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 pt-2 sm:pt-4">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">12K+</p>
              <p className="text-xs text-muted-foreground">Movies</p>
            </div>
            <div className="w-px h-8 sm:h-10 bg-border" />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">50K+</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </div>
            <div className="w-px h-8 sm:h-10 bg-border" />
            <div className="flex items-center gap-1">
              <Star className="w-4 sm:w-5 h-4 sm:h-5 fill-primary text-primary" />
              <p className="text-xl sm:text-2xl font-bold text-foreground">4.9</p>
              <p className="text-xs text-muted-foreground ml-1">Rating</p>
            </div>
          </div>
        </div>

        {/* Right side - floating movie cards (desktop only) */}
        <div className="hidden lg:flex relative w-80 h-[440px]">
          {movies.slice(0, 3).map((movie, i) => (
            <div
              key={movie.id}
              className="absolute rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105"
              style={{
                width: "240px",
                height: "360px",
                top: `${i * 20}px`,
                left: `${i * 30}px`,
                zIndex: 3 - i,
                transform: `rotate(${(i - 1) * 4}deg)`,
                opacity: 1 - i * 0.15,
              }}
            >
              <Image
                src={movie.poster_url}
                alt={movie.title}
                width={240}
                height={360}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-sm font-bold text-foreground">{movie.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-xs text-muted-foreground">{movie.rating.global_rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
