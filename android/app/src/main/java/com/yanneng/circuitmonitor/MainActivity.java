package com.yanneng.circuitmonitor;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(IgnoreBatteryOptimizationPlugin.class);
        super.onCreate(savedInstanceState);
    }
    //     private static final int IGNORE_BATTERY_OPTIMIZATION_REQUEST = 1002;
//     @Override
//     public void onCreate(@Nullable Bundle savedInstanceState, @Nullable PersistableBundle persistentState) {
//         super.onCreate(savedInstanceState, persistentState);

//         PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
//         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
//             if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
//                 askIgnoreOptimization();
//             } else {
//                 // already ignoring battery optimization code here next you want to do
//             }
//         } else {
//             // already ignoring battery optimization code here next you want to do
//         }

//     }
//     private val resultLauncher = registerForActivityResult(new ActivityResultContracts.RequestPermission(), () -> {
//        int a = 2;
//     });

//     private void askIgnoreOptimization() {

//         if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
//             Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
//             intent.setData(Uri.parse("package:" + getPackageName()));
//             resultLauncher.lanch(intent);
//         } else {
// //            openNextActivity();
//         }
//     }
}
