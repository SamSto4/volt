/** The bottom of every page: secondary links. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border py-6">
      <nav aria-label="Footer" className="page-container flex flex-wrap items-center gap-x-6 gap-y-2 type-small">
        <span className="font-display font-bold">Volt</span>
        <a
          href="https://github.com/SamSto4/volt"
          className="rounded-sm text-muted-foreground hover:text-foreground"
        >
          Source on GitHub
        </a>
      </nav>
    </footer>
  );
}
