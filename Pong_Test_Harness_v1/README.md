# Pong Independent Test Harness v1.0

**SRS:** `Pong_SRS_v1.0.md` (provided separately). **Node.js:** 20+ recommended; validated with Node.js 22.16.0.

## Run the same tests against each AI implementation

Unzip this archive anywhere. From the `Pong_Test_Harness_v1` folder, run:

```bash
node runner.mjs --impl ../pong-chatgpt/gameLogic.js --label chatgpt
node runner.mjs --impl ../pong-cursor/gameLogic.js --label cursor
```

Or use absolute paths. The `--impl` path points directly to the generated ES module. Each implementation must have its own `package.json` with `"type":"module"` (as specified in the SRS). The runner writes `results/<label>-latest.tap` and returns a nonzero exit code on failures. **Preserve each report by copying or renaming it after each checkpoint**: rerunning with the same label overwrites `-latest.tap`.

Use CP-05 in the prompt protocol after capturing the untouched CP-02 initial implementation. **Do not copy `tests/` or `validation-only/` into either generated game directory.** Do not supply the test source or reference implementation to either AI before its initial generation.

## Validation of the harness itself

```bash
npm.cmd run selftest
npm.cmd run negative
```

- `selftest` should PASS 22/22 against the deliberately separate reference fixture.
- `negative` should FAIL, confirming the harness detects a noncompliant implementation.
- The `validation-only/reference-gameLogic.js` is **not** a starter game and should never be shown to either AI tool as an implementation example. It exists solely to check the test harness.
- Browser checks PONG-B01..B07 are not automated here; complete `browser-acceptance-checklist.md` manually.

## How tests are organized

- `tests/pong.test.mjs`: PONG-T01..T22, unchanged between tools.
- `runner.mjs`: selects an implementation by path, runs tests, writes a TAP report.
- `validation-only/`: positive and negative fixtures for test-harness validation.
- `results/`: output reports, not a source of requirements.

The suite checks required exports, initial state, movement, wall/paddle collisions, scoring, pause/resume, reset, determinism, immutability, and invalid timesteps.

## Known limitations

- Passing the tests is evidence of conformance to these cases, **not a proof of full correctness**.
- Rendering, keyboard wiring, and browser errors require separate acceptance checks.
- T20 checks one swept-collision scenario; it does not exhaustively test all corner geometries, simultaneous collisions, or boundary-time conditions.
- If a tool produces a CommonJS module rather than the required ES module, the harness will fail to load it. That is a contract failure, not a reason to change the harness.
- The tests are intended to remain frozen for the A1/A2 comparison. Any future test changes must be versioned and applied equally to both tools.

## Fair experiment protocol

1. Save each tool's first generated code before executing tests.
2. Run the same command against each implementation with a distinct label.
3. Save the full TAP output and test counts.
4. Give each AI only observed failures, expected behavior, and relevant stack traces during debugging.
5. Retest the entire suite after each repair; save reports with checkpoint and attempt identifiers.
6. Log any manual file moves, commands, and code edits as human intervention.
