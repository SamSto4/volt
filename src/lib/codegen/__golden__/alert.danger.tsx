import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Example() {
  return (
    <Alert tone="danger">
      <AlertTitle>{"Couldn't save"}</AlertTitle>
      <AlertDescription>Your changes are still here. Try again.</AlertDescription>
    </Alert>
  );
}
