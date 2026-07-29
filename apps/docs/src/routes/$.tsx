import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/$")({
  component: () => "Page not found",
});
