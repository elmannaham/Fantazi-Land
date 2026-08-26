import { NextRequest, NextResponse } from "next/server";
import { profilesService } from "@/lib/services/profiles.service";
import { errorHandler, validationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw validationError("Veuillez fournir un fichier CSV via le champ 'file'");
    }

    const csvContent = await file.text();
    const result = await profilesService.importCsv(csvContent);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
