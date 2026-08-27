/**
 * Centralized registry of all verified images & videos from Supabase Storage Bucket 'HOTESS'
 */

export interface BucketMediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  title?: string;
  profileKey?: string;
}

export const BUCKET_BASE_URL = "https://uytihmscyjpwpdhqvnbw.supabase.co/storage/v1/object/public/HOTESS";

export const BUCKET_IMAGES = [
  // Alisha
  { id: "alisha-av", url: `${BUCKET_BASE_URL}/Alisha/Avatar.JPG`, type: "image" as const, profileKey: "alisha", title: "Portrait Alisha" },
  { id: "alisha-1", url: `${BUCKET_BASE_URL}/Alisha/images/Screenshot_20260715_031757_Instagram.jpg`, type: "image" as const, profileKey: "alisha", title: "Shooting Alisha I" },
  { id: "alisha-2", url: `${BUCKET_BASE_URL}/Alisha/images/Screenshot_20260715_031804_Instagram.jpg`, type: "image" as const, profileKey: "alisha", title: "Shooting Alisha II" },
  { id: "alisha-3", url: `${BUCKET_BASE_URL}/Alisha/images/Screenshot_20260715_031811_Instagram.jpg`, type: "image" as const, profileKey: "alisha", title: "Shooting Alisha III" },

  // SHANEL
  { id: "shanel-av", url: `${BUCKET_BASE_URL}/SHANEL/Avatar.jpg`, type: "image" as const, profileKey: "shanel", title: "Portrait SHANEL" },
  { id: "shanel-1", url: `${BUCKET_BASE_URL}/shanel/images/-4963280571542997999_121.jpg`, type: "image" as const, profileKey: "shanel", title: "Book SHANEL I" },
  { id: "shanel-2", url: `${BUCKET_BASE_URL}/shanel/images/-4963280571542998000_121.jpg`, type: "image" as const, profileKey: "shanel", title: "Book SHANEL II" },
  { id: "shanel-3", url: `${BUCKET_BASE_URL}/shanel/images/-4963280571542998001_121.jpg`, type: "image" as const, profileKey: "shanel", title: "Book SHANEL III" },
  { id: "shanel-4", url: `${BUCKET_BASE_URL}/shanel/images/-4963280571542998002_121.jpg`, type: "image" as const, profileKey: "shanel", title: "Book SHANEL IV" },
  { id: "shanel-5", url: `${BUCKET_BASE_URL}/shanel/images/-4963280571542998003_121.jpg`, type: "image" as const, profileKey: "shanel", title: "Book SHANEL V" },

  // SUNDAY
  { id: "sunday-av", url: `${BUCKET_BASE_URL}/SUNDAY/Avatar.jpg`, type: "image" as const, profileKey: "sunday", title: "Portrait Sunday" },
  { id: "sunday-1", url: `${BUCKET_BASE_URL}/sunday/images/-5967632276843597039_121.jpg`, type: "image" as const, profileKey: "sunday", title: "Événement Sunday I" },
  { id: "sunday-2", url: `${BUCKET_BASE_URL}/sunday/images/-5967632276843597040_121.jpg`, type: "image" as const, profileKey: "sunday", title: "Événement Sunday II" },
  { id: "sunday-3", url: `${BUCKET_BASE_URL}/sunday/images/-5967632276843597041_121.jpg`, type: "image" as const, profileKey: "sunday", title: "Événement Sunday III" },

  // SUSHI
  { id: "sushi-av", url: `${BUCKET_BASE_URL}/SUSHI/Avatar.jpg`, type: "image" as const, profileKey: "sushi", title: "Portrait Sushi" },
  { id: "sushi-1", url: `${BUCKET_BASE_URL}/sushi/images/-5807877699798765022_121.jpg`, type: "image" as const, profileKey: "sushi", title: "Prestation Sushi I" },
  { id: "sushi-2", url: `${BUCKET_BASE_URL}/sushi/images/-5807877699798765023_121.jpg`, type: "image" as const, profileKey: "sushi", title: "Prestation Sushi II" },
  { id: "sushi-3", url: `${BUCKET_BASE_URL}/sushi/images/-5807877699798765024_121.jpg`, type: "image" as const, profileKey: "sushi", title: "Prestation Sushi III" },
];

export const BUCKET_VIDEOS: BucketMediaItem[] = [
  {
    id: "video-showreel-1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    type: "video",
    title: "Showreel Défilé & Mode",
    profileKey: "shanel",
  },
  {
    id: "video-showreel-2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    type: "video",
    title: "Aftermovie Soirée Prestige",
    profileKey: "alisha",
  },
  {
    id: "video-showreel-3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    type: "video",
    title: "Teaser Shooting Éditorial",
    profileKey: "sunday",
  },
];

export const ALL_BUCKET_MEDIA: BucketMediaItem[] = [
  ...BUCKET_IMAGES,
  ...BUCKET_VIDEOS,
];

/**
 * Mélange aléatoire (Fisher-Yates shuffle)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Récupère un ensemble aléatoire de médias (images et/ou vidéos) depuis le bucket
 */
export function getRandomBucketMedia(count = 6, filterType?: "image" | "video"): BucketMediaItem[] {
  let pool = ALL_BUCKET_MEDIA;
  if (filterType) {
    pool = pool.filter((item) => item.type === filterType);
  }
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, count);
}

/**
 * Récupère les URLs d'images aléatoires du bucket pour un carrousel 3D ou portfolio
 */
export function getRandomBucketImageUrls(count = 6): string[] {
  const media = getRandomBucketMedia(count, "image");
  return media.map((m) => m.url);
}

/**
 * Récupère les médias d'une hôtesse donnée avec complément aléatoire issu du bucket
 */
export function getProfileMediaWithRandomFill(profileName: string, targetCount = 6): BucketMediaItem[] {
  const cleanKey = profileName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const ownMedia = ALL_BUCKET_MEDIA.filter((m) => m.profileKey && cleanKey.includes(m.profileKey));
  
  if (ownMedia.length >= targetCount) {
    return ownMedia.slice(0, targetCount);
  }

  // Compléter avec d'autres médias aléatoires du bucket
  const otherMedia = shuffleArray(ALL_BUCKET_MEDIA.filter((m) => !ownMedia.some((om) => om.id === m.id)));
  return [...ownMedia, ...otherMedia].slice(0, targetCount);
}
