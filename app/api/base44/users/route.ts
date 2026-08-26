import { NextRequest, NextResponse } from "next/server";
import { base44UserService } from "@/lib/services/base44-user.service";
import { errorHandler } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const skip = searchParams.get("skip") ? Number(searchParams.get("skip")) : undefined;
    const sort_by = searchParams.get("sort_by") || undefined;
    const qParam = searchParams.get("q");

    let q: Record<string, any> | undefined = undefined;
    if (qParam) {
      try {
        q = JSON.parse(qParam);
      } catch {
        q = { search: qParam };
      }
    }

    const users = await base44UserService.listUsers({
      limit,
      skip,
      sort_by,
      q,
    });

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newUser = await base44UserService.createUser(body);

    return NextResponse.json(
      {
        success: true,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
