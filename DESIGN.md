---
name: genle_fractal
description: A compact procedural form laboratory
colors:
  bg: "#080808"
  panel: "#141414"
  ink: "#eeeeee"
  muted: "#aaaaaa"
  accent: "#b1ff49"
  line: "#303030"
  stage: "#000000"
  control: "#111111"
  hover: "#181818"
  stage-action: "#000000bb"
  track: "#555555"
  placeholder: "#999999"
typography:
  display:
    fontFamily: "StudioCode, \"Cascadia Code\", Consolas, \"Microsoft YaHei\", monospace"
    fontSize: "24px"
    fontWeight: 500
    letterSpacing: "-.03em"
  title:
    fontFamily: "StudioCode, \"Cascadia Code\", Consolas, \"Microsoft YaHei\", monospace"
    fontSize: "12px"
  body:
    fontFamily: "StudioCode, \"Cascadia Code\", Consolas, \"Microsoft YaHei\", monospace"
    fontSize: "12px"
    lineHeight: 1.5
  label:
    fontFamily: "StudioCode, \"Cascadia Code\", Consolas, \"Microsoft YaHei\", monospace"
    fontSize: "11px"
  button:
    fontFamily: "StudioCode, \"Cascadia Code\", Consolas, \"Microsoft YaHei\", monospace"
    fontSize: "11px"
  footer:
    fontFamily: "StudioCode, \"Cascadia Code\", Consolas, \"Microsoft YaHei\", monospace"
    fontSize: "10px"
rounded:
  square: "0px"
spacing:
  action-gap: "4px"
  heading-gap: "6px"
  field-gap: "8px"
  timeline-gap: "10px"
  phone-margin: "12px"
  compact-gap: "16px"
  workbench-gap: "24px"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "4px 10px"
  button-hover:
    backgroundColor: "{colors.hover}"
    textColor: "{colors.accent}"
  button-pressed:
    textColor: "{colors.accent}"
  stage-action:
    backgroundColor: "{colors.stage-action}"
    typography: "{typography.label}"
  numeric-input:
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    padding: "3px 4px"
    width: "84px"
  parameter-group:
    typography: "{typography.button}"
    padding: "10px 0"
  range-thumb:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.square}"
    width: "2px"
    height: "14px"
---
# Design System: genle_fractal

## Overview

**Creative North Star: "Procedural Form Laboratory"**

A procedural form laboratory expressed through a compact code interface. Black and gray surfaces, near-white text and fluorescent green control signals surround a dominant live render. Local JetBrains Mono makes names, parameters and status read as one coherent instrument.

The user's approved desktop and English mobile layouts define this studio direction. The rendered form supplies depth; flat controls and thin boundaries support precise adjustment. Chinese and English share the same hierarchy, while saved names remain personal data.

**Key Characteristics:**
- Black and gray instrument surfaces
- Fluorescent green control signals
- Local monospace type and compact fields
- Live form supplies depth
- Peer Chinese and English modes

## Colors

A neutral instrument frame with one fluorescent accent. Tokens above are extracted from dist/uber.css; shorthand source hex values are expanded without changing the color.

### Primary
- **Fluorescent Signal** (accent): active controls, focus outlines, slider thumbs, numeric inputs and code decoration.

### Neutral
- **Studio Black** (bg), **Panel Gray** (panel), and **Render Black** (stage): page, error-panel and canvas surfaces.
- **Near White** (ink) and **Technical Gray** (muted): primary information and quieter metadata.
- **Boundary Gray** (line): crisp one-pixel separation.
- **Control Black** (control), **Hover Gray** (hover) and translucent **Stage Action Black** (stage-action): control states and canvas overlays.
- **Track Gray** (track) and **Placeholder Gray** (placeholder): sliders/scrollbars and optional-name hints.

**The Signal Rule.** Reserve fluorescent green for interface signals; preserve the render's independent material colors.

## Typography

Local JetBrains Mono is registered as StudioCode from studio-code.woff2. Fallbacks are Cascadia Code, Consolas, Microsoft YaHei and monospace. Chinese glyphs may use the system fallback. All numerical text uses tabular figures.

- Display: 24px / 500 / -.03em; 20px at widths at or below 1050px.
- Title: 12px parameter heading; compact group headings and controls use 11px.
- Body: 12px / 1.5 default; explanatory disclosure uses 11px / 1.8.
- Label: 11px fields, stage overlays and status. Timeline output becomes 10px on phones.
- Footer: 10px metadata. A single family carries the whole studio hierarchy.

**The Language Parity Rule.** Chinese and English use the same visual hierarchy; saved preset names remain verbatim.

## Layout

Desktop .studio is a two-column grid: minmax(0,1fr) and 350px, with a 24px gap and 16px 24px 10px margins. At 1600px the dock becomes 390px. At 1050px it becomes 320px with 16px gap and 12px 16px margins.

