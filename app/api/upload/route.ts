import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { mediaRepository } from "@/lib/repositories/media.repository";
import { errorHandler, forbiddenError, validationError } from "@/lib/errors";
import { authenticateRequest, requireProfileAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// Type MIME autorisé -> extension de fichier (l'extension ne vient jamais du nom fourni par le client)
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
};
const PUBLIC_BUCKET = "profiles";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const profileId = formData.get("profileId") as string | null;
    const bucket = (formData.get("bucket") as string) || PUBLIC_BUCKET;

    // Seuls les admins choisissent un autre bucket ou envoient hors d'un profil
    if (user.role !== "admin" && (bucket !== PUBLIC_BUCKET || !profileId)) {
      throw forbiddenError("Upload autorisé uniquement vers votre propre profil");
    }
    if (profileId) {
      await requireProfileAccess(request, profileId);
    }

    if (!file) {
      throw validationError("Aucun fichier fourni");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw validationError("Le fichier dépasse la taille maximale autorisée (10 Mo)");
    }

    const fileExt = ALLOWED_TYPES[file.type];
    if (!fileExt) {
      throw validationError(`Type de fichier non supporté: ${file.type}`);
    }

    const adminClient = createServiceClient();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = profileId ? `${profileId}/${fileName}` : `uploads/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Échec upload Supabase Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = adminClient.storage.from(bucket).getPublicUrl(filePath);
    const fileUrl = publicUrlData.publicUrl;

    let mediaRecord = null;
    if (profileId) {
      const fileType = file.type.startsWith("video/") ? "video" : "image";
      mediaRecord = await mediaRepository.create({
        profile_id: profileId,
        file_url: fileUrl,
        file_type: fileType,
        file_size_bytes: file.size,
      });
    }

    return NextResponse.json(
      {
        success: true,
        file: {
          id: mediaRecord?.id || null,
          url: fileUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
