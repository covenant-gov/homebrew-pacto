cask "pacto" do
  arch arm: "aarch64", intel: "x64"

  version "0.8.1"
  sha256 arm:   "18c30e76ed22b75d587bb7da301771fa4b5356eeba13bac523dc35e76cc493cd",
         intel: "d42fc84074dc2d3a3fe3455fb7c2bffdde75a1d4dd854eb9af7f90c1226ec2bd"

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
