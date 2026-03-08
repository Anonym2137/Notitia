import { Movie } from "@/types";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";


export default function MovieCardRow({ movie }: { movie: Pick<Movie, 'id' | 'title' | 'slug' | 'poster_url' | 'release_date' | 'genres' | 'rating'> }) {
  return (
    <Card className="group overflow-auto card-glow border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5">
      <CardContent className="p-0">
        <Link href={`/movies/${movie.slug || movie.title}`} className="flex gap-4 p-4">
          <div className="relative w-24 h-36 shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={movie.poster_url || "/placeholder.svg"}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors duration-300">{movie.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {movie.rating?.global_rating && (
                  <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2 py-0.5 group-hover:bg-primary/20 transition-colors duration-300">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{movie.rating.global_rating.toFixed(2)}</span>
                  </div>
                )}
                {movie.release_date && (
                  <Badge variant="secondary" className="text-xs">
                    {new Date(movie.release_date).getFullYear()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {movie.genres?.map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs transition-all duration-200 hover:bg-primary/10 hover:border-primary/40">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            <Button size="sm" className="w-fit mt-2 press-effect hover:shadow-md hover:shadow-primary/20 transition-all duration-200">
              <Plus className="w-3 h-3 mr-1" />
              Add to Watchlist
            </Button>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}