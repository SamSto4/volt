import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const avatarProps = z.object({
  name: z.string().min(1).max(60).default("Alex Morgan").meta({ title: "Name" }),
  // Saved pages come from users, so image addresses are untrusted. Only
  // https:// or a path on the same site is allowed: no http (mixed content),
  // no javascript: or data: URLs. Empty means "show initials".
  src: z
    .string()
    .max(500)
    .regex(/^(https:\/\/\S+|\/\S*)?$/, "Use an https:// address or a path starting with /")
    .default("")
    .meta({ title: "Image address" }),
  size: z.enum(["sm", "md", "lg"]).default("md").meta({ title: "Size" }),
  // On when the person's name is already written next to the avatar, so
  // screen readers don't hear the name twice.
  decorative: z.boolean().default(false).meta({ title: "Name is shown next to it" }),
});

/** @typedef {z.infer<typeof avatarProps>} AvatarProps */

export default defineManifest({
  name: "avatar",
  title: "Avatar",
  category: "display",
  description: "A person's photo in a circle, with their initials when there's no photo.",
  usage: {
    whenToUse: "Next to a name in author lines, comments or team lists, to help people recognize someone at a glance.",
    whenNotToUse: "As the only way to identify someone. Show the name too, unless space is very tight.",
  },
  props: avatarProps,
  variants: [
    { name: "Initials", props: {} },
    { name: "Small", props: { name: "Priya Shah", size: "sm" } },
    { name: "Large", props: { name: "Jordan Lee", size: "lg" } },
  ],
  fits: ["inline"],
  a11y: {
    role: "img",
    keyboard: [],
    notes: [
      "The avatar is named with the person's name, both as a photo (alt text) and as initials.",
      "When the name is written right next to it, mark it decorative so screen readers skip it instead of saying the name twice.",
      "If the photo fails to load, initials appear in its place, so there's never a broken-image icon.",
    ],
  },
  code: {
    from: "@/components/ui/avatar",
    render: (/** @type {AvatarProps} */ props, /** @type {AvatarProps} */ defaults) =>
      h("Avatar", {
        name: props.name,
        src: props.src || undefined,
        size: props.size === defaults.size ? undefined : props.size,
        decorative: props.decorative,
      }),
  },
  install: {
    dependencies: [],
    registryDependencies: ["utils"],
  },
});
