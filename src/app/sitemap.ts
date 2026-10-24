import type { MetadataRoute } from "next";
import { games } from "@/data/games";
import { siteOrigin } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin;
  return [
    "",
    "/games",
    "/about",
    "/privacy",
    "/progress",
    ...games.map((g) => `/games/${g.slug}`),
  ].map((path) => ({
    url: `${base}${path}/`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
