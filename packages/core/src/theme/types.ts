/** Color mode accepted by the Theme provider. */
export type ThemeMode = "system" | "light" | "dark";

/** Typography weight names accepted by theme authoring. */
export type FontWeight = "normal" | "medium" | "semibold" | "bold" | (string & {});

/** Optional typography role configuration. */
export interface TypographyRole {
  family?: string;
  fallbacks?: string;
  weight?: FontWeight;
}

/** Theme typography configuration. */
export interface TypographyConfig {
  body?: TypographyRole;
  heading?: TypographyRole;
  code?: TypographyRole;
}
