## Purpose

Make the personal journal easy to discover and comfortable to read in Chinese across device sizes and themes, while retaining the site's existing article and activity records.

## ADDED Requirements

### Requirement: Blog-first homepage
The homepage SHALL prioritize published writing using actual article titles, metadata, and available covers, with latest writing and topic discovery before secondary activity summaries.

#### Scenario: Opening the journal
- **WHEN** a visitor opens the homepage
- **THEN** the newest article and recent posts link to their existing article URLs, useful real-tag topics are available, and dive, ski, and exploration destinations remain reachable with truthful summaries

### Requirement: Topic and archive discovery
The journal SHALL let readers navigate all articles chronologically through existing archive URLs and discover all articles matching a selected real tag through safely encoded topic links.

#### Scenario: Following a topic
- **WHEN** a reader follows a topic link
- **THEN** the topic view lists matching articles in newest-first order and provides a route back to the complete archive

#### Scenario: Reading an older archive page
- **WHEN** a reader follows pagination to an older page
- **THEN** the original article URLs, chronological ordering, and previous/next navigation remain usable on desktop and mobile

### Requirement: Responsive accessible journal shell
The site SHALL provide consistent paper/ink/ocean presentation in persisted light and default dark themes, visible keyboard focus, readable metadata, and a single primary set of section links per viewport.

#### Scenario: Mobile navigation
- **WHEN** the viewport is narrow
- **THEN** the mobile section navigation remains usable without duplicate desktop section links, horizontal page overflow, or content hidden under fixed controls

#### Scenario: Theme persistence
- **WHEN** a reader changes theme and navigates to another page
- **THEN** the selected theme persists and navigation, article content, and search remain legible

### Requirement: Comfortable article reading
Article views SHALL preserve content, metadata, hero assets, canonical and RSS URLs, search indexing, reading progress, sharing, and comments while improving Chinese line spacing, heading hierarchy, and narrow-screen overflow handling.

#### Scenario: Reading and finding an article
- **WHEN** a visitor reads an article or searches for existing text
- **THEN** article content and matching search destinations retain their existing URLs, code and tables remain accessible, and comments and sharing controls remain available

### Requirement: Activity feature preservation
Activity pages SHALL retain existing dive/ski/exploration records, maps, charts, filtering, and detail interactions under the shared editorial shell.

#### Scenario: Exploring activity records
- **WHEN** a visitor opens an activity page and uses its existing filters or map/detail controls
- **THEN** the existing datasets and interactive results remain available with cohesive headings and readable controls in both themes
