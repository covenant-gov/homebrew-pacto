cask "pacto" do
  arch arm: "aarch64", intel: "x64"

  version "0.3.0"
  sha256 arm:   "REPLACE_WITH_SHA256_FOR_AARCH64_DMG",
         intel: "REPLACE_WITH_SHA256_FOR_X64_DMG"

  url "https://github.com/covenant-gov/pacto-app/releases/download/v#{version}/pacto_#{version}_#{arch}.dmg"
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
end
