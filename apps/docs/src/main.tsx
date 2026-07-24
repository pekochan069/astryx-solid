import { hydrate, render } from "@solidjs/web";
import { RouterProvider } from "@tanstack/solid-router";

import { createDocsApp } from "./app";
import { createDocsRouter } from "./router";
import "./style.css";

const rootElement = document.getElementById("app")!;
const pathname = window.location.pathname.replace(/\/$/, "") || "/";
const router = createDocsRouter();
const serverTree = snapshotTree(rootElement);

type ElementSnapshot = {
  element: Element;
  children: ElementSnapshot[];
};

function snapshotTree(element: Element): ElementSnapshot {
  return { element, children: Array.from(element.children, snapshotTree) };
}

function treeWasReused(snapshot: ElementSnapshot): boolean {
  return (
    snapshot.element.isConnected &&
    snapshot.element.children.length === snapshot.children.length &&
    snapshot.children.every(
      (child, index) => child.element === snapshot.element.children[index] && treeWasReused(child),
    )
  );
}

function hasHydrationWarning(argument: unknown): boolean {
  const message =
    typeof argument === "string" ? argument : argument instanceof Error ? argument.message : "";
  return /hydration|mismatch/i.test(message);
}

function mountRouter() {
  let hydrationWarning = false;
  const originalWarn = console.warn;
  const originalError = console.error;
  const recordHydrationWarning = (...args: unknown[]) => {
    hydrationWarning ||= args.some(hasHydrationWarning);
  };
  console.warn = (...args) => {
    recordHydrationWarning(...args);
    originalWarn(...args);
  };
  console.error = (...args) => {
    recordHydrationWarning(...args);
    originalError(...args);
  };

  try {
    hydrate(() => createDocsApp(pathname), rootElement);
  } finally {
    console.warn = originalWarn;
    console.error = originalError;
  }

  rootElement.dataset.hydrated =
    !hydrationWarning && treeWasReused(serverTree) ? "reused" : "replaced";
}

if (serverTree.children.length > 0) {
  mountRouter();
} else {
  render(() => <RouterProvider router={router} />, rootElement);
}
