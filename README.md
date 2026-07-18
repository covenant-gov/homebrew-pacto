# homebrew-pacto

Homebrew tap for [Pacto](https://github.com/covenant-gov/pacto-app), a private, censorship-resistant community organizing platform.

## Install

```bash
brew tap covenant-gov/pacto
brew install --cask pacto
```

Or in one line:

```bash
brew install --cask covenant-gov/pacto/pacto
```

## Notes

- Pacto is currently distributed unsigned. Homebrew applies the `com.apple.quarantine` attribute by default, so Gatekeeper shows the app as **damaged** on first launch.
- After installing, remove the quarantine attribute:
  ```bash
  xattr -r -d com.apple.quarantine /Applications/pacto.app
  ```
- The proper fix is Apple Developer ID signing + notarization; once that is in place, `brew install --cask pacto` will open without any manual steps.

## Updating this tap

After each Pacto release, update `Casks/pacto.rb`:

1. Change `version` to the new tag (without the leading `v`).
2. Replace the two `sha256` values with the checksums of the release DMGs:
   ```bash
   shasum -a 256 pacto_0.3.0_aarch64.dmg
   shasum -a 256 pacto_0.3.0_x64.dmg
   ```
3. Verify the cask:
   ```bash
   brew audit --cask --strict Casks/pacto.rb
   brew install --cask Casks/pacto.rb
   ```
