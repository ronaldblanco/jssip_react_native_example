#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <PushKit/PushKit.h>                    /* <------ add this line */
#import "RNVoipPushNotificationManager.h"      /* <------ add this line */

#import <RNCallKeep/RNCallKeep.h>      /* <------ add this line */
//#import "RNCallKit.h"   /* <------ add this line */

#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

//#import "RNBackgroundTimer.h"

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

//#import "LoudSpeaker.h"

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate

//##################################################
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}
//##################################################

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"jssip634"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

//############################################### More time

//###############################################

//###############################################
/* Add PushKit delegate method */

// --- Handle updated push credentials
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  // Register VoIP push token (a property of PKPushCredentials) with server
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];
}

- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type
{
  // --- The system calls this method when a previously provided push token is no longer valid for use. No action is necessary on your part to reregister the push type. Instead, use this method to notify your server not to send push notifications using the matching push token.
}

// --- Handle incoming pushes
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  
  // --- NOTE: apple forced us to invoke callkit ASAP when we receive voip push
  // --- see: react-native-callkeep

  // --- Retrieve information from your voip push payload
  NSString *uuid = [[[NSUUID UUID] UUIDString] lowercaseString];
  NSString *callerName = payload.dictionaryPayload[@"callerName"];
  NSString *handle = payload.dictionaryPayload[@"handle"];
  //NSString *callerName = payload.dictionaryPayload[@"aps"][@"callerName"];
  //NSString *handle = payload.dictionaryPayload[@"aps"][@"handle"];
  //NSString *callerName = @"callerName";
  //NSString *handle = @"handle";
  //NSDictionary *extra = payload.dictionaryPayload;
  //NSString *callerName = [NSString stringWithFormat:@"%@ (Connecting...)", payload.dictionaryPayload[@"callerName"]];
  //NSString *handle = payload.dictionaryPayload[@"handle"];

  // --- this is optional, only required if you want to call `completion()` on the js side
  [RNVoipPushNotificationManager addCompletionHandler:uuid completionHandler:completion];

  // --- Process the received push
  [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];
  //return [RNCallKeep];
  
  // --- You should make sure to report to callkit BEFORE execute `completion()`
  [RNCallKeep reportNewIncomingCall: uuid
                             handle: handle
                         handleType: @"generic"
                           hasVideo: NO
                localizedCallerName: callerName
                    supportsHolding: YES
                       supportsDTMF: YES
                   supportsGrouping: YES
                 supportsUngrouping: YES
                        fromPushKit: YES
                            payload: nil
              withCompletionHandler: nil];
  //[RNCallKeep reportNewIncomingCall:uuid handle:handle handleType:@"generic" hasVideo:false localizedCallerName:callerName fromPushKit:true payload:nil];
  //[RNCallKeep reportNewIncomingCall:uuid handle:"Incoming Call..." handleType:@"generic" hasVideo:false localizedCallerName:"No Name" fromPushKit: YES payload:nil];
  //[RNCallKeep RNCallKeepDidDisplayIncomingCall:uuid handle:handle];
  NSLog (@"Entering Voip Notification!");
  
  // --- You don't need to call it if you stored `completion()` and will call it on the js side.
  completion();
}
//###############################################

//############################################### more time
/*AVAudioPlayer *musicPlayer;
- (void)playMusic {

    //NSString *musicPath = [[NSBundle mainBundle] pathForResource:@"phone_loop" ofType:@"wav"];
    //NSURL *musicURL = [NSURL fileURLWithPath:musicPath];
    NSURL *musicURL = [NSURL fileURLWithPath:@"https://server.com/silence.mp3"];
  
    musicPlayer = [[AVAudioPlayer alloc] initWithContentsOfURL:musicURL error:nil];
    [musicPlayer setNumberOfLoops:10];   // Negative number means loop forever

    [musicPlayer prepareToPlay];
    [musicPlayer play];
    NSLog (@"Playing Background Music");
}

- (void)stopMusic {
    
    [musicPlayer stop];
}*/

//int sleepActivation;
int sleepActivation = 0;
- (void)sleepAppForBackground {
  int i, k;
  i = 0;
  k = 60;
  if(sleepActivation) for(i=0;i<k;i++){
    if(sleepActivation) sleep(1);
  }
    
}

// Create the background task
//__block UIBackgroundTaskIdentifier bgTask;
//UIApplication *app = [UIApplication sharedApplication];

- (void)applicationDidEnterBackground:(UIApplication *)application
{

  // Create the background task
  __block UIBackgroundTaskIdentifier bgTask;
  UIApplication *app = [UIApplication sharedApplication];
  bgTask = [app beginBackgroundTaskWithName:nil expirationHandler:^{
       // End the task so the OS doesn’t kill the app
       if (bgTask != UIBackgroundTaskInvalid) {
            [app endBackgroundTask:bgTask];
            bgTask = UIBackgroundTaskInvalid;
       }
  }];
  
  /* ... Code permitted to execute in background … */
  NSLog (@"To Background by aplication");
  //[self playMusic];
  //sleep(300); //5 minutes (300)
  
  /*sleepActivation = 1;
  int i = 0;
  if(sleepActivation) for(i=0;i<60;i++){
    if(sleepActivation) sleep(1);
  }*/
  
  // End the task
  if (bgTask != UIBackgroundTaskInvalid) {
       [app endBackgroundTask:bgTask];
       bgTask = UIBackgroundTaskInvalid;
  }
    
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
  NSLog (@"To Foreground by aplication");
  
  //sleepActivation = 0;
  
  //[self stopMusic];
  //[UIApplication activateIgnoringOtherApps:YES];

  //[[self window] makeKeyAndOrderFront:self];

  //[[self window] setLevel:NSFloatingWindowLevel];

  //[UIApplication beginModalSessionForWindow:[self window]];
  
}

- (void)sceneDidEnterBackground:(UIScene *)scene
{

  // Create the background task
  /*__block UIBackgroundTaskIdentifier bgTask;
  UIApplication *app = [UIApplication sharedApplication];
  bgTask = [app beginBackgroundTaskWithName:nil expirationHandler:^{
       // End the task so the OS doesn’t kill the app
       if (bgTask != UIBackgroundTaskInvalid) {
            [app endBackgroundTask:bgTask];
            bgTask = UIBackgroundTaskInvalid;
       }
  }];
  
   //... Code permitted to execute in background …
  NSLog (@"To Background by scene");
  //[self playMusic];
  sleep(300);
  
  // End the task
  if (bgTask != UIBackgroundTaskInvalid) {
       [app endBackgroundTask:bgTask];
       bgTask = UIBackgroundTaskInvalid;
  }*/
  NSLog (@"To Background by scene");

}

- (void)sceneWillEnterForeground:(UIScene *)scene
{
  //[[UIApplication sharedApplication] endBackgroundTask:{}];
    NSLog (@"To Foreground by scene");
    /*[self stopMusic];*/
  
    
}

/*- (BOOL)application:(UIApplication *)application
  continueUserActivity:(NSUserActivity *)userActivity
  restorationHandler:(void(^)(NSArray * _Nullable restorableObjects))restorationHandler {
    return [RNCallKeep application:application
                        continueUserActivity:userActivity
                        restorationHandler:restorationHandler];
  
}*/

//#########################################################

@end
