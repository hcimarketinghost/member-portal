import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HCI Member Portal",
  description: "Hill Country Indoor Sports & Fitness — member class booking and account",
};

// viewport-fit=cover lets full-bleed content (the home hero) extend up behind
// the status bar; safe-area-inset-* padding keeps text clear of it.
export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="hp">
        {children}
      </body>
    </html>
  );
}
