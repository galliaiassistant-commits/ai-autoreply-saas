import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata:
  Metadata = {
  metadataBase:
    new URL(
      "https://jhyroai.com"
    ),

  title: {
    default:
      "Jhyro AI | AI Business Assistant",
    template:
      "%s | Jhyro AI",
  },

  description:
    "Jhyro AI automates customer conversations, WhatsApp replies, appointments, business knowledge, and follow-ups.",

  applicationName:
    "Jhyro AI",

  keywords: [
    "Jhyro AI",
    "AI business assistant",
    "WhatsApp automation",
    "AI receptionist",
    "appointment booking",
    "customer messaging",
    "business automation",
  ],

  authors: [
    {
      name: "Jhyro AI",
      url: "https://jhyroai.com",
    },
  ],

  creator: "Jhyro AI",
  publisher: "Jhyro AI",

  category:
    "Business Software",

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Jhyro AI",
    title:
      "Jhyro AI | Smarter Conversations. Better Business.",
    description:
      "Turn customer messages into helpful answers, qualified leads, and confirmed bookings.",
    images: [
      {
        url:
          "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt:
          "Jhyro AI — Smarter Conversations. Better Business.",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",
    title:
      "Jhyro AI | AI Business Assistant",
    description:
      "Automate customer conversations, bookings, and business assistance with Jhyro AI.",
    images: [
      "/opengraph-image.png",
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview":
        "large",
      "max-snippet": -1,
      "max-video-preview":
        -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}