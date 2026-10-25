const PLAYFIELD_WIDTH = 800;
const PLAYFIELD_HEIGHT = 500;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_SPEED = 300;
const PADDLE_Y_MIN = 0;
const PADDLE_Y_MAX = 420;
const LEFT_PADDLE_X = 30;
const RIGHT_PADDLE_X = 758;
const BALL_RADIUS = 8;
const BALL_START_X = 400;
const BALL_START_Y = 250;
const BALL_START_VX = 200;
const BALL_START_VY = 150;
const WALL_TOP_Y = 8;
const WALL_BOTTOM_Y = 492;
const EVENT_EPS = 1e-6;
const MAX_BALL_EVENTS = 16;

function validateDt(dt) {
  if (typeof dt !== "number" || Number.isNaN(dt) || !Number.isFinite(dt) || dt < 0 || dt > 0.1) {
    throw new RangeError("dt must be a finite number in [0, 0.1]");
  }
}

function readInput(input) {
  const src = input && typeof input === "object" ? input : {};
  return {
    leftUp: !!src.leftUp,
    leftDown: !!src.leftDown,
    rightUp: !!src.rightUp,
    rightDown: !!src.rightDown,
    togglePause: !!src.togglePause
  };
}

function cloneState(state) {
  return {
    status: state.status,
    leftPaddle: { ...state.leftPaddle },
    rightPaddle: { ...state.rightPaddle },
    ball: { ...state.ball },
    score: { ...state.score }
  };
}

function movePaddle(paddle, up, down, dt) {
  let dir = 0;
  if (up && !down) dir = -1;
  else if (down && !up) dir = 1;
  let y = paddle.y + dir * PADDLE_SPEED * dt;
  if (y < PADDLE_Y_MIN) y = PADDLE_Y_MIN;
  if (y > PADDLE_Y_MAX) y = PADDLE_Y_MAX;
  return { ...paddle, y };
}

function closestPointOnPaddle(px, py, paddle) {
  const left = paddle.x;
  const right = paddle.x + paddle.width;
  const top = paddle.y;
  const bottom = paddle.y + paddle.height;
  return {
    x: Math.min(right, Math.max(left, px)),
    y: Math.min(bottom, Math.max(top, py))
  };
}

function overlapsPaddle(ball, paddle) {
  const closest = closestPointOnPaddle(ball.x, ball.y, paddle);
  const dx = ball.x - closest.x;
  const dy = ball.y - closest.y;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

function approachingPaddle(ball, side) {
  if (side === "left") return ball.vx < 0;
  return ball.vx > 0;
}

function timeToCorner(ball, cx, cy) {
  const dx = ball.x - cx;
  const dy = ball.y - cy;
  const a = ball.vx * ball.vx + ball.vy * ball.vy;
  if (a === 0) return Infinity;
  const b = 2 * (dx * ball.vx + dy * ball.vy);
  const c = dx * dx + dy * dy - ball.radius * ball.radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return Infinity;
  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);
  let best = Infinity;
  for (const t of [t1, t2]) {
    if (t < -EVENT_EPS) continue;
    const hitT = t < 0 ? 0 : t;
    const rx = dx + ball.vx * hitT;
    const ry = dy + ball.vy * hitT;
    if (rx * ball.vx + ry * ball.vy < 0) {
      if (hitT < best) best = hitT;
    }
  }
  return best;
}

function timeToPaddle(ball, paddle, side) {
  if (!approachingPaddle(ball, side)) return Infinity;
  if (overlapsPaddle(ball, paddle)) return 0;

  const r = ball.radius;
  const left = paddle.x;
  const right = paddle.x + paddle.width;
  const top = paddle.y;
  const bottom = paddle.y + paddle.height;
  let best = Infinity;

  const consider = (t, inFace) => {
    if (!Number.isFinite(t) || !inFace) return;
    if (t < -EVENT_EPS) return;
    const hitT = t < 0 ? 0 : t;
    if (hitT < best) best = hitT;
  };

  if (ball.vx !== 0) {
    const tRight = (right + r - ball.x) / ball.vx;
    const yRight = ball.y + ball.vy * (tRight < 0 ? 0 : tRight);
    consider(tRight, yRight >= top && yRight <= bottom);

    const tLeft = (left - r - ball.x) / ball.vx;
    const yLeft = ball.y + ball.vy * (tLeft < 0 ? 0 : tLeft);
    consider(tLeft, yLeft >= top && yLeft <= bottom);
  }

  if (ball.vy !== 0) {
    const tTop = (top - r - ball.y) / ball.vy;
    const xTop = ball.x + ball.vx * (tTop < 0 ? 0 : tTop);
    consider(tTop, xTop >= left && xTop <= right);

    const tBottom = (bottom + r - ball.y) / ball.vy;
    const xBottom = ball.x + ball.vx * (tBottom < 0 ? 0 : tBottom);
    consider(tBottom, xBottom >= left && xBottom <= right);
  }

  consider(timeToCorner(ball, left, top), true);
  consider(timeToCorner(ball, right, top), true);
  consider(timeToCorner(ball, left, bottom), true);
  consider(timeToCorner(ball, right, bottom), true);

  return best;
}

function timeToTopWall(ball) {
  if (ball.vy >= 0) return Infinity;
  if (ball.y <= WALL_TOP_Y) return 0;
  return (WALL_TOP_Y - ball.y) / ball.vy;
}

