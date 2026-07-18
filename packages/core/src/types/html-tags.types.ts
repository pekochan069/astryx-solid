import type { JSX } from "@solidjs/web";

/** Names accepted by Solid JSX as intrinsic HTML, SVG, or MathML elements. */
export type HTMLTags = keyof JSX.IntrinsicElements;
