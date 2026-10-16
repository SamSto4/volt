import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Example() {
  return (
    <Tabs defaultValue="Next.js">
      <TabsList aria-label="Framework">
        <TabsTrigger value="Next.js">Next.js</TabsTrigger>
        <TabsTrigger value="Vite">Vite</TabsTrigger>
        <TabsTrigger value="HTML">HTML</TabsTrigger>
      </TabsList>
      <TabsContent value="Next.js">Add the component to app/ and import it into your page.</TabsContent>
      <TabsContent value="Vite">Add the component to src/components and import it into App.jsx.</TabsContent>
      <TabsContent value="HTML">Copy the generated markup and the CSS variables into your page.</TabsContent>
    </Tabs>
  );
}
