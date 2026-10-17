import { createInitialState, updateGame, resetGame } from './gameLogic.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let state = createInitialState();
const held = new Set();
let pendingPause = false;
let lastTime = null;
const controls = new Set(['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown', 'Space', 'KeyR']);

window.addEventListener('keydown', event => {
  if (!controls.has(event.code)) return;
  event.preventDefault();
  if (event.code === 'Space') {
    if (!event.repeat && !held.has('Space')) pendingPause = true;
  } else if (event.code === 'KeyR') {
    if (!event.repeat && !held.has('KeyR')) {
      state = resetGame();
      pendingPause = false;
    }
  }
  held.add(event.code);
});
window.addEventListener('keyup', event => {
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
  ctx.textAlign = 'center';
  ctx.font = '36px sans-serif';
  ctx.fillText(String(state.score.left), canvas.width * 0.25, 50);
  ctx.fillText(String(state.score.right), canvas.width * 0.75, 50);
  if (state.status === 'paused') {
    ctx.font = '32px sans-serif';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 45);
  }
}

function frame(timestamp) {
  const dt = lastTime === null ? 0 : Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;
  state = updateGame(state, {
    leftUp: held.has('KeyW'),
    leftDown: held.has('KeyS'),
    rightUp: held.has('ArrowUp'),
    rightDown: held.has('ArrowDown'),
    togglePause: pendingPause
  }, dt);
  pendingPause = false;
  render();
  requestAnimationFrame(frame);
}

render();
requestAnimationFrame(frame);
