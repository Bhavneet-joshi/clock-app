# Digital Clock App

A minimalist digital clock app with alarm, timer, and stopwatch functionality.

## Features

- **Clock**: Digital display of current time with next alarm indicator
- **Alarm**: Set alarms with custom sound, snooze, and repeat options
- **Timer**: Countdown timer with presets
- **Stopwatch**: Precise timing with lap recording

## Tech Stack

- React Native
- Expo
- AsyncStorage for data persistence
- Expo Router for navigation
- React Native Reanimated for animations

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npx expo start
   ```

## Deployment

### Prerequisites

1. Install EAS CLI:
   ```
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```
   eas login
   ```
3. Configure your project:
   ```
   eas build:configure
   ```

### Build for Android

1. Build a preview APK (for testing):
   ```
   eas build --platform android --profile preview
   ```

2. Build for production:
   ```
   eas build --platform android --profile production
   ```

### Build for iOS

1. Build for internal testing:
   ```
   eas build --platform ios --profile preview
   ```

2. Build for production:
   ```
   eas build --platform ios --profile production
   ```

### Submit to App Stores

#### Google Play Store

1. Create a Google Play Console account if you don't have one
2. Create a new app in the Google Play Console
3. Generate a service account key and save it as `google-service-account.json` in your project root
4. Submit to Google Play Store:
   ```
   eas submit -p android --latest
   ```

#### Apple App Store

1. Create an Apple Developer account if you don't have one
2. Create a new app in App Store Connect
3. Set up the following environment variables:
   ```
   export APPLE_ID="your-apple-id@example.com"
   export ASC_APP_ID="your-app-store-connect-app-id"
   export APPLE_TEAM_ID="your-team-id"
   ```
4. Submit to Apple App Store:
   ```
   eas submit -p ios --latest
   ```

### Over-the-Air Updates

This app is configured to use Expo Updates for OTA updates. To publish an update:

1. Make your changes to the app
2. Run:
   ```
   eas update --branch production --message "Description of changes"
   ```

## Troubleshooting

### Common Issues

1. **Reduced motion warning in development**:
   - This is a development-only warning and can be safely ignored
   - The app handles this with a custom hook in `hooks/useReducedMotionConfig.ts`

2. **Build failures**:
   - Ensure your Expo account has the correct credentials
   - Check that all native dependencies are properly installed
   - Verify your app.json and eas.json configurations

3. **Font loading issues**:
   - The app uses the Digital-7 (mono) font
   - Ensure the font file is correctly placed in `assets/fonts/`

## Project Structure

- `app/` - Main application code
  - `(tabs)/` - Tab-based navigation screens
    - `index.tsx` - Clock screen
    - `alarm.tsx` - Alarm screen
    - `timer.tsx` - Timer screen
    - `stopwatch.tsx` - Stopwatch screen
    - `_layout.tsx` - Tab navigation layout
  - `index.tsx` - Entry point that redirects to tabs
- `hooks/` - Custom React hooks
- `assets/` - Static assets including fonts and images

## License

MIT
