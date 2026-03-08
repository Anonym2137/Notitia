import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Film, Clapperboard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import FollowPersonButton from "@/components/FollowPersonButton"
import { getPersonById } from "./actions"
import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
    { params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params
    const { type: typeParam } = await searchParams
    const personId = parseInt(id, 10)

    if (isNaN(personId)) {
        return { title: 'Person Not Found' }
    }

    const preferredType = typeParam === "actor" || typeParam === "director" ? typeParam : undefined
    const person = await getPersonById(personId, preferredType)

    if (!person) {
        return { title: 'Person Not Found' }
    }

    return {
        title: `${person.name} | Notitia`,
        description: `Discover movies directed and acted by ${person.name} on Notitia.`,
        openGraph: {
            title: `${person.name} | Notitia`,
            description: `Discover movies directed and acted by ${person.name} on Notitia.`,
            images: [person.photo_url || ""],
        },
    }
}
export default async function PersonPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
    const { id } = await params
    const { type: typeParam } = await searchParams
    const personId = parseInt(id, 10)

    if (isNaN(personId)) {
        notFound()
    }

    const preferredType = typeParam === "actor" || typeParam === "director" ? typeParam : undefined
    const person = await getPersonById(personId, preferredType)

    if (!person) {
        notFound()
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isFollowedAsActor = false
    let isFollowedAsDirector = false

    if (user) {
        if (person.type === "actor" || person.type === "both") {
            const { data: actorFollow } = await supabase
                .from("actor_follows")
                .select("user_id")
                .eq("user_id", user.id)
                .eq("actor_id", personId)
                .maybeSingle()
            isFollowedAsActor = !!actorFollow
        }

        if (person.type === "director" || person.type === "both") {
            const { data: directorFollow } = await supabase
                .from("director_follows")
                .select("user_id")
                .eq("user_id", user.id)
                .eq("director_id", personId)
                .maybeSingle()
            isFollowedAsDirector = !!directorFollow
        }
    }

    const totalMovies = new Set([
        ...person.moviesAsActor.map(m => m.id),
        ...person.moviesAsDirector.map(m => m.id),
    ]).size

    const roleLabel =
        person.type === "both" ? "Actor & Director" :
            person.type === "actor" ? "Actor" : "Director"

    const defaultTab =
        preferredType === "director" ? "director" :
            preferredType === "actor" ? "actor" :
                person.type === "director" ? "director" : "actor"

    return (
        <div className="min-h-screen bg-background">
            {/* Gradient background */}
            <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Person Header */}
                <div className="flex flex-col md:flex-row gap-8 pt-8 mb-10">
                    {/* Photo */}
                    <div className="flex justify-center md:block flex-shrink-0 animate-fade-in-up">
                        <div className="w-48 h-64 rounded-xl overflow-hidden shadow-2xl border border-border glow-on-hover transition-all duration-500 hover:shadow-primary/20">
                            <Image
                                src={person.photo_url}
                                alt={person.name}
                                width={192}
                                height={256}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-2 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                        <h1 className="text-4xl font-bold text-foreground mb-2">{person.name}</h1>

                        <div className="flex items-center gap-3 mb-6">
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                {roleLabel}
                            </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 py-4 border-y border-border/50">
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                                <p className="text-xs text-muted-foreground mb-1">Total Movies</p>
                                <p className="flex items-center gap-2 text-foreground text-xl font-bold">
                                    <Film className="w-5 h-5 text-primary" /> {totalMovies}
                                </p>
                            </div>
                            {person.moviesAsActor.length > 0 && (
                                <div className="animate-fade-in-up" style={{ animationDelay: '0.30s' }}>
                                    <p className="text-xs text-muted-foreground mb-1">As Actor</p>
                                    <p className="flex items-center gap-2 text-foreground text-xl font-bold">
                                        <Film className="w-5 h-5 text-primary" /> {person.moviesAsActor.length}
                                    </p>
                                </div>
                            )}
                            {person.moviesAsDirector.length > 0 && (
                                <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                                    <p className="text-xs text-muted-foreground mb-1">As Director</p>
                                    <p className="flex items-center gap-2 text-foreground text-xl font-bold">
                                        <Clapperboard className="w-5 h-5 text-primary" /> {person.moviesAsDirector.length}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Follow Buttons */}
                        <div className="flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            {person.type === "both" ? (
                                <>
                                    <div className="flex gap-3">
                                        <FollowPersonButton
                                            personId={personId}
                                            type={preferredType === "director" ? "director" : "actor"}
                                            initialFollowed={preferredType === "director" ? isFollowedAsDirector : isFollowedAsActor}
                                            showLabel={true}
                                            label={preferredType === "director" ? "Follow as Director" : "Follow as Actor"}
                                            followingLabel={preferredType === "director" ? "Following as Director" : "Following as Actor"}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <FollowPersonButton
                                            personId={personId}
                                            type={preferredType === "director" ? "actor" : "director"}
                                            initialFollowed={preferredType === "director" ? isFollowedAsActor : isFollowedAsDirector}
                                            size="sm"
                                            showLabel={true}
                                            label={preferredType === "director" ? "Also follow as Actor" : "Also follow as Director"}
                                            followingLabel={preferredType === "director" ? "Following as Actor" : "Following as Director"}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex gap-3">
                                    <FollowPersonButton
                                        personId={personId}
                                        type={person.type}
                                        initialFollowed={person.type === "actor" ? isFollowedAsActor : isFollowedAsDirector}
                                        showLabel={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filmography */}
                <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    {person.type === "both" ? (
                        <Tabs defaultValue={defaultTab} className="items-center">
                            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                                <TabsTrigger value="actor" className="transition-all duration-200">
                                    <Film className="w-4 h-4 mr-2" />
                                    As Actor ({person.moviesAsActor.length})
                                </TabsTrigger>
                                <TabsTrigger value="director" className="transition-all duration-200">
                                    <Clapperboard className="w-4 h-4 mr-2" />
                                    As Director ({person.moviesAsDirector.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="actor">
                                <MovieGrid movies={person.moviesAsActor} showRole />
                            </TabsContent>

                            <TabsContent value="director">
                                <MovieGrid movies={person.moviesAsDirector} />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                {person.type === "actor" ? (
                                    <><Film className="w-6 h-6 text-primary" /> Filmography</>
                                ) : (
                                    <><Clapperboard className="w-6 h-6 text-primary" /> Filmography</>
                                )}
                            </h2>
                            <MovieGrid
                                movies={person.type === "actor" ? person.moviesAsActor : person.moviesAsDirector}
                                showRole={person.type === "actor"}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function MovieGrid({ movies, showRole = false }: { movies: any[]; showRole?: boolean }) {
    if (movies.length === 0) {
        return (
            <Card className="p-8 card-glow">
                <div className="text-center">
                    <Film className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No movies found.</p>
                </div>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie, index) => (
                <Link
                    key={movie.id}
                    href={`/movies/${movie.slug}`}
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.04}s` }}
                >
                    <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-secondary border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                        <Image
                            src={movie.poster_url || "/placeholder.svg"}
                            alt={movie.title}
                            width={240}
                            height={360}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Rating badge */}
                        {movie.rating?.global_rating > 0 && (
                            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                                <Star className="w-3 h-3 fill-primary text-primary" />
                                <span className="text-[10px] sm:text-xs font-semibold text-foreground">
                                    {movie.rating.global_rating.toFixed(1)}
                                </span>
                            </div>
                        )}

                        {/* Year badge */}
                        {movie.release_date && (
                            <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                                <span className="text-[10px] sm:text-xs font-medium text-foreground">
                                    {new Date(movie.release_date).getFullYear()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 space-y-0.5 px-0.5">
                        <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                            {movie.title}
                        </h4>
                        {showRole && movie.role && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                                as {movie.role}
                            </p>
                        )}
                        {movie.genres && movie.genres.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                                {movie.genres.slice(0, 2).map((genre: string) => (
                                    <Badge key={genre} variant="outline" className="text-[9px] px-1.5 py-0">
                                        {genre}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    )
}
