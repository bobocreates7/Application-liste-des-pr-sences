import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cescom.lp',
  appName: 'CESCOM LP',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_notif",
      iconColor: "#FFFFFF"
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#800000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