The stage is calc(100dvh - 178px), minimum 380px. The dock is sticky at 16px, height calc(100dvh - 62px), minimum 380px. Preset tools are fixed above a flexing independently scrollable parameter area; local preset chips wrap within an 88px maximum height.

At 760px the layout stacks with 12px margins. Stage is 52dvh, minimum 300px. Parameter dock is 80dvh, minimum 360px, with 18px top margin and 8px sticky offset. Ticker is hidden. Numerical fields retain an 84px input column beside their sliders; small controls support dense parameter editing.

Playback, cycle duration, PNG and WebM share one compact row below the stage. Right-side parameter groups are separated by 1px gray rules. Quality selection and the timeline sit inside the stage near its bottom edge; desktop uses one row, phones stack quality above the timeline. View clipping is exposed only in the render stability parameter group.

There is no top navigation. Language/reference actions sit beside the studio title; archive gallery and companion nodes are separate surfaces.

## Elevation & Depth

No decorative shadows. Four corner markers frame only the render stage. Quiet field borders, shared preset outlines and unframed actions establish a restrained hierarchy. The render's existing lights/materials create the depth.

**The Flat Instrument Rule.** Let the live form supply depth; keep the surrounding controls flat.

## Shapes

Only the main stage uses four 9px 「」-style corner markers. Ordinary actions have no borders, text fields and selects retain subtle complete borders, numeric values use only a faint bottom rule, and each saved preset shares one enclosing border across its actions. Range tracks are 1px high with 2px × 14px green vertical handles; a 6px gap on either side follows each handle. Default buttons have a 26px minimum height; selected preset outlines and text become green. Phone view and preset actions use 28px minimum height.

## Components

- Compact buttons: 4px 10px padding, 11px type, 150ms background/color transition. Hover changes background and text; pressed controls use green text; saved presets share one quiet selected outline.
- Symbol actions: preserve an accessible label/title. Green play control and language control are concise signals.
- Numeric/range fields: 11px labels and inputs; numeric input is 84px wide with 3px 4px padding. Label, slider and value share one row.
- Parameter disclosure: 11px summary with 10px vertical padding; green +/− shows closed/open state.
- Local preset actions: wrap compact name/update/remove controls; long names truncate visually but preserve source text.
- Code ticker: decorative 1400ms character frames; hide on phones and freeze while hidden or reduced motion is requested. Cursor uses a 1.2s stepped blink.
- Focus: 1px green outline with 3px offset on interactive controls/canvas. Reduced motion removes cursor/button animation.
- Rendering motion: default 20-second continuous fixed dual-phase loop; preset transitions use 800ms smoothstep interpolation. Timeline scrubbing continues playback from the chosen position; explicit pause controls allow still inspection; ultra quality pauses for still work.
- Bilingual UI: persist genle-fractal-language, translate dynamic status, and retain uber-user-presets-v1 and original user names.

## Do's and Don'ts

### Do
- Keep the live render visually dominant.
- Use the studio tokens and local code font.
- Retain visible focus, accessible symbol names and dynamic status.
- Preserve user preset names and local storage compatibility.
- Keep parameter scrolling and language switching usable on phones.

### Don't
- Do not reintroduce gallery navigation into the studio.
- Do not use the rendered blue/gold materials as interface accents.
- Do not add ornamental card shadows or rounded control pills.
- Do not translate user-entered preset names.
- Do not change renderer lighting or materials for an interface revision.

## Live phase instruments

Read-only LoopPI and LoopPI2 outputs sit diagonally opposite: upper left and lower right on desktop, staggered upper corners on phones. Fluorescent sign/integer glyphs (38px desktop, 25px phone) contrast with white fractional glyphs (20px / 13px). Values use the same referencePhases function as the renderer, update with animation/timeline/parameter changes, and retain four decimals. Thin axes and phase labels carry the experimental instrument character without card borders. Frequent changes do not announce through live regions.

## Fullscreen, backup and quality

The fullscreen icon requests fullscreen for the complete render stage, retaining view controls, live phase readouts, quality, and timeline. Escape or the same fullscreen button returns to the studio. A stacked-file download icon beside JSON export saves every local preset, including camera and material/light parameters. The import action accepts the collection backup and merges entries by ID after validation. The boot description is removed. Quality has five tiers: draft (legacy 0), standard (1), enhanced (1.5), fine (2), ultra still (3). Enhanced renders at 1.25× base resolution, 320 main ray steps, and an intermediate distance threshold; fine and ultra preserve their previous behavior and IDs.

## Global accent preference

A small color-swatch button beside the language switch opens a compact color/hex editor with reset. The chosen accent applies through --accent to all interface signals, selected preset outlines and the light-direction marker, without changing rendered materials or light colors. The default remains #b1ff49; the browser stores the preference as genle-fractal-accent. Bulk preset download is the leftmost action in the preset toolbar.
