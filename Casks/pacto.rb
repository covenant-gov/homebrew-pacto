cask "pacto" do
  arch arm: "aarch64", intel: "x64"

  version "0.3.0"
  sha256 arm:   "5f2923f721c9c32b1d896bd0842a4f73f302049a3b6295874534bfd64a915417",
         intel: "7e7a4e6cf216166079675758fae11eb0a2d339e245c93d717872e440e007797c"

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
