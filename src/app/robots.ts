import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://pawstay.com";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/book", "/confirmation"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
