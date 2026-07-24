export function matchesInventoryPattern(value: string, pattern: string) {
  return pattern.startsWith("=") ? value === pattern.slice(1) : value.includes(pattern);
}
