import {
  Center,
  FormLayout,
  Grid,
  GridSpan,
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
      <Grid columns={2} gap={2} aria-label="Example grid">
        <GridSpan columns={2}>Wide grid item</GridSpan>
        <div>Grid item</div>
      </Grid>
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
