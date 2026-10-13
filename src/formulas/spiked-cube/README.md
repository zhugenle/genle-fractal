# SPIKED CUBE formula delivery

2026-10-12. Formula-only migration from the preserved old worktree. Public renderer/UI/state/build/release files are not changed by this delivery. The original supplied OSL is retained in source.osl.

The kernel exports `evaluateFormula(world)` returning world-space DE and orbit trap. CubeSymmetry canonicalizes feedback, retaining the earlier symmetry fix. DistanceSafety remains the earlier conservative correction; the reported granular artifact is not addressed by this change.

One progress value drives both internal iteration twist and object rotation about world Y through the formula center. `referencePhases` returns `[twistDegrees, objectYawRadians]`, defaults to a 20-second cycle in the test harness, and gives identical values at progress 0 and 1. Rotation is an inverse object transform inside the kernel. No camera or light parameters are changed.

TwistAngle and TwistLoop remain in `FORMULA_HIDDEN_PARAMETERS` and defaults for existing preset compatibility. Visible groups omit them, and the test page has only a timeline. A legacy TwistLoop=0 freezes internal twist but does not disable the new object spin. No independently editable spin axis/speed is introduced.

The layout `spiked-cube-packed-v1` is an adapter proposal, not a drop-in replacement for `uber-bulb-packed-v1`. Integration must discover SC0/SC1/SC2, consume hidden parameter definitions for schema validation, accept the phase units above, and support formula-specific groups. See docs/handoffs/spiked-cube-y-spin.md at the repository root. Keep the node-legacy page on its existing formula/profile until a separate compatibility adapter is approved.

## Tests

```powershell
node --test src/formulas/spiked-cube/tests/formula.test.mjs
node src/formulas/spiked-cube/tests/serve.mjs 4184
```

Open `http://127.0.0.1:4184/` for the isolated test and `/numerics.html` for GPU distance comparison. The server listens only on localhost. It reads the current worktree's common shader modules via config/build.json without changing the configuration; on this pre-migration worktree it uses the preserved dist/studio.glsl instead. It never reads another worktree or a Documents directory at runtime.

Five Node tests cover hidden schema, closed dual animation, uniform upload and object rotation about an offset center. GPU evidence in tests/gpu-result.json records 20/20 passes, GL error 0, max absolute CPU/GPU error 8.63e-7. These are sampled configurations, not exhaustive geometry or visual stability proofs. The isolated test confirms shader compilation and visible rendering, and seeking continues playback. Full studio/node integration and npm build checks remain the integration task's responsibility once the architecture baseline is committed and the adapters are applied.
