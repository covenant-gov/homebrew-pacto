import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const workflow = readFileSync(new URL('../.github/workflows/release-bump.yaml', import.meta.url), 'utf8');
function script(name) {
  const step = workflow.split(`      - name: ${name}\n`)[1]?.split('      - name: ')[0] ?? '';
  return step.split('        run: |\n')[1]?.split('\n').filter(line => line.startsWith('          ')).map(line => line.slice(10)).join('\n') ?? '';
}

test('audit can load the release cask with only that cask trusted', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pacto-cask-trust-'));
  try {
    writeFileSync(path.join(dir, 'brew'), `#!/bin/bash
set -eu
printf '%s\\n' "$*" >> "$RUNNER_TEMP/calls"
case "$*" in
  'trust --cask covenant-gov/pacto/pacto') touch "$RUNNER_TEMP/trusted" ;;
  'style --cask covenant-gov/pacto/pacto') ;;
  'audit --cask --strict --online covenant-gov/pacto/pacto')
    if [ ! -f "$RUNNER_TEMP/trusted" ]; then
      echo 'Refusing to load cask covenant-gov/pacto/pacto from untrusted tap' >&2
      exit 1
    fi ;;
  *) echo "Unexpected brew command: $*" >&2; exit 1 ;;
esac
`, { mode: 0o755 });
    const result = spawnSync('bash', ['-eu', '-c', script('Trust the release cask') + '\n' + script('brew style and audit')], {
      encoding: 'utf8', env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, RUNNER_TEMP: dir, CASK_TOKEN: 'covenant-gov/pacto/pacto' },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(readFileSync(path.join(dir, 'calls'), 'utf8').trim().split('\n'), [
      'trust --cask covenant-gov/pacto/pacto',
      'style --cask covenant-gov/pacto/pacto',
      'audit --cask --strict --online covenant-gov/pacto/pacto',
    ]);
  } finally { rmSync(dir, {recursive:true, force:true}); }
});

test('trust follows checksum verification without disabling Homebrew protections', () => {
  assert.ok(workflow.indexOf('- name: Trust the release cask') > workflow.indexOf('- name: Checksums match'));
  assert.ok(workflow.indexOf('- name: Trust the release cask') < workflow.indexOf('- name: brew style and audit'));
  assert.doesNotMatch(workflow, /HOMEBREW_NO_REQUIRE_TAP_TRUST/);
  assert.match(workflow, /brew audit --cask --strict --online/);
  assert.match(workflow, /--match-head-commit "\$HEAD_SHA"/);
});
