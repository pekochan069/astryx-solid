## Rules

- DO NOT modify any package versions or install new packages without confirmation
- Avoid type assertion
- Make sure functions don't exceed more than 100 lines, and 150 lines for components
- When creating new pr, use `./.github/pull_request_template.md`
- Divide commits based on packages, and divide more when needed

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
