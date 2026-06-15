import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub Client ID 未配置" },
      { status: 500 }
    );
  }
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user`;
  return NextResponse.redirect(url);
}
