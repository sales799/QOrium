import type { MetadataRoute } from "next";
import { allMarketingPaths, baseUrl } from "../marketing/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return allMarketingPaths().map((path) => ({
    url: `${baseUrl}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/library/") ? 0.55 : 0.8
  }));
}
