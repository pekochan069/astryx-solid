import {
  AspectRatio,
  Badge,
  Blockquote,
  Button,
  ButtonGroup,
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
  IconButton,
  Link,
  LinkProvider,
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
  ToggleButton,
  ToggleButtonGroup,
  useLinkComponent,
  useLinkify,
  useResizable,
  VStack,
} from "@astryx-solid/core";
import { Button as SubpathButton } from "@astryx-solid/core/button";
import { ButtonGroup as SubpathButtonGroup } from "@astryx-solid/core/button-group";
import { useInteractiveRole } from "@astryx-solid/core/hooks";
import { InternationalizationProvider, useTranslator } from "@astryx-solid/core/i18n";
import { IconButton as SubpathIconButton } from "@astryx-solid/core/icon-button";
import { InteractiveRoleContext } from "@astryx-solid/core/interactive-role-context";
import { Link as SubpathLink, type LinkComponent } from "@astryx-solid/core/link";
import { SizeContext, useSize } from "@astryx-solid/core/size-context";
import { defineTheme, Theme, useTheme } from "@astryx-solid/core/theme";
import {
  ToggleButton as SubpathToggleButton,
  ToggleButtonGroup as SubpathToggleButtonGroup,
} from "@astryx-solid/core/toggle-button";
import { VisuallyHidden } from "@astryx-solid/core/visually-hidden";
import { Dynamic } from "@solidjs/web";
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

export const actionExportsMatch =
  Button === SubpathButton &&
  ButtonGroup === SubpathButtonGroup &&
  IconButton === SubpathIconButton &&
  Link === SubpathLink &&
  ToggleButton === SubpathToggleButton &&
  ToggleButtonGroup === SubpathToggleButtonGroup;

const RouterLink: LinkComponent = (props) => (
  <Dynamic {...props} component="a" data-router-link="true" />
);

export function PackedAdapter() {
  return (
    <LinkProvider component={RouterLink}>
      <Link href="/router">Router</Link>
    </LinkProvider>
  );
}

export function PackedActions() {
  const resolved = useLinkComponent(() => undefined);
  const linked = useLinkify(() => "Visit https://example.com");
  return (
    <Stack data-testid="packed-actions" data-native-link={resolved() === "a" ? "true" : "false"}>
      <Link href="/native">Native</Link>
      {linked()}
      <Button
        label="Cancel action"
        onClick={(event) => event.preventDefault()}
        clickAction={() => {
          throw new Error("Canceled action ran");
        }}
      />
      <ButtonGroup label="Packed group">
        <Button label="First" />
        <Button label="Second" href="/second" />
      </ButtonGroup>
      <IconButton label="Settings" icon="⚙" />
    </Stack>
  );
}

export function PackedInteractiveActions() {
  const [pressed, setPressed] = createSignal(false);
  const [single, setSingle] = createSignal<string | null>("grid");
  const [multiple, setMultiple] = createSignal<readonly string[]>(["bold"]);
  return (
    <Stack data-testid="packed-interactive-actions">
      <PackedAdapter />
      <ToggleButton label="Favorite" isPressed={pressed()} onPressedChange={setPressed} />
      <ToggleButtonGroup label="View" value={single()} onChange={setSingle}>
        <ToggleButton label="Grid" value="grid" />
        <ToggleButton label="List" value="list" />
      </ToggleButtonGroup>
      <ToggleButtonGroup label="Format" type="multiple" value={multiple()} onChange={setMultiple}>
        <ToggleButton label="Bold" value="bold" />
        <ToggleButton label="Italic" value="italic" />
      </ToggleButtonGroup>
    </Stack>
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
