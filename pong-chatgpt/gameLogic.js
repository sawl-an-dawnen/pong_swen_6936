// Pure simulation: no browser globals, clocks, or randomness.
const WIDTH = 800;
const HEIGHT = 500;
const PADDLE_SPEED = 300;
const EPS = 1e-10;

export function createInitialState() {
  return {
    status: 'playing',
    leftPaddle: { x: 30, y: 210, width: 12, height: 80 },
    rightPaddle: { x: 758, y: 210, width: 12, height: 80 },
    ball: { x: 400, y: 250, vx: 200, vy: 150, radius: 8 },
    score: { left: 0, right: 0 }
  };
}

export function resetGame() {
  return createInitialState();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function movePaddle(paddle, up, down, dt) {
  const direction = Number(Boolean(down)) - Number(Boolean(up));
  paddle.y = clamp(paddle.y + direction * PADDLE_SPEED * dt, 0, HEIGHT - paddle.height);
}

// Return the earliest time when a moving circle first contacts a rectangle.
// The boundary of the radius-expanded rectangle consists of four straight
// segments and four quarter-circles, so corner contact is detected exactly.
function paddleContact(ball, paddle, limit) {
  const { x, y, vx, vy, radius: r } = ball;
  const left = paddle.x;
  const right = left + paddle.width;
  const top = paddle.y;
  const bottom = top + paddle.height;
  let earliest = Infinity;

  function candidate(t, valid) {
    if (t >= -EPS && t <= limit + EPS && valid(t)) earliest = Math.min(earliest, Math.max(0, t));
  }

  if (vx > 0) candidate((left - r - x) / vx, t => y + vy * t >= top - EPS && y + vy * t <= bottom + EPS);
  if (vx < 0) candidate((right + r - x) / vx, t => y + vy * t >= top - EPS && y + vy * t <= bottom + EPS);
  if (vy > 0) candidate((top - r - y) / vy, t => x + vx * t >= left - EPS && x + vx * t <= right + EPS);
  if (vy < 0) candidate((bottom + r - y) / vy, t => x + vx * t >= left - EPS && x + vx * t <= right + EPS);

  const a = vx * vx + vy * vy;
  if (a > 0) {
    for (const cx of [left, right]) {
      for (const cy of [top, bottom]) {
        const dx = x - cx;
        const dy = y - cy;
        const b = 2 * (dx * vx + dy * vy);
        const c = dx * dx + dy * dy - r * r;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) continue;
        const t = (-b - Math.sqrt(discriminant)) / (2 * a);
        candidate(t, time => {
          const px = x + vx * time;
          const py = y + vy * time;
          return (cx === left ? px <= left + EPS : px >= right - EPS) &&
            (cy === top ? py <= top + EPS : py >= bottom - EPS);
        });
      }
    }
  }
  return earliest;
}

function scorePoint(next, side) {
  next.score[side] += 1;
  const total = next.score.left + next.score.right;
  next.ball.x = WIDTH / 2;
  next.ball.y = HEIGHT / 2;
  next.ball.vx = total % 2 === 1 ? -200 : 200;
  next.ball.vy = 150;
}

export function updateGame(state, input, dt) {
  if (typeof dt !== 'number' || !Number.isFinite(dt) || dt < 0 || dt > 0.1) {
    throw new RangeError('dt must be a finite number in [0, 0.1]');
  }
  const keys = input ?? {};
  const next = {
    ...state,
    leftPaddle: { ...state.leftPaddle },
    rightPaddle: { ...state.rightPaddle },
    ball: { ...state.ball },
    score: { ...state.score }
  };

  if (keys.togglePause) {
    next.status = next.status === 'playing' ? 'paused' : 'playing';
    return next;
  }
  if (next.status === 'paused' || dt === 0) return next;

  movePaddle(next.leftPaddle, keys.leftUp, keys.leftDown, dt);
  movePaddle(next.rightPaddle, keys.rightUp, keys.rightDown, dt);

  const ball = next.ball;
  let remaining = dt;
  // Each collision must consume positive time or change the active collision
  // surface; zero-time contacts are suppressed for the next event only.
  let suppressed = null;
  for (let iteration = 0; iteration < 100 && remaining > 0; iteration++) {
    const events = [];
    const add = (time, kind) => {
      if (time >= -EPS && time <= remaining + EPS && !(time <= EPS && kind === suppressed)) {
        events.push({ time: Math.max(0, time), kind });
      }
    };

    if (ball.vy < 0) add((ball.radius - ball.y) / ball.vy, 'top');
    if (ball.vy > 0) add((HEIGHT - ball.radius - ball.y) / ball.vy, 'bottom');

    // Only approach the inside-facing side of the appropriate paddle.
    if (ball.vx < 0) {
      const t = paddleContact(ball, next.leftPaddle, remaining);
      if (Number.isFinite(t)) add(t, 'leftPaddle');
    }
    if (ball.vx > 0) {
      const t = paddleContact(ball, next.rightPaddle, remaining);
      if (Number.isFinite(t)) add(t, 'rightPaddle');
    }

    // Scoring is strictly beyond the boundary; at exact equality there is no score.
    if (ball.vx < 0) {
      const t = (-ball.radius - ball.x) / ball.vx;
      if (t < remaining - EPS || (t < 0 && ball.x + ball.radius < 0)) add(t, 'scoreRight');
    }
    if (ball.vx > 0) {
      const t = (WIDTH + ball.radius - ball.x) / ball.vx;
      if (t < remaining - EPS || (t < 0 && ball.x - ball.radius > WIDTH)) add(t, 'scoreLeft');
    }

    if (events.length === 0) {
      ball.x += ball.vx * remaining;
      ball.y += ball.vy * remaining;
      break;
    }
    const first = Math.min(...events.map(event => event.time));
    ball.x += ball.vx * first;
    ball.y += ball.vy * first;
    remaining -= first;
    const simultaneous = events.filter(event => Math.abs(event.time - first) <= EPS);

    if (simultaneous.some(event => event.kind === 'scoreLeft')) {
      scorePoint(next, 'left');
      return next;
    }
    if (simultaneous.some(event => event.kind === 'scoreRight')) {
      scorePoint(next, 'right');
      return next;
    }

    const hitWall = simultaneous.some(event => event.kind === 'top' || event.kind === 'bottom');
    const hitPaddle = simultaneous.some(event => event.kind === 'leftPaddle' || event.kind === 'rightPaddle');
    if (hitWall) {
      ball.vy = -ball.vy;
      ball.y = clamp(ball.y, ball.radius, HEIGHT - ball.radius);
    }
    if (hitPaddle) {
      ball.vx = -ball.vx;
      const paddle = simultaneous.some(event => event.kind === 'leftPaddle') ? next.leftPaddle : next.rightPaddle;
      // Keep the ball on the playfield-facing side after contact.
      if (paddle === next.leftPaddle) ball.x = Math.max(ball.x, paddle.x + paddle.width + ball.radius);
      else ball.x = Math.min(ball.x, paddle.x - ball.radius);
    }
    suppressed = hitPaddle ? (ball.vx > 0 ? 'leftPaddle' : 'rightPaddle') :
      (hitWall ? (ball.vy > 0 ? 'top' : 'bottom') : null);
  }
  return next;
}
