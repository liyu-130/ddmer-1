import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 创建 admin 用户（部署后请立即修改默认密码）
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { nickname: "Admin" },
    create: {
      username: "admin",
      hashed_password: adminPassword,
      nickname: "Admin",
      is_admin: true,
    },
  });

  // 创建默认站点配置（中性占位符，部署后请在后台修改为自己的信息）
  const siteConfigs = [
    { key: "title", value: "My Blog", description: "网站标题" },
    { key: "url", value: "https://example.com/", description: "网站地址" },
    { key: "authorName", value: "Admin", description: "作者名" },
    { key: "bio", value: "欢迎来到我的博客", description: "个人简介" },
    { key: "avatarUrl", value: "", description: "头像图片地址（空则使用默认）" },
    { key: "useGradient", value: "false", description: "是否使用渐变背景" },
    { key: "themeColors", value: JSON.stringify(["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"]), description: "主题颜色数组" },
    { key: "bgImages", value: "[]", description: "背景图片地址数组（JSON）" },
    { key: "defaultPostCover", value: "", description: "文章默认封面图（空则使用默认）" },
    { key: "photoWallImage", value: "", description: "照片墙预览图（空则使用默认）" },
    { key: "cloudMusicPlaylistId", value: "", description: "网易云音乐歌单ID" },
    { key: "cloudMusicIds", value: "[]", description: "网易云音乐歌曲ID数组（JSON）" },
    { key: "apiBaseUrl", value: "", description: "后端API地址（空则使用当前域名）" },
    { key: "social_github", value: "", description: "GitHub链接" },
    { key: "social_bilibili", value: "", description: "Bilibili链接" },
    { key: "social_email", value: "", description: "邮箱地址" },
    { key: "social_x", value: "", description: "X(Twitter)链接" },
    { key: "social_youtube", value: "", description: "YouTube链接" },
    { key: "icp_name", value: "", description: "ICP备案号" },
    { key: "icp_link", value: "", description: "ICP备案链接" },
    { key: "moeIcp_name", value: "", description: "萌ICP备案号" },
    { key: "moeIcp_link", value: "", description: "萌ICP备案链接" },
    { key: "chatterTitle", value: "留言", description: "说说/留言页面标题" },
    { key: "chatterDescription", value: "记录生活、技术与随想", description: "说说/留言页面描述" },
  ];

  for (const cfg of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: cfg.key },
      update: {},
      create: cfg,
    });
  }

  console.log("Seed completed: admin user and default site configs created.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
