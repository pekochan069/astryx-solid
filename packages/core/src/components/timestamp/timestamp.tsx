import * as stylex from "@stylexjs/stylex";
import { createMemo, createSignal, omit, onCleanup, onSettled, Show } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { TextColor, TextSize, TextType, TextWeight } from "../text/text";

import { stylexProps } from "../../stylex";
import { colorVars } from "../../theme/tokens.stylex";
import { themeProps } from "../../utils/theme-props";
import { textStyles } from "../text/text";

export type TimestampFormat =
  | "relative"
  | "auto"
  | "date"
  | "date_long"
  | "date_weekday"
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

const SECONDS_PER_DAY = 86_400;

const styles = stylex.create({
  time: { display: "inline", fontFamily: "inherit", fontStyle: "normal" },
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
  const absoluteSeconds = Math.abs(seconds);

  if ((!future && absoluteSeconds < 10) || (future && absoluteSeconds <= 30)) return "now";

  const units: Array<[number, string]> = [
    [365 * SECONDS_PER_DAY, "year"],
    [30 * SECONDS_PER_DAY, "month"],
    [SECONDS_PER_DAY, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  if (!future && absoluteSeconds >= SECONDS_PER_DAY && absoluteSeconds < 2 * SECONDS_PER_DAY)
    return "yesterday";

  for (const [span, unit] of units)
    if (absoluteSeconds >= span) {
      const count = Math.floor(absoluteSeconds / span);
      return future
        ? `in ${count} ${unit}${count === 1 ? "" : "s"}`
        : `${count} ${unit}${count === 1 ? "" : "s"} ago`;
    }

  return future ? "in a few seconds" : `${absoluteSeconds} seconds ago`;
}

function timezoneName(date: Date) {
  return new Intl.DateTimeFormat(undefined, { timeZoneName: "short" })
    .formatToParts(date)
    .find(({ type }) => type === "timeZoneName")?.value;
}

function withTimezone(value: string, date: Date, shown: boolean) {
  const name = shown ? timezoneName(date) : undefined;
  return name === undefined ? value : `${value} ${name}`;
}

function absolute(date: Date, format: TimestampFormat, timezone: boolean) {
  if (format === "system_date") return date.toLocaleDateString("en-CA");
  if (format === "system_time")
    return withTimezone(date.toLocaleTimeString("en-GB"), date, timezone);
  if (format === "system_date_time")
    return withTimezone(
      `${date.toLocaleDateString("en-CA")} ${date.toLocaleTimeString("en-GB")}`,
      date,
      timezone,
    );

  const options: Intl.DateTimeFormatOptions =
    format === "date"
      ? { year: "numeric", month: "short", day: "numeric" }
      : format === "date_long"
        ? { year: "numeric", month: "long", day: "numeric" }
        : format === "date_weekday"
          ? { year: "numeric", month: "short", day: "numeric", weekday: "short" }
          : format === "time"
            ? { hour: "numeric", minute: "2-digit" }
            : {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              };

  return new Intl.DateTimeFormat(undefined, {
    ...options,
    ...(timezone && (format === "date_time" || format === "time") ? { timeZoneName: "short" } : {}),
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
      ? Math.abs(now().getTime() - date().getTime()) / 1000 <=
        (props.autoThreshold ?? 7 * SECONDS_PER_DAY)
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
      styles.time,
      ...textStyles(
        props.type ?? "supporting",
        props.color ?? "secondary",
        props.size,
        props.weight,
      ),
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
