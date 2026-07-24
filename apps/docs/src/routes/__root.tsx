import type { JSX } from "@solidjs/web";

import { HeadContent, Scripts, createRootRoute } from "@tanstack/solid-router";

import "../style.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Astryx Solid" },
    ],
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  }),
  shellComponent: RootDocument,
});

function RootDocument(props: Readonly<{ children: JSX.Element }>) {
  return (
    <html lang="en">
      <head />
      <body>
        <HeadContent />
        <div id="app">{props.children}</div>
        <Scripts />
      </body>
    </html>
  );
}
