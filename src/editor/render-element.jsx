import { createElement } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, InputField } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isRenderable } from "@/lib/codegen/jsx.js";

// Renders the same element tree that codegen prints (ADR 0003) as real React.
// Because the preview and the code come from one tree, what you see is
// exactly what the Code tab says, and the two can't drift apart.

/**
 * Every component name a manifest's render() may use, mapped to the real
 * component. A test checks that this covers every type used by every preset.
 *
 * @type {Record<string, import("react").ElementType>}
 */
export const scope = {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  InputField,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
};

/**
 * @param {import("@/lib/codegen/jsx.js").Child} node
 * @returns {import("react").ReactNode}
 */
export function renderElement(node) {
  if (!isRenderable(node)) return null;
  if (typeof node === "string") return node;

  // Capitalized names are components and must be in scope; lowercase ones
  // are HTML tags, which React renders by name.
  const isComponent = /^[A-Z]/.test(node.type);
  const type = isComponent ? scope[node.type] : node.type;
  if (!type) throw new Error(`No component named "${node.type}" in the preview scope`);

  // Children are passed as separate arguments, the way compiled JSX does it,
  // so React doesn't ask for `key`s on them.
  return createElement(type, node.props, ...node.children.map(renderElement));
}
