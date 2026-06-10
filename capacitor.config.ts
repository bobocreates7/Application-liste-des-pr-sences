import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cescom.lp.dev',
  appName: 'CESCOM LP TEST',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_notif",
      iconColor: "#FFFFFF"
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true ,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
