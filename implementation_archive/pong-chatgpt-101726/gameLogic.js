// Pure, deterministic Pong simulation. No browser APIs or external dependencies.
const WIDTH = 800;
const HEIGHT = 500;
const PADDLE_SPEED = 300;
const BALL_X = 400;
const BALL_Y = 250;
const EPSILON = 1e-9;

export function createInitialState() {
  return {
    status: 'playing',
    leftPaddle: { x: 30, y: 210, width: 12, height: 80 },
    rightPaddle: { x: 758, y: 210, width: 12, height: 80 },
    ball: { x: BALL_X, y: BALL_Y, vx: 200, vy: 150, radius: 8 },
    score: { left: 0, right: 0 }
  };
}

export function resetGame() {
  return createInitialState();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function paddleMove(paddle, up, down, dt) {
  const direction = Number(Boolean(down)) - Number(Boolean(up));
  paddle.y = clamp(paddle.y + direction * PADDLE_SPEED * dt, 0, HEIGHT - paddle.height);
}

// The earliest entry into the rounded rectangle (a rectangle expanded by the
// ball radius with circular corners) is the swept circle/rectangle contact.
function paddleContact(ball, paddle, limit) {
  const { x, y, vx, vy, radius: r } = ball;
  const minX = paddle.x;
  const maxX = paddle.x + paddle.width;
  const minY = paddle.y;
  const maxY = paddle.y + paddle.height;

  // New collisions must approach the paddle from its playing-field face.
  const isLeft = paddle.x < WIDTH / 2;
  if ((isLeft && vx >= 0) || (!isLeft && vx <= 0)) return null;

  const face = isLeft ? maxX + r : minX - r;
  let best = null;
  function consider(t) {
    if (t < -EPSILON || t > limit + EPSILON) return;
    const time = Math.max(0, t);
    if (best === null || time < best) best = time;
  }

  // Front face: projected center must fall within paddle's vertical span.
  const faceTime = (face - x) / vx;
  const faceY = y + vy * faceTime;
  if (faceY >= minY - EPSILON && faceY <= maxY + EPSILON) consider(faceTime);

  // Rounded top/bottom corners: solve the swept circle against each corner.
  const cornerX = isLeft ? maxX : minX;
  for (const cornerY of [minY, maxY]) {
    const dx = x - cornerX;
    const dy = y - cornerY;
    const a = vx * vx + vy * vy;
    const b = 2 * (dx * vx + dy * vy);
    const c = dx * dx + dy * dy - r * r;
    const disc = b * b - 4 * a * c;
    if (disc < 0) continue;
    const t = (-b - Math.sqrt(disc)) / (2 * a);
    const atX = x + vx * t;
    const atY = y + vy * t;
    const inFront = isLeft ? atX >= cornerX - EPSILON : atX <= cornerX + EPSILON;
    const outsideY = cornerY === minY ? atY <= minY + EPSILON : atY >= maxY - EPSILON;
    if (inFront && outsideY) consider(t);
  }
  return best;
}

export function updateGame(state, input, dt) {
  if (typeof dt !== 'number' || !Number.isFinite(dt) || dt < 0 || dt > 0.1) {
    throw new RangeError('dt must be a finite number in [0, 0.1]');
  }

  const controls = input ?? {};
  const next = {
    status: state.status,
    leftPaddle: { ...state.leftPaddle },
    rightPaddle: { ...state.rightPaddle },
    ball: { ...state.ball },
    score: { ...state.score }
  };

  if (controls.togglePause) {
    next.status = next.status === 'playing' ? 'paused' : 'playing';
    return next;
  }
  if (next.status === 'paused' || dt === 0) return next;

  paddleMove(next.leftPaddle, controls.leftUp, controls.leftDown, dt);
  paddleMove(next.rightPaddle, controls.rightUp, controls.rightDown, dt);

  const ball = next.ball;
  let remaining = dt;
  // Small timesteps and fixed component speeds bound the number of events.
  for (let iteration = 0; iteration < 32 && remaining > EPSILON; iteration++) {
    const events = [];
    function addEvent(time, type) {
      if (time >= -EPSILON && time <= remaining + EPSILON) {
        events.push({ time: Math.max(0, time), type });
      }
    }

    if (ball.vy < 0) addEvent((ball.radius - ball.y) / ball.vy, 'top');
    if (ball.vy > 0) addEvent((HEIGHT - ball.radius - ball.y) / ball.vy, 'bottom');

    // Score only after full-ball exit, not on equality.
    if (ball.vx < 0) {
      const t = (-ball.radius - ball.x) / ball.vx;
      if (ball.x + ball.radius < 0) addEvent(0, 'scoreRight');
      else if (t < remaining - EPSILON) addEvent(Math.max(0, t), 'scoreRight');
    }
    if (ball.vx > 0) {
      const t = (WIDTH + ball.radius - ball.x) / ball.vx;
      if (ball.x - ball.radius > WIDTH) addEvent(0, 'scoreLeft');
      else if (t < remaining - EPSILON) addEvent(Math.max(0, t), 'scoreLeft');
    }

    const leftTime = paddleContact(ball, next.leftPaddle, remaining);
    const rightTime = paddleContact(ball, next.rightPaddle, remaining);
    if (leftTime !== null) addEvent(leftTime, 'left');
    if (rightTime !== null) addEvent(rightTime, 'right');

    if (events.length === 0) {
      ball.x += ball.vx * remaining;
      ball.y += ball.vy * remaining;
      remaining = 0;
      break;
    }

    const first = Math.min(...events.map(event => event.time));
    ball.x += ball.vx * first;
    ball.y += ball.vy * first;
    remaining -= first;
    const simultaneous = events.filter(event => Math.abs(event.time - first) <= EPSILON);

    const score = simultaneous.find(event => event.type.startsWith('score'));
    if (score) {
      if (score.type === 'scoreLeft') next.score.left += 1;
      else next.score.right += 1;
      const total = next.score.left + next.score.right;
      ball.x = BALL_X;
      ball.y = BALL_Y;
      ball.vx = total % 2 === 1 ? -200 : 200;
      ball.vy = 150;
      return next;
    }

    if (simultaneous.some(event => event.type === 'top' || event.type === 'bottom')) {
      ball.vy = -ball.vy;
      ball.y = clamp(ball.y, ball.radius, HEIGHT - ball.radius);
    }
    if (simultaneous.some(event => event.type === 'left' || event.type === 'right')) {
      ball.vx = -ball.vx;
      // Place the ball just outside the contacted paddle's front face.
      if (simultaneous.some(event => event.type === 'left')) {
        ball.x = Math.max(ball.x, next.leftPaddle.x + next.leftPaddle.width + ball.radius);
      }
      if (simultaneous.some(event => event.type === 'right')) {
        ball.x = Math.min(ball.x, next.rightPaddle.x - ball.radius);
      }
    }
  }
  return next;
}
