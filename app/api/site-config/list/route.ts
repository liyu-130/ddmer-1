import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await getCurrentUser(request);
    const configs = await prisma.siteConfig.findMany({
      select: {
        id: true,
        key: true,
        value: true,
        description: true,
        updated_at: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(configs);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ code: 1, message }, { status: 401 });
  }
}
