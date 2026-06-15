import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  const albums = await prisma.album.findMany({
    orderBy: { sort: "asc" },
  });
  return NextResponse.json(albums);
}

export async function POST(request: NextRequest) {
  try {
    await getCurrentUser(request);
    const body = await request.json();
    const album = await prisma.album.create({
      data: {
        title: body.title,
        description: body.description || "",
        cover: body.cover || "",
        sort: body.sort || 0,
      },
    });
    return NextResponse.json({ code: 0, message: "success", data: album });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ code: 1, message }, { status: 401 });
  }
}
