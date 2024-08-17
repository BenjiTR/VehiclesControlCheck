import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'vehicles control',
  webDir: 'www',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    GoogleAuth: {
      forceCodeForRefreshToken: true,
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.appdata']
    }
  },
};


export default config;
