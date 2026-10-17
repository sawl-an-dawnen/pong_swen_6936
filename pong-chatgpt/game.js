import { createInitialState, updateGame, resetGame } from './gameLogic.js';

const canvas = document.querySelector('#pong');
const ctx = canvas.getContext('2d');
let state = createInitialState();
const held = new Set();
let pendingPause = false;
let lastTime = null;

const controls = new Set(['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown', 'Space', 'KeyR']);
window.addEventListener('keydown', (event) => {
  if (!controls.has(event.code)) return;
  event.preventDefault();
  if (event.code === 'Space' && !event.repeat && !held.has('Space')) pendingPause = true;
  if (event.code === 'KeyR' && !event.repeat && !held.has('KeyR')) {
    state = resetGame();
    pendingPause = false;
  }
  held.add(event.code);
});
window.addEventListener('keyup', (event) => {
  if (!controls.has(event.code)) return;
  event.preventDefault();
  held.delete(event.code);
});
window.addEventListener('blur', () => held.clear());

function render() {
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
  ctx.fillText(String(state.score.left), 330, 45);
  ctx.fillText(String(state.score.right), 470, 45);
  if (state.status === 'paused') {
    ctx.font = '38px monospace';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 50);
  }
}

function frame(timestamp) {
  const dt = lastTime === null ? 0 : Math.min(0.1, Math.max(0, (timestamp - lastTime) / 1000));
  lastTime = timestamp;
  state = updateGame(state, {
    leftUp: held.has('KeyW'),
    leftDown: held.has('KeyS'),
    rightUp: held.has('ArrowUp'),
    rightDown: held.has('ArrowDown'),
    togglePause: pendingPause,
  }, dt);
  pendingPause = false;
  render();
  requestAnimationFrame(frame);
}

render();
requestAnimationFrame(frame);
