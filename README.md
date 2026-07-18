# homebrew-pacto

Homebrew tap for [Pacto](https://github.com/covenant-gov/pacto-app), a private, censorship-resistant community organizing platform.

This repo is primarily a Homebrew tap for macOS, but the install instructions below cover all platforms Pacto builds for.

## macOS

### Homebrew

```bash
brew tap covenant-gov/pacto
brew install --cask pacto
```

Or in one line:

```bash
brew install --cask covenant-gov/pacto/pacto
```

Pacto is currently unsigned, so Homebrew's quarantine triggers Gatekeeper's **"damaged"** warning. After installing, run:

```bash
xattr -r -d com.apple.quarantine /Applications/pacto.app
```

### Manual install

1. Download the DMG for your Mac from the [latest release](https://github.com/covenant-gov/pacto-app/releases/latest):
   - Apple Silicon: `pacto_0.3.0_aarch64.dmg`
   - Intel: `pacto_0.3.0_x64.dmg`
2. Open the DMG and drag `pacto.app` to **Applications**.
3. Run the `xattr` command above to remove quarantine.

## Linux

Download the package for your distribution from the [latest release](https://github.com/covenant-gov/pacto-app/releases/latest). Examples below use v0.3.0; replace the version if a newer release is available.

### Debian / Ubuntu (AMD64)

```bash
curl -LO https://github.com/covenant-gov/pacto-app/releases/download/v0.3.0/pacto_0.3.0_amd64.deb
sudo dpkg -i pacto_0.3.0_amd64.deb
```

### Fedora / RHEL / openSUSE (x86_64)

```bash
curl -LO https://github.com/covenant-gov/pacto-app/releases/download/v0.3.0/pacto-0.3.0-1.x86_64.rpm
sudo dnf install ./pacto-0.3.0-1.x86_64.rpm
```

### AppImage

```bash
curl -LO https://github.com/covenant-gov/pacto-app/releases/download/v0.3.0/pacto_0.3.0_amd64.AppImage
chmod +x pacto_0.3.0_amd64.AppImage
./pacto_0.3.0_amd64.AppImage
```

## Windows

1. Download `pacto_0.3.0_x64_en-US.msi` from the [latest release](https://github.com/covenant-gov/pacto-app/releases/latest).
2. Run the installer and follow the prompts.

Windows Defender SmartScreen may warn that the app is unsigned. Click **More info** → **Run anyway**.

## Why is the macOS app "damaged"?

Pacto is not yet signed or notarized by Apple. macOS Gatekeeper rejects unsigned, quarantined apps with the "damaged" dialog. The `xattr` command removes the quarantine flag so the app can launch.

The proper fix is Apple Developer ID signing + notarization. Once that is in place, the macOS install will open without any manual steps.

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
