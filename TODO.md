# TODO

Deferred items, ordered by interest. Move to BRIEF Decisions log when shipped.

## Branding refresh — replace interim wordmark + P with final glyph

Currently shipping interim branding: in-app header shows "PROTOCOL" wordmark (Avenir Next Medium, accent-500), and `public/icon.svg` + the four PWA PNGs are a centered "P" in the same green on `#0a0a0a`.

When the final assets are ready, replace:
- `public/icon.svg` — final glyph. Reference designs on Desktop: `icon-v1.svg`.
- `public/logo.svg` — final wordmark. Reference designs on Desktop: `logo-v1.svg`.
- `public/icon-192.png` (192×192).
- `public/icon-512.png` (512×512).
- `public/icon-512-maskable.png` (512×512, glyph inside inner ~80% safe zone — Android adaptive icons crop ~10% per edge).
- `public/apple-touch-icon.png` (180×180).

PNGs can be exported from the design tool (preferred — direct control over the maskable safe zone) or rasterized from `icon.svg` with `rsvg-convert` (installed at `/opt/homebrew/bin/rsvg-convert`).

**Code change for the wordmark swap:**
- `src/App.tsx` `AppHeader` — currently renders a styled `<span>PROTOCOL</span>`. Swap back to `<img src="/logo.svg" ... className="h-10 w-auto" />` (no `rounded-lg`).

No manifest/`vite.config.ts` changes needed — paths stay `/icon.svg` etc.
