function mergeSafeRel(rel?: string) {
  const tokens = new Set((rel ?? "").split(/\s+/).filter(Boolean));
  tokens.add("noopener");
  tokens.add("noreferrer");
  return [...tokens].join(" ");
}

/** Adds browser isolation tokens required by a new-tab link. */
export function computeTargetAndRel(target?: string, rel?: string) {
  const safeRel = target === "_blank" ? mergeSafeRel(rel) : rel;

  return { target, rel: safeRel };
}
