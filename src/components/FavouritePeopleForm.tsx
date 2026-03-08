"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, Plus, X, Star, UserPlus, Clapperboard } from "lucide-react"
import Image from "next/image"
import { searchActors, searchDirectors, getFavouritePeople, addFavouritePerson, removeFavouritePerson } from "@/app/(pages)/settings/actions"

type Person = {
    id: number
    name: string
    photo_url: string | null
}

type FavouritePerson = {
    id: number
    actor_id: number | null
    director_id: number | null
    actors: Person | null
    directors: Person | null
}

export default function FavouritePeopleForm() {
    const [favourites, setFavourites] = useState<FavouritePerson[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<(Person & { type: "actor" | "director" })[]>([])
    const [searching, setSearching] = useState(false)
    const [searchType, setSearchType] = useState<"actor" | "director">("actor")
    const [removing, setRemoving] = useState<number | null>(null)

    const loadFavourites = useCallback(async () => {
        setLoading(true)
        const data = await getFavouritePeople()
        setFavourites(data as unknown as FavouritePerson[])
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
            let results: (Person & { type: "actor" | "director" })[] = []

            if (searchType === "actor") {
                const actors = await searchActors(searchQuery)
                results = actors.map((a: Person) => ({ ...a, type: "actor" as const }))
            } else {
                const directors = await searchDirectors(searchQuery)
                results = directors.map((d: Person) => ({ ...d, type: "director" as const }))
            }

            setSearchResults(results)
            setSearching(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, searchType])

    const handleAdd = async (type: "actor" | "director", personId: number) => {
        const result = await addFavouritePerson(type, personId)
        if (!result.error) {
            await loadFavourites()
            setDialogOpen(false)
            setSearchQuery("")
            setSearchResults([])
        }
    }

    const handleRemove = async (favouriteId: number) => {
        setRemoving(favouriteId)
        const result = await removeFavouritePerson(favouriteId)
        if (!result.error) {
            setFavourites((prev) => prev.filter((f) => f.id !== favouriteId))
        }
        setRemoving(null)
    }

    const isAlreadyFavourite = (type: "actor" | "director", personId: number) => {
        return favourites.some((f) =>
            type === "actor" ? f.actor_id === personId : f.director_id === personId
        )
    }

    const actors = favourites.filter((f) => f.actor_id !== null)
    const directors = favourites.filter((f) => f.director_id !== null)

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Favourite People
                        </CardTitle>
                        <CardDescription>
                            Add your favourite actors and directors
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
                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : favourites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <UserPlus className="h-12 w-12 text-muted-foreground/40 mb-3" />
                            <p className="text-muted-foreground text-sm">
                                No favourite people yet. Start adding your favourites!
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Actors Section */}
                            {actors.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Actors ({actors.length})
                                    </h3>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {actors.map((fav) => {
                                            const person = fav.actors
                                            if (!person) return null
                                            return (
                                                <div
                                                    key={fav.id}
                                                    className="group relative flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md"
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
                                </div>
                            )}

                            {/* Directors Section */}
                            {directors.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Clapperboard className="h-4 w-4" />
                                        Directors ({directors.length})
                                    </h3>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {directors.map((fav) => {
                                            const person = fav.directors
                                            if (!person) return null
                                            return (
                                                <div
                                                    key={fav.id}
                                                    className="group relative flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md"
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
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Search Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Favourite Person</DialogTitle>
                        <DialogDescription>
                            Search for actors or directors to add to your favourites
                        </DialogDescription>
                    </DialogHeader>

                    {/* Type Toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={searchType === "actor" ? "default" : "outline"}
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => {
                                setSearchType("actor")
                                setSearchQuery("")
                                setSearchResults([])
                            }}
                        >
                            <UserPlus className="h-4 w-4" />
                            Actors
                        </Button>
                        <Button
                            variant={searchType === "director" ? "default" : "outline"}
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => {
                                setSearchType("director")
                                setSearchQuery("")
                                setSearchResults([])
                            }}
                        >
                            <Clapperboard className="h-4 w-4" />
                            Directors
                        </Button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={`Search ${searchType}s...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            autoFocus
                        />
                    </div>

                    {/* Results */}
                    <div className="max-h-64 overflow-y-auto space-y-1">
                        {searching ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((person) => {
                                const alreadyAdded = isAlreadyFavourite(person.type, person.id)
                                return (
                                    <div
                                        key={`${person.type}-${person.id}`}
                                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                                            {person.photo_url ? (
                                                <Image
                                                    src={person.photo_url}
                                                    alt={person.name}
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                                                    {person.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{person.name}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={alreadyAdded ? "outline" : "default"}
                                            className="gap-1 text-xs"
                                            disabled={alreadyAdded}
                                            onClick={() => handleAdd(person.type, person.id)}
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
                                No {searchType}s found for &quot;{searchQuery}&quot;
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
