cask "pacto" do
  arch arm: "aarch64", intel: "x64"

  version "0.8.0"
  sha256 arm:   "6e7382dd52bad11823ddba1c4bb8ec47334a6ee4e95e18e95e56ac93f3b12eb0",
         intel: "f510c27c7a3764cfe4406c9add001114e7e1795e97024333f001c2998c3a6a97"

  url "https://github.com/covenant-gov/pacto-app/releases/download/v#{version}/Pacto_#{version}_#{arch}.dmg"
  name "Pacto"
  desc "Private, censorship-resistant community organizing platform"
  homepage "https://github.com/covenant-gov/pacto-app"

  livecheck do
    url :url
    regex(/^v?(\d+(?:\.\d+)+)$/i)
  end

  auto_updates true
  depends_on :macos

  app "Pacto.app"

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

      xattr -r -d com.apple.quarantine /Applications/Pacto.app
  EOS
end
