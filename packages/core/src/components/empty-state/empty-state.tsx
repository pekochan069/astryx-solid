import type { JSX } from "@solidjs/web";

import * as stylex from "@stylexjs/stylex";
import { createMemo, Match, omit, Show, Switch } from "solid-js";

import type { BaseProps } from "../../base-props";

import { stylexProps } from "../../stylex";
import { colorVars, fontWeightVars, spacingVars, typeScaleVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export interface EmptyStateProps extends BaseProps<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: JSX.Element;
  actions?: JSX.Element;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  isCompact?: boolean;
}

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: spacingVars["--spacing-4"],
    paddingBlock: spacingVars["--spacing-8"],
    paddingInline: spacingVars["--spacing-6"],
  },
  compact: {
    gap: spacingVars["--spacing-2"],
    paddingBlock: spacingVars["--spacing-4"],
    paddingInline: spacingVars["--spacing-4"],
  },
  text: { display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "360px" },
  title: {
    margin: 0,
    fontSize: typeScaleVars["--text-large-size"],
    lineHeight: typeScaleVars["--text-large-leading"],
    fontWeight: fontWeightVars["--font-weight-semibold"],
    color: colorVars["--color-text-primary"],
  },
  titleCompact: { fontSize: typeScaleVars["--text-label-size"] },
  description: {
    margin: 0,
    fontSize: typeScaleVars["--text-body-size"],
    lineHeight: typeScaleVars["--text-body-leading"],
    fontWeight: fontWeightVars["--font-weight-normal"],
    color: colorVars["--color-text-secondary"],
  },
  descriptionCompact: { fontSize: typeScaleVars["--text-supporting-size"] },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: spacingVars["--spacing-2"],
    marginTop: spacingVars["--spacing-1"],
  },
  actionsCompact: { flexDirection: "column" },
});

function EmptyStateHeading(props: {
  level: NonNullable<EmptyStateProps["headingLevel"]>;
  title: string;
  isCompact: boolean;
}) {
  const style = createMemo(() => stylexProps(styles.title, props.isCompact && styles.titleCompact));

  return (
    <Switch fallback={<h3 {...style()} textContent={props.title} />}>
      <Match when={props.level === 1}>
        <h1 {...style()} textContent={props.title} />
      </Match>
      <Match when={props.level === 2}>
        <h2 {...style()} textContent={props.title} />
      </Match>
      <Match when={props.level === 4}>
        <h4 {...style()} textContent={props.title} />
      </Match>
      <Match when={props.level === 5}>
        <h5 {...style()} textContent={props.title} />
      </Match>
      <Match when={props.level === 6}>
        <h6 {...style()} textContent={props.title} />
      </Match>
    </Switch>
  );
}

export function EmptyState(props: EmptyStateProps) {
  const rest = omit(
    props,
    "title",
    "description",
    "icon",
    "actions",
    "headingLevel",
    "isCompact",
    "xstyle",
    "class",
    "style",
  );

  const theme = createMemo(() =>
    themeProps("empty-state", { variant: props.isCompact ? "compact" : undefined }),
  );
  const style = createMemo(() =>
    stylexProps(styles.root, props.isCompact && styles.compact, props.xstyle),
  );

  return (
    <div
      {...rest}
      {...theme()}
      class={[theme().class, style().class, props.class]}
      style={{ ...style().style, ...props.style }}
      data-style-src={style()["data-style-src"]}
    >
      <Show when={props.icon != null}>
        <div aria-hidden="true">{props.icon}</div>
      </Show>
      <div {...stylexProps(styles.text)}>
        <EmptyStateHeading
          level={props.headingLevel ?? 3}
          title={props.title}
          isCompact={props.isCompact ?? false}
        />
        <Show when={props.description != null}>
          <div
            {...stylexProps(styles.description, props.isCompact && styles.descriptionCompact)}
            textContent={props.description}
          />
        </Show>
      </div>
      <Show when={props.actions != null}>
        <div {...stylexProps(styles.actions, props.isCompact && styles.actionsCompact)}>
          {props.actions}
        </div>
      </Show>
    </div>
  );
}
