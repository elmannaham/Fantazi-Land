import catalogData from "@/data/creators-catalog.json";

export interface BucketMediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  title?: string;
  profileKey?: string;
}

export const BUCKET_BASE_URL = "https://uytihmscyjpwpdhqvnbw.supabase.co/storage/v1/object/public/HOTESS";

/**
 * Construit la liste dynamique des images du bucket à partir du catalogue synchronisé
 */
function buildBucketImages(): BucketMediaItem[] {
  const items: BucketMediaItem[] = [];

  (catalogData || []).forEach((profile: any) => {
    const key = (profile.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    // Ajouter l'avatar si disponible
    if (profile.avatar) {
      items.push({
        id: `${key}-avatar`,
        url: profile.avatar,
        type: "image",
        title: `Portrait ${profile.name}`,
        profileKey: key,
      });
    }

    // Ajouter chaque photo de la galerie
    (profile.gallery || []).forEach((imgUrl: string, idx: number) => {
      // Éviter de dupliquer si l'avatar est identique à la première photo
      if (imgUrl !== profile.avatar) {
        items.push({
          id: `${key}-photo-${idx + 1}`,
          url: imgUrl,
          type: "image",
          title: `Shooting ${profile.name} #${idx + 1}`,
          profileKey: key,
        });
      }
    });
  });

  return items;
}

export const BUCKET_IMAGES: BucketMediaItem[] = buildBucketImages();

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
