import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"

export const metadata: Metadata = {
  title: "GalliAssist AI",
  description: "AI business assistant",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}