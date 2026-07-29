import type { JSX } from "@solidjs/web";

import {
  Button,
  ButtonGroup,
  IconButton,
  Link,
  LinkProvider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  type LinkComponent,
} from "@astryx-solid/core";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

export const Route = createFileRoute("/components/action-foundation")({
  component: ActionFoundationDocs,
});

const RouterLink: LinkComponent = (props) => <a {...props} data-router-link="true" />;
const toggleButtonStyle = { width: "128px", "justify-content": "flex-start" };
const ToggleIconSpacer = () => <span aria-hidden="true" style={{ width: "16px" }} />;

function LinkExamples() {
  return (
    <section aria-labelledby="links-heading">
      <h2 id="links-heading">Links</h2>
      <Stack direction="horizontal" gap={3} wrap="wrap">
        <Link as="a" href="/components/action-foundation">
          Native link
        </Link>
        <Link as="a" href="https://example.com" isExternalLink>
          External link
        </Link>
        <Link href="/router">Router link</Link>
        <Link href="/disabled" isDisabled>
          Disabled link
        </Link>
        <Link onClick={() => {}}>Button-like link</Link>
      </Stack>
    </section>
  );
}

function ButtonExamples() {
  return (
    <section aria-labelledby="buttons-heading">
      <h2 id="buttons-heading">Buttons</h2>
      <Stack direction="horizontal" gap={3} wrap="wrap">
        <Button label="Primary action" variant="primary" />
        <Button label="Unavailable action" isDisabled tooltip="Available after setup" />
        <Button label="Loading action" aria-label="Loading action" isLoading />
        <Button label="Button link" href="/components/action-foundation" />
        <IconButton label="Settings" icon="⚙" tooltip="Settings" />
      </Stack>
    </section>
  );
}

function GroupExamples() {
  return (
    <section aria-labelledby="groups-heading">
      <h2 id="groups-heading">Button groups</h2>
      <ButtonGroup label="Editing actions">
        <Button label="Cut" />
        <Button label="Copy" />
        <Button label="Paste" href="#paste" />
      </ButtonGroup>
    </section>
  );
}

function ToggleExamples() {
  const [favorite, setFavorite] = createSignal(false);
  const [view, setView] = createSignal<string | null>("grid");
  const [format, setFormat] = createSignal<readonly string[]>(["bold"]);

  return (
    <section aria-labelledby="toggles-heading">
      <h2 id="toggles-heading">Toggle buttons</h2>
      <Stack gap={3} align="start">
        <ToggleButton
          label="Favorite"
          icon={<span style={{ display: "inline-block", width: "16px" }}>☆</span>}
          pressedIcon={<span style={{ display: "inline-block", width: "16px" }}>★</span>}
          isPressed={favorite()}
          onPressedChange={setFavorite}
          style={toggleButtonStyle}
        />
        <ToggleButtonGroup label="View mode" value={view()} onChange={setView}>
          <ToggleButton
            label="Grid"
            value="grid"
            icon={<ToggleIconSpacer />}
            style={toggleButtonStyle}
          />
          <ToggleButton
            label="List"
            value="list"
            icon={<ToggleIconSpacer />}
            style={toggleButtonStyle}
          />
        </ToggleButtonGroup>
        <ToggleButtonGroup type="multiple" label="Formatting" value={format()} onChange={setFormat}>
          <ToggleButton
            label="Bold"
            value="bold"
            icon={<ToggleIconSpacer />}
            style={toggleButtonStyle}
          />
          <ToggleButton
            label="Italic"
            value="italic"
            icon={<ToggleIconSpacer />}
            style={toggleButtonStyle}
          />
        </ToggleButtonGroup>
      </Stack>
    </section>
  );
}

function ActionFoundationDocs(): JSX.Element {
  return (
    <LinkProvider component={RouterLink}>
      <Stack as="main" gap={5} padding={6} maxWidth={720}>
        <h1>Action foundation</h1>
        <p>Solid-native links, buttons, connected groups, icon actions, and controlled toggles.</p>
        <LinkExamples />
        <ButtonExamples />
        <GroupExamples />
        <ToggleExamples />
      </Stack>
    </LinkProvider>
  );
}
