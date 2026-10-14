# Final Engineering Report — Pong Implementation

**Experiment:** A1 — ChatGPT Software Development Evaluation  
**AI Tool:** ChatGPT (GPT-6)  
**Requirements Specification:** `Pong_SRS_v1.0.md`  
**Development Process:** CP-00 through CP-08  
**Final Outcome:** 22/22 unit tests passed; 7/7 browser acceptance checks passed (user-reported).

## 1. Executive Summary

ChatGPT generated a browser-based two-player Pong implementation using JavaScript ES modules and HTML5 Canvas.

The initial implementation passed 19 of 22 independent unit tests (86.4%). Three tests failed because balls already beyond the scoring boundaries were not scored correctly.

Following one AI-assisted debugging attempt at CP-06, all 22 unit tests passed (100%). The human evaluator subsequently reported that all seven browser acceptance checks passed.

The implementation required one corrective code iteration. No changes to the SRS or shared tests were reported.

## 2. Checkpoint History

| Checkpoint | Activity | Recorded outcome |
|---|---|---|
| CP-00 | Read and acknowledge requirements | Completed; public API, state fields, collision rules, constraints, and risks summarized |
| CP-01 | Implementation plan | Completed; four-file architecture and deterministic update design proposed |
| CP-02 | Generate baseline implementation | Completed; four required files generated and original implementation preserved |
| CP-03 | Static compliance review | Completed; 2 confirmed code concerns and 2 suspected risks reported |
| CP-04 | First runtime execution | Partial success; HTTP serving and Node.js smoke checks succeeded, browser automation blocked |
| CP-05 | Independent unit-test baseline | 19 passed, 3 failed, 0 not run |
| CP-06 | AI-assisted debugging | One repair attempt; retest produced 22 passed, 0 failed |
| CP-07 | Browser acceptance verification | 7/7 PASS, based on human evaluator observations |
| CP-08 | Final evidence-based review | Completed using recorded checkpoint evidence |

**Artifact naming clarification:** The repaired version was saved under `pong_cp03/`, despite being produced during formal checkpoint CP-06. The directory name is an artifact label, not the checkpoint designation.

## 3. Requirements and Implementation

The implementation delivered the four required files:

- `index.html` — Browser entry point and 800×500 Canvas.
- `game.js` — Keyboard input, browser animation loop, rendering, pause display, and restart.
- `gameLogic.js` — Pure game logic, collision handling, scoring, pause behavior, and state updates.
- `package.json` — ES module configuration without external runtime dependencies.

The required public functions were implemented:

- `createInitialState()`
- `updateGame(state, input, dt)`
- `resetGame()`

The shared tests verified the specified initial values, movement, clamping, tested collision behavior, scoring, pause/resume, reset, deterministic repeatability, immutability, and timestep validation.

**Unverified beyond specified tests:** Exhaustive collision edge cases, prolonged gameplay stability, performance benchmarks, and cross-browser behavior.

## 4. Independent Unit-Test Results

| Metric | CP-05: First run | CP-06: Final retest |
|---|---:|---:|
| Total tests | 22 | 22 |
| Passed | 19 | 22 |
| Failed | 3 | 0 |
| Not run | 0 | 0 |
| Pass rate | 86.4% | 100% |
| Reported test duration | 71.833 ms | 71.471 ms |

### Initial Failed Tests

| Test ID | Expected behavior | Observed failure |
|---|---|---|
| PONG-T10 | Ball fully exiting right awards left player one point | Score remained unchanged |
| PONG-T11 | Ball fully exiting left awards right player one point | Score remained unchanged |
| PONG-T12 | Scoring resets ball, alternates serve direction, and preserves paddles | First assertion failed because scoring did not trigger a reset |

The first failed assertion in T12 prevented its remaining assertions from executing in that run.

The independent suite was maintained separately from the generated implementation.

## 5. Defect Analysis and AI Repair

**Confirmed root cause:** The original `updateGame()` implementation calculated scoring events using the time required for the ball to reach a boundary. When the ball began already completely outside the playfield, the calculated event time was negative and rejected by the event-registration logic.

**Affected requirements:** PONG-FR-07 and PONG-FR-08.

### CP-06 Corrective Action

ChatGPT modified `gameLogic.js`, specifically the `updateGame()` function, by adding checks for balls already completely outside the left or right scoring boundaries.

The correction reused the existing scoring and reset logic, terminating the update immediately after scoring.

