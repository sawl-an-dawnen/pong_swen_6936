# CP-08 — Final Engineering Report: Browser-Based Pong

**Specification:** `Pong_SRS_v1.0.md` (version 1.0)  
**Implementation tool:** ChatGPT  
**Report date:** October 17, 2026  
**Evidence basis:** CP-00–CP-07 checkpoint record, CP-02 saved implementation, independent unit-test output, and user-reported browser acceptance results.

## 1. Executive Summary

The original CP-02 Pong implementation passed **22 of 22 independent unit tests** and **7 of 7 user-performed browser acceptance checks**, for **29 passed checks, 0 failed, and 0 not run** across those two verification activities. No implementation repairs were recorded. Browser acceptance results were reported by the human evaluator rather than independently witnessed by ChatGPT.

Passing the provided tests establishes compliance for their exercised scenarios; it does not prove correctness for all possible collision or timing edge cases.

## 2. Deliverables and API

| File | Function | Recorded status |
|---|---|---|
| `index.html` | 800 × 500 canvas and entry point | Created in CP-02 |
| `game.js` | Keyboard input, animation loop, browser rendering | Created in CP-02 |
| `gameLogic.js` | Pure deterministic state updates, collision handling, scoring | Created in CP-02 |
| `package.json` | ES module configuration (`"type": "module"`) | Created in CP-02 |

The required `gameLogic.js` exports are `createInitialState()`, `updateGame(state, input, dt)`, and `resetGame()`. The saved baseline uses no external runtime dependencies. The specification and shared tests were not changed.

## 3. Requirements Completed and Verification Boundaries

| Requirements | Evidence | Assessment |
|---|---|---|
| PONG-FR-01–04: canvas, keyboard controls, paddle movement, ball motion | Relevant unit tests and user browser checks | Passed exercised checks |
| PONG-FR-05–06: wall and paddle collisions | T06–T09, T20, T22 | Passed exercised cases; non-exhaustive |
| PONG-FR-07–08: scoring and reset | T10–T12; B04 | Passed exercised cases |
| PONG-FR-09–10: pause and restart | T13–T15, T21; B05–B06 | Passed exercised cases |
| PONG-NFR-01–03: pure logic, immutability, no runtime libraries | Static review; T16–T18 and source manifest | Supported by available evidence |
| PONG-NFR-04–06: responsiveness, separation, fresh initialization | Code review and browser observations | Supported for observed operation; no performance benchmark |

**Not comprehensively verified:** every possible swept corner contact, very close or simultaneous event timings, extremely narrow score-threshold cases, prolonged runtime performance, and multiple browsers/platforms. These are coverage limits, not recorded failures.

## 4. Checkpoint History

| Checkpoint | Recorded result |
|---|---|
| CP-00 | SRS read and acknowledged |
| CP-01 | Four-file implementation plan established |
| CP-02 | Initial baseline files generated |
| CP-03 | Read-only static compliance review; potential edge-case risks identified |
| CP-04 | Local HTTP serving reported working; no browser gameplay execution at this checkpoint |
| CP-05 | Supplied independent unit tests executed: 22 passed, 0 failed |
| CP-06 | Failure-report placeholder contained no observed failure; no code changes |
| CP-07 | Human evaluator reported all seven browser checks passed |
| CP-08 | Engineering report assembled from the checkpoint record |

## 5. First-Run Versus Final Unit-Test Results

| Metric | First recorded independent execution (CP-05) | Final recorded baseline |
|---|---:|---:|
| Passed | 22 | 22 |
| Failed | 0 | 0 |
| Skipped | 0 | 0 |
| Not run | 0 | 0 |

These columns describe **the same recorded successful execution**; no separate post-repair final test run took place. The supplied TAP output records **22 tests, 22 passes, 0 failures**, exit code **0**, and approximately **77.04 ms test-run duration**. Test-run duration is not development duration.

**Evidence file:** `cp02_baseline-latest.tap`.

## 6. Browser Acceptance Results (Human-Reported)

| ID | Check | Result |
|---|---|---|
| PONG-B01 | Canvas rendering | PASS |
| PONG-B02 | Left-paddle W/S controls | PASS |
| PONG-B03 | Right-paddle arrow controls and no page scrolling | PASS |
| PONG-B04 | Visible score updates | PASS |
| PONG-B05 | Pause/resume and PAUSED display | PASS |
| PONG-B06 | Restart resets game | PASS |
| PONG-B07 | No uncaught browser console errors | PASS |

**Browser total:** 7 pass, 0 fail, 0 not run. The human evaluator's notes were **“ALL PASS.”** No screenshots or browser console transcript were supplied for independent corroboration.

## 7. Defects, Repairs, and Open Risks

**Observed test/runtime failures:** None in the supplied unit-test output or the reported browser checks.  
**Confirmed implemented fixes:** None.  
**AI repair attempts:** 0 recorded.  
**Implementation changes after baseline:** None recorded.

The CP-03 static review identified *possible* edge-case issues in scoring tolerance, corner-collision separation, and near-simultaneous collision event ordering. These did **not** become observed failures in CP-05 or CP-07 and were not repaired. They remain **unverified risks**, not confirmed defects.

## 8. Human Interventions and Timing

| Item | Evidence-based result |
|---|---|
| Requirements and staged prompts | Provided by human evaluator |
| Independent tests and runner | Supplied by human evaluator |
| Browser acceptance execution | Performed/reported by human evaluator |
| Human source-code corrections | None documented |
| AI repair prompts with actual failures | None documented |
| Git commit/version reference | Not available in checkpoint log |
| Exact AI model mode/version for comparison | Not recorded per checkpoint |
| Total development elapsed time | **Not established by the checkpoint evidence** |
| Automated test execution time | Approximately **77.04 ms** (not engineering elapsed time) |

Development elapsed time cannot be inferred from the test duration or the final report date. It must be recorded separately if available for the A1/A2 comparison.

## 9. Tool Strengths and Weaknesses — Interpretation, Not Measurement

**Strengths suggested by this single experiment:** ChatGPT produced the required four-file baseline, preserved the specified API, and achieved a passing first recorded independent test run without documented repair iterations. Its staged checkpoint responses supported separate planning, source review, execution, and evidence collection.

**Limitations:** Static review raised potential issues that were not supported by failures in the supplied suite. Browser acceptance depended on human execution and reporting. Neither cross-browser robustness nor difficult numerical collision corner cases were exhaustively validated. This one result should not be generalized to all software-development tasks.

## 10. Final Comparison Record

| Metric | ChatGPT baseline |
|---|---|
| Required implementation files | 4 created |
| First recorded unit-test run | 22 PASS / 0 FAIL |
| Final recorded unit-test state | 22 PASS / 0 FAIL; same execution |
| Human-reported browser acceptance | 7 PASS / 0 FAIL |
| Observed defects requiring repair | 0 |
| AI repair attempts | 0 |
| Documented human code edits | 0 |
| Total development elapsed time | Not recorded |
| Outstanding confirmed defects | None reported |
| Unresolved verification risks | Boundary timing, corner separation, simultaneous events |

**Conclusion:** The unchanged initial ChatGPT Pong implementation satisfied all 22 independently executed unit tests and all 7 human-reported browser acceptance checks. This establishes a successful measured baseline for comparison against a second tool using the same SRS and independent tests, while preserving the limitations of the available evidence.
