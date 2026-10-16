import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";

export default function Page() {
  return (
    <main>
      <article className="mx-auto flex w-full max-w-prose flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-4">
          <h1 className="type-heading-1">How we cut our page load time in half</h1>
          <p className="text-muted-foreground">{"Three small changes, measured before and after, and what we'd do differently next time."}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Avatar name="Priya Shah" size="sm" />
            <Badge>Performance</Badge>
          </div>
        </header>
        <p>We started by measuring. Before changing anything, we recorded how long the page took to show its main content on a mid-range phone.</p>
        <p>{"The biggest win was the smallest change: serving images at the size they're shown, instead of the size they were uploaded."}</p>
      </article>
      <section className="mx-auto flex w-full max-w-prose flex-col gap-4 px-4 py-6">
        <h2 className="type-heading-2">Key takeaway</h2>
        <div className="flex flex-col gap-4">
          <Alert tone="success">
            <AlertTitle>Measure first</AlertTitle>
            <AlertDescription>Every change was checked against the same before-and-after numbers.</AlertDescription>
          </Alert>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
        <h2 className="type-heading-1">Get the newsletter</h2>
        <p className="text-muted-foreground">One email a month. Unsubscribe any time.</p>
        <div className="flex flex-col gap-4">
          <InputField label="Email" placeholder="you@example.com" />
        </div>
        <div className="flex flex-wrap gap-4">
          <Button>Subscribe</Button>
        </div>
      </section>
    </main>
  );
}
