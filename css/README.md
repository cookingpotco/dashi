# @cookingpot/dashi-css

Tailwind v4 build and `className` helpers for [Dashi](https://dashi.run) apps.

## Setup

1. Add `npm:tailwindcss@4` and `jsr:@cookingpot/dashi-css` to the app
   `deno.json`, with `"nodeModulesDir": "auto"` so `@import "tailwindcss"`
   resolves.
2. Create `styles.css`:

```css
@import "tailwindcss";
@source "./**/*.{ts,tsx}";
```

3. Add tasks:

```json
"css": "deno run -A jsr:@cookingpot/dashi-css",
"css:watch": "deno run -A jsr:@cookingpot/dashi-css --watch"
```

4. In `dev.ts`, import `buildCss` and call
   `buildCss({ root: import.meta.dirname, watch: true, signal })`. Wait until
   `generated/styles.json` exists, then spawn
   `deno run -A --watch main.ts --watch generated/styles.json`.
5. In the layout, set
   `<link rel="stylesheet" href={stylesheetHref(import.meta.dirname)} />`.
6. Serve hashed CSS at `GET /generated/:file` with `generatedFile(root)`.
7. Compose classes with `cn(...)`.

Use `className` only. Core `dashi` does not compile CSS.
