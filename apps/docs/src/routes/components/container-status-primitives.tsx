import {
  Card,
  EmptyState,
  ProgressBar,
  ResizeHandle,
  Stack,
  StatusDot,
  Thumbnail,
  Timestamp,
  useResizable,
} from "@astryx-solid/core";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";

export const Route = createFileRoute("/components/container-status-primitives")({
  component: ContainerStatusPrimitivesDocs,
});

function ContainerStatusPrimitivesDocs() {
  const sidebar = useResizable({
    defaultSize: 200,
    minSizePx: 120,
    maxSizePx: 320,
    collapsible: true,
  });
  const vertical = useResizable({ defaultSize: 48, minSizePx: 24, maxSizePx: 72 });
  const rtl = useResizable({ defaultSize: 160, minSizePx: 120, maxSizePx: 240 });
  const overlay = useResizable({ defaultSize: 160, minSizePx: 120, maxSizePx: 240 });
  const bottom = useResizable({ defaultSize: 48, minSizePx: 24, maxSizePx: 72 });

  const [removed, setRemoved] = createSignal(false);

  return (
    <Stack as="main" gap={6} padding={6} maxWidth={720}>
      <h1>Container and status primitives</h1>

      <div>
        <Card>Default card</Card>
        <Card variant="muted">Muted card</Card>
        <Card variant="transparent">Transparent card</Card>
        <Card variant="green">Green card</Card>
      </div>

      <Card variant="muted">
        <EmptyState
          title="No reports"
          description="Create a report to begin tracking progress."
          actions={<button type="button">Create report</button>}
        />
        <EmptyState title="No filters" isCompact />
      </Card>

      <div>
        <ProgressBar value={72} label="Upload progress" hasValueLabel />
        <ProgressBar label="Loading progress" isIndeterminate />
        <ProgressBar value={32} label="Disabled progress" isDisabled />
      </div>

      <div>
        <StatusDot variant="success" label="Online" isPulsing />
        <StatusDot variant="warning" label="Needs attention" tooltip="Service needs attention" />
        <StatusDot variant="error" label="Offline" />
        <span>Online</span>
        <Timestamp value="2025-01-01T12:00:00Z" format="date_time" />
        <Timestamp value="2025-01-01T12:00:00Z" format="relative" />
        <Timestamp value="2025-01-01T12:00:00Z" format="auto" />
        <Timestamp value="2025-01-01T12:00:00Z" isLive />
      </div>

      <div>
        <Thumbnail
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          alt="Landscape"
          label="Cover image"
          onClick={() => {}}
          onRemove={() => setRemoved(true)}
        />
        <Thumbnail label="Loading cover" isLoading />
        <Thumbnail label="Disabled cover" isDisabled />
        <Show when={removed()}>
          <span role="status" textContent="Cover image removed" />
        </Show>
      </div>

      <div style={{ display: "flex", height: "96px" }}>
        <Card width={sidebar.size}>Resizable panel</Card>
        <ResizeHandle
          label="Resize panel"
          resizable={sidebar.props}
          hasDivider
          pillPlacement="auto"
          isAlwaysVisible={false}
        />
        <Card>Content</Card>
        <ResizeHandle label="Disabled resize panel" resizable={sidebar.props} isDisabled />
      </div>

      <div style={{ display: "flex", height: "96px" }}>
        <Card width={rtl.size}>RTL panel</Card>
        <ResizeHandle label="RTL resize panel" resizable={rtl.props} style={{ direction: "rtl" }} />
        <Card>Content</Card>
      </div>

      <div style={{ display: "flex", width: "240px", height: "96px", position: "relative" }}>
        <Card width={overlay.size}>Overlay panel</Card>
        <ResizeHandle
          label="Overlay resize panel"
          position="overlay"
          resizable={overlay.props}
          pillPlacement="end"
        />
      </div>

      <div style={{ display: "flex", height: "120px", width: "160px", "flex-direction": "column" }}>
        <Card style={{ height: `${vertical.size}px` }}>Vertical panel</Card>
        <ResizeHandle
          label="Vertical resize panel"
          direction="vertical"
          resizable={vertical.props}
        />
        <Card>Content</Card>
      </div>

      <div style={{ display: "flex", "flex-direction": "column", height: "128px" }}>
        <Card style={{ height: `${bottom.size}px` }}>Vertical panel</Card>
        <ResizeHandle
          direction="vertical"
          label="Resize bottom panel"
          resizable={bottom.props}
          hasDivider
        />
        <Card>Bottom content</Card>
      </div>
    </Stack>
  );
}
