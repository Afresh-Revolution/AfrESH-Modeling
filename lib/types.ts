export type RosterModel = {
  id?: string;
  name: string;
  category: string;
  image_url: string;
  sort_order?: number;
};

export type EditorialItem = {
  id?: string;
  title: string;
  image_url: string;
  /** Optional campaign video (e.g. Cloudinary URL). */
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
