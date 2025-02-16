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
  }
}

export default config
