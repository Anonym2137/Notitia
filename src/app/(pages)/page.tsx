import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import { getPrivateImageUrl } from "@/lib/e2/actions";
import { getAvatarUrl } from "@/lib/e2/avatars";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import GenresSection from "@/components/GenresSection";
import DiscoverCTA from "@/components/DiscoverCTA";
import HomeDashboard from "@/components/HomeDashboard";
import { unstable_cache } from "next/cache";


function HeroSkeleton() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center overflow-hidden animate-pulse">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-20 py-8 sm:py-0">
        <div className="flex-1 max-w-2xl space-y-6 text-center lg:text-left">
          <div className="space-y-3">
            <div className="h-12 sm:h-16 lg:h-20 bg-secondary/60 rounded-2xl w-3/4 mx-auto lg:mx-0" />
            <div className="h-10 sm:h-14 lg:h-16 bg-primary/20 rounded-2xl w-1/2 mx-auto lg:mx-0" />
          </div>
          <div className="h-5 bg-secondary/40 rounded-lg w-2/3 mx-auto lg:mx-0" />
          <div className="flex justify-center lg:justify-start gap-4">
            <div className="h-14 w-40 bg-primary/20 rounded-xl" />
            <div className="h-14 w-36 bg-secondary/50 rounded-xl" />
          </div>
        </div>
        <div className="hidden lg:flex relative w-80 h-[440px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-2xl bg-secondary/50"
              style={{
                width: "240px",
                height: "360px",
                top: `${i * 20}px`,
                left: `${i * 30}px`,
                zIndex: 3 - i,
                transform: `rotate(${(i - 1) * 4}deg)`,
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendingSkeleton() {
  return (
    <section className="py-16 lg:py-24 animate-pulse">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-10">
          <div className="h-9 bg-secondary/60 rounded-xl w-64" />
          <div className="h-5 bg-secondary/40 rounded-lg w-80 mt-3" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="rounded-xl bg-secondary/50 aspect-[2/3]" />
              <div className="space-y-1.5">
                <div className="h-4 bg-secondary/60 rounded w-3/4" />
                <div className="h-3 bg-secondary/40 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col pb-24 lg:pb-8 pt-16 animate-pulse">
      {/* Welcome Header */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20" />
          <div className="space-y-1.5">
            <div className="h-3 bg-secondary/40 rounded w-20" />
            <div className="h-5 bg-secondary/60 rounded w-32" />
          </div>
        </div>
      </section>

      {/* CTA skeleton */}
      <section className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="h-20 rounded-2xl bg-primary/10 border border-primary/20" />
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl bg-card border border-border">
                <div className="w-5 h-5 bg-secondary/40 rounded" />
                <div className="h-7 w-10 bg-secondary/60 rounded" />
                <div className="h-3 w-14 bg-secondary/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended skeleton */}
      <section className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-4">
            <div className="h-6 bg-secondary/60 rounded w-48" />
          </div>
          <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[140px] sm:w-[160px] space-y-2">
                <div className="rounded-xl bg-secondary/50 aspect-[2/3]" />
                <div className="h-4 bg-secondary/60 rounded w-3/4" />
                <div className="h-3 bg-secondary/40 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending skeleton */}
      <section className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="h-6 bg-secondary/60 rounded w-52 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border">
              <div className="w-6 h-6 bg-secondary/40 rounded" />
              <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg bg-secondary/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary/60 rounded w-1/2" />
                <div className="h-3 bg-secondary/40 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


const getCachedTrendingMovies = unstable_cache(
  async () => {
    const supabase = createStaticClient();

    const { data: popularMovieIds, error: idsError } = await supabase
      .from("most_popular_movies_of_week")
      .select("movie_id");

    if (idsError || !popularMovieIds) {
      console.error("Error fetching popular movie ids: ", idsError);
      return null;
    }

    const movieIds = popularMovieIds.map((item) => item.movie_id);
    if (movieIds.length === 0) return null;

    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select(
        "id, title, slug, release_date, poster_url, rating: media_stats(global_rating, global_search_count), genres: movie_genres(genres(name))"
      )
      .not("poster_url", "is", null)
      .in("id", movieIds);

    if (moviesError || !movies) {
      console.error("Error fetching movies: ", moviesError);
      return null;
    }

    const moviesWithFullUrls = await Promise.all(
      movies.map(async (movie) => {
        const fullUrl = await getPrivateImageUrl(movie.poster_url);
        const ratingFromDb =
          Array.isArray(movie.rating) && movie.rating.length > 0
            ? movie.rating[0]
            : null;
        const ratingObject = {
          global_rating: ratingFromDb?.global_rating || 0,
          global_search_count: ratingFromDb?.global_search_count || null,
        };
        const genresArray = Array.isArray(movie.genres)
          ? movie.genres.map((g: any) => g.genres?.name).filter(Boolean)
          : [];
        return {
          ...movie,
          poster_url: fullUrl,
          rating: ratingObject,
          genres: genresArray,
          isInWatchlist: false,
        };
      })
    );

    return moviesWithFullUrls;
  },
  ["home-trending-movies"],
  { revalidate: 300 }
);

const getCachedUserMovies = unstable_cache(
  async (userId: string) => {
    const supabase = createStaticClient();

    const [trendingResponse, recommendedResponse] = await Promise.all([
      supabase.from("most_popular_movies_of_week").select("movie_id").limit(6),
      supabase.rpc("recommended_movies_for_user", {
        p_user_id: userId,
        p_limit: 6,
      }),
    ]);

    const trendingIds =
      trendingResponse.data?.map((item) => item.movie_id) ?? [];
    const recommendedIds =
      recommendedResponse.data?.map(
        (item: { movie_id: number }) => item.movie_id
      ) ?? [];

    const allMovieIds = [...new Set([...trendingIds, ...recommendedIds])];
    if (allMovieIds.length === 0) return null;

    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select(
        "id, title, slug, release_date, poster_url, rating: media_stats(global_rating, global_search_count), genres: movie_genres(genres(name))"
      )
      .not("poster_url", "is", null)
      .in("id", allMovieIds);

    if (moviesError || !movies) {
      console.error("Error fetching movies: ", moviesError);
      return null;
    }

    const moviesWithFullUrls = await Promise.all(
      movies.map(async (movie) => {
        const fullUrl = await getPrivateImageUrl(movie.poster_url);
        const ratingFromDb =
          Array.isArray(movie.rating) && movie.rating.length > 0
            ? movie.rating[0]
            : null;
        const ratingObject = {
          global_rating: ratingFromDb?.global_rating || 0,
          global_search_count: ratingFromDb?.global_search_count || null,
        };
        const genresArray = Array.isArray(movie.genres)
          ? movie.genres.map((g: any) => g.genres?.name).filter(Boolean)
          : [];
        return {
          ...movie,
          poster_url: fullUrl,
          rating: ratingObject,
          genres: genresArray,
        };
      })
    );

    return { moviesWithFullUrls, trendingIds, recommendedIds };
  },
  ["home-user-movies"],
  { revalidate: 300 }
);

const getCachedUserData = unstable_cache(
  async (userId: string) => {
    const supabase = createStaticClient();

    const [
      watchlistResponse,
      profileResponse,
      watchlistCountResponse,
      watchedCountResponse,
      ratingsResponse,
    ] = await Promise.all([
      supabase.from("watchlist").select("movie_id").eq("user_id", userId),
      supabase
        .from("users")
        .select("full_name, username, avatar_url")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("watchlist")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("watched")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("movie_reviews")
        .select("rating")
        .eq("user_id", userId),
    ]);

    const watchlistIds =
      watchlistResponse.data?.map((w) => w.movie_id) ?? [];
    const profile = profileResponse.data;
    const watchlistCount = watchlistCountResponse.count ?? 0;
    const watchedCount = watchedCountResponse.count ?? 0;
    const ratings = ratingsResponse.data ?? [];
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) /
        ratings.length
        : 0;

    let avatarUrl: string | null = null;
    if (profile?.avatar_url) {
      avatarUrl = await getAvatarUrl(profile.avatar_url);
    }

    return {
      watchlistIds,
      profile,
      stats: { watchedCount, avgRating, watchlistCount },
      avatarUrl,
    };
  },
  ["home-user-data"],
  { revalidate: 60 }
);


async function LoggedOutHero() {
  const movies = await getCachedTrendingMovies();
  if (!movies) return null;
  return <HeroSection movies={movies} />;
}

async function LoggedOutTrending() {
  const movies = await getCachedTrendingMovies();
  if (!movies) return null;
  return <TrendingSection movies={movies} />;
}

async function LoggedInDashboard({ userId, email }: { userId: string; email: string }) {
  const [movieData, userData] = await Promise.all([
    getCachedUserMovies(userId),
    getCachedUserData(userId),
  ]);

  if (!movieData) {
    return <div>No data</div>;
  }

  const { moviesWithFullUrls, trendingIds, recommendedIds } = movieData;
  const { watchlistIds, profile, stats, avatarUrl } = userData;

  const enrichedMovies = moviesWithFullUrls.map((movie) => ({
    ...movie,
    isInWatchlist: watchlistIds.includes(movie.id),
  }));

  const trendingMovies = enrichedMovies.filter((movie) =>
    trendingIds.includes(movie.id)
  );
  const recommendedMovies = enrichedMovies.filter((movie) =>
    recommendedIds.includes(movie.id)
  );

  return (
    <HomeDashboard
      user={{ email }}
      profile={profile}
      stats={stats}
      trendingMovies={trendingMovies}
      recommendedMovies={recommendedMovies}
      avatarUrl={avatarUrl}
    />
  );
}


export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className="pt-16">
        <Suspense fallback={<DashboardSkeleton />}>
          <LoggedInDashboard userId={user.id} email={user.email || ""} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-4">
      <main className="flex-1 pt-16">
        <Suspense fallback={<HeroSkeleton />}>
          <LoggedOutHero />
        </Suspense>
        <Suspense fallback={<TrendingSkeleton />}>
          <LoggedOutTrending />
        </Suspense>
        <GenresSection />
        <DiscoverCTA />
      </main>
    </div>
  );
}
