# CP-08 Final Engineering Report — Cursor Pong (A2)

**SRS:** `Pong_SRS_v1.0.md` v1.0 (2026-10-13)  
**Implementation directory:** `C:\Repos\pong-cursor`  
**Harness:** `C:\Repos\pong_swen_6936\Pong_Test_Harness_v1`  
**Date of this session:** 2026-10-25 (America/Chicago timestamps from the checkpoint log)

This report uses only the checkpoint log, saved files, and observed runs. Missing items are marked **not recorded**.

---

## 1. Assignment and artifacts

**Measured**

| Item | Value |
|---|---|
| Required files present | `index.html`, `game.js`, `gameLogic.js`, `package.json` (`"type": "module"`), plus unchanged `Pong_SRS_v1.0.md` |
| Public API | `gameLogic.js` exports `createInitialState`, `updateGame`, `resetGame` |
| Git commit / version | **Not recorded** (`git` was not available in the shell used for this report) |
| Experiment ID | **Not recorded** in this chat |
| Tool / mode | Cursor agent session; model identified in-product as Cursor Grok 4.6 |

**Interpretation:** Distinct Cursor tree vs ChatGPT; harness results named `cursor-*.tap` were written by the shared runner, not by editing tests.

---

## 2. Checkpoint log (this conversation)

| CP | Clock (local) | What happened |
|---|---|---|
| CP-00 | 11:44, restated 11:53 | SRS read; no code. Ready for CP-01. |
| CP-01 | 11:55 | Plan only; no code. |
| CP-02 | ~11:55–12:00 | Created the four deliverable files. Two in-file corrections before the first harness run (paddle face TOI; `vx` sign on paddle hit). SRS not changed. |
| CP-03 | 12:00 | Read-only review. No code changes. |
| CP-04 | 12:04 | `python -m http.server 8080 --bind 127.0.0.1`. Page loaded; canvas visible; later screenshot showed live scores. |
| CP-05 | 12:11 | First harness run against this impl. |
| CP-06 | 12:13 | No observed unit-test failures → **no repair diff**. Retest. |
| CP-07 | 12:14 | Agent browser pass + checklist. |
| Human | 12:18 | User stopped the Python server. |
| Human | 12:23 | User: all browser verification pass. |
| CP-08 | 12:24 | This report. |

---

## 3. Requirements completed vs unverified

**Measured as completed against the frozen unit suite**

- PONG-T01..T22: all `ok` on first harness run and on CP-06 retest.
- §2 deliverables and ES-module load over HTTP: observed (200s for `index.html`, `game.js`, `gameLogic.js`).
- §4–§5 public schema/API: exercised by T01, T13–T18, T21.

**Measured as completed by human browser review (authoritative for B01–B07 in this log)**

- PONG-B01..B07: user stated **all pass**.

**Unverified / not independently proven**

- Full SRS collision space beyond T06–T09, T20, T22 (corners, simultaneous wall+paddle, rear/top faces). Harness README: T20 is one swept case.
- Git identity of the tree.
- Load-time DevTools console on a cold reload (agent B07 hooks were installed mid-session).
- Physical QWERTY W/S in the agent run (agent used `KeyboardEvent` with `code` KeyW/KeyS; user later passed B02).

**Not in scope of the game tree (SRS §9 / §12 process)**

- Formal experiment log file, dual-tool directory layout, and fairness reruns were not produced as repo artifacts in this session.

---

## 4. Unit tests: first run vs final

Command (both times):

```text
node runner.mjs --impl C:\Repos\pong-cursor\gameLogic.js --label <label>
```

from `Pong_Test_Harness_v1`. Shared tests were **not** modified.

| Run | Label / TAP | tests | pass | fail | skipped | duration_ms | exit |
|---|---|---|---|---|---|---|---|
| **First (CP-05)** | `results/cursor-latest.tap` | 22 | **22** | **0** | 0 | 80.0158 | 0 |
| **Retest (CP-06)** | `results/cursor-cp06-latest.tap` | 22 | **22** | **0** | 0 | 59.1053 | 0 |

A third file `results/cursor-results-latest.tap` also shows `# pass 22` / `# fail 0` / `duration_ms 80.0409`. Origin of that extra copy was not logged in the chat beyond harness output.

**First-run vs final:** 22/22 → 22/22. **No unit-test regression. No post-failure repair cycle.**

---

## 5. Browser acceptance

**CP-04 (agent, observed)**

- HTTP 200 for HTML and both modules.
- Title `Pong`; 800×500 canvas; black field, white paddles/ball, scores.
- Python log also had `400` on TLS/HTTPS probes to port 8080 (not game JS failures).
- Dedicated DevTools console dump: **not obtained**.

**CP-07 (agent, observed)**

