# @metervara/edge-ticker

A scroll-linked WebGL ticker. A single fixed canvas maps styled text around the
viewport edge and bends the glyph strip through the rounded corners as the page
scrolls.

## Install

```bash
npm install github:metervara/edge-ticker#v1.2.1
```

There is no npm release — pin to a git tag. The built `dist/` is committed to the
repository so the package works straight from GitHub with no build step.

## Quick start

Add a full-viewport canvas as a fixed, non-interactive overlay, then bind the
ticker to it. The library sizes the canvas and listens for scroll/resize. It maps
the document's existing scroll range onto the full ticker travel — it adds no
scroll spacer, so the ticker completes exactly at the bottom of your content
(shorter pages simply move the ticker faster per pixel scrolled).

```html
<canvas id="edge-ticker" aria-hidden="true"></canvas>
```

```css
#edge-ticker {
  position: fixed;
  inset: 0;
  z-index: 10;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}
```

```typescript
import { createEdgeTicker } from "@metervara/edge-ticker";

const ticker = createEdgeTicker("#edge-ticker", {
  runs: [
    { text: " START ", background: "#111111", fontWeight: 900, punchOut: true },
    { text: "     This is the text that ends here.    ", fill: "#111111" },
    { text: " END ", background: "#ff6b57", fontWeight: 900, punchOut: true },
  ],
});
```

Every option is optional; omitted values fall back to `defaultOptions`.

## Responsive / fluid font sizing

The library is intentionally "dumb" about sizing: it exposes a single numeric
`font.size` (in CSS pixels) and does **no** internal responsive scaling. Fluid
typography is the consuming project's job. Compute the size however you like and
push it in with `update()`:

```typescript
const query = window.matchMedia("(max-width: 720px)");

const applySize = () => {
  ticker.update({ font: { size: query.matches ? 32 : 48 } });
};

applySize();
query.addEventListener("change", applySize);
```

`update()` re-merges options (nested `font` / `distortion` / `exitOverscan` /
`scrollPadding` are shallow-merged; `runs` is replaced when provided) and rebuilds
the layout. The ticker already rebuilds on `resize` on its own — you only need
`update()` when you want to change option *values*.

## API

```typescript
const ticker = createEdgeTicker(canvas, config);
```

- `canvas` — `HTMLCanvasElement` or a selector string.
- `config` — a partial `TickerOptions`. All fields are optional and merged over
  `defaultOptions`.

Returned `EdgeTicker` instance:

| Method | Description |
|---|---|
| `update(overrides)` | Merge new options in and rebuild (reloads font/texture if changed). |
| `refresh()` | Force a rebuild against current options and viewport. |
| `getOptions()` | Read-only snapshot of the resolved options. |
| `destroy()` | Remove listeners and stop rendering. |

## Options

```typescript
import { defaultOptions } from "@metervara/edge-ticker";
```

| Option | Type | Default | Description |
|---|---|---|---|
| `runs` | `TickerRun[]` | see below | Ordered styled spans that make up the ticker text. |
| `font` | `TickerFont` | Inter-ish 48px/700 | Family, fallback, `size`, `weight`, `style`, `lineHeight`, optional `url`. |
| `letterSpacing` | `number` | `1.5` | Default tracking between glyphs (px). |
| `stripPaddingX` / `stripPaddingY` | `number` | `28` / `18` | Padding around the rendered text strip. |
| `backgroundPaddingX` | `number` | `12` | Horizontal padding of run background pills. |
| `backgroundRadius` | `number` | `7` | Corner radius of run background pills. |
| `cornerRadius` | `number` | `86` | Centerline radius of the viewport-edge corners. |
| `edgePadding` | `number \| { x?, y?, top?, right?, bottom?, left? }` | `24` | Inset of the strip from the viewport edge. Use `x`/`y` for side vs top/bottom spacing, or individual sides for full control. |
| `direction` | `"forward" \| "reverse"` | `"reverse"` | `reverse` enters horizontally on the top edge; `forward` enters on the right edge. |
| `exitOverscan` | `{ start, end }` | `{ 0, -0.5 }` | Where the text sits at each end, normalized to strip length & relative to scroll direction. `0` = enters/exits exactly; negative pulls it *inside* (partially visible); positive overscans fully out. Default leaves it half-in at the end. |
| `repeatTexture` | `boolean` | `true` | Repeat the text texture inside the moving window. |
| `repeatWindowCopies` | `number` | `2` | How many copies of the text fit in the window. |
| `scrollLaps` | `number` | `1` | Visible ticker passes over the full page scroll. |
| `scrollPadding` | `{ start, end }` | `{ 0, 0 }` | Normalized dead-scroll before/after one pass. |
| `columnStep` / `rowStep` | `number` | `2` / `3` | Mesh slicing density along / across the strip. |
| `distortion` | `DistortionOptions` | see below | Per-fragment RG offset distortion. |

### Runs

```typescript
type TickerRun = {
  text: string;
  background?: string;   // rounded pill behind the run
  fill?: string;         // text color (default #111111)
  fontStyle?: "normal" | "italic" | "oblique";
  fontWeight?: string | number;
  mirrorX?: boolean;     // mirror this run horizontally inside its segment
  mirrorY?: boolean;     // mirror this run vertically inside its line box
  punchOut?: boolean;    // knock glyphs out of the background
  tracking?: number;     // per-run letter spacing
  underline?: boolean;
};
```

`mirrorX` and `mirrorY` can be combined. Mirroring keeps the run's measured
width and placement unchanged; only the rendered glyphs and underline are
flipped in the generated text texture.

### Custom font

Set `font.url` to a WOFF/WOFF2 file (served by your app). It is loaded via the
`FontFace` API before the first layout.

```typescript
createEdgeTicker("#edge-ticker", {
  font: { family: "MyFace", url: "/fonts/MyFace.woff2", weight: 700, size: 48 },
});
```

### Distortion

Distortion is entirely texture-driven — supply an RG map and it offsets the
glyphs per fragment (red along the ticker, green across it). There is no
procedural/math fallback: with no `textureUrl` the effect is inert.

```typescript
type DistortionOptions = {
  enabled: boolean;        // master switch (default true) — needs a texture to render
  repeatX: number;         // default 8
  repeatY: number;         // default 1
  scrollWithText: boolean; // false = anchored to edge, true = travels with text
  strengthAlong: number;   // px offset along the ticker (default 8)
  strengthAcross: number;  // px offset across the ticker (default 10)
  textureUrl?: string;     // RG map; red = along, green = across
};
```

```typescript
createEdgeTicker("#edge-ticker", {
  distortion: { textureUrl: "/textures/my-distortion-rg.png" },
});
```

## Development

```bash
npm install
npm run dev      # serve the example page (scrollable lorem ipsum) at :5173
npm run build    # build dist/ (ES module + .d.ts) via Vite
```

The example lives in `example/` and `index.html`.

## Releasing

```bash
npm run build
git add -A && git commit -m "…"
git tag vX.Y.Z
git push && git push --tags
```

Consumers then bump the tag in their `github:metervara/edge-ticker#vX.Y.Z`
dependency.
