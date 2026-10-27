## Purpose

Give the personal journal a recognizable Zhumao cat identity in browser tabs and saved device shortcuts using locally served icons.

## ADDED Requirements

### Requirement: Recognizable tab icon
The journal SHALL declare a scalable favicon and ICO fallback on every page using the shared shell. The icon SHALL depict a rounded ivory cat face with pointed ears and upward-looking eyes peeking from a deep teal rounded tile, without text or whiskers. At 16 pixels the design SHALL omit the nose and retain distinguishable ears and eyes.

#### Scenario: Opening a journal page
- **WHEN** a reader opens a page using the shared shell
- **THEN** its icon links resolve to valid local SVG and ICO assets with the peeking cat identity

### Requirement: Saved shortcut icons
The journal SHALL provide a 180-pixel Apple touch icon and 192- and 512-pixel manifest PNG icons with the same cat identity and a pale pink nose. Manifest and page theme colors SHALL match the journal's deep teal palette.

#### Scenario: Saving a shortcut
- **WHEN** a client reads the touch icon or manifest metadata
- **THEN** each declared icon resolves to a valid image at its declared size and the manifest retains its existing application name, start URL, and display mode