- **Repair attempts recorded:** 1
- **Additional AI repair attempts:** 0
- **Unit-test regressions observed:** 0
- **Final retest:** 22/22 PASS

The other three implementation files were reported unchanged.

## 6. Browser Acceptance Results — CP-07

The AI could not complete direct browser acceptance testing because automated Chromium navigation was blocked by the execution environment.

The human evaluator performed browser testing and reported:

| Test ID | Requirement | Human-observed result |
|---|---|---|
| PONG-B01 | Canvas rendering | PASS |
| PONG-B02 | Left paddle W/S controls | PASS |
| PONG-B03 | Right paddle arrow controls and no scrolling | PASS |
| PONG-B04 | Score display and updates | PASS |
| PONG-B05 | Pause/resume and PAUSED indicator | PASS |
| PONG-B06 | Restart behavior | PASS |
| PONG-B07 | No uncaught console errors | PASS |

**Browser acceptance:** 7 passed, 0 failed, 0 not run by the human evaluator.

These results were reported by the user and were not independently reproduced through the assistant's browser automation.

## 7. Unresolved Issues

No failed tests remained in the provided independent suite, and no browser acceptance failures were reported.

The CP-03 static review raised additional concerns involving:

- Possible paddle top/bottom-edge collision responses outside the explicitly described front-face/corner behavior.
- Floating-point epsilon effects near exact scoring thresholds.
- Collision-loop iteration limits.

These were not established as additional observed runtime failures or specifically repaired. Their behavior outside the existing test cases remains unverified.

## 8. Human Interventions

Recorded human involvement included supplying the SRS, issuing checkpoint prompts, providing the independently maintained test harness, requesting a targeted repair after observed failures, and manually performing browser acceptance verification.

No human source-code edits were reported.

The human controlled when the AI could proceed from planning to implementation, testing, and debugging. ChatGPT did not perform an unsolicited repair before the baseline test results were recorded.

The actual completion of the requested Git commits or snapshots was not established in the available record.

## 9. Elapsed Time

The recorded automated unit-test durations were:

- CP-05 initial test run: 71.833 ms.
- CP-06 final test run: 71.471 ms.

These measurements represent test-runner execution durations, not AI development time.

| Measurement | Recorded result |
|---|---|
| Total development elapsed time | Not recorded |
| Time spent planning | Not recorded |
| Time spent generating the implementation | Not recorded |
| Time spent debugging | Not recorded |
| Human testing duration | Not recorded |

These values cannot be accurately reconstructed from the checkpoint history.

## 10. Tool Strengths and Weaknesses

The following assessments are interpretations based on this experiment, not general benchmark claims.

### Strengths

- Produced the required application structure and public API.
- Passed 86.4% of independent unit tests on the first implementation.
- Maintained separation between browser code and deterministic game logic.
- Corrected the observed defect through a localized change.
- Achieved 100% unit-test compliance after one AI-assisted repair attempt.
- Preserved the first-generation implementation for comparison.
- Provided traceable explanations connecting defects to SRS requirements.

### Weaknesses

- Failed three initial unit tests because of an overlooked scoring boundary condition.
- Required independent testing and corrective prompting to achieve full test-suite compliance.
- Could not independently verify browser acceptance due to environment restrictions.
- Did not establish exhaustive correctness for additional collision edge cases.
- Did not produce sufficiently complete elapsed-time measurements for quantitative development-efficiency comparison.

## 11. Final Evaluation

| Evaluation metric | Recorded result |
|---|---|
| Initial unit-test pass rate | 86.4% |
| Final unit-test pass rate | 100% |
| Initial failed test cases | 3 |
| Confirmed underlying defect repaired | 1 |
| AI repair attempts | 1 |
| Unit-test regressions | 0 observed |
| Browser acceptance | 7/7 PASS, user-reported |
| External runtime dependencies | None |
| Total development time | Unavailable |

**Measured conclusion:** The implementation improved from 19/22 to 22/22 passing unit tests following one AI-assisted repair attempt. The human evaluator additionally reported all seven browser acceptance checks passing.

**Engineering interpretation:** ChatGPT demonstrated the ability to implement the specified application, diagnose its observed scoring defect, and correct it without breaking previously passing tests. Independent verification was essential to identifying the initial defect.

No claim about superiority or inferiority relative to Cursor or another AI development tool can be made from this single experiment. A valid comparison requires equivalent checkpoint procedures, identical requirements and tests, and separately recorded results for the second tool.

**Final disposition:** CP-08 completed; all specified verification checks passed or were reported as passing, with the stated limitations.
