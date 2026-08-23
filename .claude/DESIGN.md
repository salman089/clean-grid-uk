---
name: Lumina Grid
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#adc6ff'
  on-tertiary: '#002e6a'
  tertiary-container: '#71a1ff'
  on-tertiary-container: '#00367a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 16px
---

## Brand & Style
The design system is engineered for high-performance environmental monitoring. The brand personality is authoritative, transparent, and precise. It targets energy analysts and sustainability officers who require rapid cognitive processing of complex datasets. 

The aesthetic follows a **Modern Corporate** approach with **Minimalist** influences. It prioritizes a "Data-First" philosophy, where UI chrome is receded to allow vibrant status indicators to lead the visual hierarchy. The emotional response is one of calm control amidst high-stakes climate data, achieved through a structured dark-theme environment that reduces eye strain during long-term monitoring.

## Colors
The palette is rooted in a deep slate foundation to provide maximum contrast for functional color signaling.

- **Primary (Emerald):** Represents "Clean" energy and optimal grid states. Use for positive trends and primary actions.
- **Warning (Amber):** Represents "High Carbon" intensity or system stress. Use sparingly for alerts and cautionary data points.
- **Background (#0F172A):** The base layer for the entire application.
- **Surface (#1E293B):** Used for cards, navigation rails, and section grouping to create subtle depth.
- **Text Hierarchy:** High-contrast White (#F8FAFC) for titles and primary data; Soft Gray (#94A3B8) for labels, metadata, and supporting descriptions.

## Typography
This design system utilizes **Inter** for all UI elements due to its exceptional legibility in low-light environments and variable font performance. 

For tabular data and specific carbon intensity readings, a secondary monospaced font (JetBrains Mono) is recommended to ensure numerical alignment and rapid scanning. Use `label-md` for all axis labels and category headers to maintain a disciplined, professional structure. Scale down headlines for mobile devices, ensuring `display-lg` never exceeds `28px` to maintain screen efficiency.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop to maintain data integrity across wide views, transitioning to a fluid single-column stack for mobile.

- **Grid:** 12-column layout with 16px gutters.
- **Density:** High density is achieved through a 4px baseline grid. Padding within data cards should remain tight (12px to 16px) to maximize the information visible above the fold.
- **Breakpoints:**
  - Mobile: < 600px (4 columns, 16px margins)
  - Tablet: 600px - 1024px (8 columns, 24px margins)
  - Desktop: > 1024px (12 columns, 32px margins)

## Elevation & Depth
Depth is conveyed through **Tonal Layers** rather than heavy shadows. This maintains a clean, professional "instrument panel" feel.

- **Level 0 (Background):** #0F172A. Used for the main canvas.
- **Level 1 (Cards/Panels):** #1E293B. Used for the primary content containers.
- **Level 2 (Dropdowns/Modals):** #334155. Accompanied by a subtle, large-radius shadow (0px 10px 25px rgba(0,0,0,0.3)) to provide focus.
- **Outlines:** Instead of shadows, use 1px solid borders in #334155 to define card boundaries. This keeps the UI sharp and avoids the "muddy" look often found in dark-mode shadows.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a subtle modern touch without feeling overly "consumer-grade" or playful. 

- Standard components (Inputs, Buttons, Cards) use a 4px corner radius.
- System status "Pills" (Status indicators) use a fully rounded (999px) radius to distinguish them from interactive buttons.
- Graphs and chart bars should use sharp or 2px rounded corners to maintain mathematical precision.

## Components
- **Buttons:** Primary buttons use the Emerald Green (#10B981) with white text. Secondary buttons use a ghost style (transparent fill with #334155 border).
- **Data Cards:** Use a 1px border (#334155) and no background blur. Card headers should have a subtle bottom border to separate the title from the data visualization.
- **Inputs:** Darker than the surface (#0F172A) with a 1px border. Focus state should use a 2px Emerald Green glow.
- **Status Chips:** Small, uppercase labels. "Low Carbon" uses a 10% opacity green background with 100% opacity green text.
- **Charts:** Use thin stroke weights (1.5px) for line charts. Grid lines within charts should be #1E293B (matching the surface color) to remain unobtrusive.
- **KPI Metrics:** Large numerical displays using the `mono-data` typeface to ensure absolute clarity on shifting values.