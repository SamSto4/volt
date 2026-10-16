import Link from "next/link";
import { AccordionBlock } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/input";
import { TabsBlock } from "@/components/ui/tabs";
import accordionManifest, { accordionProps } from "@/registry/accordion";
import alertManifest, { alertProps } from "@/registry/alert";
import avatarManifest, { avatarProps } from "@/registry/avatar";
import badgeManifest, { badgeProps } from "@/registry/badge";
import buttonManifest, { buttonProps } from "@/registry/button";
import cardManifest, { cardProps } from "@/registry/card";
import inputManifest, { inputProps } from "@/registry/input";
import tabsManifest, { tabsProps } from "@/registry/tabs";

// A reference page for the Volt design tokens and component presets, so both
// themes can be checked by eye.
//
// Class names are written out in full ("bg-primary", not `bg-${name}`)
// because Tailwind finds the classes to generate by scanning source text.

const colors = [
  { volt: "surface", className: "bg-background", token: "background", use: "Page background" },
  { volt: "surface-raised", className: "bg-card", token: "card", use: "Cards, panels, inputs, menus" },
  { volt: "line", className: "bg-border", token: "border", use: "Decorative hairlines and dividers" },
  { volt: "line-strong", className: "bg-input", token: "input", use: "Borders of inputs and other controls" },
  { volt: "ink", className: "bg-foreground", token: "foreground", use: "Primary text and icons" },
  { volt: "ink-muted", className: "bg-muted-foreground", token: "muted-foreground", use: "Secondary text and captions" },
  { volt: "primary", className: "bg-primary", token: "primary", use: "Main action, links, focus, selection" },
  { volt: "primary-tint", className: "bg-primary-tint", token: "primary-tint", use: "Drop targets, highlighted code lines" },
  { volt: "accent", className: "bg-highlight", token: "highlight", use: "Badges and “new” markers. Fill only" },
  { volt: "success", className: "bg-success", token: "success", use: "Confirmations and positive status" },
  { volt: "danger", className: "bg-destructive", token: "destructive", use: "Errors and destructive actions" },
  { volt: "hover surface", className: "bg-accent", token: "accent", use: "Hover rows and menu items" },
];

const typeStyles = [
  { name: "display", className: "type-display", spec: "Space Grotesk 700 · 56/60 (40/44 on mobile)" },
  { name: "heading-1", className: "type-heading-1", spec: "Space Grotesk 600 · 36/42 (28/34 on mobile)" },
  { name: "heading-2", className: "type-heading-2", spec: "Space Grotesk 600 · 24/30" },
  { name: "body", className: "type-body", spec: "Inter 400 · 16/24" },
  { name: "small", className: "type-small", spec: "Inter 400 · 14/20" },
  { name: "label", className: "type-label", spec: "Inter 600 · 12/16 · uppercase" },
  { name: "code", className: "type-code", spec: "JetBrains Mono 400 · 13/20" },
];

const spacing = [
  { name: "space-2", className: "w-2", px: 8 },
  { name: "space-4", className: "w-4", px: 16 },
  { name: "space-6", className: "w-6", px: 24 },
  { name: "space-10", className: "w-10", px: 40 },
];

const radii = [
  { name: "radius-sm", className: "rounded-sm", px: "6px", use: "Inputs, chips" },
  { name: "radius-md", className: "rounded-md", px: "12px", use: "Cards, panels" },
  { name: "radius-full", className: "rounded-full", px: "9999px", use: "Buttons, badges" },
];

/** @type {import("next").Metadata} */
export const metadata = {
  title: "Foundations · Volt",
  description: "Volt's colors, type, spacing and corners, and every component preset.",
};

