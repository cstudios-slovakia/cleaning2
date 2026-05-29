# Emerald Design System & Design Language

This document describes the design philosophy, layout principles, and styling strategies implemented in the Emerald system (v1.4.2). Use this as a blueprint to reproduce this high-fidelity interface across other projects.

---

## 👁️ 1. Core Philosophy

The design balances **ambient, premium depth** with **tactile operational constraints**:
1. **Glassmorphism & Depth:** Soft borders, subtle drop-shadows, and translucent surfaces let color layers bleed through.
2. **Context-Aware Colors:** UI components communicate state instantly (e.g., in-progress transitions, error warnings) using HSL-derived accent ranges.
3. **Responsive Tactility:** Layouts are tailored to their target screen size—mobile for operational cleaning tasks (large touch areas, bottom notch padding) and desktop/tablet for administration (wide grids, clear navigation bars).

---

## 🪐 2. Spatial Hierarchy & Layering

The interface is structured in three overlaying z-index panels:

```
┌─────────────────────────────────────────────────────────┐
│ [Z-100] overlays & MODALS (React Portals / Sideovers)   │
├─────────────────────────────────────────────────────────┤
│ [Z-10] CONTENT CONTROLLERS (Navigation, Header, Cards) │
├─────────────────────────────────────────────────────────┤
│ [Z-0] BACKGROUND LAYER (Dynamic Aurora, Marble Veins)   │
└─────────────────────────────────────────────────────────┘
```

1. **Background Layer (z-0):**
   * **Ambient Glow:** Driven by three radial blobs undergoing slow rotation and drift keyframe animations (`aurora-1`, `aurora-2`, `aurora-3`).
   * **Textures:** Subtle natural background textures, such as the Luxury Gold marble vein gradient overlays, to enhance tactile aesthetics.
2. **Surface Layer (z-10):**
   * Cards are clean, rounded elements (`rounded-2xl` to `rounded-3xl`) with solid fills overlaying the moving background, styled with thin, light borders (`border-slate-100`) to prevent contrast bleeding.
   * Headers and sidebars utilize backdrop filters (`backdrop-blur-md` with `bg-white/80`) to look organic and integrated.
3. **Portal Layer (z-100):**
   * Operations slideouts and overlay modals bypass local container restrictions using React Portals (`createPortal` to `document.body`), preventing overflow issues and clipping on mobile devices.

---

## 🎨 3. Theme Engine Architecture

The visual theme engine shifts color schemes transparently by remapping root CSS custom variables without altering Tailwind class names.

### The CSS Theme Mapping Strategy
We map the Tailwind `primary` palette dynamically to CSS custom variables inside `tailwind.config.js`:

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
        }
      }
    }
  }
}
```

### The Color Palette Blueprints

Inside `index.css`, themes are defined by target classes attached to the `body` element:

#### 1. Basic Theme (Clean Slate & Blue)
* A high-contrast, modern interface with slate surfaces and high-visibility digital blue highlights.
```css
:root {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-main: #f1f5f9;
}
```

#### 2. Emerald Theme (Rich Green)
* Warm, eco-friendly forest-mint styling that balances vibrant green alerts with soft, readable backgrounds.
```css
body.theme-emerald {
  --color-primary-50: #ecfdf5;
  --color-primary-100: #d1fae5;
  --color-primary-500: #10b981;
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  --bg-main: #f4fbf7;
  --bg-card: #ffffff;
  --text-main: #064e3b;
  --text-muted: #10b981;
  --border-main: #e6f4ea;
}
```

#### 3. LP Theme (Luxury Gold & Marble)
* A gold and warm sand palette that implements natural procedural marble gradients to build an elegant look.
```css
body.theme-lp {
  --color-primary-50: #fdfaf2;
  --color-primary-100: #fbf2db;
  --color-primary-500: #d4af37;
  --color-primary-600: #b8860b;
  --color-primary-700: #996515;
  --bg-main: #faf9f6;
  --bg-card: #ffffff;
  --text-main: #1c1917;
  --text-muted: #85754e;
  --border-main: #f3ede2;
  background-image: 
    radial-gradient(circle at 100% 150%, #f6f3ea 24%, #faf9f6 25%, #faf9f6 28%, #f6f3ea 29%, #faf9f6 36%, #f2efe4 40%, transparent 40%),
    radial-gradient(circle at 0% 0%, #faf9f6 0%, #faf9f6 3%, #f2efe4 8%, #faf9f6 8%, #faf9f6 12%, #f4f0e6 16%, transparent 16%) !important;
}
```

#### 4. Dark Theme (Rich Slate Navy)
* Avoids pure black (`#000000`) to limit eye strain, utilizing a rich navy-slate base (`#0f172a`) to maintain card depth and shadows.
```css
body.theme-dark {
  --color-primary-50: #1e293b;
  --color-primary-100: #334155;
  --color-primary-500: #3b82f6;
  --color-primary-600: #60a5fa;
  --color-primary-700: #93c5fd;
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-main: #334155;
}
```

---

## ⚡ 4. Layout & Mobile UX

When building functional checklists or operational flows, utilize these core layout elements:

1. **Large Target Checklist Areas:**
   * Give touch elements (checkboxes, inputs) generous click targets (minimum `44px` height).
   * Put active actions (like assignment submissions) behind physical constraints (e.g., disable completion until every single task checkbox returns `true`).
2. **Bottom Notch Padding (The `pb-32` Rule):**
   * On mobile devices, system notches or virtual home indicator bars overlay fixed controls. Always apply a generous bottom padding (`pb-32`) to the sliding container's content area, keeping buttons floating safely above physical interactions.
3. **Body Scroll Lock:**
   * When an overlay or slideover is initialized, hook a side-effect setting `document.body.style.overflow = 'hidden'`. Clear it when the overlay is dismissed to preserve scroll anchors on desktop and prevent scroll chaining on mobile.

---

## 💫 5. Tactile Micro-Animations

Incorporate these subtle transitions to keep the interface dynamic:

* **Spring Transitions:** Scale buttons slightly down on active click (`active:scale-95 transition-all duration-150`).
* **Aurora Swells:** Keep background blobs moving slowly. Using keyframe transforms (`translate` combined with small rotation shifts and `scale`) keeps gradients looking organic.
* **Selection Highlighting:** Setting active options apart with matching drop-shadow glows or subtle rings makes selections stand out cleanly.
