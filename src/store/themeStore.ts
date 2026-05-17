import { useState, useEffect } from "react";

export type ThemeMode = "light" | "dark";

export interface FontOption {
  id: string;
  name: string;
  display: string; // for headings
  body: string;    // for body
  googleQuery: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "cormorant-golos",
    name: "Cormorant + Golos",
    display: "Cormorant",
    body: "Golos Text",
    googleQuery: "Cormorant:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Golos+Text:wght@400;500;600",
  },
  {
    id: "playfair-inter",
    name: "Playfair + Inter",
    display: "Playfair Display",
    body: "Inter",
    googleQuery: "Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600",
  },
  {
    id: "merriweather-rubik",
    name: "Merriweather + Rubik",
    display: "Merriweather",
    body: "Rubik",
    googleQuery: "Merriweather:ital,wght@0,400;0,700;1,400&family=Rubik:wght@400;500;600",
  },
  {
    id: "montserrat-opensans",
    name: "Montserrat + Open Sans",
    display: "Montserrat",
    body: "Open Sans",
    googleQuery: "Montserrat:wght@500;600;700&family=Open+Sans:wght@400;500;600",
  },
  {
    id: "oswald-roboto",
    name: "Oswald + Roboto",
    display: "Oswald",
    body: "Roboto",
    googleQuery: "Oswald:wght@400;500;600&family=Roboto:wght@400;500;700",
  },
  {
    id: "pacifico-rubik",
    name: "Pacifico + Rubik",
    display: "Pacifico",
    body: "Rubik",
    googleQuery: "Pacifico&family=Rubik:wght@400;500;600",
  },
];

export interface ThemeSettings {
  mode: ThemeMode;
  // Light palette
  lightBg: string;
  lightSurface: string;
  lightText: string;
  lightMuted: string;
  lightBorder: string;
  // Dark palette
  darkBg: string;
  darkSurface: string;
  darkText: string;
  darkMuted: string;
  darkBorder: string;
  // Common
  accent: string;
  fontId: string;
  radius: number; // px
}

export const DEFAULT_THEME: ThemeSettings = {
  mode: "light",
  lightBg: "#FAFAF8",
  lightSurface: "#FFFFFF",
  lightText: "#1A1A1A",
  lightMuted: "#9A9690",
  lightBorder: "#E8E4DC",
  darkBg: "#0F0F0E",
  darkSurface: "#1A1A18",
  darkText: "#F2F0EC",
  darkMuted: "#8A8680",
  darkBorder: "#2A2826",
  accent: "#1A1A1A",
  fontId: "cormorant-golos",
  radius: 16,
};

const KEY = "blog_theme";

function load(): ThemeSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_THEME, ...(JSON.parse(raw) as Partial<ThemeSettings>) };
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_THEME;
}

function persist(t: ThemeSettings) {
  localStorage.setItem(KEY, JSON.stringify(t));
  window.dispatchEvent(new Event("theme-updated"));
}

let _theme: ThemeSettings = load();

export function getTheme(): ThemeSettings {
  return _theme;
}

export function updateTheme(patch: Partial<ThemeSettings>) {
  _theme = { ..._theme, ...patch };
  persist(_theme);
  applyTheme(_theme);
}

export function resetTheme() {
  _theme = { ...DEFAULT_THEME };
  persist(_theme);
  applyTheme(_theme);
}

function loadFont(font: FontOption) {
  const linkId = "app-google-font";
  let link = document.getElementById(linkId) as HTMLLinkElement | null;
  const href = `https://fonts.googleapis.com/css2?family=${font.googleQuery}&display=swap`;
  if (!link) {
    link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

export function applyTheme(t: ThemeSettings) {
  const root = document.documentElement;
  const isDark = t.mode === "dark";

  const bg = isDark ? t.darkBg : t.lightBg;
  const surface = isDark ? t.darkSurface : t.lightSurface;
  const text = isDark ? t.darkText : t.lightText;
  const muted = isDark ? t.darkMuted : t.lightMuted;
  const border = isDark ? t.darkBorder : t.lightBorder;

  root.style.setProperty("--app-bg", bg);
  root.style.setProperty("--app-surface", surface);
  root.style.setProperty("--app-text", text);
  root.style.setProperty("--app-muted", muted);
  root.style.setProperty("--app-border", border);
  root.style.setProperty("--app-accent", t.accent);
  root.style.setProperty("--app-radius", `${t.radius}px`);

  const font = FONT_OPTIONS.find((f) => f.id === t.fontId) || FONT_OPTIONS[0];
  root.style.setProperty("--font-display", `'${font.display}', serif`);
  root.style.setProperty("--font-body", `'${font.body}', sans-serif`);
  loadFont(font);

  if (isDark) root.classList.add("dark-theme");
  else root.classList.remove("dark-theme");

  // also update theme-color meta
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = bg;
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeSettings>(_theme);
  useEffect(() => {
    const handler = () => setTheme(getTheme());
    window.addEventListener("theme-updated", handler);
    return () => window.removeEventListener("theme-updated", handler);
  }, []);
  return theme;
}

// Apply immediately on module load
applyTheme(_theme);
