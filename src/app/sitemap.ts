import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/what-we-do",
    "/who-we-serve",
    "/about",
    "/business-diagnostic",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({ url: `${site.url}${path}/` }));
}
