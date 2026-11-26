import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors";
import { deleteProject, getProject, updateProject } from "@/lib/studio/service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const project = await updateProject(id, body);
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deleteProject(id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return errorHandler(error);
  }
}
