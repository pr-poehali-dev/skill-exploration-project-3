import { useEffect } from "react";
import { getSiteSettings } from "@/store/siteSettingsStore";

export interface SEOInput {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  canonical?: string;
  author?: string;
  publishedAt?: string;
  section?: string;
}

function setMeta(name: string, value: string | undefined, attr: "name" | "property" = "name") {
  if (!value) {
    document.head.querySelectorAll(`meta[${attr}="${name}"]`).forEach((el) => el.remove());
    return;
  }
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string | undefined) {
  if (!href) {
    document.head.querySelectorAll(`link[rel="${rel}"]`).forEach((el) => el.remove());
    return;
  }
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSEO(input: SEOInput) {
  useEffect(() => {
    const site = getSiteSettings();
    const fullTitle = input.title
      ? `${input.title} — ${site.siteName}`
      : `${site.siteName} · ${site.tagline}`;
    const description = input.description || site.description;
    const keywords = input.keywords || site.keywords;
    const image = input.image || site.ogImage;
    const url = input.canonical || window.location.href;

    document.title = fullTitle;
    document.documentElement.lang = site.language || "ru";

    setMeta("description", description);
    setMeta("keywords", keywords);
    setMeta("robots", input.noindex ? "noindex, nofollow" : site.robots);
    setMeta("theme-color", site.themeColor);
    if (input.author) setMeta("author", input.author);

    // Open Graph
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", input.type || "website", "property");
    setMeta("og:site_name", site.siteName, "property");
    setMeta("og:url", url, "property");
    if (image) setMeta("og:image", image, "property");
    if (input.publishedAt) setMeta("article:published_time", input.publishedAt, "property");
    if (input.section) setMeta("article:section", input.section, "property");
    if (input.author) setMeta("article:author", input.author, "property");

    // Twitter
    setMeta("twitter:card", image ? "summary_large_image" : "summary");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    if (image) setMeta("twitter:image", image);
    if (site.twitterHandle) setMeta("twitter:site", site.twitterHandle);

    setLink("canonical", url);
  }, [
    input.title,
    input.description,
    input.keywords,
    input.image,
    input.type,
    input.noindex,
    input.canonical,
    input.author,
    input.publishedAt,
    input.section,
  ]);
}
