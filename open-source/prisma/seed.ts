import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedPresets() {
  if ((await prisma.exportPreset.count()) > 0) return;

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

  console.log("✅ Seeded 3 export presets");
}

async function seedDemoProject() {
  // Idempotent: only bootstrap the demo project when the workspace is still empty.
  if ((await prisma.project.count()) > 0) return;

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
            consistency_notes:
              "Palette magenta / cyan, produit noir mat, décor studio sombre.",
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
            consistency_notes:
              "Étalonnage à raccorder avec la palette magenta.",
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

  console.log("✅ Seeded demo project");
}

async function main() {
  console.log("🌱 Seeding VideoFlow Studio...");
  await seedPresets();
  await seedDemoProject();
  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
