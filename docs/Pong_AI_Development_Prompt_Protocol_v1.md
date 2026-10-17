# Pong AI Development Prompt Protocol — v1.0

**Applies to:** A1 (ChatGPT) and A2 (Cursor)  
**Specification:** `Pong_SRS_v1.0.md`  
**Purpose:** Repeatable, auditable development workflow using equivalent prompts and shared verification.

## Before beginning (human preparation)

1. Give each tool the same exact `Pong_SRS_v1.0.md` content. For Cursor, attach/reference the file in the project; for ChatGPT, upload it to the conversation. Verify the complete document is accessible.
2. Use independent, initially empty implementation directories and the same Node.js major version, browser, operating environment, and testing suite. Do not copy code between implementations.
3. Start screen recording or preserve a complete transcript. Capture the tool/model version, settings, and start time. Save each checkpoint's code as a Git commit or snapshot.
4. **Freeze the SRS and independent test suite.** Do not reveal the test source code before the initial implementation. Share failing test names, expected/actual behavior, and stack traces as needed during debugging.
5. Do not claim to have run tests unless they actually ran. Cursor may be able to execute commands directly; in ChatGPT, the human may need to save files/run commands. Record those tool-access differences as human intervention, not as code-quality failures.
6. For fairness, use the exact same core prompts below. Tool-specific mechanics (creating files, terminal permissions) are recorded as deviations. Keep the same maximum repair budget: **two AI repair attempts per failed checkpoint**, then log unresolved issues and continue when feasible.
7. Some checks are pending until the independent harness exists. Mark them **NOT RUN**, never PASS.

## Shared checkpoint rules

At each checkpoint record: `checkpoint_id`, tool, start/end time, prompt text, code snapshot/commit, actions performed by human, observed result, test results, failures, and AI repair attempts. **Do not modify the SRS or shared tests to make an implementation pass.**

---

## CP-00 — Read and acknowledge requirements

**Paste:**

> CP-00: You are implementing a browser-based Pong game for a controlled AI software-development comparison. The attached `Pong_SRS_v1.0.md` is the authoritative requirements contract. Read it completely. Do not write or modify code yet. Summarize: (1) required deliverables, (2) exact public exports and state fields, (3) deterministic behavior and collision requirements, and (4) ambiguities or risks. Do not invent requirements. Ask only questions that block implementation; otherwise explicitly state you are ready for CP-01.

**Gate:** Required exports, state shape, constraints, and key risks accurately summarized. **Human action:** Check against SRS; record any omissions. Do not provide corrective hints unless a true blocker exists.

## CP-01 — Implementation plan

**Paste:**

> CP-01: Using only `Pong_SRS_v1.0.md`, propose a concise implementation plan for `index.html`, `game.js`, `gameLogic.js`, and `package.json`. Identify how `gameLogic.js` will remain independent of browser APIs and how collisions, scoring, and pause behavior will be deterministic. Explain the public API contract and how the browser will call it. Do not write or modify code yet. Keep the plan small and aligned with the SRS; do not add libraries or features.

**Gate:** Plan respects module boundaries and SRS. **Human action:** Record design deviations, but do not dictate internal algorithms unless they violate the contract.

## CP-02 — Generate the baseline implementation

**Paste:**

> CP-02: Implement the complete Pong baseline now, following `Pong_SRS_v1.0.md` and the CP-01 plan. Produce or create all required files: `index.html`, `game.js`, `gameLogic.js`, and `package.json`. Ensure `gameLogic.js` exports `createInitialState()`, `updateGame(state, input, dt)`, and `resetGame()` as ES module functions. Keep game logic pure, deterministic, and independent of DOM/Canvas. Implement browser keyboard controls, canvas rendering, score display, pause/resume, and restart. Do not add external dependencies. Do not change the SRS. When finished, list all created/modified files, state what is implemented, and explicitly distinguish anything actually executed or tested from anything only reasoned about. Do not perform a self-directed repair pass yet.

**Gate:** Files are present, exports exist, initial code is preserved **before** repairs. **Human action:** Save the unmodified initial output and commit/snapshot as `CP-02-initial`.

## CP-03 — Static compliance review

**Paste:**

> CP-03: Perform a read-only compliance review of the current implementation against `Pong_SRS_v1.0.md`. Do not modify code. Identify missing requirements, contract mismatches, possible bugs, and unverified behavior. Reference SRS requirement IDs and file/function locations where possible. Classify each finding as confirmed from code, suspected, or untested. Do not claim that runtime or unit tests passed unless they were executed.

**Gate:** Read-only review completed. **Human action:** Record issues and any unsupported AI claims. Do not silently apply fixes.

## CP-04 — First runtime execution

**Paste:**

