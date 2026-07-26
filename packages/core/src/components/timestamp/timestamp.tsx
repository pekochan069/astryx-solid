import * as stylex from "@stylexjs/stylex";
import { createMemo, createSignal, omit, onCleanup, onSettled, Show } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { TextColor, TextSize, TextType, TextWeight } from "../text/text";

import { stylexProps } from "../../stylex";
import { colorVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";

export type TimestampFormat =
  | "relative"
  | "auto"
  | "date"
  | "date_time"
  | "time"
  | "system_date"
  | "system_date_time"
  | "system_time";

export interface TimestampProps extends BaseProps<HTMLTimeElement> {
  value: string | number;
  format?: TimestampFormat;
  type?: TextType;
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;
  autoThreshold?: number;
  hasTooltip?: boolean;
  isTimezoneShown?: boolean;
  isLive?: boolean;
}

const day = 86_400;

const styles = stylex.create({
  root: { fontFamily: "inherit", fontStyle: "normal", color: colorVars["--color-text-secondary"] },
  focus: {
    outline: { default: null, ":focus-visible": `2px solid ${colorVars["--color-accent"]}` },
  },
});

function dateOf(value: string | number) {
  return new Date(typeof value === "number" && value < 1e12 ? value * 1000 : value);
}

function relative(date: Date, now: Date) {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const future = seconds < 0;
  const n = Math.abs(seconds);

  if (n <= 30) return "now";

  const units: Array<[number, string]> = [
    [365 * day, "year"],
    [30 * day, "month"],
    [day, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [span, unit] of units)
    if (n >= span) {
      const count = Math.floor(n / span);
      return future
        ? `in ${count} ${unit}${count === 1 ? "" : "s"}`
        : `${count} ${unit}${count === 1 ? "" : "s"} ago`;
    }

  return future ? "in a few seconds" : `${n} seconds ago`;
}

function absolute(date: Date, format: TimestampFormat, timezone: boolean) {
  if (format === "system_date") return date.toLocaleDateString("en-CA");
  if (format === "system_time") return date.toLocaleTimeString("en-GB");
  if (format === "system_date_time")
    return `${date.toLocaleDateString("en-CA")} ${date.toLocaleTimeString("en-GB")}`;

  const options: Intl.DateTimeFormatOptions =
    format === "date"
      ? { year: "numeric", month: "short", day: "numeric" }
      : format === "time"
        ? { hour: "numeric", minute: "2-digit" }
        : { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };

  return new Intl.DateTimeFormat(undefined, {
    ...options,
    ...(timezone ? { timeZoneName: "short" } : {}),
  }).format(date);
}

export function Timestamp(props: TimestampProps) {
  const rest = omit(
    props,
    "value",
    "format",
    "type",
    "size",
    "color",
    "weight",
    "autoThreshold",
    "hasTooltip",
    "isTimezoneShown",
    "isLive",
    "xstyle",
    "class",
    "style",
  );

  const [now, setNow] = createSignal(new Date());
  const date = () => dateOf(props.value);
  const valid = () => !Number.isNaN(date().getTime());
  const effective = () =>
    props.format === "auto" || props.format == null
      ? Math.abs(now().getTime() - date().getTime()) / 1000 <= (props.autoThreshold ?? 7 * day)
        ? "relative"
        : "date_time"
      : props.format;
  const text = () =>
    effective() === "relative"
      ? relative(date(), now())
      : absolute(date(), effective(), props.isTimezoneShown ?? false);

  onSettled(() => {
    if (!props.isLive) return;

    const timer = setInterval(() => setNow(new Date()), 1_000);
    onCleanup(() => clearInterval(timer));
  });

  const theme = createMemo(() =>
    themeProps("timestamp", {
      format: effective(),
      type: props.type,
      size: props.size,
      color: props.color,
      weight: props.weight,
    }),
  );
  const style = createMemo(() =>
    stylexProps(
      styles.root,
      props.hasTooltip !== false && effective() === "relative" && styles.focus,
      props.xstyle,
    ),
  );

  return (
    <Show when={valid()}>
      <time
        {...rest}
        {...theme()}
        datetime={date().toISOString()}
        aria-label={effective() === "relative" ? date().toLocaleString() : undefined}
        title={
          props.hasTooltip !== false && effective() === "relative"
            ? date().toLocaleString()
            : undefined
        }
        tabindex={props.hasTooltip !== false && effective() === "relative" ? "0" : undefined}
        class={[theme().class, style().class, props.class]}
        style={{ ...style().style, ...props.style }}
        data-style-src={style()["data-style-src"]}
        textContent={text()}
      />
    </Show>
  );
}