function timeToBottomWall(ball) {
  if (ball.vy <= 0) return Infinity;
  if (ball.y >= WALL_BOTTOM_Y) return 0;
  return (WALL_BOTTOM_Y - ball.y) / ball.vy;
}

function timeToLeftScore(ball, remaining) {
  if (ball.x + ball.radius < 0) return 0;
  if (ball.vx >= 0) return Infinity;
  const t = (-ball.radius - ball.x) / ball.vx;
  if (!Number.isFinite(t) || t < 0 || t >= remaining) return Infinity;
  return t;
}

function timeToRightScore(ball, remaining) {
  if (ball.x - ball.radius > PLAYFIELD_WIDTH) return 0;
  if (ball.vx <= 0) return Infinity;
  const t = (PLAYFIELD_WIDTH + ball.radius - ball.x) / ball.vx;
  if (!Number.isFinite(t) || t < 0 || t >= remaining) return Infinity;
  return t;
}

function resetBallAfterScore(state) {
  const total = state.score.left + state.score.right;
  state.ball.x = BALL_START_X;
  state.ball.y = BALL_START_Y;
  state.ball.vy = BALL_START_VY;
  state.ball.vx = total % 2 === 1 ? -BALL_START_VX : BALL_START_VX;
}

function separateFromPaddle(ball, paddle, side) {
  if (side === "left") {
    const minX = paddle.x + paddle.width + ball.radius;
    if (ball.x < minX) ball.x = minX;
  } else {
    const maxX = paddle.x - ball.radius;
    if (ball.x > maxX) ball.x = maxX;
  }
}

function integrateBall(state, dt) {
  const ball = state.ball;
  let remaining = dt;
  let steps = 0;

  while (remaining > 0 && steps < MAX_BALL_EVENTS) {
    steps += 1;
    const tTop = timeToTopWall(ball);
    const tBottom = timeToBottomWall(ball);
    const tLeftPaddle = timeToPaddle(ball, state.leftPaddle, "left");
    const tRightPaddle = timeToPaddle(ball, state.rightPaddle, "right");
    const tLeftScore = timeToLeftScore(ball, remaining);
    const tRightScore = timeToRightScore(ball, remaining);

    let tMin = remaining;
    const events = [];

    const consider = (t, name, isScore) => {
      if (!Number.isFinite(t)) return;
      if (t < -EVENT_EPS) return;
      const hitT = t < 0 ? 0 : t;
      if (isScore) {
        if (hitT >= remaining) return;
      } else if (hitT > remaining) {
        return;
      }
      if (hitT < tMin - EVENT_EPS) {
        tMin = hitT;
        events.length = 0;
        events.push(name);
      } else if (Math.abs(hitT - tMin) <= EVENT_EPS) {
        if (!events.includes(name)) events.push(name);
      }
    };

    consider(tTop, "top", false);
    consider(tBottom, "bottom", false);
    consider(tLeftPaddle, "leftPaddle", false);
    consider(tRightPaddle, "rightPaddle", false);
    consider(tLeftScore, "leftScore", true);
    consider(tRightScore, "rightScore", true);

    const scored = events.includes("leftScore") || events.includes("rightScore");
    if (scored) {
      if (events.includes("rightScore")) state.score.left += 1;
      if (events.includes("leftScore")) state.score.right += 1;
      resetBallAfterScore(state);
      return;
    }

    if (events.length === 0) {
      ball.x += ball.vx * remaining;
      ball.y += ball.vy * remaining;
      return;
    }

    ball.x += ball.vx * tMin;
    ball.y += ball.vy * tMin;
    remaining -= tMin;

    if (events.includes("top") || events.includes("bottom")) {
      ball.vy = -ball.vy;
      if (ball.y < WALL_TOP_Y) ball.y = WALL_TOP_Y;
      if (ball.y > WALL_BOTTOM_Y) ball.y = WALL_BOTTOM_Y;
    }
    if (events.includes("leftPaddle")) {
      ball.vx = -ball.vx;
      separateFromPaddle(ball, state.leftPaddle, "left");
    }
    if (events.includes("rightPaddle")) {
      ball.vx = -ball.vx;
      separateFromPaddle(ball, state.rightPaddle, "right");
    }
  }
}

export function createInitialState() {
  return {
    status: "playing",
    leftPaddle: {
      x: LEFT_PADDLE_X,
      y: 210,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT
    },
    rightPaddle: {
      x: RIGHT_PADDLE_X,
      y: 210,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT
    },
    ball: {
      x: BALL_START_X,
      y: BALL_START_Y,
      vx: BALL_START_VX,
      vy: BALL_START_VY,
      radius: BALL_RADIUS
    },
    score: { left: 0, right: 0 }
  };
}

export function resetGame() {
  return createInitialState();
}

export function updateGame(state, input, dt) {
  validateDt(dt);
  const keys = readInput(input);

  if (keys.togglePause) {
    const next = cloneState(state);
    next.status = state.status === "paused" ? "playing" : "paused";
    return next;
  }

  if (state.status === "paused") {
    return cloneState(state);
  }

  const next = cloneState(state);
  if (dt === 0) {
    return next;
  }

  next.leftPaddle = movePaddle(next.leftPaddle, keys.leftUp, keys.leftDown, dt);
  next.rightPaddle = movePaddle(next.rightPaddle, keys.rightUp, keys.rightDown, dt);
  integrateBall(next, dt);
  return next;
}
