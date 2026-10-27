## Why

The journal has no declared favicon and its manifest references missing icons. A recognizable peeking Zhumao cat will connect browser tabs and saved shortcuts to the journal's existing cat identity.

## What Changes

- Add a compact SVG favicon and multi-resolution ICO fallback depicting an ivory cat peeking from a deep teal rounded tile.
- Add larger PNG touch and manifest icons with a pale pink nose.
- Declare icons in the shared layout and align manifest/theme colors with the journal palette.

## Capabilities

### New Capabilities
- `journal-icons`: Recognizable, locally served journal icons for tabs and saved shortcuts.

### Modified Capabilities
None.

## Impact

Static assets in public/, shared Layout.astro metadata, and manifest.json. No runtime dependency, navigation, content, or publishing identity changes.
