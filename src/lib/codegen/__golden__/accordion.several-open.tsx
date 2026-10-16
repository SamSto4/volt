import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Example() {
  return (
    <Accordion allowMultiple>
      <AccordionItem value="What's included">
        <AccordionTrigger>{"What's included"}</AccordionTrigger>
        <AccordionContent>Unlimited projects and email support.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="What's not included">
        <AccordionTrigger>{"What's not included"}</AccordionTrigger>
        <AccordionContent>Phone support and custom contracts.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
