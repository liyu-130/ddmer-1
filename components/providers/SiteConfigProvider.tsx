"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type SiteConfigContextType = {
  config: Record<string, string>;
  loading: boolean;
};

const SiteConfigContext = createContext<SiteConfigContextType>({
  config: {},
  loading: true,
});

export function SiteConfigProvider({
  children,
  initialConfig = {},
}: {
  children: React.ReactNode;
  initialConfig?: Record<string, string>;
}) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 始终从 API 拉取最新配置，initialConfig 仅作初始显示
    fetch("/api/site-config")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "object" && data !== null) {
          setConfig(data);
        }
      })
      .catch(() => {
        // 如果 API 拉取失败，保留 initialConfig 作为兜底
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loading }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

export function useConfigValue(key: string, defaultValue = ""): string {
  const { config } = useContext(SiteConfigContext);
  return config[key] ?? defaultValue;
}

/** 从站点配置读取 JSON 数组（如 bgImages、themeColors），解析失败返回 fallback */
export function useConfigJson<T>(key: string, fallback: T): T {
  const raw = useConfigValue(key, "");
  return useMemo(() => {
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as T;
    } catch {
      // ignore
    }
    return fallback;
  }, [raw, fallback]);
}
