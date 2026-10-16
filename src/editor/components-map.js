import { AccordionBlock } from "@/components/ui/accordion";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TabsBlock } from "@/components/ui/tabs";
import { TextareaField } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";

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
  // The manifest maps to the labeled field, so generated code is accessible by default.
  input: InputField,
  alert: Alert,
  avatar: Avatar,
  tabs: TabsBlock,
  accordion: AccordionBlock,
  tooltip: Tooltip,
  textarea: TextareaField,
  select: SelectField,
  checkbox: Checkbox,
  switch: Switch,
};
