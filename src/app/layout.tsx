import type { Metadata } from "next";
import { Geist_Mono, Manrope, Rubik_Mono_One } from "next/font/google";
import { CustomCursor } from "@/components/custom-cursor";
import { IntroPreloader } from "@/components/intro-preloader";
import { SiteDock } from "@/components/site-dock";
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
        <IntroPreloader />
        {children}
        <footer className="px-5 pt-10 pb-32 font-mono text-[11px] tracking-wider text-fg/40 uppercase sm:px-8">
          © 2026 Peter Racz · interactions inspired by Skiper UI &amp; Aceternity UI
        </footer>
        <SiteDock />
        <CustomCursor />
      </body>
    </html>
  );
}
