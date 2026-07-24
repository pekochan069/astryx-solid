import { Stack } from "@astryx-solid/core";
import { Button } from "@astryx-solid/core/button";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

export function RouteComponent() {
  const [count, setCount] = createSignal(0);

  return (
    <Stack as="main" gap={6} padding={6} maxWidth={720}>
      <Stack gap={2}>
        <h1>Astryx Solid</h1>
        <p>Stack arranges content vertically by default.</p>
      </Stack>

      <Stack direction="horizontal" gap={2} align="center" wrap="wrap">
        <Button
          label={`Clicked ${count()} times`}
          variant="primary"
          onClick={() => setCount(count() + 1)}
        />
        <Button label="Reset" onClick={() => setCount(0)} />
      </Stack>
    </Stack>
  );
}
