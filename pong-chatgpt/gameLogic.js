// Pure simulation module. Distances are pixels and dt is in seconds.
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
    score: { left: 0, right: 0 },
  };
}

export function resetGame() {
  return createInitialState();
}

function cloneState(state) {
  return {
    ...state,
    leftPaddle: { ...state.leftPaddle },
    rightPaddle: { ...state.rightPaddle },
    ball: { ...state.ball },
    score: { ...state.score },
  };
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function movePaddle(paddle, up, down, dt) {
  const direction = Number(Boolean(down)) - Number(Boolean(up));
  paddle.y = clamp(paddle.y + direction * PADDLE_SPEED * dt, 0, HEIGHT - paddle.height);
}

// Earliest contact of a moving circle with the paddle's FRONT face or
// the two front corners. The paddle is fixed for this simulation timestep.
function paddleHit(ball, paddle, isLeft, duration) {
  if (isLeft ? ball.vx >= 0 : ball.vx <= 0) return Infinity;

  const faceX = isLeft ? paddle.x + paddle.width : paddle.x;
  const targetX = faceX + (isLeft ? ball.radius : -ball.radius);
  let best = Infinity;
  const faceTime = (targetX - ball.x) / ball.vx;
  if (faceTime >= -EPS && faceTime <= duration + EPS) {
    const y = ball.y + ball.vy * faceTime;
    if (y >= paddle.y - EPS && y <= paddle.y + paddle.height + EPS) {
      best = Math.max(0, faceTime);
    }
  }

  // Exact circular corner intersection, rather than an expanded AABB.
  for (const cornerY of [paddle.y, paddle.y + paddle.height]) {
    const dx = ball.x - faceX;
    const dy = ball.y - cornerY;
    const a = ball.vx * ball.vx + ball.vy * ball.vy;
    const b = 2 * (dx * ball.vx + dy * ball.vy);
    const c = dx * dx + dy * dy - ball.radius * ball.radius;
    const discriminant = b * b - 4 * a * c;
    if (a === 0 || discriminant < 0) continue;
    const root = (-b - Math.sqrt(discriminant)) / (2 * a);
    if (root < -EPS || root > duration + EPS) continue;
    const t = Math.max(0, root);
    const x = ball.x + ball.vx * t;
    const y = ball.y + ball.vy * t;
    const onFront = isLeft ? x >= faceX - EPS : x <= faceX + EPS;
    const outsideEnd = cornerY === paddle.y ? y <= paddle.y + EPS : y >= paddle.y + paddle.height - EPS;
    // Reject motion away from the corner and existing overlapping contacts.
    const approaching = (x - faceX) * ball.vx + (y - cornerY) * ball.vy < -EPS;
    if (onFront && outsideEnd && approaching) best = Math.min(best, t);
  }
  return best;
}

function serveAfterScore(next, scorer) {
  next.score[scorer] += 1;
  const total = next.score.left + next.score.right;
  next.ball.x = WIDTH / 2;
  next.ball.y = HEIGHT / 2;
  next.ball.vx = total % 2 === 1 ? -200 : 200;
  next.ball.vy = 150;
}

export function updateGame(state, input, dt) {
  if (typeof dt !== 'number' || !Number.isFinite(dt) || dt < 0 || dt > 0.1) {
    throw new RangeError('dt must be a finite number between 0 and 0.1 seconds');
  }
  const next = cloneState(state);
  const keys = input ?? {};

  if (keys.togglePause) {
    next.status = next.status === 'playing' ? 'paused' : 'playing';
    return next;
  }
  if (next.status === 'paused' || dt === 0) return next;

  movePaddle(next.leftPaddle, keys.leftUp, keys.leftDown, dt);
  movePaddle(next.rightPaddle, keys.rightUp, keys.rightDown, dt);

  const ball = next.ball;
  let remaining = dt;
  // Every collision reverses at least one velocity component. A small event
  // limit guards against non-progressing degenerate externally supplied states.
  for (let events = 0; events < 64 && remaining > 0; events++) {
    if (ball.x + ball.radius < 0) {
      serveAfterScore(next, 'right');
      return next;
    }
    if (ball.x - ball.radius > WIDTH) {
      serveAfterScore(next, 'left');
      return next;
    }

    const wallY = ball.vy < 0 ? ball.radius : HEIGHT - ball.radius;
    const wallTime = ball.vy === 0 ? Infinity : (wallY - ball.y) / ball.vy;
    const wall = wallTime >= -EPS ? Math.max(0, wallTime) : Infinity;
    const left = paddleHit(ball, next.leftPaddle, true, remaining);
    const right = paddleHit(ball, next.rightPaddle, false, remaining);

    // Crossing the score line is a strict inequality. There must be time
    // remaining after reaching the line to score on this call.
    const scoreBoundary = ball.vx < 0 ? -ball.radius : WIDTH + ball.radius;
    const scoreTimeRaw = ball.vx === 0 ? Infinity : (scoreBoundary - ball.x) / ball.vx;
    const scoreTime = scoreTimeRaw >= 0 && scoreTimeRaw < remaining ? scoreTimeRaw : Infinity;
    const hitTime = Math.min(remaining, wall, left, right, scoreTime);
    ball.x += ball.vx * hitTime;
    ball.y += ball.vy * hitTime;
    remaining -= hitTime;

    // Score takes priority when it occurs at the same time as another event.
    if (scoreTime !== Infinity && Math.abs(scoreTime - hitTime) <= EPS) {
      serveAfterScore(next, ball.vx < 0 ? 'right' : 'left');
      return next;
    }

    const hitWall = wall !== Infinity && Math.abs(wall - hitTime) <= EPS;
    const hitPaddle = (left !== Infinity && Math.abs(left - hitTime) <= EPS) ||
      (right !== Infinity && Math.abs(right - hitTime) <= EPS);
    if (hitWall) {
      ball.y = wallY;
      ball.vy = -ball.vy;
    }
    if (hitPaddle) {
      // Place the center clear of the contacted front plane when contact
      // occurred on the face; corner contacts move away by reflected vx.
      ball.vx = -ball.vx;
    }
    if (!hitWall && !hitPaddle) break;
  }
  return next;
}
