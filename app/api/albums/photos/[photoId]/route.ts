import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    await getCurrentUser(request);
    const { photoId } = await params;
    const id = Number(photoId);
    await prisma.$transaction(async (tx) => {
      const photo = await tx.photo.findUnique({ where: { id } });
      if (!photo) throw new Error("照片不存在");
      await tx.photo.delete({ where: { id } });
      const count = await tx.photo.count({
        where: { album_id: photo.album_id },
      });
      await tx.album.update({
        where: { id: photo.album_id },
        data: { photo_count: count },
      });
    });
    return NextResponse.json({ code: 0, message: "success" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ code: 1, message }, { status: 401 });
  }
}
