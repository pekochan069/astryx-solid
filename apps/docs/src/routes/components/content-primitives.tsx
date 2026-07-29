import type { JSX } from "@solidjs/web";

import {
  AspectRatio,
  Badge,
  Blockquote,
  Citation,
  Code,
  Divider,
  Heading,
  Icon,
  Kbd,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from "@astryx-solid/core";
import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/components/content-primitives")({
  component: ContentPrimitivesDocs,
});

function CheckIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ContentPrimitivesDocs() {
  return (
    <Stack as="main" gap={4} padding={6} maxWidth={720}>
      <Heading level={1}>Content primitives</Heading>

      <Text as="p">Text, status, loading, and semantic content primitives.</Text>

      <AspectRatio ratio={16 / 9} fit="center">
        <Skeleton width="100%" height="100%" />
      </AspectRatio>

      <Stack direction="horizontal" gap={2} align="center">
        <Badge variant="success" label="Ready" />
        <Icon icon={CheckIcon} aria-label="Ready" aria-hidden={false} />
        <Kbd keys="mod+k" />
        <Spinner aria-label="Loading preview" />
      </Stack>

      <Blockquote cite="Astryx">Semantic HTML remains baseline.</Blockquote>

      <Text as="p">
        Use <Code>Text</Code> for themed copy and{" "}
        <Citation source={{ title: "Astryx" }} number={1} />
        for sources.
      </Text>

      <Divider label="More" />
    </Stack>
  );
}
