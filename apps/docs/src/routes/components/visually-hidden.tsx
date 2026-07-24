import { Stack } from "@astryx-solid/core";
import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { createFileRoute } from "@tanstack/solid-router";

import registry from "../../registry/components.json";

export const Route = createFileRoute("/components/visually-hidden")({
  component: VisuallyHiddenDocs,
});

export function VisuallyHiddenDocs() {
  const component = registry.components.find(({ name }) => name === "VisuallyHidden")!;

  return (
    <Stack as="main" gap={4} padding={6} maxWidth={720}>
      <h1>{component.name}</h1>
      <p>{component.description}</p>
      <pre>
        <code>{`import { VisuallyHidden } from "${component.subpath}";`}</code>
      </pre>
      <button type="button">
        <span aria-hidden="true">×</span>
        <VisuallyHidden as="span">Close dialog</VisuallyHidden>
      </button>
      <VisuallyHidden as="div" aria-live="polite">
        Upload complete
      </VisuallyHidden>
    </Stack>
  );
}
