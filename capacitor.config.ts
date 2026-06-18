import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cescom.lp',
  appName: 'CESCOM LP',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_notif",
      iconColor: "#1A73E8"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "ic_launcher_foreground",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
