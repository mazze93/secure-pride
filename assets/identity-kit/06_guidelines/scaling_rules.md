# Secure Pride — Scaling Rules

> Version 1.0 | Vector System

## Critical Rule

**You do not scale scratches linearly.**

The abrasion system uses tiered variants. Detail is removed discretely as size decreases.
At small sizes, meaning comes from form, not detail.

---

## Tier 1 — Large (512–1024px)

File: `01_primary/brass_master.svg`

- Full abrasion system (12 micro scratches + 3 deep abrasions)
- Full prism fragmentation (4 paths)
- Visible micro detail
- Inner shield frame visible

---

## Tier 2 — Medium (128–256px)

File: `02_scaled/medium_256.svg`

Changes from Tier 1:
- Scratch count reduced to ~50% (6 micro + 1 deep abrasion)
- Deepest/widest abrasions removed
- Only 1 prism fragment kept
- Stroke widths increased +20% for legibility

Do not:
- Use the Tier 1 file at 256px (scratches become illegible noise)
- Re-add scratches "to match Tier 1"

---

## Tier 3 — Small (32–64px)

Files: `02_scaled/small_64.svg`, `02_scaled/micro_32.svg`

Changes (non-negotiable):
- All scratches removed
- All prism paths removed
- Inner shield frame removed
- Keyhole simplified at 32px (tab removed, circle only)

Do not:
- Add any texture, scratch, or overlay at this tier
- Use Tier 1 or Tier 2 files at these sizes

---

## Stroke Width Scaling

Stroke widths are **not** calculated by ratio. They are set explicitly per tier:

| Element | Tier 1 (1024px) | Tier 2 (256px) | Tier 3 (64px) | Tier 3 (32px) |
|---|---|---|---|---|
| Micro scratches | 1.0–1.5px | 0.45–0.55px | — | — |
| Deep abrasions | 2.2–2.5px | 0.85px | — | — |
| Prism fragments | 2.0–3.5px | 1.1px | — | — |
| Shackle | 34px | 9px | 2.5px | 1.6px |

---

## Abrasion Directional Logic

All abrasion preserves this implied origin at every tier (where abrasion exists):

```
heart → outward → shield interior
```

Scratches are concentrated in the lower-left shield interior.
They are directional and non-uniform. They are not random noise.

---

## Mono System Scaling

Mono files (`03_mono/`) scale freely — no tier system applies.
They contain no abrasion, no prism, and no gradients.

---

## Export Notes

For raster exports (PNG), apply texture/grain in the export step only.
Do not embed raster texture in the SVG source.

PNG exports should be generated from the SVG at the target pixel density.
Raster files are not included in the source — they are derived on export.
