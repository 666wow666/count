import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fortune.ziwei',
  appName: '紫微星盘',
  webDir: 'dist',
  android: {
    backgroundColor: '#0F0A1F',
    allowMixedContent: true
  },
  ios: {
    backgroundColor: '#0F0A1F',
    allowsLinkPreview: false
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0F0A1F'
    }
  }
};

export default config;
