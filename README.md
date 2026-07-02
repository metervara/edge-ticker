# @metervara/edge-ticker

A scroll-linked WebGL ticker. A single fixed canvas maps styled text around the
viewport edge and bends the glyph strip through the rounded corners as the page
scrolls.

## Install

```bash
npm install github:metervara/edge-ticker#v1.0.0
```

There is no npm release — pin to a git tag. The built `dist/` is committed to the
repository so the package works straight from GitHub with no build step.

## Quick start

Add a full-viewport canvas as a fixed, non-interactive overlay, then bind the
ticker to it. The library sizes the canvas, listens for scroll/resize, and (by
default) appends an invisible runway to `<body>` so there is always enough scroll
distance to complete the ticker travel.

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
- `config` — a partial `TickerOptions`, plus an optional `runway`
  (`HTMLElement` or selector). If no runway is given, one is created and appended
  to `<body>`.

Returned `EdgeTicker` instance:

| Method | Description |
|---|---|
| `update(overrides)` | Merge new options in and rebuild (reloads font/texture if changed). |
| `refresh()` | Force a rebuild against current options and viewport. |
| `getOptions()` | Read-only snapshot of the resolved options. |
| `destroy()` | Remove listeners, drop the runway (if owned), stop rendering. |

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
| `edgePadding` | `number` | `24` | Inset of the path from the viewport edge. |
| `direction` | `"forward" \| "reverse"` | `"reverse"` | `reverse` enters horizontally on the top edge; `forward` enters on the right edge. |
| `exitOverscan` | `{ start, end }` | `{ 0, -0.5 }` | Normalized to strip length; negative pulls the path inside. |
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
  punchOut?: boolean;    // knock glyphs out of the background
  tracking?: number;     // per-run letter spacing
  underline?: boolean;
};
```

### Custom font

Set `font.url` to a WOFF/WOFF2 file (served by your app). It is loaded via the
`FontFace` API before the first layout.

```typescript
createEdgeTicker("#edge-ticker", {
  font: { family: "MyFace", url: "/fonts/MyFace.woff2", weight: 700, size: 48 },
});
```

### Distortion

```typescript
type DistortionOptions = {
  enabled: boolean;        // default true
  repeatX: number;         // default 8
  repeatY: number;         // default 1
  scrollWithText: boolean; // false = anchored to edge, true = travels with text
  size: number;            // fallback map size when no textureUrl (default 256)
  strengthAlong: number;   // px offset along the ticker (default 8)
  strengthAcross: number;  // px offset across the ticker (default 10)
  textureUrl?: string;     // optional RG map; red = along, green = across
};
```

With no `textureUrl`, a procedural RG map is generated, so distortion works with
zero assets.

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
