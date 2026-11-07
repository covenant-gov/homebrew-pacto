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

function jobBlock(name) {
  const marker = `  ${name}:\n`;
  const start = workflow.indexOf(marker);
  assert.ok(start >= 0, `missing job ${name}`);
  const rest = workflow.slice(start + marker.length);
  const next = rest.search(/\n  [a-zA-Z0-9_-]+:\n/);
  return rest.slice(0, next === -1 ? undefined : next);
}

const VERIFY_GATES = [
  'Only the cask may change',
  'Cask version is a newer published release',
  'Checksums match the DMGs the cask points at',
  'Trust the release cask',
  'brew style and audit',
  'Install and uninstall the cask',
];

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

test('workflow defaults to read-only; write lives only on the merge job', () => {
  assert.match(workflow, /^permissions:\n  contents: read\n/m);
  assert.doesNotMatch(workflow, /^permissions:\n(?:  .+\n)*  contents: write/m);
  const verify = jobBlock('verify');
  const merge = jobBlock('merge');
  assert.match(verify, /permissions:\n      contents: read\n      pull-requests: write\n/);
  assert.doesNotMatch(verify, /^\s+contents:\s*write\s*$/m);
  assert.match(merge, /permissions:\n      contents: write\n      pull-requests: write\n/);
  assert.match(merge, /needs:\s*verify/);
});

test('same-repo chore/bump-v gate is required on both jobs', () => {
  const gate = /if:\s*startsWith\(github\.head_ref, 'chore\/bump-v'\) && github\.event\.pull_request\.head\.repo\.full_name == github\.repository/;
  assert.match(jobBlock('verify'), gate);
  assert.match(jobBlock('merge'), gate);
});

test('checkout is SHA-pinned with persist-credentials false and only on verify', () => {
  assert.match(
    workflow,
    /uses:\s*actions\/checkout@d23441a48e516b6c34aea4fa41551a30e30af803\s*#\s*v6\.1\.0/,
  );
  assert.doesNotMatch(workflow, /uses:\s*actions\/checkout@v\d/);
  assert.match(workflow, /persist-credentials:\s*false/);
  assert.equal((workflow.match(/uses:\s*actions\/checkout@/g) || []).length, 1);
  assert.doesNotMatch(jobBlock('merge'), /actions\/checkout@/);
  assert.doesNotMatch(jobBlock('merge'), /brew install/);
  assert.doesNotMatch(jobBlock('merge'), /actions\/download-artifact/);
  assert.doesNotMatch(jobBlock('merge'), /needs\.verify\.outputs/);
});

test('GH_TOKEN is step-scoped and absent from brew install / trust / audit', () => {
  assert.doesNotMatch(workflow, /^env:\n(?:  .+\n)*  GH_TOKEN:/m);
  for (const name of [
    'Checksums match the DMGs the cask points at',
    'Tap the checkout for brew',
    'Trust the release cask',
    'brew style and audit',
    'Install and uninstall the cask',
  ]) {
    const step = workflow.split(`      - name: ${name}\n`)[1]?.split('      - name: ')[0] ?? '';
    assert.doesNotMatch(step, /GH_TOKEN:/, `${name} must not receive GH_TOKEN`);
  }
  for (const name of [
    'Only the cask may change',
    'Cask version is a newer published release',
    'Report the failing gate',
    'Revalidate identity and merge the verified commit',
    'Close superseded bump PRs',
  ]) {
    const step = workflow.split(`      - name: ${name}\n`)[1]?.split('      - name: ')[0] ?? '';
    assert.match(step, /GH_TOKEN:\s*\$\{\{\s*github\.token\s*\}\}/, `${name} needs explicit GH_TOKEN`);
  }
});

