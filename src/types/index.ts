
export type MovieReview = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    user_id: string;
    username: string;
    avatar_url: string | null;
  };
}

export type Movie = {
  id: number;
  title: string;
  slug: string;
  poster_url: string;
  description: string;
  actors: Actor[];
  genres: string[];
  directors: Director[];
  duration: number;
  rating: Rating;
  reviewsCount?: number;
  reviews?: MovieReview[];
  isInWatchlist: boolean,
  userRating?: number;
  release_date: number;
  whereToWatch: WhereToWatch[];
}

export type Actor = {
  id: number;
  name: string;
  role: string;
  photo_url: string;
}

export type Director = {
  id: number;
  name: string;
  photo_url: string;
}

export type Rating = {
  global_rating: number;
  global_search_count: string | null;
}

export type WhereToWatch = {
  name: string;
  logo_path: string;
  provider_id: number;
}

export type RatingDialogProps = {
  movieTitle: string;
  movieId: number;
}

export type SearchUser = {
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}