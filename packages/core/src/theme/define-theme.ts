import type { TypographyConfig } from "./types";

import { toLightDark, type LightDarkValue } from "./light-dark";
import { syntaxTokenDefaults } from "./syntax/tokens";
import {
  colorDefaults,
  spacingDefaults,
  sizeDefaults,
  borderDefaults,
  radiusDefaults,
  shadowDefaults,
  durationDefaults,
  easeDefaults,
  transitionDefaults,
  typographyDefaults,
  textSizeDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
} from "./tokens.stylex";

/** Token value shared by theme and syntax authoring. */
export type TokenValue = string | LightDarkValue;

/** CSS property overrides for one component rule. */
export type StyleOverrides = Record<string, string | Record<string, string>>;

/** Component rules keyed by `base` or visual-prop selectors. */
export type ComponentStyleMap = Record<string, Record<string, StyleOverrides>>;

/** All token names shipped by Core. */
export type CoreTokenName = keyof typeof tokenDefaults;
export type TokenName = CoreTokenName;

/** Input accepted by {@link defineTheme}. */
export interface DefineThemeInput {
  name: string;
  extends?: DefinedTheme;
  typography?: TypographyConfig;
  tokens?: Partial<Record<TokenName, TokenValue>>;
  components?: ComponentStyleMap;
}

/** Theme ready for a Theme provider or CSS generation. */
export interface DefinedTheme {
  name: string;
  tokens: Record<string, string>;
  components?: ComponentStyleMap;
  __inputTokens?: Partial<Record<string, TokenValue>>;
  __built?: true;
}

/** Flat default token map. */
export const tokenDefaults: Record<string, string> = {
  ...colorDefaults,
  ...spacingDefaults,
  ...sizeDefaults,
  ...borderDefaults,
  ...radiusDefaults,
  ...shadowDefaults,
  ...durationDefaults,
  ...easeDefaults,
  ...transitionDefaults,
  ...typographyDefaults,
  ...textSizeDefaults,
  ...fontWeightDefaults,
  ...typeScaleDefaults,
  ...syntaxTokenDefaults,
};

function resolveToken(value: TokenValue): string {
  return typeof value === "string" ? value : toLightDark(value);
}

function mergeComponents(
  base?: ComponentStyleMap,
  override?: ComponentStyleMap,
): ComponentStyleMap | undefined {
  if (!base && !override) return undefined;

  const result: ComponentStyleMap = {};

  for (const [component, rules] of Object.entries(base ?? {})) {
    result[component] = { ...rules };
  }

  for (const [component, rules] of Object.entries(override ?? {})) {
    result[component] ??= {};
    for (const [selector, styles] of Object.entries(rules)) {
      result[component][selector] = {
        ...result[component][selector],
        ...styles,
      };
    }
  }

  return result;
}

function fontFamily(role?: { family?: string; fallbacks?: string }): string | undefined {
  if (!role?.family) return undefined;

  const family = role.family.includes(" ") ? `"${role.family}"` : role.family;

  return role.fallbacks ? `${family}, ${role.fallbacks}` : family;
}

function typographyTokens(config?: TypographyConfig): Record<string, string> {
  if (!config) return {};

  const body = fontFamily(config.body);
  const heading = fontFamily(config.heading) ?? body;
  const code = fontFamily(config.code);

  return {
    ...(body ? { "--font-family-body": body } : {}),
    ...(heading ? { "--font-family-heading": heading } : {}),
    ...(code ? { "--font-family-code": code } : {}),
  };
}

/** Create a theme by merging defaults, inherited values, and explicit overrides. */
export function defineTheme(input: DefineThemeInput): DefinedTheme {
  if (!/^[A-Za-z0-9_-]+$/.test(input.name)) {
    throw new Error(`Invalid theme name: ${input.name}`);
  }

  const tokens = { ...input.extends?.tokens, ...typographyTokens(input.typography) };

  for (const [name, value] of Object.entries(input.tokens ?? {})) {
    if (value !== undefined) tokens[name] = resolveToken(value);
  }

  return {
    name: input.name,
    tokens,
    components: mergeComponents(input.extends?.components, input.components),
    __inputTokens: { ...input.extends?.__inputTokens, ...input.tokens },
  };
}

function cssName(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function cssValue(value: string | Record<string, string>): string {
  return typeof value === "string" ? value : "";
}

function selectorForRule(component: string, rule: string): string {
  const root = `.astryx-solid-${component}`;

  if (rule === "base") return root;

  const attrs = rule.split("+").map((part) => {
    const [name, value] = part.split(":");
    return `[data-${cssName(name)}="${value.replaceAll('"', '\\"')}"]`;
  });

  return `${root}${attrs.join("")}`;
}

function ruleText(selector: string, styles: StyleOverrides): string {
  const declarations = Object.entries(styles)
    .filter(([, value]) => typeof value === "string")
    .map(([name, value]) => `  ${cssName(name)}: ${cssValue(value)};`)
    .join("\n");

  return declarations ? `${selector} {\n${declarations}\n}` : "";
}

/** Generate CSS for theme tokens and component overrides. */
export function generateThemeCSS(theme: DefinedTheme): string {
  const tokenRules = Object.entries(theme.tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  const themeSelector = `[data-astryx-solid-theme="${theme.name}"]`;
  const componentRules = Object.entries(theme.components ?? {}).flatMap(([component, rules]) =>
    Object.entries(rules).flatMap(([selector, styles]) => {
      const componentSelector = `${themeSelector} ${selectorForRule(component, selector)}`;
      const base = ruleText(componentSelector, styles);
      const pseudoRules = Object.entries(styles)
        .filter(([, value]) => typeof value !== "string")
        .map(([pseudo, value]) =>
          ruleText(`${componentSelector}${pseudo}`, value as Record<string, string>),
        )
        .filter(Boolean);
      return [base, ...pseudoRules].filter(Boolean);
    }),
  );

  const mediaRules = [
    `[data-astryx-solid-theme="${theme.name}"] [data-astryx-solid-media="dark"] {\n  color-scheme: dark;\n  --color-text-primary: var(--color-on-dark);\n  --color-icon-primary: var(--color-on-dark);\n  --color-accent: var(--color-on-dark);\n}`,
    `[data-astryx-solid-theme="${theme.name}"] [data-astryx-solid-media="light"] {\n  color-scheme: light;\n  --color-text-primary: var(--color-on-light);\n  --color-icon-primary: var(--color-on-light);\n  --color-accent: var(--color-on-light);\n}`,
  ];

  return [
    `[data-astryx-solid-theme="${theme.name}"] {\n${tokenRules}\n}`,
    ...mediaRules,
    ...componentRules,
  ]
    .filter(Boolean)
    .join("\n");
}
