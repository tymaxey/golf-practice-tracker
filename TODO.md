# TODO

Deferred items, ordered by interest. Move to BRIEF Decisions log when shipped.

## Branding refresh — new icon + wordmark

Replace the placeholder flag-pin icon with the new "G" glyph and add the wordmark to the in-app header.

**Assets needed in `public/`:**
- `icon.svg` — new glyph (replaces existing). Sources on Desktop: `icon-v1.svg`.
- `logo.svg` — wordmark for the header. Sources on Desktop: `logo-v1.svg`.
- `icon-192.png` (192×192) — Android.
- `icon-512.png` (512×512) — Android.
- `icon-512-maskable.png` (512×512, glyph centered inside inner ~80% safe zone) — Android adaptive icons crop ~10% on each edge, so the "G" must not touch the edge.
- `apple-touch-icon.png` (180×180) — iOS home screen.

PNGs can either be exported from the design tool (preferred — better art-direction over the maskable safe zone) or rasterized from `icon.svg` with `rsvg-convert` (already installed at `/opt/homebrew/bin/rsvg-convert`).

**Code change:**
- `src/App.tsx:401` — swap the header `<img src="/icon.svg" ... className="h-10 w-10 rounded-lg" />` to use `/logo.svg` with `h-10 w-auto` and drop `rounded-lg` (wordmark already has clean edges). Consider whether to keep the icon.svg as a separate small mark elsewhere.

No manifest/`vite.config.ts` changes needed — paths stay `/icon.svg` etc.
