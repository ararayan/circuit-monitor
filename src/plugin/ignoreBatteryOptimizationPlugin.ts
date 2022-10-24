import { registerPlugin } from "@capacitor/core";

export interface IgnoreBatteryOptimization {
  requestIgnoreBatteryOptimization(): Promise<{result: boolean}>;
  checkIgnoreBatteryOptimization(): Promise<{result: boolean}>;
}


export const ignoreBatteryOptimization = registerPlugin<IgnoreBatteryOptimization>('YnIgnoreBatteryOptimization');

