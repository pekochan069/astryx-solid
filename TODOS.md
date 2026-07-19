# TODOS

## Parity

### Cover parity failure paths

**What:** Add fixture-driven tests for invalid disposition ledgers and failed gate reports.

**Why:** The control plane's successful path is covered, but malformed evidence and downstream gate failures are not regression-tested.

**Context:** Exercise `packages/verification/src/parity.ts` validation errors, gate short-circuiting, failed per-gate and aggregate reports, and exit status 1.

**Effort:** M
**Priority:** P2
**Depends on:** None

## Completed
