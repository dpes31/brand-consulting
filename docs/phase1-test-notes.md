# Phase 1 PDF Regression Notes

## User test findings

- Native browser print produced A4 landscape pages, not 16:9.
- Ctrl+P printed only the viewer shell / first page in some cases.
- Export PDF produced all 23 pages but scaled 16:9 content into A4, creating white bands.
- STP slide (page 21) clipped its lower positioning block.

## Root cause

The browser print engine selected A4 (`841.92 x 594.96pt`) while the required PowerPoint-style page is `960 x 540pt`. Scaling a 16:9 slide into A4 landscape necessarily creates blank bands or clipping.

## Retest implementation

- Replaced iframe print calls with a deterministic PDF builder using a `960 x 540pt` MediaBox.
- Intercepted Ctrl/Cmd+P in the report viewer and routed it to the same PDF builder.
- Rasterizes each slide at 2560 x 1440 and places it full-bleed on each 16:9 PDF page.
- Strengthened overflow detection with descendant-bound checks.
- Added a final slide-body scale-to-fit fallback for dense slides such as STP.

## Acceptance criteria

- PDF page size: exactly `960 x 540pt`.
- Page count equals slide count.
- No white bands.
- No left/right clipping.
- STP page 21 includes the full TO-BE positioning block.
- `main` remains unchanged until explicit approval.
