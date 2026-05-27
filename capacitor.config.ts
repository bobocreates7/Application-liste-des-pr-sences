import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cescom.lp',
  appName: 'CESCOM LP',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: "icon",
      iconColor: "#1A73E8"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      backgroundColor: "#1A73E8",
      androidSplashResourceName: "splash",
     
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
