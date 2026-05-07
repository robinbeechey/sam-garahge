# Stabilize Evaluation PRs #923, #924, #925

**Created**: 2026-05-07
**Source**: SAM Task 01KR0SPSWYJZPY6R46MSZMH9Z6
**Type**: PR hygiene / stabilization (no runtime changes)

## Problem

Three evaluation-related PRs from a prior orchestration need hygiene fixes:
1. PR #923 is one commit behind main (branched before `bb5509d9`)
2. PR #924 has a failing "Specialist Review Evidence" CI check due to `needs-human-review` label
3. All three need verified clean state before human review

## Research Findings

### PR #923 (`sam/establish-document-cloudflare-staging-01kr0d`)
- CI: all green, merge state CLEAN
- Concern about deleting `convert-eval-backlog-to-task-packets.md` was incorrect — the PR only moves its own task file from backlog to archive
- Merge base is `4f31a885`, one commit behind current main `bb5509d9`
- Fix: rebase onto main for clean merge base

### PR #924 (`sam/convert-merged-2026-05-01kr0d`)
- CI: "Specialist Review Evidence" FAILURE — caused by `needs-human-review` label
- Label is intentional: PR contains 20 task packets requiring human review before use
- The CI script at `scripts/quality/check-specialist-review-evidence.ts:150-156` fails immediately on this label
- The review table itself has DEFERRED status which is acceptable (line 205-207)
- Fix: label should stay (correct per policy); update PR body to explain the CI failure

### PR #925 (`sam/implement-low-risk-phase-01kr0f`)
- CI: all green, merge state CLEAN
- Already based on current main — no rebase needed

## Implementation Checklist

- [ ] Rebase PR #923 branch onto current main
- [ ] Push rebased #923 branch
- [ ] Update PR #924 body to clarify that CI failure is intentional review gate
- [ ] Verify CI re-runs on rebased #923
- [ ] Report final states of all three PRs

## Acceptance Criteria

- [ ] PR #923 merge base is current main HEAD
- [ ] PR #923 CI re-runs and passes
- [ ] PR #924 `needs-human-review` label remains with clear explanation
- [ ] PR #925 confirmed clean (no changes needed)
- [ ] No PRs merged
- [ ] No runtime behavior changes
