import {
  Center,
  FormLayout,
  Grid,
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  Section,
  Stack,
  StackItem,
  VStack,
} from "@astryx-solid/core";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, onSettled, Show } from "solid-js";

export const Route = createFileRoute("/components/layout-primitives")({
  component: LayoutPrimitivesDocs,
});

export function LayoutPrimitivesDocs() {
  return (
    <Stack as="main" gap={6} padding={6} maxWidth={960}>
      <h1>Layout primitives</h1>

      <p>Responsive containers, grids, stacks, sections, and page regions.</p>

      <HStack gap={2} align="center" wrap="wrap">
        <button type="button">Primary action</button>
        <button type="button">Secondary action</button>
      </HStack>

      <VStack gap={2} padding={2}>
        <StackItem>Vertical item</StackItem>
        <StackItem>Another vertical item</StackItem>
      </VStack>

      <Center height={80} axis="both">
        Centered content
      </Center>

      <ResponsiveGridExample />

      <Section variant="muted" dividers={["top", "bottom"]}>
        <FormLayout direction="horizontal-labels">
          <label for="layout-name">Name</label>
          <input id="layout-name" />
        </FormLayout>
      </Section>

      <Layout
        header={<LayoutHeader>Header</LayoutHeader>}
        start={<LayoutPanel>Panel</LayoutPanel>}
        content={<LayoutContent>Content</LayoutContent>}
        footer={<LayoutFooter>Footer</LayoutFooter>}
      />
    </Stack>
  );
}

function ResponsiveGridExample() {
  const [isMounted, setIsMounted] = createSignal(false);
  if (typeof window !== "undefined") {
    onSettled(() => {
      setIsMounted(true);
    });
  }

  // ponytail: mount after hydration for WebKit; remove when Solid 2 preserves this SSR subtree.
  return (
    <Show when={isMounted()}>
      <Grid minChildWidth={240} gap={2} aria-label="Example grid">
        <div>First grid item</div>
        <div>Second grid item</div>
      </Grid>
    </Show>
  );
}
