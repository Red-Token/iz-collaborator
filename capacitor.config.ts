import type {CapacitorConfig} from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.iz-collaborator",
  appName: "iz-collaborator",
  webDir: "build",
  server: {
    androidScheme: "https"
  },
  plugins: {
    SplashScreen: {
      androidSplashResourceName: "splash"
    }
  },
  // Use this for live reload https://capacitorjs.com/docs/guides/live-reload
  // server: {
  //   url: "http://192.168.1.250:1847",
  //   cleartext: true
  // },
};

export default config
