import { createFileRoute } from "@tanstack/solid-router";
import { Button } from "@asytyx-solid/core/button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Button label="Hello, world!" variant="primary" class="hello" />
    </div>
  );
}
