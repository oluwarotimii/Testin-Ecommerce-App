# Carbon — Design Style Reference

> **Unofficial, community-authored reference.** Compiled by [designsystems.one](https://www.designsystems.one). Not affiliated with, endorsed by, or sponsored by IBM. "Carbon" and related marks belong to their respective owners. This document describes publicly observable style attributes in original words — it contains no copied documentation, logos, icon artwork, or original token files. Always defer to the official source for canonical, current values.

**System:** Carbon
**Owner:** IBM
**Official documentation:** https://www.carbondesignsystem.com/
**Visual character:** Square-cornered, grid-obsessed IBM engineering: Plex everywhere, one electric blue, and a spacing scale you can set a watch by.

---

## Summary

Open, enterprise-grade system with serious engineering depth.

_Confidence: high. Values are drawn from well-documented public token references._

## Color tokens

| Color | Value | CSS variable | Role |
| --- | --- | --- | --- |
| Interactive / Blue 60 | `#0f62fe` | `--cds-interactive` | Primary interactive color — buttons, links, focus |
| Text Primary / Gray 100 | `#161616` | `--cds-text-primary` | Primary body text |
| Background | `#ffffff` | `--cds-background` | Default page background (White theme) |
| Layer 01 / Gray 10 | `#f4f4f4` | `--cds-layer-01` | First layered surface (tiles, fields) |
| Border Subtle / Gray 20 | `#e0e0e0` | `--cds-border-subtle` | Hairline borders and dividers |
| Text Secondary / Gray 70 | `#525252` | `--cds-text-secondary` | Secondary text |
| Support Error / Red 60 | `#da1e28` | `--cds-support-error` | Errors and destructive actions |
| Support Success / Green 50 | `#24a148` | `--cds-support-success` | Success states |
| Support Warning / Yellow 30 | `#f1c21b` | `--cds-support-warning` | Warnings |

## Typography

- **Display:** IBM Plex Sans — weights 300, 400, 600 — `'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif`
- **Body:** IBM Plex Sans — weights 400, 600 — `'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif`
- **Mono:** IBM Plex Mono — weights 400 — `'IBM Plex Mono', Menlo, monospace`

## Type scale

| Step | Size | Line height |
| --- | --- | --- |
| heading-07 | `54px` | `64px` |
| heading-05 | `32px` | `40px` |
| heading-03 | `20px` | `28px` |
| body-02 | `16px` | `24px` |
| body-01 | `14px` | `20px` |
| label-01 | `12px` | `16px` |

## Spacing

Base unit: `8px (with 2px mini-units)`

Scale: `2px` · `4px` · `8px` · `12px` · `16px` · `24px` · `32px` · `40px` · `48px`

## Corner radius

| Name | Value |
| --- | --- |
| default | `0` |
| field (v11 optional) | `4px` |

## Elevation / shadows

| Name | Value |
| --- | --- |
| overlay | `0 2px 6px rgba(0,0,0,0.3)` |

## Motion

| Name | Value |
| --- | --- |
| fast-01 | `70ms` |
| moderate-02 | `240ms` |
| standard-easing | `cubic-bezier(0.2, 0, 0.38, 0.9)` |

## Quick start (CSS)

```css
/* Carbon — illustrative tokens, restated as CSS custom properties.
   Unofficial reference by designsystems.one; values are indicative, not
   canonical. Official reference: https://www.carbondesignsystem.com/ */

:root {
  /* Color */
  --cds-interactive: #0f62fe; /* Primary interactive color — buttons, links, focus */
  --cds-text-primary: #161616; /* Primary body text */
  --cds-background: #ffffff; /* Default page background (White theme) */
  --cds-layer-01: #f4f4f4; /* First layered surface (tiles, fields) */
  --cds-border-subtle: #e0e0e0; /* Hairline borders and dividers */
  --cds-text-secondary: #525252; /* Secondary text */
  --cds-support-error: #da1e28; /* Errors and destructive actions */
  --cds-support-success: #24a148; /* Success states */
  --cds-support-warning: #f1c21b; /* Warnings */

  /* Typography */
  --font-display: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'IBM Plex Mono', Menlo, monospace;

  /* Type scale */
  --text-heading-07: 54px /* line-height 64px */;
  --text-heading-05: 32px /* line-height 40px */;
  --text-heading-03: 20px /* line-height 28px */;
  --text-body-02: 16px /* line-height 24px */;
  --text-body-01: 14px /* line-height 20px */;
  --text-label-01: 12px /* line-height 16px */;

  /* Spacing */
  --space-1: 2px;
  --space-2: 4px;
  --space-3: 8px;
  --space-4: 12px;
  --space-5: 16px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;

  /* Radius */
  --radius-default: 0;
  --radius-field-v11-optional-: 4px;

  /* Elevation */
  --shadow-overlay: 0 2px 6px rgba(0,0,0,0.3);

  /* Motion */
  --motion-fast-01: 70ms;
  --motion-moderate-02: 240ms;
  --motion-standard-easing: cubic-bezier(0.2, 0, 0.38, 0.9);
}
```

## Origin

IBM open-sourced Carbon in 2017. It absorbed lessons from earlier IBM design languages and aligns with the IBM Design Language. Carbon ships across web (React, Angular, Vue, Svelte, vanilla), iOS, and Android.

## Governance

IBM design and engineering teams own the system; community contributions accepted through GitHub. Strong RFC discipline and explicit deprecation policy. Open-source with a public roadmap.

## Known for

- Strong cross-framework support — Carbon ships first-class libraries for React, Angular, Vue, Svelte, and Web Components.
- Public design tokens with a clear primitive-vs-semantic structure.
- Detailed motion language with documented duration and easing tokens.

## Underrated

- The data visualization tokens and component family (Carbon Charts) are an underused asset.
- Carbon's grid system is genuinely flexible and well-documented.

## Watch out for

- Visual identity is intentionally enterprise — bringing Carbon to a consumer product means significant retheming.
- API surface area is large; full adoption is a real commitment.

## Components worth studying

- **DataTable** — Sortable, filterable, expandable grid that scales to enterprise data volumes.
- **Notification** — Toast and inline notifications with clear severity and dismissal patterns.
- **Tile** — Composable surface with selectable, expandable, and clickable variants.

## When to choose Carbon

Pick Carbon if you're building enterprise tools that need to look serious, work across many frameworks, and survive a security review. Don't pick it for a consumer-facing brand-led product.

## Apply this style with an AI tool

Paste this into your AI coding assistant as a direction, then iterate:

> Design in the spirit of Carbon by IBM — Open, enterprise-grade system with serious engineering depth. Character: Square-cornered, grid-obsessed IBM engineering: Plex everywhere, one electric blue, and a spacing scale you can set a watch by. Use a primary colour near #0f62fe, the typeface "IBM Plex Sans" (or a close equivalent), corner radius around 0, a spacing rhythm on a 8px (with 2px mini-units) base. Lean into what it's known for: Strong cross-framework support — Carbon ships first-class libraries for React, Angular, Vue, Svelte, and Web Components. Match the intent, not the pixels; adapt it to my product rather than cloning it.

## Official references

- [Carbon docs](https://www.carbondesignsystem.com/)
- [Carbon on GitHub](https://github.com/carbon-design-system/carbon)
- [Tokens reference](https://www.carbondesignsystem.com/guidelines/color/tokens/)

---

_Generated by [designsystems.one](https://www.designsystems.one/design-systems/carbon-design) — a catalogue of public design systems. Style facts are reported for reference and education; adapt them to your own product. Report issues or takedown requests via the site._
