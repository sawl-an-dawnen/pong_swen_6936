import { createInitialState, updateGame, resetGame } from "./gameLogic.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const held = {
  leftUp: false,
  leftDown: false,
  rightUp: false,
  rightDown: false
};

let pendingTogglePause = false;
let pendingReset = false;
let state = createInitialState();
let lastTime = performance.now();

const CONTROL_CODES = new Set(["KeyW", "KeyS", "ArrowUp", "ArrowDown", "Space", "KeyR"]);

function isControlEvent(event) {
  return CONTROL_CODES.has(event.code);
}

window.addEventListener("keydown", (event) => {
  if (!isControlEvent(event)) return;
  event.preventDefault();

  if (event.code === "KeyW") held.leftUp = true;
  if (event.code === "KeyS") held.leftDown = true;
  if (event.code === "ArrowUp") held.rightUp = true;
  if (event.code === "ArrowDown") held.rightDown = true;

  if (event.code === "Space" && !event.repeat) {
    pendingTogglePause = true;
  }
  if (event.code === "KeyR" && !event.repeat) {
    pendingReset = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (!isControlEvent(event)) return;
  event.preventDefault();

  if (event.code === "KeyW") held.leftUp = false;
  if (event.code === "KeyS") held.leftDown = false;
  if (event.code === "ArrowUp") held.rightUp = false;
  if (event.code === "ArrowDown") held.rightDown = false;
});

function draw() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  const { leftPaddle, rightPaddle, ball, score } = state;
  ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "32px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(String(score.left), canvas.width * 0.25, 16);
  ctx.fillText(String(score.right), canvas.width * 0.75, 16);

  if (state.status === "paused") {
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
  }
}

function frame(now) {
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  if (dt > 0.1) dt = 0.1;
  if (dt < 0) dt = 0;

  if (pendingReset) {
    state = resetGame();
    pendingReset = false;
    pendingTogglePause = false;
  } else {
    const input = {
      leftUp: held.leftUp,
      leftDown: held.leftDown,
      rightUp: held.rightUp,
      rightDown: held.rightDown,
      togglePause: pendingTogglePause
    };
    pendingTogglePause = false;
    state = updateGame(state, input, dt);
  }

  draw();
  requestAnimationFrame(frame);
}

draw();
requestAnimationFrame(frame);
