"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, Plus, X, Heart, Film } from "lucide-react"
import Image from "next/image"
import { searchMovies, getFavouriteMovies, addFavouriteMovie, removeFavouriteMovie } from "@/app/(pages)/settings/actions"

type Movie = {
    id: number
    title: string
    poster_url: string | null
    release_date: string | null
}

type FavouriteMovie = {
    id: number
    movie_id: number
    movies: Movie | null
}

export default function FavouriteMoviesForm() {
    const [favourites, setFavourites] = useState<FavouriteMovie[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Movie[]>([])
    const [searching, setSearching] = useState(false)
    const [removing, setRemoving] = useState<number | null>(null)

    const loadFavourites = useCallback(async () => {
        setLoading(true)
        const data = await getFavouriteMovies()
        setFavourites(data as unknown as FavouriteMovie[])
        setLoading(false)
    }, [])

    useEffect(() => {
        loadFavourites()
    }, [loadFavourites])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setSearchResults([])
                return
            }
            setSearching(true)
            const results = await searchMovies(searchQuery)
            setSearchResults(results as Movie[])
            setSearching(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleAdd = async (movieId: number) => {
        const result = await addFavouriteMovie(movieId)
        if (!result.error) {
            await loadFavourites()
            setDialogOpen(false)
            setSearchQuery("")
            setSearchResults([])
        }
    }

    const handleRemove = async (favouriteId: number) => {
        setRemoving(favouriteId)
        const result = await removeFavouriteMovie(favouriteId)
        if (!result.error) {
            setFavourites((prev) => prev.filter((f) => f.id !== favouriteId))
        }
        setRemoving(null)
    }

    const isAlreadyFavourite = (movieId: number) => {
        return favourites.some((f) => f.movie_id === movieId)
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            Favourite Movies
                        </CardTitle>
                        <CardDescription>
                            Save your all-time favourite movies
                        </CardDescription>
                    </div>
                    <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : favourites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Film className="h-12 w-12 text-muted-foreground/40 mb-3" />
                            <p className="text-muted-foreground text-sm">
                                No favourite movies yet. Start adding your favourites!
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {favourites.map((fav) => {
                                const movie = fav.movies
                                if (!movie) return null
                                const year = movie.release_date
                                    ? new Date(movie.release_date).getFullYear()
                                    : null
                                return (
                                    <div
                                        key={fav.id}
                                        className="group relative flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md"
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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemove(fav.id)}
                                            disabled={removing === fav.id}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Search Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Favourite Movie</DialogTitle>
                        <DialogDescription>
                            Search for movies to add to your favourites
                        </DialogDescription>
                    </DialogHeader>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search movies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            autoFocus
                        />
                    </div>

                    {/* Results */}
                    <div className="max-h-72 overflow-y-auto space-y-1">
                        {searching ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((movie) => {
                                const alreadyAdded = isAlreadyFavourite(movie.id)
                                const year = movie.release_date
                                    ? new Date(movie.release_date).getFullYear()
                                    : null
                                return (
                                    <div
                                        key={movie.id}
                                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                                            {movie.poster_url ? (
                                                <Image
                                                    src={movie.poster_url}
                                                    alt={movie.title}
                                                    width={40}
                                                    height={56}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Film className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{movie.title}</p>
                                            {year && (
                                                <p className="text-xs text-muted-foreground">{year}</p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={alreadyAdded ? "outline" : "default"}
                                            className="gap-1 text-xs"
                                            disabled={alreadyAdded}
                                            onClick={() => handleAdd(movie.id)}
                                        >
                                            {alreadyAdded ? (
                                                "Added"
                                            ) : (
                                                <>
                                                    <Plus className="h-3 w-3" />
                                                    Add
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )
                            })
                        ) : searchQuery.length >= 2 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No movies found for &quot;{searchQuery}&quot;
                            </p>
                        ) : (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Type at least 2 characters to search
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
