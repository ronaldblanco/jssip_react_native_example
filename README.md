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

For IOS:

cd ios
pod install
cd .. 

Run by comands:
npx react-native run-ios 

Or Open on Xcode
#######################

For Android:

adb devices
adb -s device_id reverse tcp:8081 tcp:8081
npx react-native run-android

To fix build problems
cd android
./gradlew clean && ./gradlew :app:bundleRelease
