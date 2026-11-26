import { PrismaClient, ProfileCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data first
  await prisma.profile.deleteMany({});

  // Create test profiles
  const profiles = await Promise.all([
    prisma.profile.create({
      data: {
        name: "Marie Dupont",
        category: ProfileCategory.Photographie,
        bio: "Photographe professionnelle spécialisée dans la photographie de produits et portrait. 8 ans d'expérience, passionnée par la lumière naturelle.",
        avatar_url: "https://i.pravatar.cc/150?img=1",
        base_rate: 150,
        currency: "EUR",
        instagram_url: "@mariedupont",
        tiktok_url: "@mariedupont",
        website_url: "https://mariedupont.com",
        is_public: true,
        is_available: true,
        performance_stats: {
          create: {
            total_projects: 45,
            total_reviews: 38,
            avg_rating: 4.8,
            response_time_hours: 2,
            completion_rate: 100,
            repeat_client_rate: 65,
          },
        },
      },
    }),
    prisma.profile.create({
      data: {
        name: "Luc Fontaine",
        category: ProfileCategory.Videographie,
        bio: "Vidéographe créatif spécialisé dans les vidéos de contenu et productions commerciales. Équipement 4K dernière génération.",
        avatar_url: "https://i.pravatar.cc/150?img=2",
        base_rate: 200,
        currency: "EUR",
        instagram_url: "@lucfontaine",
        tiktok_url: "@lucfontaine",
        website_url: "https://lucfontaine.tv",
        is_public: true,
        is_available: true,
        performance_stats: {
          create: {
            total_projects: 28,
            total_reviews: 22,
            avg_rating: 4.9,
            response_time_hours: 3,
            completion_rate: 98,
            repeat_client_rate: 70,
          },
        },
      },
    }),
    prisma.profile.create({
      data: {
        name: "Sophie Laurent",
        category: ProfileCategory.Contenu_Mode,
        bio: "Content creator mode & lifestyle. 250k followers. Spécialisée en lookbooks, haul videos, et reviews mode.",
        avatar_url: "https://i.pravatar.cc/150?img=3",
        base_rate: 100,
        currency: "EUR",
        instagram_url: "@sophielaurent",
        tiktok_url: "@sophielaurent_mode",
        website_url: "https://sophielaurent.fr",
        is_public: true,
        is_available: true,
        performance_stats: {
          create: {
            total_projects: 62,
            total_reviews: 55,
            avg_rating: 4.7,
            response_time_hours: 1,
            completion_rate: 100,
            repeat_client_rate: 80,
          },
        },
      },
    }),
    prisma.profile.create({
      data: {
        name: "Thomas Noir",
        category: ProfileCategory.Gaming,
        bio: "Gaming streamer et content creator. Spécialiste en jeux compétitifs, montages vidéo, et coaching gaming.",
        avatar_url: "https://i.pravatar.cc/150?img=4",
        base_rate: 75,
        currency: "EUR",
        instagram_url: "@thomasnoir",
        tiktok_url: "@thomasnoir_gaming",
        website_url: "https://thomasnoir.gg",
        is_public: true,
        is_available: true,
        performance_stats: {
          create: {
            total_projects: 35,
            total_reviews: 30,
            avg_rating: 4.6,
            response_time_hours: 1,
            completion_rate: 97,
            repeat_client_rate: 60,
          },
        },
      },
    }),
    prisma.profile.create({
      data: {
        name: "Emma Beaumont",
        category: ProfileCategory.Beaute,
        bio: "Makeup artist et beauty influencer. Spécialisée en makeup artistry, tutoriels beauté, et collaborations marques.",
        avatar_url: "https://i.pravatar.cc/150?img=5",
        base_rate: 120,
        currency: "EUR",
        instagram_url: "@emmabeaumont",
        tiktok_url: "@emmabeaumont_makeup",
        website_url: "https://emmabeaumont.beauty",
        is_public: true,
        is_available: true,
        performance_stats: {
          create: {
            total_projects: 52,
            total_reviews: 48,
            avg_rating: 4.9,
            response_time_hours: 2,
            completion_rate: 100,
            repeat_client_rate: 75,
          },
        },
      },
    }),
    prisma.profile.create({
      data: {
        name: "Lucas Moreau",
        category: ProfileCategory.Lifestyle,
        bio: "Lifestyle creator spécialisé en travel content, lifestyle vlogs et conseils mode de vie.",
        avatar_url: "https://i.pravatar.cc/150?img=6",
        base_rate: 110,
        currency: "EUR",
        instagram_url: "@lucasmoreau",
        tiktok_url: "@lucasmoreau_life",
        website_url: "https://lucasmoreau.life",
        is_public: true,
        is_available: false,
        performance_stats: {
          create: {
            total_projects: 40,
            total_reviews: 35,
            avg_rating: 4.5,
            response_time_hours: 6,
            completion_rate: 95,
            repeat_client_rate: 50,
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${profiles.length} profiles`);

  // Add reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        profile_id: profiles[0].id,
        client_name: "Jean Martin",
        rating: 5,
        comment: "Excellente photographe, très professionnelle et à l'écoute. Résultats impeccables!",
        is_verified: true,
      },
    }),
    prisma.review.create({
      data: {
        profile_id: profiles[0].id,
        client_name: "Claire Rousseau",
        rating: 5,
        comment: "Recommandé sans hésiter. Travail de haute qualité.",
        is_verified: true,
      },
    }),
    prisma.review.create({
      data: {
        profile_id: profiles[1].id,
        client_name: "Antoine Leclerc",
        rating: 5,
        comment: "Vidéos magnifiques, Luc maîtrise son art à la perfection.",
        is_verified: true,
      },
    }),
    prisma.review.create({
      data: {
        profile_id: profiles[2].id,
        client_name: "Marque XYZ",
        rating: 4,
        comment: "Bonne collaboration, résultats conformes aux attentes.",
        is_verified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // Add bookings
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        profile_id: profiles[0].id,
        client_name: "Studio Mode Paris",
        project_title: "Séance photo produits mode",
        project_description: "Photographie produits pour catalogue collection printemps",
        status: "confirmed",
        start_date: new Date("2026-09-15"),
        end_date: new Date("2026-09-15"),
        budget: 500,
        notes: "3 heures de shooting, 50-60 photos à traiter",
      },
    }),
    prisma.booking.create({
      data: {
        profile_id: profiles[0].id,
        client_name: "Influenceur Emma",
        project_title: "Shooting portrait",
        project_description: "Photos de profil et contenus personnels",
        status: "pending",
        start_date: new Date("2026-09-20"),
        end_date: new Date("2026-09-20"),
        budget: 300,
        notes: "Lieu: Parc de la Tête d'Or, Lyon",
      },
    }),
    prisma.booking.create({
      data: {
        profile_id: profiles[1].id,
        client_name: "Marque Tech Startup",
        project_title: "Production vidéo commerciale",
        project_description: "Vidéo marketing produit 60 secondes",
        status: "completed",
        start_date: new Date("2026-08-10"),
        end_date: new Date("2026-08-20"),
        budget: 1500,
        completed_at: new Date("2026-08-22"),
      },
    }),
    prisma.booking.create({
      data: {
        profile_id: profiles[2].id,
        client_name: "Agence Publicité",
        project_title: "Collaboration content mode",
        project_description: "5 posts Instagram + 10 Reels TikTok",
        status: "confirmed",
        start_date: new Date("2026-09-01"),
        end_date: new Date("2026-09-30"),
        budget: 800,
        notes: "Livrables: photos RAW + vidéos éditées",
      },
    }),
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);

  // Add media assets
  const mediaAssets = await Promise.all([
    prisma.mediaAsset.create({
      data: {
        profile_id: profiles[0].id,
        file_url: "https://example.com/portfolio/photo1.jpg",
        file_type: "image",
        file_size_bytes: 2500000,
      },
    }),
    prisma.mediaAsset.create({
      data: {
        profile_id: profiles[0].id,
        file_url: "https://example.com/portfolio/photo2.jpg",
        file_type: "image",
        file_size_bytes: 3100000,
      },
    }),
    prisma.mediaAsset.create({
      data: {
        profile_id: profiles[1].id,
        file_url: "https://example.com/portfolio/video1.mp4",
        file_type: "video",
        file_size_bytes: 150000000,
      },
    }),
  ]);

  console.log(`✅ Created ${mediaAssets.length} media assets`);

  await seedVideoFlowStudio();

  console.log("✨ Seeding complete!");
}

async function seedVideoFlowStudio() {
  // Idempotent: only bootstrap the studio workspace when it is still empty.
  if ((await prisma.project.count()) > 0) return;

  if ((await prisma.exportPreset.count()) === 0) {
    await prisma.exportPreset.createMany({
      data: [
        {
          name: "Reels & Shorts",
          platform: "Instagram / TikTok",
          format: "VERTICAL_9_16",
          resolution: "1080x1920",
          fps: 30,
          container: "mp4",
          video_bitrate_mbps: 12,
          audio_bitrate_kbps: 192,
          burned_subtitles: true,
          is_default: true,
        },
        {
          name: "YouTube HD",
          platform: "YouTube",
          format: "HORIZONTAL_16_9",
          resolution: "1920x1080",
          fps: 30,
          container: "mp4",
          video_bitrate_mbps: 16,
          audio_bitrate_kbps: 320,
          burned_subtitles: false,
          is_default: false,
        },
        {
          name: "Master vertical 4K",
          platform: "Archive / étalonnage",
          format: "VERTICAL_9_16",
          resolution: "2160x3840",
          fps: 30,
          container: "mov",
          video_bitrate_mbps: 60,
          audio_bitrate_kbps: 320,
          burned_subtitles: false,
          is_default: false,
        },
      ],
    });
  }

  const preset = await prisma.exportPreset.findFirst({
    where: { is_default: true },
    orderBy: { created_at: "asc" },
  });

  await prisma.project.create({
    data: {
      title: "Lancement produit — Neon Drive",
      brief:
        "Teaser vertical de 18 s pour le lancement du flacon Neon Drive : accroche macro, créatrice face caméra, rush atelier et carton final.",
      format: "VERTICAL_9_16",
      fps: 30,
      status: "IN_PRODUCTION",
      export_preset_id: preset?.id ?? null,
      shots: {
        create: [
          {
            position: 1,
            title: "Accroche — détail produit",
            shot_type: "GENERATION",
            duration_seconds: 4,
            hook: "Trois secondes pour changer ta routine.",
            voiceover: "Et si trois secondes suffisaient ?",
            action: "Gros plan sur la main qui saisit le flacon.",
            visual_prompt:
              "Gros plan macro sur un flacon noir mat, main gantée de cuir, lumière néon magenta latérale, reflets liquides, travelling avant lent, rendu cinématographique 35 mm.",
            consistency_notes: "Palette magenta / cyan, produit noir mat, décor studio sombre.",
            transition_in: "Cut sec",
            transition_out: "Whip pan",
            pacing: "Dynamique",
            subtitle_text: "3 secondes pour tout changer",
            audio_track: "Beat « Neon Drive » — intro",
            render_status: "RENDERED",
          },
          {
            position: 2,
            title: "Swap visage créatrice",
            shot_type: "SWAP",
            duration_seconds: 5,
            voiceover: "Le geste qui change tout.",
            action: "La créatrice applique le produit face caméra.",
            visual_prompt:
              "Plan poitrine de la créatrice face caméra, fond studio sombre, lumière magenta douce, léger mouvement de caméra à l'épaule.",
            consistency_notes: "Même tenue et même lumière que le plan 01.",
            swap_type: "FACE",
            swap_source_ref: "s3://videoflow/refs/visage-creatrice.mp4",
            swap_target_ref: "Sujet principal — plan 02",
            swap_preserve_zones: "Mains, produit, arrière-plan",
            swap_consent_confirmed: true,
            transition_in: "Fondu enchaîné",
            transition_out: "Cut sec",
            pacing: "Mesuré",
            subtitle_text: "Le geste qui change tout",
            audio_track: "Voix off + beat",
            render_status: "QUEUED",
          },
          {
            position: 3,
            title: "Rush atelier",
            shot_type: "EXISTING_CLIP",
            duration_seconds: 6,
            action: "Rush tourné en atelier : fabrication à la main.",
            consistency_notes: "Étalonnage à raccorder avec la palette magenta.",
            transition_in: "Fondu enchaîné",
            transition_out: "Cut sec",
            pacing: "Lent",
            subtitle_text: "Fabriqué à la main",
            audio_track: "Ambiance atelier + nappe",
            render_status: "DRAFT",
          },
          {
            position: 4,
            title: "Carton final + CTA",
            shot_type: "EDIT",
            duration_seconds: 3,
            action: "Carton typographique et appel à l'action.",
            transition_in: "Zoom punch",
            transition_out: "Fondu au noir",
            pacing: "Cut rapide",
            subtitle_text: "Disponible maintenant — lien en bio",
            audio_track: "Drop du beat + whoosh",
            render_status: "DRAFT",
          },
        ],
      },
    },
  });

  console.log("✅ Seeded VideoFlow Studio demo project");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
