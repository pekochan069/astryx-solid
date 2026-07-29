import { createContext } from "solid-js";

export type FormLayoutDirection = "vertical" | "horizontal" | "horizontal-labels";

export interface FormLayoutContextValue {
  readonly direction: FormLayoutDirection;
}

export const FormLayoutContext = createContext<FormLayoutContextValue>({
  direction: "vertical",
});
