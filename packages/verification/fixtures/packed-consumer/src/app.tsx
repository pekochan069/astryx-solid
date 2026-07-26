import {
  AspectRatio,
  Badge,
  Blockquote,
  Card,
  Center,
  Citation,
  Code,
  Divider,
  EmptyState,
  FormLayout,
  Grid,
  GridSpan,
  Heading,
  HStack,
  Icon,
  Kbd,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  ProgressBar,
  ResizeHandle,
  Section,
  Skeleton,
  Spinner,
  Stack,
  StackItem,
  StatusDot,
  Text,
  Thumbnail,
  Timestamp,
  useResizable,
  VStack,
} from "@astryx-solid/core";
import { useInteractiveRole } from "@astryx-solid/core/hooks";
import { InternationalizationProvider, useTranslator } from "@astryx-solid/core/i18n";
import { InteractiveRoleContext } from "@astryx-solid/core/interactive-role-context";
import { SizeContext, useSize } from "@astryx-solid/core/size-context";
import { defineTheme, Theme, useTheme } from "@astryx-solid/core/theme";
import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { createSignal } from "solid-js";

const lightTheme = defineTheme({ name: "consumer-light", tokens: { "--color-accent": "a" } });
const darkTheme = defineTheme({ name: "consumer-dark", tokens: { "--color-accent": "b" } });

const messages = {
  en: { greeting: { defaultMessage: "Hello" } },
  fr: { greeting: { defaultMessage: "Bonjour" } },
};

export function createApp() {
  const [alternate, setAlternate] = createSignal(false);

  if (typeof window !== "undefined") queueMicrotask(() => setAlternate(true));

  return (
    <Theme theme={alternate() ? darkTheme : lightTheme} mode={alternate() ? "dark" : "light"}>
      <InternationalizationProvider locale={alternate() ? "fr" : "en"} messages={messages}>
        <VisuallyHidden as="span">Close dialog</VisuallyHidden>
        <p data-testid="consumer-state">
          <ConsumerState />
        </p>
        <InteractiveRoleContext value={{ role: "button" }}>
          <p data-testid="consumer-role">
            <ConsumerRole />
          </p>
        </InteractiveRoleContext>
        <SizeContext value={{ size: "sm" }}>
          <p data-testid="consumer-size">
            <ConsumerSize />
          </p>
        </SizeContext>
      </InternationalizationProvider>
    </Theme>
  );
}

export function ContentPrimitives() {
  return (
    <div data-testid="content-primitives">
      <AspectRatio ratio={16 / 9}>Media</AspectRatio>
      <Badge variant="success" label="Ready" />
      <Blockquote cite="Source">Quote</Blockquote>
      <Citation source={{ title: "Reference", url: "https://example.com" }} number={1} />
      <Code>const value = 1</Code>
      <Kbd keys="ctrl+k" />
      <Skeleton width={20} height={10} />
    </div>
  );
}

export function PackedLayoutPrimitives() {
  return (
    <Stack>
      <Center>Centered</Center>
      <Grid columns={2}>
        <GridSpan columns={2}>Wide</GridSpan>
      </Grid>
      <HStack>Horizontal</HStack>
      <VStack>Vertical</VStack>
      <StackItem size="fill">Flexible</StackItem>
      <Section>
        <FormLayout>Form</FormLayout>
      </Section>
    </Stack>
  );
}

export function PackedContainerStatus() {
  const region = useResizable({ defaultSize: 160, minSizePx: 100, maxSizePx: 240 });

  return (
    <Card data-testid="packed-container-status">
      <EmptyState title="No files" description="Upload a file to begin." />
      <ProgressBar value={50} label="Upload" hasValueLabel />
      <StatusDot variant="success" label="Ready" />
      <Thumbnail label="upload" isLoading />
      <Timestamp value="2025-01-01T00:00:00Z" format="system_date" />
      <ResizeHandle label="Resize panel" resizable={region.props} />
    </Card>
  );
}

export function PackedLayout() {
  return (
    <Layout
      data-testid="packed-layout"
      header={<LayoutHeader>Header</LayoutHeader>}
      start={<LayoutPanel>Panel</LayoutPanel>}
      content={<LayoutContent>Content</LayoutContent>}
      footer={<LayoutFooter>Footer</LayoutFooter>}
    />
  );
}

export const packedPrimitives = {
  divider: () => <Divider data-testid="packed-divider" label="More" />,
  heading: () => (
    <Heading data-testid="packed-heading" level={2}>
      Packed heading
    </Heading>
  ),
  icon: () => (
    <Icon data-testid="packed-icon" icon="close" aria-label="Close" aria-hidden={false} />
  ),
  spinner: () => <Spinner data-testid="packed-spinner" aria-label="Loading packed content" />,
  text: () => <Text data-testid="packed-text" textContent="Packed text" />,
};

function ConsumerState() {
  const theme = useTheme();
  const translate = useTranslator();

  return (
    <>
      {theme.name}:{theme.mode}:{theme.token("--color-accent")}:{translate("greeting")}
    </>
  );
}

function ConsumerRole() {
  const role = useInteractiveRole({});

  return <>{role()}</>;
}

function ConsumerSize() {
  const size = useSize();

  return <>{size()}</>;
}
