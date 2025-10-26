import "./globals.css";
import { Roboto } from "next/font/google";
import type { Metadata } from "next";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto"
});

export const metadata: Metadata = {
  title: "ShortFuse | AI Shorts Generator",
  description:
    "Transform YouTube videos into scroll-stopping short-form clips with AI-powered highlight detection and instant sharing."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>{children}</body>
    </html>
  );
}
