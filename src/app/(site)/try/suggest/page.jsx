import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FindComponents } from "./_components/find-components";

/** @type {import("next").Metadata} */
export const metadata = {
  title: "Find your components · Volt",
  description: "Answer four short questions and get a page outline, the components to use, and design tips.",
};

/**
 * Four questions in, a starting point out: which template to begin with,
 * the page top to bottom, the components with the reason for each, and
 * tips. The advice comes from plain rules in src/lib/suggest, not from AI,
 * so the same answers always give the same page.
 */
export default function SuggestPage() {
  return (
    <main className="page-container flex flex-col gap-10 py-10">
      <div className="flex flex-col items-start gap-4">
        <Link href="/try" className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-4" })}>
          <ArrowLeft aria-hidden="true" strokeWidth={1.5} />
          Back to the gallery
        </Link>
        <p className="type-label text-muted-foreground">Component guide</p>
        <h1 className="max-w-3xl type-heading-1">Find the right components for your page</h1>
        <p className="max-w-[60ch] text-muted-foreground">
          Tell us what you&apos;re making in four short questions. You&apos;ll get a page outline, the components to start
          with and why, and design tips. Nothing you answer leaves this page.
        </p>
      </div>
      <FindComponents />
    </main>
  );
}
