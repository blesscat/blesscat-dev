# Project identity Specification

## Purpose

Keep the blog's repository and deployment identity consistent while preserving public publishing and the existing automation environment.

## Requirements

### Requirement: Blog repository identity
The project MUST use GitHub repository `blesscat/blog`, retain its repository identity and history, use `blog` as its package name, and configure its local origin to the renamed repository.

#### Scenario: Repository rename
- **WHEN** the repository is renamed
- **THEN** its numeric repository ID and commit history remain unchanged and origin resolves to `blesscat/blog`

### Requirement: Deployment continuity
The rename MUST preserve the existing Cloudflare Pages project identity, production branch, build settings, and custom domain. Deployment integration MUST resolve to the renamed GitHub repository by its unchanged repository ID, and configuration MUST describe the existing static Pages service without creating a replacement Worker or Pages project.

#### Scenario: In-place deployment rename
- **WHEN** the existing Pages project supports an in-place rename
- **THEN** its ID remains unchanged, its name becomes `blog`, its source retains the same GitHub repository ID, and `blog.blesscat.dev` remains attached; a stale provider source label MUST be reported explicitly and the integration verified by an exact-head GitHub-triggered preview

#### Scenario: External verification unavailable
- **WHEN** any external rename or trigger cannot be verified
- **THEN** the delivery report explicitly identifies the blocked step and does not claim successful deployment

### Requirement: Public publishing compatibility
The site MUST retain `https://blog.blesscat.dev`, existing article paths, RSS and canonical URLs, `blesscat.dev` display branding, article content, comment configuration, and social account identities throughout the rename.

#### Scenario: Public site output
- **WHEN** the renamed project is built
- **THEN** its public routes, feed links, canonical links, content, comments, and display branding remain equivalent to the baseline

### Requirement: Safe local automation migration
The rename MUST preserve active checkout paths and working automation references while Orca agents run. Documentation MUST use repository-relative source references where possible and record the verified automation dependencies and remaining directory migration steps without exposing secrets.

#### Scenario: Active managed checkouts
- **WHEN** the repository and deployment are renamed while agents are active
- **THEN** checkout directories and their metadata remain intact, active jobs continue referencing existing paths, and a coordinated directory migration is documented as follow-up
