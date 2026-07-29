import { createContext, useContext } from "solid-js";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export interface ButtonGroupContextValue {
  readonly orientation: ButtonGroupOrientation;
  readonly isDisabled: boolean;
}
export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);
export function useButtonGroup() {
  return useContext(ButtonGroupContext);
}
