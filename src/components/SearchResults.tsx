'use client'

import { useMemo, useState } from "react"
import { Film, SlidersHorizontal, User, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import MovieCardRow from "@/components/MovieCardRow"
import CastCardRow from "@/components/CastCardRow"
import { Movie, Actor, SearchUser } from "@/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import Link from "next/link"

interface SearchResultsProps {
  movies: Pick<Movie, 'id' | 'title' | 'slug' | 'poster_url' | 'release_date' | 'genres' | 'rating'>[]
  actors: Actor[]
  users: SearchUser[]
  query: string
  followedActorIds?: number[]
}

export default function SearchResults({ movies, actors, users, query, followedActorIds = [] }: SearchResultsProps) {
  const [contentType, setContentType] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")
  const [minRating, setMinRating] = useState("0")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filteredMovies = useMemo(() => {
    let processableMovies = [...movies]

    if (selectedGenres.length > 0) {
      processableMovies = processableMovies.filter(movie => selectedGenres.some(g => movie.genres?.includes(g)))
    }

    if (minRating !== "0") {
      processableMovies = processableMovies.filter(movie => movie.rating.global_rating >= parseFloat(minRating))
    }

    if (sortBy === "rating") {
      return [...processableMovies].sort((a, b) => b.rating.global_rating - a.rating.global_rating)
    }

    if (sortBy === "year") {
      return [...processableMovies].sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    }

    return processableMovies
  }, [movies, selectedGenres, minRating, sortBy])

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prevGenres => prevGenres.includes(genre) ? prevGenres.filter(g => g !== genre) : [...prevGenres, genre])
  }

  const clearFilters = () => {
    setContentType("all")
    setSortBy("relevance")
    setMinRating("0")
    setSelectedGenres([])
  }

  const allGenres = useMemo(() => {
    const genres = new Set<string>()
    movies.forEach(movie => {
      movie.genres?.forEach(genre => genres.add(genre))
    })
    return Array.from(genres).sort()
  }, [movies])

  const displayedMovies = contentType === 'all' || contentType === 'movies' ? filteredMovies : []
  const displayedActors = contentType === 'all' || contentType === 'actors' ? actors : []
  const displayedUsers = contentType === 'all' || contentType === 'users' ? users : []
  const totalResults = displayedMovies.length + displayedActors.length + displayedUsers.length

  const FilterContent = () => (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2 font-semibold">
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Content Type</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="all-filter" checked={contentType === "all"} onCheckedChange={() => setContentType("all")} />
            <Label htmlFor="all-filter" className="text-sm font-normal cursor-pointer">
              All ({totalResults})
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="movies-filter"
              checked={contentType === "movies"}
              onCheckedChange={() => setContentType("movies")}
            />
            <Label htmlFor="movies-filter" className="text-sm font-normal cursor-pointer">
              Movies ({displayedMovies.length})
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="actors-filter"
              checked={contentType === "actors"}
              onCheckedChange={() => setContentType("actors")}
            />
            <Label htmlFor="actors-filter" className="text-sm font-normal cursor-pointer">
              Actors ({displayedActors.length})
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="users-filter"
              checked={contentType === "users"}
              onCheckedChange={() => setContentType("users")}
            />
            <Label htmlFor="users-filter" className="text-sm font-normal cursor-pointer">
              Users ({displayedUsers.length})
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Sort By</Label>
        <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Minimum Rating</Label>
        <Select value={minRating} onValueChange={(value: string) => setMinRating(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All Ratings</SelectItem>
            <SelectItem value="5">5+ Stars</SelectItem>
            <SelectItem value="6">6+ Stars</SelectItem>
            <SelectItem value="7">7+ Stars</SelectItem>
            <SelectItem value="8">8+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Genres</Label>
        <div className="space-y-2">
          {allGenres.map((genre) => (
            <div key={genre} className="flex items-center gap-2">
              <Checkbox
                id={`${genre}-filter`}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => handleGenreToggle(genre)}
              />
              <Label htmlFor={`${genre}-filter`} className="text-sm font-normal cursor-pointer">
                {genre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {(selectedGenres.length > 0 || minRating !== "0" || sortBy !== "relevance") && (
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent"
          onClick={() => clearFilters()}
        >
          Clear Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="space-y-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold truncate">
              Results for <span className="text-primary">"{query}"</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {totalResults} result{totalResults !== 1 ? "s" : ""}
            </p>
          </div>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden shrink-0 bg-transparent">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <FilterContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-64 space-y-6 shrink-0">

          <Card className="p-4 lg:mt-12 space-y-6">
            <FilterContent />
          </Card>
        </aside>

        <main className="flex-1 space-y-6">
          {displayedMovies.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2"><Film className="w-6 h-6 text-primary" /><h2 className="text-2xl font-bold">Movies</h2></div>
              <div className="space-y-3">
                {displayedMovies.map((movie) => <MovieCardRow key={movie.slug} movie={movie} />)}
              </div>
            </section>
          )}

          {displayedActors.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2"><User className="w-6 h-6 text-primary" /><h2 className="text-2xl font-bold">Actors</h2></div>
              <div className="space-y-3">
                {displayedActors.map((actor) => <CastCardRow key={actor.name} actor={actor} isFollowed={followedActorIds.includes(actor.id)} />)}
              </div>
            </section>
          )}

          {displayedUsers.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2"><Users className="w-6 h-6 text-primary" /><h2 className="text-2xl font-bold">Users</h2></div>
              <div className="space-y-3">
                {displayedUsers.map((user) => (
                  <Link
                    key={user.user_id}
                    href={`/profile/${user.user_id}`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <Avatar className="h-12 w-12 border border-border">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                      ) : (
                        <AvatarFallback className="text-sm font-bold">
                          {user.username?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{user.username}</p>
                      {user.full_name && (
                        <p className="text-sm text-muted-foreground truncate">{user.full_name}</p>
                      )}
                      {user.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className="text-center py-16">
              <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No results found for "{query}"</h2>
              <p className="text-muted-foreground">Try adjusting your filters or search for something else.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
