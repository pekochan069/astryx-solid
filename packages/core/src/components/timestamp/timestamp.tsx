import * as stylex from "@stylexjs/stylex";
import { createEffect, createMemo, createSignal, omit, Show } from "solid-js";

import type { BaseProps } from "../../base-props";
import type { TextColor, TextSize, TextType, TextWeight } from "../text/text";

import { stylexProps } from "../../stylex";
import { colorVars } from "../../theme/tokens.stylex";
import { setElementRef } from "../../utils/set-element-ref";
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

const MINUTE = 60;
const HOUR = 3_600;
const DAY = 86_400;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;
const DEFAULT_AUTO_THRESHOLD = 7 * DAY;
const FUTURE_SKEW_TOLERANCE = 30;

type AbsoluteFormat = Exclude<TimestampFormat, "relative" | "auto">;

const styles = stylex.create({
  time: {
    display: "inline",
    fontFamily: "inherit",
    fontStyle: "normal",
    fontSize: "inherit",
    lineHeight: "inherit",
    color: "inherit",
    fontWeight: "inherit",
  },
  focus: {
    outline: { default: null, ":focus-visible": `2px solid ${colorVars["--color-accent"]}` },
    outlineOffset: { default: "0", ":focus-visible": "2px" },
  },
});

function parseValue(value: string | number) {
  return new Date(typeof value === "number" && value < 1e12 ? value * 1000 : value);
}

function relative(date: Date, now: Date) {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (Math.abs(seconds) < 10) return "now";

  if (seconds < 0) {
    const amount = Math.abs(seconds);

    if (amount <= FUTURE_SKEW_TOLERANCE) return "now";
    if (amount < MINUTE) return "in a few seconds";
    if (amount < HOUR) {
      const count = Math.floor(amount / MINUTE);
      return `in ${count} minute${count === 1 ? "" : "s"}`;
    }
    if (amount < DAY) {
      const count = Math.floor(amount / HOUR);
      return `in ${count} hour${count === 1 ? "" : "s"}`;
    }
    if (amount < MONTH) {
      const count = Math.floor(amount / DAY);
      return `in ${count} day${count === 1 ? "" : "s"}`;
    }
    if (amount < YEAR) {
      const count = Math.floor(amount / MONTH);
      return `in ${count} month${count === 1 ? "" : "s"}`;
    }

    const count = Math.floor(amount / YEAR);
    return `in ${count} year${count === 1 ? "" : "s"}`;
  }

  if (seconds < MINUTE) return `${seconds} seconds ago`;
  if (seconds < HOUR) {
    const count = Math.floor(seconds / MINUTE);
    return `${count} minute${count === 1 ? "" : "s"} ago`;
  }
  if (seconds < DAY) {
    const count = Math.floor(seconds / HOUR);
    return `${count} hour${count === 1 ? "" : "s"} ago`;
  }
  if (seconds < 2 * DAY) return "yesterday";
  if (seconds < MONTH) return `${Math.floor(seconds / DAY)} days ago`;
  if (seconds < YEAR) {
    const count = Math.floor(seconds / MONTH);
    return `${count} month${count === 1 ? "" : "s"} ago`;
  }

  const count = Math.floor(seconds / YEAR);
  return `${count} year${count === 1 ? "" : "s"} ago`;
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

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatSystemDate(date: Date) {
  return `${String(date.getFullYear()).padStart(4, "0")}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatSystemDateTime(date: Date) {
  return `${formatSystemDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatSystemTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function isAbsoluteFormat(format: TimestampFormat): format is AbsoluteFormat {
  return format !== "relative" && format !== "auto";
}

function absolute(date: Date, format: AbsoluteFormat, timezone: boolean) {
  if (format === "system_date") return formatSystemDate(date);
  if (format === "system_time") return withTimezone(formatSystemTime(date), date, timezone);
  if (format === "system_date_time")
    return withTimezone(formatSystemDateTime(date), date, timezone);

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

function fullAbsolute(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function liveInterval(seconds: number) {
  const amount = Math.abs(seconds);
  if (amount < MINUTE) return 1_000;
  if (amount < HOUR) return 30_000;
  if (amount < DAY) return 60_000;
  return 300_000;
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
    "ref",
    "xstyle",
    "class",
    "style",
  );

  const [now, setNow] = createSignal(new Date());
  const date = createMemo(() => parseValue(props.value));
  const valid = createMemo(() => !Number.isNaN(date().getTime()));
  const effective = createMemo<TimestampFormat>(() => {
    if (props.format !== undefined && props.format !== "auto") return props.format;

    return Math.abs(now().getTime() - date().getTime()) / 1000 <=
      (props.autoThreshold ?? DEFAULT_AUTO_THRESHOLD)
      ? "relative"
      : "date_time";
  });
  const relativeSeconds = createMemo(() => (now().getTime() - date().getTime()) / 1000);
  const showTooltip = createMemo(() => props.hasTooltip !== false && effective() === "relative");
  const text = createMemo(() => {
    if (!valid()) return "";

    const format = effective();
    return format === "relative"
      ? relative(date(), now())
      : isAbsoluteFormat(format)
        ? absolute(date(), format, props.isTimezoneShown ?? false)
        : "";
  });
  const absoluteText = createMemo(() => (valid() ? fullAbsolute(date()) : ""));

  const [warned, setWarned] = createSignal(false);
  createEffect(
    () => ({ valid: valid(), warned: warned(), value: props.value }),
    ({ valid: isValid, warned: hasWarned, value }) => {
      if (!isValid && !hasWarned) {
        setWarned(true);
        console.warn(
          `Timestamp: could not parse value ${JSON.stringify(value)} as a date. Rendering nothing.`,
        );
      }
    },
  );
  createEffect(
    () => ({
      isLive: props.isLive,
      valid: valid(),
      format: effective(),
      seconds: relativeSeconds(),
    }),
    ({ isLive, valid: isValid, format, seconds }) => {
      if (!isLive || !isValid || format !== "relative") return;

      const timer = setInterval(() => setNow(new Date()), liveInterval(seconds));
      return () => clearInterval(timer);
    },
  );

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
      showTooltip() && styles.focus,
      props.xstyle,
    ),
  );

  return (
    <Show when={valid()}>
      <time
        {...rest}
        {...theme()}
        ref={(element) => setElementRef(props.ref, element)}
        datetime={date().toISOString()}
        aria-label={effective() === "relative" ? absoluteText() : undefined}
        title={showTooltip() ? absoluteText() : undefined}
        tabindex={showTooltip() ? "0" : undefined}
        class={[theme().class, style().class, props.class]}
        style={{ ...style().style, ...props.style }}
        data-style-src={style()["data-style-src"]}
        textContent={text()}
      />
    </Show>
  );
}
