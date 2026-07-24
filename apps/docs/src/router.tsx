import { createRouter } from "@tanstack/solid-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultStaleTime: 5000,
    scrollRestoration: true,
  });
}

export type DocsRouter = ReturnType<typeof getRouter>;

declare module "@tanstack/solid-router" {
  interface Register {
    router: DocsRouter;
  }
}
