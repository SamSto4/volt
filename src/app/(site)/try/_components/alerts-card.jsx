import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShowcaseCard } from "./showcase";

/**
 * Inline messages that stay on the page. Each says what happened and what to do.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function AlertsCard({ className } = {}) {
  return (
    <ShowcaseCard className={className} id="alerts" title="Inline alerts" context="Forms · Publishing" note="The icon's shape and a hidden “Success:” or “Error:” carry the tone, not the color.">
      <Alert tone="success">
        <AlertTitle>Page published</AlertTitle>
        <AlertDescription>Anyone with the link can now see it.</AlertDescription>
      </Alert>
      <Alert tone="danger">
        <AlertTitle>Couldn&apos;t publish</AlertTitle>
        <AlertDescription>The hero image is missing alt text. Add it, then publish again.</AlertDescription>
      </Alert>
    </ShowcaseCard>
  );
}
