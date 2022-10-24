package com.yanneng.circuitmonitor;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.PowerManager;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import static android.content.Context.POWER_SERVICE;
import static android.provider.Settings.EXTRA_APP_PACKAGE;


@CapacitorPlugin(name = "YnIgnoreBatteryOptimization")
public class IgnoreBatteryOptimizationPlugin extends Plugin {
    @PluginMethod()
    public void checkIgnoreBatteryOptimization(PluginCall call) {
        JSObject res = new JSObject();
        try {
            PowerManager pm = (PowerManager) getContext().getSystemService(POWER_SERVICE);
            String pkgName = getActivity().getPackageName();
            boolean isIgnore = pm.isIgnoringBatteryOptimizations(pkgName);
            res.put("result", isIgnore);
            call.resolve(res);
        } catch (Error err) {
            call.reject("[IgnoreBatteryOptimizationPlugin]: can't access battery optimization setting in android!");
        }
    }

    @PluginMethod()
    public void requestIgnoreBatteryOptimization(PluginCall call) {
        JSObject res = new JSObject();
//        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P)
//        {
//            ActivityManager am = (ActivityManager)getContext().getSystemService(Context.ACTIVITY_SERVICE);
//            Boolean isRestricted = am.isBackgroundRestricted();
//            if(isRestricted) {
//                // Show some message to the user that app won't work in background and needs to change settings
//                //... (implement dialog)
//                // When user clicks 'Ok' or 'Go to settings', then:
//                openBatterySettings();
//                Boolean isStillRestricted = am.isBackgroundRestricted();
//                res.put("result", !isStillRestricted);
//            }else {
//                res.put("result", false);
//            }
//        }else {
//            res.put("result", false);
//        }

        PowerManager pm = (PowerManager) getContext().getSystemService(POWER_SERVICE);
        String pkgName = getActivity().getPackageName();
        boolean isIgnore = pm.isIgnoringBatteryOptimizations(pkgName);
        if (!isIgnore)
        {
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + pkgName));
            getContext().startActivity(intent);
            boolean nextIsIgnore = pm.isIgnoringBatteryOptimizations(pkgName);
            res.put("result", nextIsIgnore);
        } else {
            res.put("result", false);
        }
        call.resolve(res);
    }
//    private void openBatterySettings()
//    {
//        Intent intent = new Intent();
//        intent.setAction(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
//        intent.putExtra(EXTRA_APP_PACKAGE, getActivity().getPackageName());
//        getContext().startActivity(intent);
//    }
}
