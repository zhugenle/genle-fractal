# Composer v2 integration contract

`GenleDocuments` owns draft documents and the workspace. Draft schema is
`genle-fractal-draft` v1; it allows zero nodes, missing wires and no output.
Project schema is `genle-fractal-project` v1. Existing graph/formula schemas and
storage keys are not redefined. Migration copies the old graph without deleting it.

Only `renderable(draft)` converts a complete reachable graph into FORMULA/GRAPH v1.
Editor edge validation rejects invalid ports and cycles without requiring a
complete formula. Draft persistence never depends on successful GPU compilation.

`GenleGraphPreview(canvas, {onState,onFrame,onCamera})` is DOM-control-free:
`setDocument(id,draft,preview)`, `setGraph(draft,revision)`,
`patchParameters(changes,revision)`, `setCamera`, `setSettings`, `setQuality`,
`clear`, `snapshot`, `diagnostics`, `dispose`.

One preview serves the active document. Programs use a bounded cache. Draw receipts
carry documentId and revision; compilation results cannot switch a newer document.
Ordinary parameter patches do not compile GLSL or rebuild page controls. Structural
compiles keep only the latest pending request. A frame receipt means draw submission,
not a claim that the GPU/browser has completed presentation.

The preview uses the existing studio shader profile, renderer uniforms and budget;
the original studio, legacy node profile and recording controllers remain separate.
