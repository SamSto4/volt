import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/input";

export default function Page() {
  return (
    <main>
      <section className="flex flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="highlight">New</Badge>
        </div>
        <h1 className="max-w-3xl type-display">Launch pages people actually finish reading</h1>
        <p className="max-w-prose text-muted-foreground">A short sentence that says who this is for and what they get.</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button>Get started</Button>
          <Button variant="secondary">See how it works</Button>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
        <h2 className="type-heading-1">Why people choose it</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Fast to set up</CardTitle>
              <CardDescription>Go from an empty page to a published one in an afternoon.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Works on any screen</CardTitle>
              <CardDescription>Every layout adapts from phones to wide monitors.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Keyboard first</CardTitle>
              <CardDescription>Every action works without a mouse.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
        <h2 className="type-heading-1">Questions</h2>
        <div className="flex flex-col gap-6">
          <Accordion>
            <AccordionItem value="How long does delivery take?">
              <AccordionTrigger>How long does delivery take?</AccordionTrigger>
              <AccordionContent>Most orders arrive in three to five working days.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="Can I return an item?">
              <AccordionTrigger>Can I return an item?</AccordionTrigger>
              <AccordionContent>Yes. Send it back unused within 30 days for a full refund.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="Do you ship abroad?">
              <AccordionTrigger>Do you ship abroad?</AccordionTrigger>
              <AccordionContent>We ship to most countries. Costs are shown at checkout.</AccordionContent>
            </AccordionItem>
          </Accordion>
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
