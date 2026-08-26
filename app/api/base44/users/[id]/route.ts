import { NextRequest, NextResponse } from "next/server";
import { base44UserService } from "@/lib/services/base44-user.service";
import { errorHandler } from "@/lib/errors";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await base44UserService.getUser(params.id);
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const updated = await base44UserService.updateUser(params.id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const result = await base44UserService.deleteUser(params.id);
    return NextResponse.json({
      message: "Utilisateur Base44 supprimé avec succès",
      ...result,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
