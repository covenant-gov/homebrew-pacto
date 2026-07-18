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

- Pacto is currently distributed unsigned. On first launch macOS may show a warning that the developer cannot be verified. Go to **System Settings → Privacy & Security** and click **Open Anyway**.
- `brew install --cask` strips the quarantine flag by default, so you should see the gentler "unverified developer" prompt rather than the "damaged" dialog that browser downloads trigger.

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