> CP-04: Provide the exact commands and steps needed to launch this implementation locally with a simple HTTP static server, without adding dependencies. If you have terminal access and permission, run the commands and report the actual output; otherwise tell me precisely what to run. Do not modify code. Report whether the game launched, any console/terminal errors, and any checks you could not perform. Do not infer success from code inspection.

**Gate:** Launch attempt is documented as PASS, FAIL, or NOT RUN. **Human action:** If necessary, run commands and paste the complete actual output. Record time and manual steps.

## CP-05 — Independent unit-test baseline

**Paste:**

> CP-05: We are now evaluating the existing implementation against the independently maintained Pong unit-test suite. Do not modify code or tests yet. If you can execute the supplied test command, run it and report the exact results; otherwise ask me to run it and paste the output. Summarize total passed/failed/not-run tests and list each failure by test ID, expected behavior, actual behavior, and likely root cause. Clearly distinguish observed failures from hypotheses. Do not alter the shared test suite or SRS.

**Human setup:** Supply the same test-run command for each implementation and, if needed, the same failure-report format. The harness is a separate deliverable and must be created before this checkpoint can be executed. **Gate:** Baseline test report recorded; mark NOT RUN if harness unavailable.

## CP-06 — AI-assisted debugging (repeat for at most two attempts)

**Paste:**

> CP-06: Fix the implementation defects identified in the following observed test or runtime failures. Preserve `Pong_SRS_v1.0.md`, the public API, and all passing behavior. Do not modify the shared tests. Make the smallest justified implementation changes. For each change, identify the root cause, the file/function changed, and the requirement it addresses. If you can run the same tests, do so and report actual results; otherwise provide exact retest instructions. Do not claim a fix is verified without a successful retest.
>
> FAILURE REPORT:
> [PASTE THE ACTUAL FAILURE REPORT HERE]

**Gate:** Retest the **entire** suite after each repair. Log regressions and number of repair attempts. Stop after two attempts per checkpoint even if failures remain; mark unresolved failures explicitly.

## CP-07 — Browser acceptance verification

**Paste:**

> CP-07: Using the browser acceptance checks PONG-B01 through PONG-B07 in `Pong_SRS_v1.0.md`, create a concise verification checklist with exact manual actions and expected outcomes. Do not modify code. If you have direct browser interaction available, execute the checks and report observed evidence; otherwise clearly mark them NOT RUN and ask me to perform them. Include canvas rendering, both players' keys, score display, pause/resume, restart, and console errors. Never substitute a code review for an observed browser test.

**Gate:** Record each B01–B07 as PASS, FAIL, or NOT RUN. **Human action:** Perform the same manual sequence in both implementations and record observations. If browser failures require fixes, use CP-06's repair wording and budget, then rerun all relevant checks.

## CP-08 — Final evidence-based review

**Paste:**

> CP-08: Produce a concise final engineering report for this Pong implementation based only on the actual checkpoint log, saved code, and observed test results. Include: requirements completed/unverified, first-run versus final unit-test counts, browser acceptance outcomes, defects and fixes, unresolved issues, AI repair attempts, human interventions, elapsed time, and strengths/weaknesses of this tool. Clearly separate measured facts from interpretations. Do not fabricate missing data. This report will later be compared against a second tool using the same SRS and tests.

**Gate:** Report matches evidence. **Human action:** Save the report and final Git commit/snapshot.

---

## Standard recovery prompt — blocked checkpoint

> CP-09: We are blocked at checkpoint [CP-ID]. Here is the observed issue and exact evidence: [PASTE]. Do not change the SRS, shared tests, or public API. Diagnose the cause and propose the smallest corrective action. State what you can verify directly and what requires my intervention. If a code change is necessary, wait for my authorization before changing files.

## Human intervention log (copy for each event)

```text
Experiment ID:
Tool/model/version:
Checkpoint:
Timestamp:
Reason intervention was necessary:
Exact human action (commands, file edits, clarifications):
AI action attempted first:
Time spent:
Effect on outcome:
Code snapshot/commit:
```

## Checkpoint results log (copy for each checkpoint)

```text
Experiment ID:
Tool/model/version:
Checkpoint ID:
Start time / end time:
Prompt used unchanged? Yes / No (explain):
Files changed:
Git commit or snapshot:
Unit tests: PASS __ / FAIL __ / NOT RUN __
Browser checks: PASS __ / FAIL __ / NOT RUN __
AI repair attempts:
Human interventions:
Observed evidence (logs, screenshots, command output):
Open issues:
```

## Interpretation cautions

- The A1 and A2 assignment objectives emphasize demonstrating each tool's useful features. The controlled comparison is an added methodology and should not consume all video time.
- A difference in direct filesystem or terminal access is a workflow capability difference, not proof of better or worse generated code.
- Avoid using test pass count alone as a quality score; browser acceptance, clarity, reliability, and effort also matter.
- Preserve the exact initial generated version, even when it does not run.
