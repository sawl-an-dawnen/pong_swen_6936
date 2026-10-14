import test from 'node:test';
import assert from 'node:assert/strict';
const moduleUrl = process.env.PONG_IMPL_URL;
if (!moduleUrl) throw new Error('Use runner.mjs --impl PATH');
const impl = await import(moduleUrl);
for (const name of ['createInitialState','updateGame','resetGame'])
  assert.equal(typeof impl[name], 'function', `Required export missing: ${name}`);
const {createInitialState: initial, updateGame: step, resetGame: reset} = impl;
const approx = (actual, expected, name='value') =>
  assert.ok(Number.isFinite(actual) && Math.abs(actual-expected)<=1e-6,
    `${name}: expected ${expected}, received ${actual}`);
const stateWith = ({ball, leftPaddle, rightPaddle, score, status}={}) => {
  const s = initial();
  if (ball) Object.assign(s.ball,ball);
  if (leftPaddle) Object.assign(s.leftPaddle,leftPaddle);
  if (rightPaddle) Object.assign(s.rightPaddle,rightPaddle);
  if (score) Object.assign(s.score,score);
  if (status) s.status=status;
  return s;
};
test('PONG-T01 initial state exact public values',()=>{
  assert.deepEqual(initial(),{
    status:'playing',
    leftPaddle:{x:30,y:210,width:12,height:80},
    rightPaddle:{x:758,y:210,width:12,height:80},
    ball:{x:400,y:250,vx:200,vy:150,radius:8},
    score:{left:0,right:0}
  });
});
test('PONG-T02 left paddle moves upward 30 px',()=>{
  approx(step(initial(),{leftUp:true},.1).leftPaddle.y,180);
});
test('PONG-T03 right paddle moves downward 30 px',()=>{
  approx(step(initial(),{rightDown:true},.1).rightPaddle.y,240);
});
test('PONG-T04 paddle y clamped at both boundaries',()=>{
  let s=stateWith({leftPaddle:{y:5},rightPaddle:{y:415}});
  let n=step(s,{leftUp:true,rightDown:true},.1);
  approx(n.leftPaddle.y,0); approx(n.rightPaddle.y,420);
  approx(n.leftPaddle.x,30); approx(n.rightPaddle.x,758);
});
test('PONG-T05 ball advances exactly in collision-free update',()=>{
  let b=step(initial(),{},.1).ball;
  approx(b.x,420); approx(b.y,265);
  approx(b.vx,200); approx(b.vy,150);
});
test('PONG-T06 top wall reflects with overshoot resolution',()=>{
  let b=step(stateWith({ball:{x:400,y:10,vx:200,vy:-150}}),{},.1).ball;
  approx(b.x,420); approx(b.y,21); approx(b.vy,150);
});
test('PONG-T07 bottom wall reflects with overshoot resolution',()=>{
  let b=step(stateWith({ball:{x:400,y:490,vx:200,vy:150}}),{},.1).ball;
  approx(b.x,420); approx(b.y,479); approx(b.vy,-150);
});
test('PONG-T08 left paddle reverses vx without changing vy',()=>{
  let b=step(stateWith({ball:{x:60,y:250,vx:-200,vy:0}}),{},.1).ball;
  approx(b.vx,200); approx(b.vy,0); approx(b.x,60);
});
test('PONG-T09 right paddle reverses vx without changing vy',()=>{
  let b=step(stateWith({ball:{x:740,y:250,vx:200,vy:0}}),{},.1).ball;
  approx(b.vx,-200); approx(b.vy,0); approx(b.x,740);
});
test('PONG-T10 right exit awards left point once',()=>{
  let n=step(stateWith({ball:{x:810,y:100,vx:200,vy:0}}),{},.1);
  assert.deepEqual(n.score,{left:1,right:0});
});
test('PONG-T11 left exit awards right point once',()=>{
  let n=step(stateWith({ball:{x:-10,y:100,vx:-200,vy:0}}),{},.1);
  assert.deepEqual(n.score,{left:0,right:1});
});
test('PONG-T12 score resets ball, alternates serves, preserves paddles',()=>{
  let s=stateWith({ball:{x:810,y:100,vx:200,vy:0},leftPaddle:{y:125}});
  let n=step(s,{},.1);
  assert.deepEqual(n.ball,{x:400,y:250,vx:-200,vy:150,radius:8});
  approx(n.leftPaddle.y,125);
  s=stateWith({ball:{x:-10,y:100,vx:-200,vy:0},score:{left:1,right:0}});
  n=step(s,{},.1);
  assert.deepEqual(n.ball,{x:400,y:250,vx:200,vy:150,radius:8});
  assert.deepEqual(n.score,{left:1,right:1});
});
test('PONG-T13 pause toggle changes status without movement',()=>{
  const s=initial(), n=step(s,{togglePause:true,leftUp:true},.1);
  assert.equal(n.status,'paused');
  assert.deepEqual({...n,status:'playing'},s);
});
test('PONG-T14 paused freezes; resume toggle does not advance',()=>{
  const s=stateWith({status:'paused'});
  assert.deepEqual(step(s,{leftUp:true},.1),s);
  const n=step(s,{togglePause:true,leftUp:true},.1);
  assert.deepEqual(n,{...s,status:'playing'});
  assert.notDeepEqual(step(n,{leftUp:true},.1),n);
});
test('PONG-T15 reset restores values with fresh nested objects',()=>{
  const a=reset(),b=reset();
  assert.deepEqual(a,initial()); assert.notStrictEqual(a,b);
  assert.notStrictEqual(a.ball,b.ball); assert.notStrictEqual(a.score,b.score);
});
test('PONG-T16 same state/input/dt gives identical results',()=>{
  const s=stateWith({ball:{x:400,y:485,vy:150}});
  assert.deepEqual(step(s,{rightUp:true},.1),step(s,{rightUp:true},.1));
});
test('PONG-T17 original and nested objects are not mutated or aliased',()=>{
  const s=initial(), before=structuredClone(s);
  const n=step(s,{leftUp:true},.1);
  assert.deepEqual(s,before);
  assert.notStrictEqual(n,s);
  for (const key of ['ball','score','leftPaddle','rightPaddle'])
    assert.notStrictEqual(n[key],s[key],`${key} is aliased`);
});
test('PONG-T18 invalid dt throws RangeError',()=>{
  for (const dt of [-.01,.101,NaN,Infinity,-Infinity,'0.1',null,undefined])
    assert.throws(()=>step(initial(),{},dt),RangeError,`dt=${dt}`);
});
test('PONG-T19 opposite directions cancel for each paddle',()=>{
  const n=step(initial(),{leftUp:true,leftDown:true,rightUp:true,rightDown:true},.1);
  approx(n.leftPaddle.y,210); approx(n.rightPaddle.y,210);
});
test('PONG-T20 swept paddle collision prevents tunneling',()=>{
  const n=step(stateWith({ball:{x:58,y:250,vx:-500,vy:0}}),{},.1);
  assert.ok(n.ball.vx>0,'ball must bounce even if endpoint is past paddle');
  assert.equal(n.score.right,0);
});
test('PONG-T21 dt zero causes no movement or scoring',()=>{
  const s=initial();
  assert.deepEqual(step(s,{leftUp:true},0),s);
  assert.equal(step(s,{togglePause:true},0).status,'paused');
});
test('PONG-T22 moving away from paddle does not re-trigger collision',()=>{
  const n=step(stateWith({ball:{x:49,y:250,vx:200,vy:0}}),{},.1);
  approx(n.ball.vx,200); approx(n.ball.x,69);
});