export default function Foundations() {
  return (
    <>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10">
        <section className="flex flex-col gap-2">
          <p className="type-label text-muted-foreground">Foundations</p>
          <h1 className="type-heading-1">Volt design tokens</h1>
          <p className="max-w-prose text-muted-foreground">
            The colors, type, spacing and corners every Volt component is built from. Switch the
            theme to check both.
          </p>
          <p>
            <Link href="/components" className="rounded-sm text-primary underline underline-offset-4">
              Browse the components with their code
            </Link>
          </p>
        </section>

        {/* Each component's "Styles" row comes from its manifest: parse()
            fills in every prop a preset doesn't set, exactly like a dropped block. */}
        <ComponentSection manifest={buttonManifest}>
          <ExampleRow label="Styles">
            {buttonManifest.variants.map((variant) => {
              const { label, ...props } = buttonProps.parse(variant.props);
              return (
                <Button key={variant.name} {...props}>
                  {label}
                </Button>
              );
            })}
          </ExampleRow>
          <ExampleRow label="Sizes">
            <Button variant="secondary" size="sm">
              Small
            </Button>
            <Button variant="secondary" size="md">
              Medium
            </Button>
            <Button variant="secondary" size="lg">
              Large
            </Button>
          </ExampleRow>
          <ExampleRow label="Disabled">
            <Button variant="secondary" disabled>
              Not available
            </Button>
          </ExampleRow>
        </ComponentSection>

        <ComponentSection manifest={badgeManifest}>
          <ExampleRow label="Styles">
            {badgeManifest.variants.map((variant) => {
              const { label, ...props } = badgeProps.parse(variant.props);
              return (
                <Badge key={variant.name} {...props}>
                  {label}
                </Badge>
              );
            })}
          </ExampleRow>
          <ExampleRow label="In context">
            <span className="inline-flex items-center gap-2">
              Inspector <Badge>Beta</Badge>
            </span>
          </ExampleRow>
        </ComponentSection>

        <ComponentSection manifest={cardManifest}>
          <ExampleRow label="Examples">
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              {cardManifest.variants.map((variant) => {
                // These cards sit under the "Card" h2, so the default h3 is the right level.
                const { title, description, headingLevel } = cardProps.parse(variant.props);
                return (
                  <Card key={variant.name}>
                    <CardHeader>
                      <CardTitle level={headingLevel}>{title}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </ExampleRow>
        </ComponentSection>

        <ComponentSection manifest={inputManifest}>
          <ExampleRow label="Examples">
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
              {inputManifest.variants.map((variant) => (
                <InputField key={variant.name} {...inputProps.parse(variant.props)} />
              ))}
            </div>
          </ExampleRow>
        </ComponentSection>

        <ComponentSection manifest={alertManifest}>
          <ExampleRow label="Tones">
            <div className="flex w-full flex-col gap-4">
              {alertManifest.variants.map((variant) => {
                const { title, description, ...props } = alertProps.parse(variant.props);
                return (
                  <Alert key={variant.name} {...props}>
                    <AlertTitle>{title}</AlertTitle>
                    <AlertDescription>{description}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </ExampleRow>
        </ComponentSection>

        <ComponentSection manifest={avatarManifest}>
          <ExampleRow label="Examples">
            {avatarManifest.variants.map((variant) => (
              <Avatar key={variant.name} {...avatarProps.parse(variant.props)} />
            ))}
          </ExampleRow>
          <ExampleRow label="In context">
            {/* The name is written next to it, so the avatar is decorative. */}
            <span className="inline-flex items-center gap-2 type-small">
              <Avatar name="Priya Shah" size="sm" decorative />
              Priya Shah
            </span>
          </ExampleRow>
        </ComponentSection>

        <ComponentSection manifest={tabsManifest}>
          {tabsManifest.variants.map((variant) => (
            <ExampleRow key={variant.name} label={variant.name}>
              <TabsBlock className="w-full" {...tabsProps.parse(variant.props)} />
            </ExampleRow>
          ))}
        </ComponentSection>

        <ComponentSection manifest={accordionManifest}>
          {accordionManifest.variants.map((variant) => (
            <ExampleRow key={variant.name} label={variant.name}>
              <AccordionBlock className="w-full" {...accordionProps.parse(variant.props)} />
            </ExampleRow>
          ))}
        </ComponentSection>

        <section aria-labelledby="color-heading" className="flex flex-col gap-4">
          <h2 id="color-heading" className="type-heading-2">
            Color
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map((color) => (
              <li
                key={color.token}
                className="flex items-center gap-4 rounded-md border border-border bg-card p-4"
              >
                <span
                  aria-hidden="true"
                  className={`size-12 shrink-0 rounded-sm border border-border ${color.className}`}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="font-semibold">{color.volt}</span>
                  <code className="type-code text-muted-foreground">{color.className}</code>
                  <span className="type-small text-muted-foreground">{color.use}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="type-heading" className="flex flex-col gap-4">
          <h2 id="type-heading" className="type-heading-2">
            Type
          </h2>
          <ul className="flex flex-col rounded-md border border-border bg-card">
            {typeStyles.map((style) => (
              <li
                key={style.name}
                className="flex flex-col gap-2 border-b border-border p-4 last:border-b-0 md:p-6"
              >
                <span className="type-small text-muted-foreground">
                  <code className="type-code">{style.className}</code> · {style.spec}
                </span>
                {/* aria-hidden: these are visual samples, and "display" or
                    "heading-1" read aloud as headings would break the outline. */}
                <span aria-hidden="true" className={`${style.className} wrap-break-word`}>
                  Drop real components into real pages
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section aria-labelledby="spacing-heading" className="flex flex-col gap-4">
            <h2 id="spacing-heading" className="type-heading-2">
              Spacing
            </h2>
            <ul className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 md:p-6">
              {spacing.map((step) => (
                <li key={step.name} className="flex items-center gap-4">
                  <span aria-hidden="true" className={`h-4 rounded-sm bg-primary ${step.className}`} />
                  <span className="type-small">
                    {step.name} · {step.px}px ·{" "}
                    <code className="type-code text-muted-foreground">{step.className.slice(2)}</code>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="radius-heading" className="flex flex-col gap-4">
            <h2 id="radius-heading" className="type-heading-2">
              Corners
            </h2>
            <ul className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 md:p-6">
              {radii.map((radius) => (
                <li key={radius.name} className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className={`h-10 w-16 shrink-0 border border-input bg-background ${radius.className}`}
                  />
                  <span className="type-small">
                    {radius.name} · {radius.px} · {radius.use}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}

/**
 * A component's heading, description and examples, all taken from its manifest
 * except the examples themselves.
 *
 * @param {{ manifest: import("@/registry/schema").Manifest, children: import("react").ReactNode }} props
 */
function ComponentSection({ manifest, children }) {
  const headingId = `${manifest.name}-heading`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 id={headingId} className="type-heading-2">
          {manifest.title}
        </h2>
        <p className="max-w-prose text-muted-foreground">{manifest.description}</p>
      </div>
      <div className="flex flex-col gap-6 rounded-md border border-border bg-card p-4 md:p-6">
        {children}
      </div>
    </section>
  );
}

/**
 * One labeled row of examples.
 *
 * @param {{ label: string, children: import("react").ReactNode }} props
 */
function ExampleRow({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="type-label text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}
