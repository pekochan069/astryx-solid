import { AspectRatio, Badge, Blockquote, Citation, Code, Kbd, Skeleton } from "@astryx-solid/core";
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
