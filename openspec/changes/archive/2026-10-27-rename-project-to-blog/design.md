## Context

See proposal.md for motivation. Baseline is `30d92f79ae989e776f3f44ae39287f39081dbb1b`; the existing clean non-main branch is reused. Astro builds static files to `dist`, with `site: https://blog.blesscat.dev`. GitHub has no Actions workflows; Cloudflare Pages provides the successful deployment check. The existing Wrangler file references an absent Cloudflare adapter server entrypoint and does not describe this static pipeline.

Live Pages project `blesscat-dev` has ID `f5fd66eb-d59d-4a2b-b4a6-afdb9a611491`, GitHub source ID `1199463855`, production branch `main`, build `pnpm run build`, output `dist`, and custom domain `blog.blesscat.dev`. Hermes jobs `1ced6d10523f` and `5ede94795531` reference the owner checkout. Orca tracks the owner and two linked worktrees by absolute paths and repository ID.

## Goals / Non-Goals

**Goals:** Change repository and deployment identity in place, capture external evidence, and keep active publishing dependencies valid.

**Non-Goals:** UI changes, URL migrations, social identity changes, dependency upgrades, production content changes, merges, or active directory moves.

## Decisions

- Rename GitHub through its existing repository endpoint, verify the numeric ID, then change shared origin. Redirect reliance alone would leave stale automation identity.
- Rename Pages through its existing project PATCH endpoint only after asserting its ID, source ID, and custom domain. Preserve source configuration and request the updated repository name. The provider may ignore source-label edits; the coordinator authorized retaining that stale display label when the unchanged repository-ID integration is verified by an exact-head webhook preview, with the residual label reported explicitly. Never create a replacement service. Re-read state after each mutation and verify the preview check on the pushed PR head.
- Replace the obsolete Worker entrypoint/assets configuration with Pages `pages_build_output_dir: ./dist` and the verified service name. Keep the compatibility date. A simple Worker-name edit could accidentally target a separate service.
- Use a relative link in the pipeline design doc. Keep active absolute filesystem references in external jobs because their directories still exist. Document the actual paths and migration procedure rather than replacing them with nonexistent `blog` paths.
- Do not change Orca's internal metadata directly. Its repository and worktree records embed active absolute paths and project identity; inspect supported CLI controls and defer any unsupported or unsafe filesystem migration to a maintenance window.
- Install from the unchanged trusted lockfile, run existing tests and build, and compare generated output against a baseline build. No new source-inspection tests are needed for this metadata change.

## Risks / Trade-offs

- [Pages project rename may affect the provider hostname] → Preserve the custom domain, verify its response, and record actual provider hostname behavior.
- [GitHub App source names can lag a rename] → Patch and re-read the existing source, then require a new PR-head Pages check as trigger evidence.
- [Concurrent automation or agents rely on old paths] → Preserve directories and external job paths until all agents stop and the migration can be verified together.
- [PR changes are not production deployment] → Report preview and production identities separately; do not merge.

## Migration Plan

Capture IDs and safe configuration, rename GitHub, update origin, patch Pages in place, update tracked metadata and documentation, run checks, and obtain the independent reviewer pair. Explicitly sync specs and archive before committing and opening a non-draft PR. Verify the PR-head deployment trigger and retained custom domain. To roll back an external rename, patch the same identities back and restore origin; never create/delete projects as a rollback shortcut. Directory migration remains a separately coordinated follow-up.
