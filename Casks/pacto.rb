cask "pacto" do
  arch arm: "aarch64", intel: "x64"

  version "0.7.2"
  sha256 arm:   "a784bda2c52161ba70c0095c9b7ae71c8f45ad15bd80893b6414951f87b813b1",
         intel: "66c0c0cde64039b2f2aa41cadd6edeab81ceb112f4cc4e01ed35a2924fa8af84"

  url "https://github.com/covenant-gov/pacto-app/releases/download/v#{version}/Pacto_#{version}_#{arch}.dmg"
  name "Pacto"
  desc "Private, censorship-resistant community organizing platform"
  homepage "https://github.com/covenant-gov/pacto-app"

  livecheck do
    url :url
    regex(/^v?(\d+(?:\.\d+)+)$/i)
  end

  auto_updates true

  app "pacto.app"

  zap trash: [
    "~/Library/Application Support/io.pacto",
    "~/Library/Caches/io.pacto",
    "~/Library/Logs/io.pacto",
    "~/Library/Preferences/io.pacto.plist",
    "~/Library/Saved Application State/io.pacto.savedState",
  ]

  caveats <<~EOS
    Pacto is currently distributed without Apple code signing or notarization.
    After installation, remove the quarantine attribute to open the app:

      xattr -r -d com.apple.quarantine /Applications/pacto.app
  EOS
end
