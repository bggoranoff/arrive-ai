# ArriveAI — Setup & Deployment Guide

Terminal-only workflow for building and deploying with Neovim. No Xcode GUI required after initial setup.

## Prerequisites

### 1. Xcode (required)

Install from the Mac App Store (free, ~30 GB). Then point the developer tools to it:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

Verify:

```bash
xcodebuild -version
```

### 2. Node.js

```bash
brew install node
```

Verify:

```bash
node --version   # should be v18+
npm --version
```

### 3. Watchman (recommended)

Enables fast refresh during development:

```bash
brew install watchman
```

### 4. CocoaPods

```bash
brew install cocoapods
```

Or via Ruby:

```bash
sudo gem install cocoapods
```

Verify:

```bash
pod --version
```

### 5. iOS Simulator runtime

Download the iOS simulator (after Xcode is installed):

```bash
xcodebuild -downloadPlatform iOS
```

List available simulators:

```bash
xcrun simctl list devices available
```

### 6. Apple Developer account (for physical device only)

You need an Apple ID signed into Xcode for code signing. This is a one-time step that requires the Xcode GUI:

1. Open Xcode
2. Go to **Settings > Accounts** (Cmd+,)
3. Click **+** and sign in with your Apple ID
4. Under your account, click **Manage Certificates** and create an **Apple Development** certificate

A free Apple ID allows sideloading to your device for 7 days (max 3 apps). The Apple Developer Program ($99/year) removes these limits.

## Initial project setup

```bash
npm install
npx expo prebuild --platform ios
```

## Deploying to the iOS Simulator

### Build and run

```bash
npx expo run:ios
```

This builds the native project and launches it on the default simulator.

### Target a specific simulator

List available simulators:

```bash
xcrun simctl list devices available | grep iPhone
```

Run on a specific one:

```bash
npx expo run:ios --device "iPhone 16"
```

### Development server (hot reload)

For iterating quickly after the first build:

```bash
npx expo start
```

Then press `i` to open in the iOS simulator.

## Wireless development with Expo Go (no USB, no Xcode)

The fastest way to run the app on your iPhone during development. No code signing or native build required.

### 1. Install Expo Go

Download **Expo Go** from the App Store on your iPhone.

### 2. Start the dev server

```bash
npx expo start
```

A QR code will appear in the terminal.

### 3. Open on your phone

Scan the QR code with your iPhone camera. The app will open in Expo Go.

Both your Mac and iPhone must be on the **same Wi-Fi network**. If they're on different networks, use tunnel mode instead:

```bash
npx expo start --tunnel
```

This routes through the internet (requires `npx expo install @expo/ngrok` on first use).

### Limitations

Expo Go only supports standard Expo SDK packages. If you add custom native modules later, you'll need a native build (see the USB deployment section below).

## Deploying to a physical iPhone 16 (USB)

### 1. Connect your iPhone via USB

Trust the computer when prompted on the phone.

Verify the device is detected:

```bash
xcrun devicectl list devices
```

### 2. Configure signing

Open `ios/ArriveAI.xcodeproj` in Xcode **once** to set up automatic signing:

1. Select the **ArriveAI** target
2. Go to **Signing & Capabilities**
3. Check **Automatically manage signing**
4. Select your **Team** (your Apple ID)

After this one-time setup you never need Xcode again.

Alternatively, set the team in `app.json` to skip this step:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.arriveai.app",
      "deploymentTarget": "18.0",
      "codeSignEntitlements": {},
      "appleTeamId": "YOUR_TEAM_ID"
    }
  }
}
```

Find your Team ID at https://developer.apple.com/account under Membership Details.

### 3. Build and deploy

```bash
npx expo run:ios --device
```

This will list connected devices and let you pick your iPhone 16. The app gets installed and launched on the phone.

### 4. Trust the developer on the phone

On first install, go to **Settings > General > VPN & Device Management** on the iPhone and trust your developer certificate.

## Useful commands

| Command | Description |
|---|---|
| `npx expo start` | Start dev server (scan QR for Expo Go) |
| `npx expo start --tunnel` | Start dev server over internet (no shared Wi-Fi needed) |
| `npx expo run:ios` | Build & run on simulator |
| `npx expo run:ios --device` | Build & run on connected device |
| `npx expo prebuild --platform ios --clean` | Regenerate the native `ios/` directory |
| `xcrun simctl list devices available` | List available simulators |
| `xcrun devicectl list devices` | List connected physical devices |
| `xcrun simctl boot "iPhone 16"` | Boot a simulator manually |
| `xcrun simctl shutdown all` | Shut down all simulators |
