# Full-App UX/UI Audit — 2026-07-17

**Task:** 01KXR2G078WK4DSCS2NQ5D5PKE — 5-hour full review of every page in `apps/web` on mobile (375px) and desktop (1280px), including modals/dialogs, with implemented fixes for everything found.

**Method:** ran the entire existing Playwright audit corpus (78 spec files, ~1,400 tests, mobile + desktop, dark + light) against a local preview build of `main` (d6b3d08db) to produce a full *before* screenshot set; added a new sweep spec (`uncovered-pages-audit.spec.ts`) for the five pages that had zero coverage; reviewed the corpus surface-by-surface; implemented fixes on this branch; rebuilt and re-captured *after* shots for every changed surface; validated each before/after pair side by side and with a low-context reviewer subagent.

**Screenshots:** branch [`sam/ux-audit-screenshots-2026-07-17`](https://github.com/raphaeltm/simple-agent-manager/tree/sam/ux-audit-screenshots-2026-07-17) (`before/` and `after/`). All inline images below reference that branch.

---

## Summary of findings

| # | Surface | Severity | Issue | Action |
|---|---------|----------|-------|--------|
| F1 | Project chat (primary surface) | High | Floating session header overlaps message content — "● Active" collides with message text | Fixed |
| F2 | Shared `Tabs` (settings, admin, project settings, workspace) | Medium | Overflowing tab strips give no scroll affordance; active tab can load off-screen | Fixed |
| F3 | Projects list card | Medium | `" ws"` blank count, "1 sessions", dangling "·" with empty repo, metadata crushed to "w.." | Fixed |
| F4 | Node detail | Low | Hand-rolled outline-danger button diverges from the app-wide danger style | Fixed |
| F5 | Project onboarding wizard | Low | "Step N of M" stated twice within ~60px on mobile | Fixed |
| F6 | Triggers page + shared Button | Medium | Button labels wrap mid-word ("New / Trigger", "View / History") | Fixed |

(Full detail per finding below; pages reviewed with no findings are listed in the "Reviewed — no changes needed" section.)

---

## Findings and fixes

_(populated per finding as fixes land)_

---

## Reviewed — no changes needed

_(populated at the end)_

---

## Coverage notes

- New Playwright coverage added: `/workspaces` (populated + empty), `/workspaces/new`, `/projects/:id/activity`, `/projects/:id/notifications`, `/projects/:id/settings/runtime` (`apps/web/tests/playwright/uncovered-pages-audit.spec.ts`).
- Pre-existing audit-spec failures found during the corpus run are triaged in "Audit-spec debt" below.

## Audit-spec debt

_(populated after failure triage)_
