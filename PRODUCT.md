# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Dependency-free static HTML/CSS/JavaScript with WebGL. Source modules live in src; Node builds the static dist output. Formula kernels and GPU utilities are shared while studio/node compatibility profiles remain distinct. The studio uses locally hosted JetBrains Mono.

## Users
People exploring procedural forms, tuning geometry, lights and materials, and saving views.

## Product Purpose
genle_fractal is an independent real-time procedural studio. The live form takes priority, with compact controls and no gallery navigation.

## Capabilities and Constraints
- Main studio: /, served from the single dist/index.html entry point.
- Adjustable UBER BULB geometry, camera, view clipping, dual materials and studio lights; PNG, WebM and JSON export/import.
- Chinese/English covers static controls, accessibility labels and dynamic status. Language persists in genle-fractal-language.
- User preset names remain verbatim. Newly saved unnamed presets receive a name in the active language.
- Preserve uber-user-presets-v1. Local preset switching uses a 0.8-second eased transition while animation continues.
- Default opening: enhanced quality on phones, fine on desktop, adaptive rendering off, and a 20-second fixed dual-phase animation. Ultra quality is a still-work mode.
- Browser WebGL uses finite ray marching; it is not Octane path tracing. Speed and WebM availability depend on browser/device.
- GitHub Pages deployment publishes the static files in `dist`; custom domain: `art.genle.cc`.

## Rendering Provenance
Core geometry comes from user-provided UBER BULB V3.0 Octane OSL, original formula © 2020 Machina-Infinitum. The supplied GIF lasts 4.8 seconds; the studio defaults to a seamless 20-second dual-phase loop. This interface redesign preserves lights and materials. Implementation details remain in UBER-PORT.md.

## Archive and Companion Surfaces
gallery.html preserves the former five-specimen gallery and its original green interface. It is an archive, not the home or a top navigation item.

The existing /nodes formula editor remains a companion surface with its own layout and uber-node-graph-v1 presets. Its legacy gallery styling is not the source of the new studio design system.
