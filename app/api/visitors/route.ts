import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const size = Number(searchParams.get("size") || "20");
  const skip = (page - 1) * size;

  const visitors = await prisma.visitor.findMany({
    orderBy: { created_at: "desc" },
    skip,
    take: size,
  });
  return NextResponse.json(visitors);
}

export async function DELETE() {
  await prisma.visitor.deleteMany();
  return NextResponse.json({ code: 0, message: "success" });
}
