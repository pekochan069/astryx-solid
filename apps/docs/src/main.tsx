import { hydrate, render } from "@solidjs/web";
import { RouterProvider } from "@tanstack/solid-router";

import { createDocsApp } from "./app";
import { createDocsRouter } from "./router";
import "./style.css";

const rootElement = document.getElementById("app")!;
const serverElement = rootElement.firstElementChild;
if (serverElement) {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  hydrate(() => createDocsApp(pathname), rootElement);
  rootElement.dataset.hydrated =
    rootElement.firstElementChild === serverElement ? "reused" : "replaced";
} else {
  render(() => <RouterProvider router={createDocsRouter()} />, rootElement);
}
