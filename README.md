# jssip_react_native_example

```
"react-native": "0.63.4",
"react-native-jssip": "^3.7.6",
"react-native-callkeep": "^4.3.1",
```

Create project react native project commands:
```
npx react-native init folder --version 0.63.4
cd folder
npm install
npm install react-native-jssip --save
npm install react-native-callkeep --save 
npm install react-native-webrtc --save 
npm install --save react-native-voip-push-notifications
```

For IOS:
```
cd project_folder
cd ios && pod install && cd ..
Run by comands:
npx react-native run-ios 
Or 
Open on Xcode
```

For Android:
```
cd project_folder
export PATH=$PATH:/Users/.../platform-tools #in case of problems with adb
adb devices
adb -s device_id reverse tcp:8081 tcp:8081
npx react-native run-android
or
npx react-native run-android -- --warning-mode all
npx react-native start #Only start metro server
other commands
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest id.bundle --assets-dest android/app/src/main/res_backup/
cd ./android && ./gradlew clean && rm -R C:\Users\roblanco\.gradle\caches\build-cache-1 && ./gradlew :app:bundleRelease && cd ..
cd ./android && ./gradlew clean && rm -R C:\Users\roblanco\.gradle\caches\build-cache-1 && ./gradlew :app:assembleRelease && cd ..
adb -s emulator-5554 reverse --remove tcp:8081
adb kill-server
adb -s emulator-5554 emu kill
```
To fix build problems or build only
```
cd ./android && ./gradlew clean && ./gradlew :app:bundleRelease && cd ..
```
To see log:
```
adb logcat ReactNative:V ReactNativeJS:V |grep 'package_name' > android_log.txt
```
Others:
```
yarn start --reset-cache //Reset cache of metro server
npx react-native link <npm package> //To link manualy an npm package
```
