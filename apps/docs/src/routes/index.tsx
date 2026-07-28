import { Stack } from "@astryx-solid/core";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [count, setCount] = createSignal(0);

  return (
    <Stack as="main" gap={6} padding={6} maxWidth={720}>
      <Stack gap={2}>
        <h1>Astryx Solid</h1>
        <p>Stack arranges content vertically by default.</p>
      </Stack>

      <Stack direction="horizontal" gap={2} align="center" wrap="wrap">
        <button type="button" onClick={() => setCount(count() + 1)}>
          Clicked {count()} times
        </button>
        <button type="button" onClick={() => setCount(0)}>
          Reset
        </button>
      </Stack>
    </Stack>
  );
}
