# Zhumao journal icons

`public/favicon.svg` is the small, nose-free artwork. `zhumao-large.svg` adds the pale pink nose for saved shortcuts. Both use the journal's deep teal and ivory palette. Keep silhouette and eyes in sync when editing either source.

Reproduce PNGs with the existing Astro dependency's Sharp renderer (after `pnpm install --frozen-lockfile`), and package the small PNGs with ImageMagick:

```sh
node --input-type=module <<'JS'
import { createRequire } from 'node:module';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.resolve('astro'));
const sharp = require('sharp');
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'zhumao-icons-'));
for (const [size, name] of [[180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
  await sharp('design/icons/zhumao-large.svg').resize(size, size).png().toFile(`public/${name}`);
}
const frames = [];
for (const size of [16, 32, 48]) {
  const frame = join(temporaryDirectory, `${size}.png`);
  await sharp('public/favicon.svg').resize(size, size).png().toFile(frame);
  frames.push(frame);
}
execFileSync('convert', [...frames, 'public/favicon.ico']);
JS
```

Use Sharp for SVG rasterization: ImageMagick's built-in SVG renderer can mishandle this clipping path. ImageMagick is used only to package already-rendered PNGs into ICO.

Inspect 16/32/48px at actual size and the larger icons against both light and dark backgrounds. The tile has transparent rounded corners and is a general-purpose icon, not a maskable icon. Existing browser favicon caches may need a fresh tab/profile to display updates.
