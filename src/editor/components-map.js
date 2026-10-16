import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Links each manifest name to the React component that renders it.
 *
 * Manifests stay free of React (ADR 0002) so codegen, server code and build
 * scripts can import them. Only code that actually renders components (the
 * editor and the preview) imports this map. A test checks that this map and
 * the manifest list name the same components.
 *
 * @type {Record<string, import("react").ComponentType<any>>}
 */
export const componentsByName = {
  button: Button,
  badge: Badge,
  card: Card,
};
