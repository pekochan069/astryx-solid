import { Dynamic, type JSX } from "@solidjs/web";
import { createContext, createMemo, useContext } from "solid-js";

import type { SyntaxThemeDefinition } from "./define-syntax-theme";

import { syntaxThemeStyle } from "./define-syntax-theme";

const SyntaxThemeContext = createContext<SyntaxThemeDefinition>();

export interface SyntaxThemeProps {
  theme: SyntaxThemeDefinition;
  children?: JSX.Element;
}

/** Applies syntax token variables to a subtree. */
export function SyntaxTheme(props: SyntaxThemeProps) {
  const style = createMemo(() => syntaxThemeStyle(props.theme));

  return (
    <SyntaxThemeContext value={props.theme}>
      <Dynamic component="div" style={style()}>
        {props.children}
      </Dynamic>
    </SyntaxThemeContext>
  );
}

/** Read the nearest syntax theme, if one exists. */
export function useSyntaxTheme(): SyntaxThemeDefinition | undefined {
  return useContext(SyntaxThemeContext);
}

export type { SyntaxThemeDefinition };
