import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Example() {
  return (
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
  );
}
