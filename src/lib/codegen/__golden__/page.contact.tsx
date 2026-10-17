import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { TextareaField } from "@/components/ui/textarea";

export default function Page() {
  return (
    <main>
      <section className="flex flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge>Support</Badge>
        </div>
        <h1 className="max-w-3xl type-display">Get in touch</h1>
        <p className="max-w-prose text-muted-foreground">Questions about an order, or just want to say hello? We reply within one working day.</p>
      </section>
      <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
        <h2 className="type-heading-1">Send us a message</h2>
        <p className="text-muted-foreground">Every message is read by a person on our team.</p>
        <div className="flex flex-col gap-4">
          <InputField label="Email" placeholder="you@example.com" required />
          <SelectField label="Topic">
            <option value="An order">An order</option>
            <option value="Returns">Returns</option>
            <option value="Something else">Something else</option>
          </SelectField>
          <TextareaField label="Message" required />
        </div>
        <div className="flex flex-wrap gap-4">
          <Button>Send message</Button>
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
    </main>
  );
}
