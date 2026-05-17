import { useState, useEffect } from "react";

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  keywords: string;
  ogImage: string;
  twitterHandle: string;
  language: string;
  robots: string;
  themeColor: string;
}

const KEY = "blog_site_settings";

const DEFAULTS: SiteSettings = {
  siteName: "Медиум",
  tagline: "Минимализм. Текст. Тишина.",
  description: "Авторский блог о дизайне, технологиях, культуре и науке. Длинные тексты, серьёзная типографика, ничего лишнего.",
  keywords: "блог, дизайн, технологии, культура, наука, минимализм, длинные тексты",
  ogImage: "",
  twitterHandle: "",
  language: "ru",
  robots: "index, follow",
  themeColor: "#FAFAF8",
};

function load(): SiteSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SiteSettings>) };
  } catch (e) {
    console.warn(e);
  }
  return DEFAULTS;
}

function save(settings: SiteSettings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("site-settings-updated"));
}

let _settings: SiteSettings = load();

export function getSiteSettings(): SiteSettings {
  return _settings;
}

export function updateSiteSettings(patch: Partial<SiteSettings>) {
  _settings = { ..._settings, ...patch };
  save(_settings);
}

export function resetSiteSettings() {
  _settings = { ...DEFAULTS };
  save(_settings);
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(_settings);
  useEffect(() => {
    const handler = () => setSettings(getSiteSettings());
    window.addEventListener("site-settings-updated", handler);
    return () => window.removeEventListener("site-settings-updated", handler);
  }, []);
  return settings;
}

export const DEFAULT_SETTINGS = DEFAULTS;
