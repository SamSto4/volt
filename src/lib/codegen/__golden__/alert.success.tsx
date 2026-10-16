import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Example() {
  return (
    <Alert tone="success">
      <AlertTitle>Page published</AlertTitle>
      <AlertDescription>Anyone with the link can now see it.</AlertDescription>
    </Alert>
  );
}
