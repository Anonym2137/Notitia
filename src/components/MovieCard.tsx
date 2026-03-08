import { Card, CardTitle, CardFooter, CardHeader, CardContent } from "@/components/ui/card";
import { VscRepo, VscStarEmpty, VscStarFull, VscThumbsup } from "react-icons/vsc";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types";
import { Plus } from "lucide-react";
import CarouselElement from "./CarouselElement";
import { CarouselItem } from "./ui/carousel";
import { Badge } from "./ui/badge";
import WatchlistBtn from "./WatchlistBtn";

export default function MovieCard({ movies, isLoggedIn = false }: { movies: Pick<Movie, "id" | "title" | "slug" | "rating" | "poster_url" | "userRating" | "genres" | "isInWatchlist">[], isLoggedIn?: boolean }) {
  return (
    <CarouselElement title="Popular movies" link="/popular-movies" className="flex w-full items-center  max-w-[95vw] gap-2 px-0">
      {movies.map((movie, index) => (
        <CarouselItem key={index}>
          <div
            className="w-[250px] flex flex-col bg-card rounded-2xl overflow-hidden shadow-2xl glow-on-hover transition-all duration-500 ease-out hover:-translate-y-2 animate-fade-in-up group"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            {/* Poster Image */}
            <div className="relative overflow-hidden">
              <Link href={`/movies/${movie.slug}`}>
                <Image
                  height={370}
                  width={250}
                  className="w-full aspect-[2/3] object-cover transition-transform duration-700 group-hover:scale-110"
                  src={movie.poster_url}
                  alt={movie.title}
                />
                {/* Cinematic gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>

              {/* Rating Badge with shimmer */}
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shimmer-badge">
                {movie.userRating != 0 ? (
                  <>
                    <VscStarFull className="text-yellow-400" />
                    <span className="text-white font-semibold text-sm">{movie.userRating}</span>
                  </>
                ) : (
                  <>
                    <VscStarEmpty className="text-yellow-400" />
                    <span className="text-white font-semibold text-sm">{movie.rating.global_rating.toFixed(2)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Movie Information */}
            <div className="p-4 bg-card text-foreground relative">
              <div className="space-y-2 mb-4 h-[73px] flex-1">
                <h3 className="text-xl font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">{movie.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="truncate">{movie.genres?.map((genre, index) => (
                    <Badge key={index} variant="outline" className="transition-all duration-200 hover:bg-primary/10 hover:border-primary/40">{genre}</Badge>
                  ))}</div>
                </div>
              </div>

              {/* Action Button */}
              <WatchlistBtn movieId={movie.id} isInWatchlist={movie.isInWatchlist} className="w-full" isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </CarouselItem>
      ))
      }
    </CarouselElement >
  )
}