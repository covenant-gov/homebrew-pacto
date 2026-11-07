# homebrew-pacto

Homebrew tap for [Pacto](https://github.com/covenant-gov/pacto-app), a private, censorship-resistant community organizing platform.

## Install

```bash
brew tap covenant-gov/pacto
brew trust --cask covenant-gov/pacto/pacto
brew install --cask pacto
```

Or in one line:

```bash
brew install --cask covenant-gov/pacto/pacto
```

## Unsigned app warning

Pacto is not yet signed or notarized by Apple. Homebrew applies the `com.apple.quarantine` attribute by default, so Gatekeeper shows the app as **damaged** on first launch.

After installing, remove the quarantine attribute:

```bash
xattr -r -d com.apple.quarantine /Applications/Pacto.app
```

Then launch Pacto from Applications.

The proper fix is Apple Developer ID signing + notarization. Once that is in place, `brew install --cask pacto` will open without any manual steps.

## Manual macOS install

If you prefer not to use Homebrew, download the DMG for your Mac from the [latest release](https://github.com/covenant-gov/pacto-app/releases/latest):

- Apple Silicon: `Pacto_<version>_aarch64.dmg`
- Intel: `Pacto_<version>_x64.dmg`

Open the DMG, drag `Pacto.app` to **Applications**, then run the `xattr` command above.

## How this tap is updated

Nobody edits `Casks/pacto.rb` by hand. Publishing a release in
[pacto-app](https://github.com/covenant-gov/pacto-app) opens a
`chore/bump-v<version>` PR here with the new version and the sha256 of the two
published DMGs.

`.github/workflows/release-bump.yaml` then verifies that PR and merges it in
two jobs so brew validation never shares merge credentials:

**`verify` (macOS, read + comment only)** checks out the PR head with
`persist-credentials: false` and runs every gate:

- only `Casks/pacto.rb` may change;
- the cask version equals the branch's tag, is newer than `main`, and that tag
  is a published, non-draft, non-prerelease release in pacto-app;
- both DMGs are downloaded from the cask's own URLs and their sha256 compared
  against the cask;
- the runner explicitly trusts only `covenant-gov/pacto/pacto` after checksum
  verification, as required by [Homebrew tap trust](https://docs.brew.sh/Tap-Trust);
- `brew style` and `brew audit --cask --strict --online` pass;
- the cask installs and its app bundle lands in `/Applications`.

**`merge` (Linux, contents + pull-requests write)** never checks out PR code and
never runs brew. It revalidates the same-repo `chore/bump-v*` identity, exact
head SHA, path filter, and published release, then squash-merges with
`--match-head-commit`, deletes the branch, and closes superseded bump PRs.

A failing verify gate leaves the PR open with a comment naming the gate, and the
release run in pacto-app goes red.

## Workflow regression check

Run `node --test test/release-bump.test.mjs`. The tests exercise trust/audit and
install scripts against stub `brew`/`gh` commands and assert credential-boundary
policy in the workflow YAML; they do not change trust or install software on the
developer's machine.
