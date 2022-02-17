# jssip_react_native_example
jssip_react_native_example

"react-native": "0.63.4",

"react-native-jssip": "^3.7.6",

"react-native-callkeep": "^4.3.1",


Create project react native project commands:

npx react-native init folder --version 0.63.4

cd folder

npm install

npm install react-native-jssip --save

npm install react-native-callkeep --save 

npm install react-native-webrtc --save 

npm install --save react-native-voip-push-notifications

######################

For IOS:

cd project_folder

cd ios && pod install && cd ..

Run by comands:

npx react-native run-ios 

Or Open on Xcode

#######################

For Android:

cd project_folder

export PATH=$PATH:/Users/.../platform-tools #in case of problems with adb

adb devices

adb -s device_id reverse tcp:8081 tcp:8081

npx react-native run-android

or

npx react-native run-android -- --warning-mode all

npx react-native start

To fix build problems or build only

cd ./android && ./gradlew clean && ./gradlew :app:bundleRelease && cd ..

To see log:

adb logcat ReactNative:V ReactNativeJS:V |grep 'package_name' > android_log.txt
