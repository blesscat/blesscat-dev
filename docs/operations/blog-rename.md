# Blog identity migration

Recorded 2026-10-27. The project is `blesscat/blog`; its public site remains
<https://blog.blesscat.dev> and its display branding remains `blesscat.dev`.
UI changes are delivered independently.

## Verified external identity

| Resource | Verified result |
| --- | --- |
| GitHub repository | `https://github.com/blesscat/blog`, ID `1199463855` |
| Git origin | `git@github.com:blesscat/blog.git` (shared by linked worktrees) |
| Baseline main | `30d92f79ae989e776f3f44ae39287f39081dbb1b`, still accessible after rename |
| Cloudflare Pages | Name `blog`, unchanged project ID `f5fd66eb-d59d-4a2b-b4a6-afdb9a611491` |
| Pages source | GitHub owner `blesscat`, unchanged repository ID `1199463855` |
| Pages production | Branch `main`, command `pnpm run build`, output `dist`, root empty |
| Domains | `blog.blesscat.dev` and retained provider hostname `blesscat-dev.pages.dev` |
| Current production deployment | `dddb2fc0-bfcd-407f-8f95-f31a7152023e`, successful before this change |
| Public probes after external rename | Homepage and `/rss.xml` both HTTP 200 |
| GitHub Actions | Zero workflows; CI/CD is the existing Pages GitHub integration |

GitHub was renamed through its existing repository endpoint. Pages was renamed
through PATCH on its existing project, after checking the project ID, source
repository ID, and custom domain. No replacement project or Worker was created.

Cloudflare's response and subsequent GET still report `source.config.repo_name`
as `blesscat-dev`, despite the PATCH requesting `blog`; the dashboard displays
the same stale source label. Its numeric GitHub repository identity remains
correct. The coordinator approved retaining that label if the new PR's exact
pushed SHA receives a GitHub-triggered Pages preview/check. Verify that check
at publication and report any failure as blocked. A source-label refresh remains
an external follow-up; do not disconnect a working integration just to change
the label. The provider hostname also stayed unchanged after the in-place rename.

`wrangler.jsonc` now describes this existing static Pages service using
`name: blog` and `pages_build_output_dir: ./dist`. The old server entrypoint
referenced an uninstalled adapter; its Worker assets and observability settings
did not describe the verified Pages pipeline. The compatibility date is retained.
Do not use `wrangler deploy` to create a separate Worker.

## Active automation and paths

The owner checkout remains `/home/blesscat/doc/blesscat-dev`. Its active linked
checkouts include `.worktree/blesscat-dev/tope` and
`.worktree/blesscat-dev/blog-editorial-ui`. Git's worktree inventory and Orca's
registered worktree records both use these absolute paths.

Read-only inspection of the local Hermes job registry verified:

- Job `1ced6d10523f` is enabled and contains four occurrences of the owner
  checkout path, including content/image destinations.
- Job `5ede94795531` is enabled and contains one occurrence of the owner path.
- Neither job hardcodes the old GitHub repository URL; every old-name occurrence
  in these jobs is part of an existing absolute filesystem path.

These external job records were left unchanged because their paths are still
valid. Their next scheduled execution has not been observed in this rename run;
configuration inspection is not proof of a future successful publish. No tokens,
job prompt bodies, or other private automation data are copied into this record.
The pipeline design document now links to its collector prompt relative to the
repository instead of embedding the owner checkout path.

## Coordinated directory and Orca follow-up

Directory migration is deferred while agents run. Orca repository
`a0d456dd-fa68-414b-be7e-a45a3389dc27` still stores the original owner path,
display name, and cached remote identity `github.com/blesscat/blesscat-dev`;
this cache is distinct from the verified Git origin. Its project/worktree records
also retain the original project identity. The installed `repo set` only exposes
external-worktree visibility; `worktree set` exposes display names, links,
comments, status, and lineage, but no supported path/remote migration operation.
No internal Orca metadata was edited.

In a maintenance window after all agents have settled:

1. Pause the two publishing jobs and confirm no agent or build uses these paths.
2. Capture Git worktree inventory and Orca workspace/session metadata. Confirm a
   supported Orca re-registration or migration procedure before moving paths;
   do not manually rewrite its internal database.
3. Coordinate the owner checkout move to `/home/blesscat/doc/blog` and any linked
   worktree moves with Git's worktree repair/move procedure and Orca's supported
   workflow. Account for linked-worktree `.git` pointers and the common Git dir.
4. Update the two Hermes jobs' path references together, including content/image
   destinations, and verify each destination exists and origin is `blesscat/blog`.
5. Reopen managed workspaces, verify branch and PR links and cached repository
   identity, run an authorized end-to-end publishing check, then resume jobs.

This is follow-up work, not a completed directory rename. An arbitrary folder
rename while these agents are live would break their working directories and
automation references.

## Validation and publication boundary

The trusted dependency source is the unchanged `pnpm-lock.yaml` and the baseline
manifest plus the package-name edit. `pnpm install --frozen-lockfile` succeeded.
The legacy `package-lock.json` is already inconsistent with the manifest:
`npm ci` fails on the baseline as well as this branch. Only its two project-name
fields are changed here; repairing that unused lockfile is separate work.

Existing tests: 42 passed across four files. Both static builds passed and emitted
1,100 files with identical paths. Of these, 1,099 were byte-identical, including
RSS, sitemaps, articles, and assets; `explore/index.html` differed only in Astro
island UID attributes. Normalizing those generated UID values made its complete
document identical. No application/content/social/comment configuration changed.
Strict OpenSpec validation is required, followed by an independent reviewer pair,
explicit spec sync, and archive. The PR is not a production deployment; `main`
is not merged or pushed directly by this workflow. The final PR body records
the commit, review provenance, checks, and exact-head Pages result.

References: [Pages project PATCH API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/edit/)
and [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).
