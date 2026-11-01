cask "pacto" do
  arch arm: "aarch64", intel: "x64"

  version "0.7.5"
  sha256 arm:   "34b3683d2688674283613f54f4d421b5075b92e966ccb8c934937c62827cb645",
         intel: "03921d633f2ef511665a4569b8506b4874c7a96f19e6d07e1b9f5ccc2e163016"

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
