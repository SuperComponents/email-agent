# Tailwind CSS v4 – Quick‑Start & Feature Overview

> **Status**: Tailwind CSS v4.1 (stable, January 2025)

---

## 1. Why v4?

* **Lightning‑fast engine** – full builds ~5× faster, incremental rebuilds 100× faster thanks to the new Oxide core.  
* **Modern‑first CSS** – leverages cascade layers, `@property`, `color-mix()`, logical properties, etc.  
* **Zero‑config onboarding** – one npm install and a single `@import "tailwindcss";` in your stylesheet gets you running.

---

## 3. Configuration = CSS‑First 🌱

`tailwind.config.js` is optional. Define theme tokens inline:

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", sans-serif;
  --spacing: 0.25rem;
  --color-brand-500: oklch(0.65 0.2 200);
}

/* Custom utility */
@utilities {
  .content-auto {
    content-visibility: auto;
  }
}
```

* The `@theme` layer turns every variable into a custom property on `:root`.  
* Use `@utilities` or `@variants` to extend utilities/variants without JS.  
* Dynamic spacing, sizing (`w-31`, `mt-18`, etc.) now “just work”.

---

## 4. Automatic Content Detection

No more `content:[…]` array. Tailwind scans everything that **isn’t** in `.gitignore` and ignores binaries.  
Need extra sources? Add them explicitly:

```css
@source "../node_modules/@my/ui-lib";
```

---

## 5. New & Improved APIs

| Area | What’s New |
|------|------------|
| **Container Queries** | `@container` + `@min-md:` / `@max-lg:` variants in core. |
| **3D Transforms** | `rotate-x-*`, `translate-z-*`, `scale-z-*`, `perspective-*`. |
| **Gradients** | `bg-linear-*`, `bg-conic-*`, `bg-radial-*`, angle control (`bg-linear-45`), and interpolation modifiers (`/oklch`, `/srgb`). |
| **not-* Variant** | Style when something *doesn’t* match (`not-hover:bg-red-500`). |
| **CSS `@starting-style`** | Create enter/exit transitions without JS (`@starting-style:hover:opacity-100`). |
| **Color Palette** | Default palette rebuilt in OKLCH for wide‑gamut (P3) displays. |

---

## 6. Migration Tips from v3 → v4

1. **Upgrade tool** – run `npx tailwindcss@latest upgrade` to automate most fixes.  
2. Replace PostCSS plugin `tailwindcss` ➜ `@tailwindcss/postcss`.  
3. Remove `postcss-import` & `autoprefixer` (v4 handles them).  
4. Delete the `content` array; verify heuristic coverage or add `@source`.  
5. Rename `bg-gradient-*` utilities to the new `bg-linear-*` family.  
6. Verify any JS‑based config logic; port tokens to `@theme` where possible.

---

## 7. Browser Support

* **Fully supported**: Safari 16.4+, Chrome 111+, Firefox 128+, Edge 111+.  
* Older browsers gracefully degrade (layout fallback; some colors/shadows differ).

---

## 8. Learning Resources

* Official docs: <https://tailwindcss.com/docs>  
* Playground: <https://play.tailwindcss.com>  
* v3→v4 Upgrade guide: <https://tailwindcss.com/docs/upgrade-guide>  

Happy shipping! 🚀