export {
  ALL_SYNTAX_KEYS,
  defineSyntaxTheme,
  resolveSyntaxTokenForMode,
  syntaxThemeStyle,
  syntaxThemeToCSS,
} from "./define-syntax-theme";
export type {
  SyntaxThemeInput,
  SyntaxThemeTokenKey,
  SyntaxThemeTokenMap,
  SyntaxThemeTokenInput,
  SyntaxTokenValue,
} from "./define-syntax-theme";

export { SyntaxTheme, useSyntaxTheme } from "./syntax-theme";
export type { SyntaxThemeDefinition } from "./syntax-theme";

export { syntaxTokenDefaults } from "./tokens";
export type { SyntaxTokenName } from "./tokens";
