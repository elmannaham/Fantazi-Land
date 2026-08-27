import { NextRequest, NextResponse } from "next/server";
import { profilesService } from "@/lib/services/profiles.service";
import { profileCreationService } from "@/lib/services/profile-creation.service";
import { profileQuerySchema, createProfileSchema } from "@/lib/schemas";
import { errorHandler } from "@/lib/errors";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = profileQuerySchema.parse(searchParams);
    const includeMediaAssets = request.nextUrl.searchParams.get("include") === "media_assets";

    let { profiles, total } = await profilesService.getProfiles({
      category: query.category,
      search: query.search,
      sortBy: query.sortBy,
      limit: query.limit,
      offset: query.offset,
    });

    // Charger les media_assets si demandé
    if (includeMediaAssets) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const profileIds = profiles.map((p) => p.id);

        if (profileIds.length > 0) {
          const mediaAssets = await prisma.mediaAsset.findMany({
            where: { profile_id: { in: profileIds } },
          });

          // Grouper par profile_id
          const assetsByProfile = mediaAssets.reduce(
            (acc, asset) => {
              if (!acc[asset.profile_id]) acc[asset.profile_id] = [];
              acc[asset.profile_id].push({
                id: asset.id,
                profile_id: asset.profile_id,
                file_url: asset.file_url,
                file_type: (asset.file_type as any) || "image",
                file_size_bytes: asset.file_size_bytes,
                uploaded_by: asset.uploaded_by,
                created_at: asset.created_at.toISOString(),
              });
              return acc;
            },
            {} as Record<string, any[]>
          );

          // Ajouter les media_assets aux profiles
          profiles = profiles.map((profile) => ({
            ...profile,
            media_assets: assetsByProfile[profile.id] || [],
          }));
        }
      } catch (dbError) {
        // Si la BD n'est pas accessible, continuer sans media_assets
        console.error("Erreur chargement media_assets:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      data: profiles,
      profiles: profiles,
      total,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const validated = createProfileSchema.parse(body);

    let user = null;
    try {
      user = await authenticateRequest(request);
    } catch {
      // Utilisateur non connecté / requête publique
      user = null;
    }

    if (user && user.email) {
      // Create profile + Base44 User atomically
      const result = await profileCreationService.createProfile(
        validated,
        user.id,
        user.email
      );

      return NextResponse.json(
        {
          success: true,
          profile: result.profile,
          base44_user_id: result.base44UserId,
          sync_log_id: result.syncLogId,
        },
        { status: 201 }
      );
    }

    // Public / direct creation
    const profile = await profilesService.createProfile(validated);

    // Mettre à jour le catalogue local
    try {
      const fs = require("fs");
      const path = require("path");
      const catalogPath = path.join(process.cwd(), "data/creators-catalog.json");
      let current = [];
      if (fs.existsSync(catalogPath)) {
        current = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
      }
      current.push({
        id: profile.id,
        name: profile.name,
        email: `${profile.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@fantazi-land.com`,
        category: profile.category,
        bio: profile.bio || "",
        baseRate: `${profile.base_rate || 500} ${profile.currency || "CAD"}`,
        avatar: profile.avatar_url || null,
        galleryCount: 0,
        gallery: profile.avatar_url ? [profile.avatar_url] : [],
      });
      fs.writeFileSync(catalogPath, JSON.stringify(current, null, 2), "utf-8");
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        success: true,
        profile,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
