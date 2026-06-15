"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const FloatingPlayer = dynamic(() => import("@/components/music/FloatingPlayer"), { ssr: false });
const Live2D = dynamic(() => import("@/components/widgets/Live2D"), { ssr: false });
// 已移除 Toolbox 和 GamesPanel 引用，避免资源占用
// const Toolbox = dynamic(() => import("@/components/widgets/Toolbox"), { ssr: false });
// const GamesPanel = dynamic(() => import("@/components/widgets/GamesPanel"), { ssr: false });

export default function ClientWidgets() {
  const pathname = usePathname();
  if (pathname.startsWith("/garden")) return null;

  return (
    <>
      <FloatingPlayer />
      <Live2D />
      {/* 工具箱与游戏面板已关闭，避免占用过多资源 */}
      {/* <Toolbox /> */}
      {/* <GamesPanel /> */}
    </>
  );
}
