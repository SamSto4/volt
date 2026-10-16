import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// next/font downloads the fonts at build time and serves them from our own
// domain. Each one exposes a CSS variable that globals.css maps to
// font-sans / font-display / font-mono.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

/** @type {import("next").Metadata} */
export const metadata = {
  title: "Volt",
  description:
    "Drop real components into real pages, then learn exactly how to put them in your project.",
};

/** @param {{ children: import("react").ReactNode }} props */
export default function RootLayout({ children }) {
  return (
    // next-themes sets the `dark` class on <html> before React hydrates, so
    // the server HTML and the browser HTML differ on purpose. This flag tells
    // React to expect that one attribute difference.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
