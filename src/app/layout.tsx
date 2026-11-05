import type { Metadata } from "next";
import { Geist_Mono, Manrope, Rubik_Mono_One } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubikMono = Rubik_Mono_One({
  variable: "--font-rubik-mono",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: { default: "Peter Racz", template: "%s · Peter Racz" },
  description: "Apps I build and notes on building them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} ${rubikMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas font-sans text-fg">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
