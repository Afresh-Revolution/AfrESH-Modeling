export type RosterModel = {
  id?: string;
  name: string;
  category: string;
  image_url: string;
  image_urls?: string[];
  sort_order?: number;
  /** Optional profile link (Instagram, etc.) shown on the public roster card. */
  social_url?: string | null;
};

export type HireModel = {
  id?: string;
  name: string;
  image_url?: string | null;
  image_urls?: string[];
  video_url?: string | null;
  accomplishments: string;
  sort_order?: number;
};

export type EditorialItem = {
  id?: string;
  title: string;
  /** Poster / gallery image; optional when row is video-only. */
  image_url: string;
  /** Optional campaign video (e.g. Cloudinary `.../video/upload/...` URL). */
  video_url?: string | null;
  sort_order?: number;
};

export type ApplicationInsert = {
  full_name: string;
  email: string;
  phone?: string | null;
  date_of_birth: string;
  height?: string | null;
  city?: string | null;
  experience_level?: string | null;
  portfolio_url?: string | null;
  message?: string | null;
  photo_urls?: string[];
};
