import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Example() {
  return (
    <Alert>
      <AlertTitle>Scheduled maintenance</AlertTitle>
      <AlertDescription>The site may be slow on Sunday between 2 and 3 a.m.</AlertDescription>
    </Alert>
  );
}
