import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.8abd67ae85f0484a917c018e5da8e41e',
  appName: 'zloum-saeed-ops',
  webDir: 'dist',
  server: {
    url: 'https://8abd67ae-85f0-484a-917c-018e5da8e41e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
    },
  },
};

export default config;
