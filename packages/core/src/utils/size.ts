import type { SizeValue } from "../types/size-value.types";

export function size(value: SizeValue) {
  return typeof value === "number" ? `${value}px` : value;
}
