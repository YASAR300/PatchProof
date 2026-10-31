export default function sitemap() {
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://patchproof.dev";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
