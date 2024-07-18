import type { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'com.benjamintr.vehiclescontrol',
  appName: 'VehiclesControlCheck',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.appdata'],
      serverClientId: '329432960985-0f0oj2qbh3gp0mbgr0k32hmi0b6gbi06.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
