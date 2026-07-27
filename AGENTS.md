## Rules

- DO NOT modify any package versions or install new packages without confirmation
- When creating new pr, use `./.github/pull_request_template.md`
- Divide commits based on packages, and divide more when needed
- Refer to `https://github.com/solidjs/solid/tree/next/documentation/solid-2.0` when things are unclear

- Avoid type assertion whenever possible
  - Due to the limition of solid.js, using type assertion inside of `Show` and `Switch` components for type narrowing are allowed
- Make sure functions don't exceed more than 100 lines, and 150 lines for components
- use native `textContent` prop for dynamic text contents instead of putting it as children for optimization
- DO NOT use early returns in Solid.js components
- DO NOT create components inside components unless inner components is a simple one to two line component with less than 2 things relying on outer component's states
- Put spaces between logical blocks

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for `pekochan069/astryx-solid`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five canonical label names. See `docs/agents/triage-labels.md`.

### Domain docs

Domain documentation uses a single-context layout. See `docs/agents/domain.md`.

## Project structure

- `packages/core`: core astryx-solid package
- `packages/build`: build utilities for solid-astryx
- `packages/verification`: testing and parity checking
- `apps/docs`: documentation site
