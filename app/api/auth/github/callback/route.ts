import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.SECRET_KEY || "default-secret-key-change-me"
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.json(
        { error: "缺少 code 参数" },
        { status: 400 }
      );
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "GitHub OAuth 未配置" },
        { status: 500 }
      );
    }

    // 1) 获取 access_token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: "获取 GitHub access_token 失败" },
        { status: 400 }
      );
    }

    // 2) 获取用户信息
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Kirameku-App",
      },
    });
    const userData = await userRes.json();
    if (!userData.id) {
      return NextResponse.json(
        { error: "获取 GitHub 用户信息失败" },
        { status: 400 }
      );
    }

    // 3) 查找或创建 GitHubUser
    let githubUser = await prisma.gitHubUser.findUnique({
      where: { github_id: userData.id },
    });

    if (!githubUser) {
      githubUser = await prisma.gitHubUser.create({
        data: {
          github_id: userData.id,
          login: userData.login,
          avatar: userData.avatar_url || "",
          bio: userData.bio || "",
        },
      });
    } else {
      githubUser = await prisma.gitHubUser.update({
        where: { id: githubUser.id },
        data: {
          login: userData.login,
          avatar: userData.avatar_url || "",
          bio: userData.bio || "",
        },
      });
    }

    // 4) 生成 token
    const token = await new SignJWT({
      sub: String(githubUser.id),
      login: githubUser.login,
      type: "github",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("72h")
      .sign(SECRET_KEY);

    // 5) 重定向
    const frontendOrigin =
      process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    return NextResponse.redirect(
      `${frontendOrigin}/auth/callback?token=${token}`
    );
  } catch {
    return NextResponse.json(
      { error: "GitHub 登录失败" },
      { status: 500 }
    );
  }
}
