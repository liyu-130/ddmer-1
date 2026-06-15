import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;
  const id = Number(albumId);
  const album = await prisma.album.findUnique({
    where: { id },
    include: { photos: { orderBy: { sort: "asc" } } },
  });
  if (!album) {
    return NextResponse.json({ code: 1, message: "相册不存在" }, { status: 404 });
  }
  return NextResponse.json(album);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    await getCurrentUser(request);
    const { albumId } = await params;
    const id = Number(albumId);
    const body = await request.json();
    const album = await prisma.album.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        cover: body.cover,
        sort: body.sort,
      },
    });
    return NextResponse.json({ code: 0, message: "success", data: album });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ code: 1, message }, { status: 401 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    await getCurrentUser(request);
    const { albumId } = await params;
    const id = Number(albumId);
    await prisma.album.delete({ where: { id } });
    return NextResponse.json({ code: 0, message: "success" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ code: 1, message }, { status: 401 });
  }
}
