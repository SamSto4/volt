import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Example() {
  return (
    <Tabs defaultValue="Monthly">
      <TabsList aria-label="Billing period">
        <TabsTrigger value="Monthly">Monthly</TabsTrigger>
        <TabsTrigger value="Yearly">Yearly</TabsTrigger>
      </TabsList>
      <TabsContent value="Monthly">Pay each month. Cancel any time.</TabsContent>
      <TabsContent value="Yearly">Pay once a year and get two months free.</TabsContent>
    </Tabs>
  );
}
