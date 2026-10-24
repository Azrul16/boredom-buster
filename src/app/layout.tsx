import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/Shell";
import { siteOrigin } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  alternates: { canonical: "/" },
  title: {
    default: "Boredom Buster — 10 Free Mini Games to Play Online",
    template: "%s — Boredom Buster",
  },
  description:
    "Play quick free browser games including Pen Fight, Tic Tac Toe, Snake, 2048, reaction games and more. No downloads or signup required.",
  openGraph: {
    title: "Boredom Buster — 10 Games. Zero Boredom.",
    description: "Bored? Pick a game and start playing.",
    type: "website",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "Boredom Buster — free browser games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Boredom Buster",
    description: "10 free browser games. Pick a game and play.",
    images: ["/social-card.png"],
  },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d12",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
