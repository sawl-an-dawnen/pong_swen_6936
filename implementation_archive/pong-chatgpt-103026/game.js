import { createInitialState, updateGame, resetGame } from './gameLogic.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let state = createInitialState();
const held = new Set();
let pendingPause = false;
let previousTime = null;

const controls = new Set(['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown', 'Space', 'KeyR']);
window.addEventListener('keydown', (event) => {
  if (controls.has(event.code)) event.preventDefault();
  if (event.code === 'Space' && !event.repeat && !held.has('Space')) pendingPause = true;
  if (event.code === 'KeyR' && !event.repeat && !held.has('KeyR')) {
    state = resetGame();
    pendingPause = false;
  }
  held.add(event.code);
});
window.addEventListener('keyup', (event) => {
  if (controls.has(event.code)) event.preventDefault();
  held.delete(event.code);
});
window.addEventListener('blur', () => held.clear());

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  for (const paddle of [state.leftPaddle, state.rightPaddle]) {
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(String(state.score.left), 320, 45);
  ctx.fillText(String(state.score.right), 480, 45);
  if (state.status === 'paused') {
    ctx.font = '36px monospace';
    ctx.fillText('PAUSED', 400, 125);
  }
}

function frame(timestamp) {
  const dt = previousTime === null ? 0 : Math.min(0.1, Math.max(0, (timestamp - previousTime) / 1000));
  previousTime = timestamp;
  state = updateGame(state, {
    leftUp: held.has('KeyW'),
    leftDown: held.has('KeyS'),
    rightUp: held.has('ArrowUp'),
    rightDown: held.has('ArrowDown'),
    togglePause: pendingPause
  }, dt);
  pendingPause = false;
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
