import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/Shell";
import { OfflineSupport } from "@/components/OfflineSupport";
import { PersonalizationProvider } from "@/components/Personalization";
import { siteOrigin } from "@/lib/site";
import "./globals.css";
import "./polish.css";
import "./records.css";
import "./minimal.css";
import "./footer.css";
import "./personalization.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  alternates: { canonical: "/" },
  title: {
    default: "Boredom Buster — 20 Free Mini Games to Play Online",
    template: "%s — Boredom Buster",
  },
  description:
    "Play quick free browser games including Pen Fight, Tic Tac Toe, Snake, 2048, reaction games and more. No downloads or signup required.",
  openGraph: {
    title: "Boredom Buster — 20 Games. Zero Boredom.",
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
    description: "20 free browser games. Pick a game and play.",
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
        <PersonalizationProvider>
          <OfflineSupport>
            <Shell>{children}</Shell>
          </OfflineSupport>
        </PersonalizationProvider>
      </body>
    </html>
  );
}