| ID | Agent result |
|---|---|
| B01 | Pass (screenshot) |
| B02 | Pass (W/S via `code` KeyW/KeyS) |
| B03 paddles | Pass (arrows moved right only) |
| B03 scroll, default layout | `scrollY` 0 |
| B03 scroll, body `minHeight=4000px` | trusted ArrowDown → `scrollY` **40** |
| B04 | Pass (scores changed on canvas, e.g. 0/0 → 15/10) |
| B05 | Pass (PAUSED freeze; Space resume) |
| B06 | Pass (R → 0/0, centered paddles/ball) |
| B07 | Empty error arrays **after** mid-session hooks; first-paint console **not** captured |

**Human (12:23)**

- “ALL Browser Verification Pass on my review.”
- This report treats **B01–B07 as pass per the human reviewer**. The agent’s tall-page ArrowDown scroll is recorded as an agent observation, not as a human fail.

---

## 6. Defects and fixes

**Unit-test defects:** none observed. CP-06 made **no** implementation changes.

**CP-02 in-implementation edits (before any harness run, not a CP-06 repair):**

1. `timeToPaddle` — removed a face TOI that ignored vertical overlap.
2. Paddle hit — `vx = -vx` (left hit had used `-Math.abs(vx)`, which would keep `vx` negative).

**CP-03 code-inspection items (not unit failures; not changed):** full AABB vs FR-06 front/corners; x-snap separation; wall clamp vs leftover overshoot; `MAX_BALL_EVENTS`; `cloneState` dropping extra private fields.

**Runtime:** HTTPS-to-HTTP `400`s on the static server. Not a game-logic defect.

---

## 7. Unresolved issues

**Fact**

- No failing T01–T22 case remains.
- Human B01–B07: pass.
- Git history / experiment ID / signed elapsed-time log: **not recorded**.
- Agent saw `scrollY=40` on an artificially tall document; human review still passed B03.

**Interpretation**

- Residual SRS risk is outside the 22-case matrix (untested geometries), not an open red test.

---

## 8. AI repair attempts

| Attempt | Trigger | Code changed? | Outcome |
|---|---|---|---|
| CP-02 local corrections | Authoring defects noticed while writing `gameLogic.js` | Yes, `gameLogic.js` only | Pre-test; first harness still 22/22 |
| CP-06 | Protocol “fix observed failures” | **No** | No failures to fix; retest 22/22 |

Follow-up prompts that changed logic after a red TAP: **none**.

---

## 9. Human interventions

**Recorded**

- Authored CP-00..CP-08 prompts and attached SRS.
- Pointed the agent at the independent harness paths (CP-05).
- Stopped the Python HTTP server (12:18).
- Performed and reported browser acceptance (12:23).
- **No human edits to game source** were logged.

**Not recorded:** whether files were copied, renamed, or committed outside this chat.

---

## 10. Elapsed time

**Measured from message timestamps only** (not a stopwatch):

| Span | Approximate |
|---|---|
| First CP-00 → CP-08 | 11:44–12:24 → **~40 minutes** |
| Plan+impl (CP-01/02) | ~11:55–12:00 |
| First unit tests (CP-05) | 12:11; TAP duration **80.0158 ms** |
| CP-06 retest TAP duration | **59.1053 ms** |

Wall-clock idle between prompts is **not** separated from model/tool time. No official experiment timer was kept.

---

## 11. Strengths and weaknesses of this tool

**Facts that support comparison**

- Produced the four SRS files in one CP-02 pass.
- First shared-suite run was 22/22; no TAP-driven repair loop.
- Ran the official runner with `--impl` to this `gameLogic.js`.
- Loaded the game over a stdlib HTTP server without adding npm dependencies.
- Did not modify SRS or `tests/pong.test.mjs`.

**Interpretation (not measurements)**

- **Strengths:** Stayed inside the contract (no extra libraries/features); separated pure logic from `game.js`; executed harness and a browser pass instead of stopping at code review; declined CP-06 speculative edits when tests were green.
- **Weaknesses:** CP-03 listed collision/separation mismatches that tests did not catch—either over-cautious review or untested SRS surface. Agent B07/B03 used injected keys and a mutated `minHeight`, which is a weaker substitute for a human keyboard/DevTools pass (the human pass later closed that gap). Git was not used. Two silent TOI/`vx` fixes in CP-02 mean the “first generated version” on disk is not byte-identical to the first Write of `gameLogic.js`.

---

## 12. Comparison-ready scorecard

| Metric | Cursor (this run) |
|---|---|
| First unit-test pass/fail | **22 / 0** |
| Final unit-test pass/fail | **22 / 0** |
| TAP-driven repair attempts | **0** |
| Human-reported B01–B07 | **all pass** |
| SRS / tests altered | **no** |
| External runtime deps | **none** (`package.json` has no `dependencies`) |

End of report.
