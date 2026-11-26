import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors";
import { createProject, listProjects } from "@/lib/studio/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await createProject(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
