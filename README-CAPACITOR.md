# Zloum & Saeed Factory Maintenance App

A full-featured mobile app for managing factory maintenance, built with React + Capacitor + TypeScript.

## Features

- ✅ Sections & Machines Management
- ✅ Text, Audio, and Image Notes
- ✅ Maintenance Scheduling (Daily/Weekly/Monthly/Custom)
- ✅ Local Notifications
- ✅ PDF Report Generation
- ✅ Offline-First with Local Storage
- ✅ Dark Mode Support
- ✅ Native Camera Integration

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Mobile**: Capacitor (iOS & Android support)
- **UI**: shadcn/ui + Tailwind CSS
- **Storage**: LocalStorage (persistent offline data)
- **Routing**: React Router
- **Native Features**: @capacitor/camera, @capacitor/local-notifications, @capacitor/filesystem

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- For iOS: macOS with Xcode installed
- For Android: Android Studio installed

### Installation

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Capacitor** (if not already done)
   ```bash
   npx cap init
   ```

3. **Add Platforms**
   ```bash
   # For Android
   npx cap add android
   
   # For iOS (macOS only)
   npx cap add ios
   ```

4. **Build the Web App**
   ```bash
   npm run build
   ```

5. **Sync Capacitor**
   ```bash
   npx cap sync
   ```

## Development

### Run in Browser (Web Preview)
```bash
npm run dev
```

### Run on Android
```bash
npx cap run android
```

### Run on iOS (macOS only)
```bash
npx cap run ios
```

### Development Client with Hot Reload

The app is configured to use hot reload from the sandbox URL during development. To switch to local development:

1. Open `capacitor.config.ts`
2. Comment out or remove the `server` section
3. Run `npm run build && npx cap sync`

## Building for Production

### Android

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. Build the app through Android Studio (Build → Build Bundle(s) / APK(s))

### iOS

1. Open Xcode:
   ```bash
   npx cap open ios
   ```

2. Build and archive through Xcode (Product → Archive)

## Syncing Changes

After making code changes, always sync with Capacitor:

```bash
npm run build
npx cap sync
```

For platform-specific updates:
```bash
npx cap sync android
npx cap sync ios
```

## App Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── Add*Dialog.tsx   # Feature dialogs
├── pages/               # Main screens
│   ├── Sections.tsx     # Home - factory sections
│   ├── Department.tsx   # Machines list
│   ├── MachineDetail.tsx# Machine details & notes
│   └── SettingsPage.tsx # App settings
├── services/            # Data layer
│   └── storage.ts       # LocalStorage wrapper
├── types/               # TypeScript definitions
└── hooks/               # Custom React hooks
```

## Data Model

- **Section**: Factory department (e.g., Electrical, Public Health)
- **Machine**: Equipment within a section
- **Note**: Text, audio, or image note attached to a machine
- **MaintenanceSchedule**: Recurring maintenance plan
- **MaintenanceEvent**: Record of completed maintenance

## Features Overview

### Sections Screen
- View all factory departments
- Add new sections
- See alerts for overdue maintenance
- Quick status overview per section

### Department Screen
- List all machines in a section
- View machine status (Working/Stopped/Needs Maintenance)
- Add new machines
- Navigate to machine details

### Machine Detail Screen
- Update machine state
- Add text, image, and audio notes
- Schedule recurring maintenance
- View all notes and history
- Camera integration for photos

### Settings
- Toggle dark mode
- Enable/disable notifications
- Load demo data for testing
- Export/import data backup
- Clear all data

## Native Capabilities

### Camera
Uses `@capacitor/camera` for taking photos directly from the machine detail screen.

### Local Notifications
Uses `@capacitor/local-notifications` to schedule maintenance reminders.

### File System
Uses `@capacitor/filesystem` for storing images and audio files locally.

### Share
Uses `@capacitor/share` for sharing PDF reports.

## Permissions

The app requires the following permissions:

**iOS** (Info.plist):
- NSCameraUsageDescription
- NSPhotoLibraryUsageDescription
- NSMicrophoneUsageDescription

**Android** (AndroidManifest.xml):
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

These are automatically configured when you run `npx cap sync`.

## Demo Data

Load sample data from Settings to test the app:
- 2 Sections (Electrical & Public Health)
- 6 Machines (3 per section)
- Various states and maintenance schedules

## Troubleshooting

### "White screen" on mobile
- Ensure you've run `npm run build && npx cap sync`
- Check browser console for errors
- Verify capacitor.config.ts is correct

### Notifications not working
- Check that permissions are granted
- Ensure notifications are enabled in Settings
- On iOS, notifications won't work in simulator (test on real device)

### Camera not working
- Grant camera permissions when prompted
- On iOS simulator, camera is not available (use real device)

## Support

For issues related to:
- **React/TypeScript**: Check the code in `src/`
- **Capacitor**: See [Capacitor docs](https://capacitorjs.com/docs)
- **Native builds**: Check platform-specific docs (Xcode/Android Studio)

## License

MIT