test('verify keeps every functional release gate; merge only merges', () => {
  const verify = jobBlock('verify');
  for (const name of VERIFY_GATES) {
    assert.match(verify, new RegExp(`- name: ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }
  assert.doesNotMatch(verify, /- name: Merge the verified commit/);
  assert.doesNotMatch(verify, /gh pr merge/);
  assert.doesNotMatch(verify, /Close superseded bump PRs/);
  const merge = jobBlock('merge');
  assert.match(merge, /- name: Revalidate identity and merge the verified commit/);
  assert.match(merge, /gh pr merge "\$PR"/);
  assert.match(merge, /--match-head-commit "\$HEAD_SHA"/);
  assert.match(merge, /Close superseded bump PRs/);
});

test('merge revalidates exact head SHA, same-repo, bump branch, path, and release', () => {
  const body = script('Revalidate identity and merge the verified commit');
  assert.match(body, /"\$head_sha" != "\$HEAD_SHA"/);
  assert.match(body, /"\$head_repo" != "\$GITHUB_REPOSITORY"/);
  assert.match(body, /chore\/bump-v\*/);
  assert.match(body, /"\$head_ref" != "\$HEAD_REF"/);
  assert.match(body, /"\$changed" != "\$CASK"/);
  assert.match(body, /gh release view "\$TAG" --repo "\$UPSTREAM"/);
  assert.doesNotMatch(body, /needs\.verify/);
  assert.doesNotMatch(body, /download-artifact/);
});

test('install fixture never runs real brew install locally', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pacto-cask-install-'));
  try {
    const apps = path.join(dir, 'Applications');
    writeFileSync(path.join(dir, 'brew'), `#!/bin/bash
set -eu
printf '%s\\n' "$*" >> "$RUNNER_TEMP/calls"
case "$*" in
  'install --cask covenant-gov/pacto/pacto')
    mkdir -p "$RUNNER_TEMP/fake-app/Pacto.app" "${apps}"
    ln -sfn "$RUNNER_TEMP/fake-app/Pacto.app" "${apps}/Pacto.app"
    ;;
  'uninstall --cask covenant-gov/pacto/pacto') rm -rf "${apps}/Pacto.app" ;;
  *) echo "Unexpected brew command: $*" >&2; exit 1 ;;
esac
`.replaceAll('${apps}', apps), { mode: 0o755 });
    writeFileSync(path.join(dir, 'pacto.rb'), '  app "Pacto.app"\n');
    const patched = script('Install and uninstall the cask')
      .replaceAll('/Applications/', `${apps}/`);
    const result = spawnSync('bash', ['-eu', '-c', patched], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        RUNNER_TEMP: dir,
        CASK_TOKEN: 'covenant-gov/pacto/pacto',
        CASK: path.join(dir, 'pacto.rb'),
      },
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.deepEqual(readFileSync(path.join(dir, 'calls'), 'utf8').trim().split('\n'), [
      'install --cask covenant-gov/pacto/pacto',
      'uninstall --cask covenant-gov/pacto/pacto',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('merge identity script rejects moved head without calling merge', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pacto-merge-gate-'));
  try {
    writeFileSync(path.join(dir, 'gh'), `#!/bin/bash
set -eu
printf '%s\\n' "$*" >> "$RUNNER_TEMP/calls"
cmd="\${1:-}"
case "$cmd" in
  api)
    # Moved-head fixture: SHA differs from HEAD_SHA; other fields stay valid.
    printf '%s\\t%s\\t%s\\t%s\\t%s\\n' \
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' \
      'covenant-gov/homebrew-pacto' \
      'chore/bump-v9.9.9' \
      'open' \
      'false'
    exit 0
    ;;
  pr)
    if [ "\${2:-}" = merge ]; then
      echo 'merge must not run' >&2
      exit 99
    fi
    ;;
esac
echo "Unexpected gh: $*" >&2
exit 1
`, { mode: 0o755 });
    const result = spawnSync('bash', ['-eu', '-c', script('Revalidate identity and merge the verified commit')], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        RUNNER_TEMP: dir,
        GITHUB_ENV: path.join(dir, 'github_env'),
        GITHUB_REPOSITORY: 'covenant-gov/homebrew-pacto',
        PR: '42',
        HEAD_SHA: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        HEAD_REF: 'chore/bump-v9.9.9',
        UPSTREAM: 'covenant-gov/pacto-app',
        CASK: 'Casks/pacto.rb',
      },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, /PR head moved/);
    assert.doesNotMatch(readFileSync(path.join(dir, 'calls'), 'utf8'), /^pr merge/m);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
