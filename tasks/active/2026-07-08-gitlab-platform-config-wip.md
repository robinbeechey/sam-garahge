# GitLab Platform Config Foundation (WIP)

## Problem

SAM has a detailed GitLab integration plan in SAM idea `01KV7ZFD6HZS5N7J45VA798KN1`, but the implementation should start with the new DB-backed platform-level integration config model. GitLab OAuth app credentials should be configurable through first-run setup and superadmin platform config, with runtime D1 values overriding optional environment fallbacks.

This task is intentionally WIP. It must not deploy to staging and must not merge to production.

## Scope

This PR covers the first implementation slice only:

- Add GitLab OAuth app config to platform config resolution.
- Add optional env fallbacks for lockout/manual deployments.
- Add setup/admin API parsing, validation, and status reporting.
- Add the minimum GitLab login-provider wiring needed so GitLab-only setup does not complete into a lockout state.
- Add setup/admin UI fields for GitLab OAuth.
- Update public self-hosting/configuration/security docs.
- Add focused tests.

Out of scope for this WIP PR:

- GitLab project creation.
- GitLab repository provider model (`RepoProvider = gitlab`).
- GitLab task runner/VM clone/push support.
- GitLab merge request creation.
- GitLab webhooks/triggers.

## Research Findings

- Platform config lives in `apps/api/src/services/platform-config.ts`.
- Non-secret runtime values use `platform_settings`; secrets use encrypted `platform_credentials` with `credential_type='platform-integration'`.
- `/setup` and `/api/admin/platform-config` parse the same `PlatformIntegrationInput`.
- UI form is `apps/web/src/components/PlatformIntegrationConfigForm.tsx`; web API types are in `apps/web/src/lib/api/admin.ts`.
- Docs already describe GitHub/Google runtime config in:
  - `apps/www/src/content/docs/docs/reference/configuration.md`
  - `apps/www/src/content/docs/docs/guides/self-hosting.mdx`
  - `apps/www/src/content/docs/docs/architecture/security.md`
- Existing tests to extend:
  - `apps/api/tests/unit/services/platform-config.test.ts`
  - `apps/api/tests/unit/routes/setup.test.ts`
  - `apps/web/tests/playwright/platform-config-audit.spec.ts`

## Implementation Checklist

- [x] Extend API env typing and `.env.example` for optional `GITLAB_HOST`, `GITLAB_CLIENT_ID`, `GITLAB_CLIENT_SECRET`.
- [x] Extend `ResolvedPlatformConfig`, `PlatformConfigStatus`, and `PlatformIntegrationInput` with `gitlab`.
- [x] Store GitLab host/client ID in `platform_settings`; store client secret in encrypted `platform_credentials`.
- [x] Add `getGitLabOAuthConfig(env)` with runtime-first/env-fallback resolution.
- [x] Extend platform config validation for GitLab host/client fields.
- [x] Extend setup/admin route parsing for GitLab input.
- [x] Extend login provider status response with `gitlab`.
- [x] Wire GitLab into BetterAuth and login surfaces so configured GitLab OAuth is usable for sign-in.
- [x] Extend admin/setup web API types and platform config form UI.
- [x] Update public docs for optional GitLab config fallbacks and runtime config.
- [x] Add/extend tests.
- [x] Run UI visual audit for changed platform config form.

## Acceptance Criteria

- Superadmins can see GitLab OAuth config status alongside GitHub/Google.
- `/setup` and `/api/admin/platform-config` accept GitLab host/client ID/client secret.
- Runtime GitLab config overrides env fallback.
- Secret values are encrypted through the existing `platform_credentials` path.
- Setup completion can treat GitLab OAuth as a sign-in provider once configured.
- Existing GitHub and Google platform config behavior remains unchanged.
- The PR is opened as draft/WIP only, with no staging deployment and no merge.

## References

- SAM idea: `01KV7ZFD6HZS5N7J45VA798KN1`
- GitLab OAuth docs: https://docs.gitlab.com/integration/oauth_provider/
- GitLab OAuth token API: https://docs.gitlab.com/api/oauth2/
- `/do` constraint: WIP PR, no staging, no production merge.
