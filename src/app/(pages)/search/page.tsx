import { createClient } from "@/lib/supabase/server";
import { getPrivateImageUrl } from "@/lib/e2/actions";
import { getAvatarUrl } from "@/lib/e2/avatars";
import { Film } from "lucide-react";
import SearchResults from "@/components/SearchResults";
import { Movie, Actor, SearchUser } from "@/types";

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    type?: string;
    sortBy?: string;
    minRating?: string;
    genres?: string;
  }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || '';

  const genresFilter = resolvedParams?.genres || '';

  if (!query && !genresFilter) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <Film className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-3xl font-bold">Search for movies or actors</h2>
          <p className="text-muted-foreground text-lg">
            Start by typing in the search bar above to discover films and talent.
          </p>
        </div>
      </div>
    );
  }

  const contentType = resolvedParams?.type || 'all';

  let moviesWithFullUrls: Pick<Movie, 'id' | 'title' | 'slug' | 'poster_url' | 'release_date' | 'genres' | 'rating'>[] = [];
  let actorsWithFullUrls: Actor[] = [];
  let usersWithAvatars: SearchUser[] = [];

  if (contentType === 'all' || contentType === 'movies') {
    const selectFields = genresFilter
      ? 'id, title, slug, poster_url, genres: movie_genres!inner(genres!inner(name)), rating: media_stats(global_rating, global_search_count), release_date'
      : 'id, title, slug, poster_url, genres: movie_genres(genres(name)), rating: media_stats(global_rating, global_search_count), release_date';

    let movieQuery = supabase
      .from('movies')
      .select(selectFields)
      .not('poster_url', 'is', null)

    if (query) {
      movieQuery = movieQuery.ilike('title', `%${query}%`);
    }

    if (resolvedParams?.minRating) {
      movieQuery = movieQuery.gte('rating', parseFloat(resolvedParams.minRating));
    }
    if (genresFilter) {
      const genres = genresFilter.split(',').map((g: string) => g.trim()).join(',')
      movieQuery = movieQuery.filter('movie_genres.genres.name', 'in', `(${genres})`);
    }

    if (resolvedParams?.sortBy === 'rating') {
      movieQuery = movieQuery.order('rating', { ascending: false });
    } else if (resolvedParams?.sortBy === 'year') {
      movieQuery = movieQuery.order('release_date', { ascending: false });
    }

    const { data: movies, error: moviesError } = await movieQuery.limit(50);

    if (moviesError) {
      console.error("Error fetching movies for search: ", moviesError);
    }

    if (movies) {
      moviesWithFullUrls = await Promise.all(
        movies.map(async (movie) => {
          const fullUrl = await getPrivateImageUrl(movie.poster_url);

          const ratingFromDb = (Array.isArray(movie.rating) && movie.rating.length > 0)
            ? movie.rating[0]
            : null

          const ratingObject: Movie['rating'] = {
            global_rating: ratingFromDb?.global_rating || 0,
            global_search_count: ratingFromDb?.global_search_count || null
          }
          const genresArray = Array.isArray(movie.genres)
            ? movie.genres.map((g: any) => g.genres?.name).filter(Boolean)
            : []

          return {
            id: movie.id,
            title: movie.title,
            slug: movie.slug,
            poster_url: fullUrl,
            rating: ratingObject,
            genres: genresArray,
            release_date: movie.release_date,
          };
        })
      );
    }
  }

  if (contentType === 'all' || contentType === 'actors') {
    const { data: actors, error: actorsError } = await supabase
      .from('actors')
      .select('id, name, photo_url')
      .not('photo_url', 'is', null)
      .ilike('name', `%${query}%`)
      .limit(50);

    if (actorsError) {
      console.error("Error fetching actors for search: ", actorsError);
    }

    if (actors) {
      actorsWithFullUrls = await Promise.all(
        actors.map(async (actor) => {
          const fullUrl = actor.photo_url ? await getPrivateImageUrl(actor.photo_url) : '/default-avatar.png';
          return { id: actor.id, name: actor.name, photo_url: fullUrl, role: '' };
        })
      );
    }
  }

  const displayQuery = query || (genresFilter ? `${genresFilter} movies` : '');

  const { data: { user } } = await supabase.auth.getUser()
  let followedActorIds: number[] = []
  if (user) {
    const { data: actorFollows } = await supabase
      .from("actor_follows")
      .select("actor_id")
      .eq("user_id", user.id)
    followedActorIds = actorFollows?.map((f: any) => f.actor_id) || []
  }

  if (query && (contentType === 'all' || contentType === 'users')) {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, username, full_name, avatar_url, bio')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)

    if (usersError) {
      console.error("Error fetching users for search: ", usersError)
    }

    if (users) {
      usersWithAvatars = await Promise.all(
        users.map(async (u) => ({
          ...u,
          avatar_url: u.avatar_url ? await getAvatarUrl(u.avatar_url) : null,
        }))
      )
    }
  }

  return (
    <SearchResults
      movies={moviesWithFullUrls}
      actors={actorsWithFullUrls}
      users={usersWithAvatars}
      query={displayQuery}
      followedActorIds={followedActorIds}
    />
  );
}

