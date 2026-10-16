import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// The site's pages (home, catalog) share a header and footer. The editor
// lives outside this route group, as a full-screen app with its own top bar
// (DESIGN.md §11). The parentheses keep "(site)" out of the URL.

/** @param {{ children: import("react").ReactNode }} props */
export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
