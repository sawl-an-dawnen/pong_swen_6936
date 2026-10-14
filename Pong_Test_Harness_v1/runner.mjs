import { spawnSync } from 'node:child_process';
import { resolve, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
const argv = process.argv.slice(2);
const ix = argv.indexOf('--impl');
const raw = ix >= 0 ? argv[ix+1] : process.env.PONG_IMPL;
if (!raw) {
  console.error('Usage: node runner.mjs --impl /absolute/path/to/gameLogic.js');
  process.exit(2);
}
const path = resolve(raw);
const label = argv.includes('--label') ? argv[argv.indexOf('--label')+1] : 'implementation';
const args = ['--test', '--test-reporter=tap', 'tests/pong.test.mjs'];
const result = spawnSync(process.execPath, args, {
  cwd: import.meta.dirname,
  encoding: 'utf8',
  env: {...process.env, PONG_IMPL_URL: pathToFileURL(path).href}
});
const output = (result.stdout || '') + (result.stderr || '');
process.stdout.write(output);
mkdirSync(resolve('results'), {recursive:true});
const filename = label.replace(/[^a-z0-9_-]/gi,'_') + '-latest.tap';
writeFileSync(resolve('results',filename), output);
console.log('Report saved: results/' + filename);
process.exit(result.status ?? 1);
