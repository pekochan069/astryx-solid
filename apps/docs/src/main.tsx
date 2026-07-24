import { render } from "@solidjs/web";
import { RouterProvider } from "@tanstack/solid-router";

import { createDocsRouter } from "./router";
import "./style.css";

const rootElement = document.getElementById("app")!;
rootElement.replaceChildren();
render(() => <RouterProvider router={createDocsRouter()} />, rootElement);
