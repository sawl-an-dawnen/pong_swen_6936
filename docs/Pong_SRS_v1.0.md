# Pong — Software Requirements Specification

**Version:** 1.0  
**Purpose:** Shared A1/A2 implementation contract for ChatGPT and Cursor  
**Date:** 2026-10-13  

## 1. Purpose and Scope

PONG-SRS-1.0 defines a browser-based, local, two-player Pong game for a controlled comparison of ChatGPT (A1) and Cursor (A2). Both implementations receive the same specification and must expose the same public API. Algorithms, helper functions, and rendering organization remain implementation choices. The test harness is independently maintained and is not part of the AI-generated solution.

## 2. Technology and Deliverables

Use JavaScript ES modules, HTML5 Canvas, and a modern browser. No external runtime dependencies or network services. Required files: index.html, game.js (browser/controller/rendering), gameLogic.js (pure logic), and package.json with "type": "module". gameLogic.js must export createInitialState, updateGame, and resetGame. Node.js built-in node:test will run the shared tests. The game must load locally through a simple HTTP static server (ES modules may not work consistently under file://).

## 3. Coordinate System and Constants

Playfield: 800 by 500 pixels, origin at upper left; +x rightward, +y downward. Paddle width 12, height 80, speed 300 px/s. Left paddle x=30; right paddle x=758. Paddle y is its top edge and is constrained to [0,420]. Ball coordinates describe its center; radius=8. Initial ball position (400,250); initial velocity (200,150) px/s. Ball speed components remain unchanged in magnitude after wall/paddle collisions. No random behavior or acceleration.

## 4. Public State Schema

createInitialState() returns a fresh plain object with exactly the required public fields below (extra private fields are permitted only if serializable and do not affect contract semantics):
{
  "status": "playing",
  "leftPaddle": {"x":30,"y":210,"width":12,"height":80},
  "rightPaddle": {"x":758,"y":210,"width":12,"height":80},
  "ball": {"x":400,"y":250,"vx":200,"vy":150,"radius":8},
  "score": {"left":0,"right":0}
}
Allowed status values are "playing" and "paused". There is no game-over state or winning score.

## 5. API Contracts

createInitialState(): no arguments; returns a new initialized state. resetGame(): no arguments; returns a fresh state equal in values to createInitialState(). updateGame(state, input, dt): returns a new state and does not mutate state or nested objects. dt is measured in seconds; accepted interval is [0,0.1]. Any non-number, NaN, infinite, or out-of-range dt throws RangeError. input is an object with optional Boolean fields leftUp, leftDown, rightUp, rightDown, togglePause; omitted fields are false. Both direction keys pressed for one paddle cancel. togglePause flips status and causes no movement or scoring during that call. If paused and togglePause is false, return an equivalent, fresh state with no movement. dt=0 causes no movement or scoring but may toggle pause.

## 6. Functional Requirements

PONG-FR-01: The browser displays two paddles, one ball, and both scores on an 800x500 canvas.
PONG-FR-02: W/S move the left paddle up/down; ArrowUp/ArrowDown move the right paddle up/down. Keyboard auto-repeat must not cause repeated pause toggles.
PONG-FR-03: Paddle displacement per update is signed 300*dt, clamped to y=0..420; x remains fixed.
PONG-FR-04: During playing, the ball travels at its specified velocity, including fractional positions.
PONG-FR-05: The ball reflects elastically from horizontal walls at center y=8 and y=492, with overshoot resolved.
PONG-FR-06: A moving ball colliding with the front face or corner of a paddle traveling toward it reverses the sign of vx, preserves |vx| and vy (unless a simultaneous wall collision also reverses vy), and is separated to prevent repeated collision.
PONG-FR-07: If the entire ball passes the left boundary (x+r<0), the right score increments once. If it passes the right boundary (x-r>800), the left score increments once.
PONG-FR-08: After a score, ball position resets to (400,250), vy=150, and vx=-200 for odd total points or +200 for even total points. Paddles retain positions. End the current update at scoring.
PONG-FR-09: Space toggles pause/resume; paused state freezes the simulation. Display PAUSED when paused.
PONG-FR-10: R restarts using resetGame and resets both scores. The browser must suppress default scrolling for game control keys.

## 7. Determinism and Collision Semantics

The update must be deterministic: identical serialized state, input, and dt yield identical serialized outputs. No Date.now, Math.random, requestAnimationFrame timing, or DOM access inside gameLogic.js. Within dt<=0.1, process motion and collision events in chronological order to prevent tunneling. For ties between a wall and paddle collision, apply both reflections. Paddle positions are updated for the timestep before resolving ball events; collision checks use these resulting paddle positions (this is a deliberate simplification). Detect swept ball-circle versus paddle-rectangle contact, including corners; moving away from a paddle must not cause a new collision. Floating-point comparisons in tests use tolerance 1e-6 unless otherwise specified. At exactly x+r=0 or x-r=800, do not score until the threshold is exceeded. A scoring event takes precedence over subsequent events, resets the ball, and terminates that update.

## 8. Nonfunctional Requirements

PONG-NFR-01: Pure deterministic game logic, no browser globals.
PONG-NFR-02: No mutation of the input state or nested structures.
PONG-NFR-03: No external runtime libraries.
PONG-NFR-04: Browser rendering should remain responsive; recommend requestAnimationFrame with timestep capped to 0.1 seconds per update.
PONG-NFR-05: Readable code with clear separation between logic and rendering.
PONG-NFR-06: A fresh browser load must initialize the game with the required state.

## 9. Verification Plan

Unit tests call the exported API directly using Node.js node:test. The identical test suite is run against both AI implementations. Browser acceptance checks cover canvas rendering, keyboard controls, pause display, and visible scores. Record the first generated version before fixes, test failures, follow-up prompts, retest outcomes, and elapsed time. Do not alter the specification or shared test assertions to accommodate a tool's output. Save any spec amendment under a new version and rerun both tools if fairness requires.

## 10. Unit Test Matrix

PONG-T01: Initial state exactly matches public values.
PONG-T02: Left paddle moves up 30 px for dt=.1.
PONG-T03: Right paddle moves down 30 px for dt=.1.
PONG-T04: Both paddles clamp to y=0 and y=420.
PONG-T05: Ball moves from (400,250) to (420,265) for dt=.1 with no input.
PONG-T06: Top-wall collision reverses vy and keeps center in bounds.
PONG-T07: Bottom-wall collision reverses vy and keeps center in bounds.
PONG-T08: Left-paddle hit produces vx>0.
PONG-T09: Right-paddle hit produces vx<0.
PONG-T10: Full right exit increments left score once.
PONG-T11: Full left exit increments right score once.
PONG-T12: Scoring resets ball with parity-based serve direction.
PONG-T13: togglePause changes playing to paused without movement.
PONG-T14: Paused update is stationary; togglePause resumes without movement.
PONG-T15: resetGame returns initial values with fresh object identity.
PONG-T16: Repeated same input produces identical output.
PONG-T17: updateGame does not mutate nested input state.
PONG-T18: Invalid dt values throw RangeError.
PONG-T19: Opposite direction keys cancel movement.
PONG-T20: Swept paddle collision avoids tunneling within dt=.1.
PONG-T21: dt=0 leaves movement and score unchanged.
PONG-T22: Collision moving away from paddle is not re-triggered.

## 11. Browser Acceptance Checks

PONG-B01: Canvas shows black playfield, white ball, and white paddles.
PONG-B02: W/S control only the left paddle.
PONG-B03: ArrowUp/ArrowDown control only the right paddle and do not scroll the page.
PONG-B04: Scores update visibly after a point.
PONG-B05: Space pauses/resumes and PAUSED appears only while paused.
PONG-B06: R restarts and restores scores and positions.
PONG-B07: Game runs without uncaught console errors.

## 12. Experiment and Prompt Logging

For every AI attempt record: assignment, tool and version/mode, experiment ID, timestamp, exact prompt, files changed, initial test pass/fail counts, observed defects, follow-up prompts, human edits, retest results, elapsed time, and Git commit/version reference. The initial generation prompt must be identical in substance for both tools. The tools receive this SRS, but not the hidden shared test implementation before the first generation. Maintain distinct implementation directories for ChatGPT and Cursor.

## 13. Open Interpretation Rules

This contract intentionally specifies externally observable behavior and minimal module boundaries, not an internal class hierarchy. Aesthetic details beyond the reference colors, score visibility, and 800x500 canvas are flexible. The baseline excludes sound, AI opponents, power-ups, variable ball speed, winning score, and online multiplayer. Any additions must not violate the public API or baseline tests.

