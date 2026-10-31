export default function robots() {
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://patchproof.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dev/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
