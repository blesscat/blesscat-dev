## Why

The project is now a blog, and the user selected `blog` as its repository and deployment name. Align the project identity while preserving the public site and its publishing pipeline.

## What Changes

- Rename GitHub `blesscat/blesscat-dev` to `blesscat/blog`, preserving repository identity, and update the shared Git remote.
- Rename package metadata to `blog` and align Cloudflare configuration with the verified existing Pages service, updating that service in place where supported.
- Replace the obsolete absolute documentation reference with a repository-relative reference; document active automation paths and the safe, deferred directory migration.
- Preserve `blog.blesscat.dev`, article URLs, RSS, canonicals, `blesscat.dev` display branding, content, comments, and social identities. UI design is a separate change.

## Capabilities

### New Capabilities

- `project-identity`: Repository and deployment identity continuity, with stable public publishing and explicit automation migration evidence.

### Modified Capabilities

None; this project has no existing main specifications.

## Impact

Package metadata, Wrangler configuration, pipeline documentation, GitHub repository settings, Cloudflare Pages integration, and local Git remote. Active Orca checkout paths and Hermes job paths remain in place until a coordinated maintenance window; unsafe moves are documented follow-up work. No application code or dependencies change.
