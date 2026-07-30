cask "pacto" do
  arch arm: "aarch64", intel: "x64"

  version "0.5.1"
  sha256 arm:   "878e98834057cd4b5f85883684ddc9864d9b58ba11c21c014f6f8b29d5fdcce7",
         intel: "ba6daa781835c40997756bb3415e66934bcce6b354f0c25da0bd11c0c3bc304b"

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
