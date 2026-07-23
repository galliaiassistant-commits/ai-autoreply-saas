import type {
  MetadataRoute,
} from "next"

export default function sitemap():
  MetadataRoute.Sitemap {
  const baseUrl =
    "https://jhyroai.com"

  return [
    {
      url: baseUrl,
      lastModified:
        new Date(),
      changeFrequency:
        "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/sign-up`,
      lastModified:
        new Date(),
      changeFrequency:
        "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/sign-in`,
      lastModified:
        new Date(),
      changeFrequency:
        "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified:
        new Date(),
      changeFrequency:
        "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified:
        new Date(),
      changeFrequency:
        "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/data-deletion`,
      lastModified:
        new Date(),
      changeFrequency:
        "yearly",
      priority: 0.4,
    },
  ]
}