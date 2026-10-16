"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/avatar").AvatarProps} AvatarProps */

/** @type {Record<AvatarProps["size"], { box: string, px: number }>} */
export const sizes = {
  sm: { box: "size-8 type-label", px: 32 },
  md: { box: "size-10 type-small font-semibold", px: 40 },
  lg: { box: "size-12 type-body font-semibold", px: 48 },
};

/**
 * Up to two initials: the first letters of the first and last words.
 * "Alex Morgan" -> "AM", "alex" -> "A", "Mary Jane Watson" -> "MW".
 *
 * Array.from splits a string into whole characters, so letters that take
 * two UTF-16 units (some emoji and rare scripts) aren't cut in half.
 *
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return (first + last).toLocaleUpperCase();
}

/**
 * A round photo, or the person's initials when there's no photo or it fails
 * to load.
 *
 * @param {Partial<AvatarProps> & Omit<import("react").ComponentProps<"span">, "children">} props
 */
export function Avatar({ name = "", src = "", size = "md", decorative = false, className, ...props }) {
  // Remember which address failed, not just "it failed". When `src` changes
  // to a new address, the comparison is false again and the new photo is
  // tried, with no useEffect needed to reset anything.
  const [failedSrc, setFailedSrc] = useState(/** @type {string | null} */ (null));
  const showImage = src !== "" && failedSrc !== src;
  const { box, px } = sizes[size];

  return (
    <span
      data-slot="avatar"
      data-size={size}
      // Initials are shown as one image named after the person; when
      // decorative, the whole avatar is hidden from screen readers.
      role={!showImage && !decorative ? "img" : undefined}
      aria-label={!showImage && !decorative ? name : undefined}
      aria-hidden={decorative ? true : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-accent-foreground",
        box,
        className,
      )}
      {...props}
    >
      {showImage ? (
        // A plain <img>, not next/image: this component is also installed into
        // Vite and plain-HTML projects, where next/image doesn't exist.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={decorative ? "" : name}
          width={px}
          height={px}
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}
