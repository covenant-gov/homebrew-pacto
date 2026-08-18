cask "pacto" do
  arch arm: "aarch64", intel: "x64"

  version "0.6.1"
  sha256 arm:   "3639b61d75a427c69e79ac3de60112f418c60bd86a4540778e6750848ecde921",
         intel: "8798b72e031bbdc25b446218d4202978f84287fab1a4d2c9d1e73e85adfaa1c1"

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
