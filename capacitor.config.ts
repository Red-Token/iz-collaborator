import type {CapacitorConfig} from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.iz-collaborator",
  appName: "iz-collaborator",
  webDir: "build",
  plugins: {
    SplashScreen: {
      androidSplashResourceName: "splash"
    }
  }
}

export default config
