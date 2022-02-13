/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Button,
    //audio
} from 'react-native';

import {
    Header,
    LearnMoreLinks,
    Colors,
    DebugInstructions,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

//voip-push-notification
//#################################################
import VoipPushNotification from 'react-native-voip-push-notification';

import RNCallKeep from 'react-native-callkeep';
const optionsCallKeep = {
    ios: {
        appName: 'app name',
        /*imageName?: string,
          supportsVideo?: boolean,
          maximumCallGroups?: string,
          maximumCallsPerCallGroup?: string,
          ringtoneSound?: string,*/
        includesCallsInRecents: true
    },
    android: {
      alertTitle: 'Permissions required',
      alertDescription: 'This application needs to access your phone accounts',
      cancelButton: 'Cancel',
      okButton: 'ok',
      imageName: 'phone_account_icon',
      additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
      // Required to get audio in background when using Android 11
      foregroundService: {
        channelId: 'com.company.my',
        channelName: 'Foreground service for my app',
        notificationTitle: 'My app is running on background',
        notificationIcon: 'Path to the resource icon of the notification',
      }, 
    }
};

class PushNotification extends React.Component {

    // --- anywhere which is most comfortable and appropriate for you,
    // --- usually ASAP, ex: in your app.js or at some global scope.
    componentDidMount(RNCallKeep) {

        // --- NOTE: You still need to subscribe / handle the rest events as usuall.
        // --- This is just a helper whcih cache and propagate early fired events if and only if for
        // --- "the native events which DID fire BEFORE js bridge is initialed",
        // --- it does NOT mean this will have events each time when the app reopened.


        // ===== Step 1: subscribe `register` event =====
        // --- this.onVoipPushNotificationRegistered
        VoipPushNotification.addEventListener('register', (token) => {
            // --- send token to your apn provider server

            console.log("VOIP Token:", token);
            AsyncStorage.setItem('@crm.device.voiptoken', token);
        });

        // ===== Step 2: subscribe `notification` event =====
        // --- this.onVoipPushNotificationiReceived
        VoipPushNotification.addEventListener('notification', (notification) => {
            // --- when receive remote voip push, register your VoIP client, show local notification ... etc
            //this.doSomething();
            //RNCallKeep.displayIncomingCall(notification.uuid, "Incoming Call...");
            console.log("New VOIP Notification [voip token]:", notification);
            // --- optionally, if you `addCompletionHandler` from the native side, once you have done the js jobs to initiate a call, call `completion()`
            VoipPushNotification.onVoipNotificationCompleted(notification.uuid);
        });

        // ===== Step 3: subscribe `didLoadWithEvents` event =====
        VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
            // --- this will fire when there are events occured before js bridge initialized
            // --- use this event to execute your event handler manually by event type

            if (!events || !Array.isArray(events) || events.length < 1) {
                return;
            }
            for (let voipPushEvent of events) {
                let { name, data } = voipPushEvent;
                if (name === VoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent) {
                    this.onVoipPushNotificationRegistered(data);
                } else if (name === VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent) {
                    this.onVoipPushNotificationiReceived(data);
                }
            }
        });

        // ===== Step 4: register =====
        // --- it will be no-op if you have subscribed before (like in native side)
        // --- but will fire `register` event if we have latest cahced voip token ( it may be empty if no token at all )
        VoipPushNotification.registerVoipToken(); // --- register token
    }

    // --- unsubscribe event listeners
    componentWillUnmount() {
        VoipPushNotification.removeEventListener('didLoadWithEvents');
        VoipPushNotification.removeEventListener('register');
        VoipPushNotification.removeEventListener('notification');
    }
}



//#################################################

//react-native-webrtc
//#################################################
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    mediaDevices,
    registerGlobals
} from 'react-native-webrtc';

window.RTCPeerConnection = window.RTCPeerConnection || RTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || RTCIceCandidate;
window.RTCSessionDescription =
    window.RTCSessionDescription || RTCSessionDescription;
window.MediaStream = window.MediaStream || MediaStream;
window.MediaStreamTrack = window.MediaStreamTrack || MediaStreamTrack;
window.navigator.mediaDevices = window.navigator.mediaDevices || mediaDevices;
window.navigator.getUserMedia =
    window.navigator.getUserMedia || mediaDevices.getUserMedia;

//const configurationRtc = { "iceServers": [{ "url": "wss://fusionpbxclient.teczz.com:7443/ws" }] };
//const pc = new RTCPeerConnection(configurationRtc);

let isFront = true;
mediaDevices.enumerateDevices().then(sourceInfos => {
    //console.log(sourceInfos);
    let videoSourceId;
    for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
            videoSourceId = sourceInfo.deviceId;
        }
    }
    mediaDevices.getUserMedia({
        audio: true,
        video: {
            width: 640,
            height: 480,
            frameRate: 30,
            facingMode: (isFront ? "user" : "environment"),
            deviceId: videoSourceId
        }
    })
        .then(stream => {
            // Got stream!
            //console.log("stream webrtc: ", stream);
        })
        .catch(error => {
            // Log error
            console.error("Error webrtc: ", error);
        });
});
//############################################################

//react-native-jssip
//############################################################
import { WebSocketInterface, UA } from "react-native-jssip";
import { RTCSession } from 'react-native-jssip/lib/RTCSession';
import { IncomingRequest } from 'react-native-jssip/lib/SIPMessage';

//import {CONSTANTS as CK_CONSTANTS,RNCallKeep} from 'react-native-callkeep';

//import uuid from 'react-native-uuid';
//uuid.v4(); // ⇨ '11'

//import {AnswerOptions, AnyListener, Originator, RTCSession, RTCSessionEventMap, TerminateOptions} from 'react-native-jssip/lib/RTCSession'
// Create our JsSIP instance and run it:

/*RNCallKeep.setup(optionsCallKeep).then(accepted => { 
  console.log("callkeep setup:", accepted);
});/*
 
//console.log("UA sessions before call: ", ua._sessions);
 
// Register callbacks to desired call events
 
//#################################################
/*
 
<StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionDescription}>
                Read the docs to discover what to do next:
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
 
*/
import uuid from 'react-native-uuid';
import BackgroundTimer from 'react-native-background-timer';

import { useStore } from './utils/context';
import { newMessages, newIncomingCall, newOutgoingCall, setGoHome, setPhone, setCallFrom, setDtmf, newIncomingCallHandUp, newOutgoingCallHandUp, newInCall, newCallHandUp, holdCall, muteCall, speakerCall, decreaseUnread, initialState } from './reducers/userReducer';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Api from './utils/api';

//BackgroundTimer.start();
//const getPhoneState = async () => {
//return await AsyncStorage.getItem('@crm.device.phone');
//}
//const phoneState = getPhoneState();
/*const updatePhoneState = async () => {
    const [state, displatch] = useStore();
    const [phone, setPhone] = useState(false);

    const phoneState = await getPhoneState();

    console.log("updatePhoneState: ",phoneState._W);

    if(phoneState && phoneState._W && phoneState._W === '1' && state && state.user) setPhone(true);//displatch(setPhone(true));
    else if(phoneState && phoneState._W && phoneState._W === '0' && state && state.user) setPhone(false);//displatch(setPhone(false));

    return phone;
}*/
//updatePhoneState();
//const phoneState = updatePhoneState();

//console.log("phoneState: ",phoneState._W);

const Phone = () => {

    const [state, displatch] = useStore();

    //const [phone, setPhone] = useState(false);

    //console.log("phoneState: ",phoneState._U);


    //if(phoneState && phoneState._W && phoneState._W === '1' && state && state.user) setPhone(true);//displatch(setPhone(true));
    //else if(phoneState && phoneState._W && phoneState._W === '0' && state && state.user) setPhone(false); //displatch(setPhone(false));

    //console.log("called Phone fron the notification -> Notification of Incomming call was received!!!!",state && state.user?state.user.ext:'', state && state.user?state.user.ext_password:'', state && state.user?state.user.pbx_domain:'');
    if (state && state.user && state.user.ext && state.user.ext_password && state.user.pbx_domain && state.phone /*&& (state.incommingCall || state.outgoingCall)*/) {
        console.log("LOADING PHONE COMPONENT", state && state.user ? state.user.ext : '', state && state.user ? state.user.ext_password : '', state && state.user ? state.user.pbx_domain : '', state && state.incommingCall, state && state.outgoingCall);
        //if(state.incommingCall) console.log("called Phone fron the notification -> Notification of Incomming call was received!!!!");

        const configurationRtc = { "iceServers": [{ "url": "wss://" + (state.user && state.user.pbx_domain ? state.user.pbx_domain : 'localhost') + ":" + (state.user && state.user.pbx_integration_port ? state.user.pbx_integration_port : '7443') + "/ws" }] };
        const pc = new RTCPeerConnection(configurationRtc);

        //let socket = new WebSocketInterface('wss://fusionpbxclient.teczz.com:7443/ws');
        let socket = new WebSocketInterface('wss://' + (state.user && state.user.pbx_domain ? state.user.pbx_domain : 'localhost') + ':' + (state.user && state.user.pbx_integration_port ? state.user.pbx_integration_port : '7443') + '/ws');
        //console.log("socket: ",socket);

        let configuration = {
            sockets: [socket],
            uri: 'sip:' + (state.user && state.user.ext ? state.user.ext : 'noext') + '@' + (state.user && state.user.pbx_domain ? state.user.pbx_domain : 'localhost'),
            password: state.user && state.user.ext_password ? state.user.ext_password : 'nopass',

            session_timers: true, // default true
            session_timers_force_refresher: true,
            session_timers_refresh_method: 'invite', // default 'update'
            use_preloaded_route: true // default false
            //stun_servers: ['stun:stun.swaypc.com:3478', 'stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
        };
        //console.log("configuration: ",configuration);

        const ua = new UA(configuration);

        const [rtc, setRtc] = useState({});
        const [stateUuid, setStateUuid] = useState(null);
        const [myUa, setMyUa] = useState(null);

        const [answered, setAnswered] = useState(false);
        const [callType, setCallType] = useState(null);
        const [answeredOnce, setAnsweredOnce] = useState(false);

        const [progres, setProgres] = useState({});
        const [failed, setFailed] = useState({});
        const [ended, setEnded] = useState({});
        const [confirmed, setConfirmed] = useState({});

        const [heldCalls, setHeldCalls] = useState({}); // callKeep uuid: held
        const [mutedCalls, setMutedCalls] = useState({}); // callKeep uuid: muted
        const [calls, setCalls] = useState({}); // callKeep uuid: number

        const [logText, setLog] = useState('');
        const [inCall, setInCall] = useState(false);

        const [makingCall, setMakingCall] = useState(false);
        const [myRNCallKeep, setMyRNCallKeep] = useState(null);

        const [callTo, setCallTo] = useState(state.callTo && state.callTo.number ? state.callTo.number : null);
        const [muteCall, setMuteCall] = useState(false);
        const [holdCall, setHoldCall] = useState(false);

        const [iceData, setIceData] = useState(null);
        const [iceServers, setIceServers] = useState([
            {
                'urls': ['stun:stun.swaypc.com:3478', 'stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
            }
        ]);

        const getIceDataInfo = async () => {
            try {
                const { data } = await Api.getStunAndTurnData();
                if (data) {
                    setIceData(data);
                    window.iceData = data;
                    if(data.v && data.v.iceServers) setIceServers(data.v.iceServers);
                    if(window.options && window.options.pcConfig) window.options.pcConfig.iceServers = data.v.iceServers;
                    console.log("IceData:", JSON.stringify(data));
                }
            }
            catch (e) {
                console.error("getStunAndTurnData error:", e);
            }
        }

        let eventHandlers = {
            'progress': (e) => {
                //console.log('call is in progress');
                //setProgres(e);
                //RNCallKeep.updateDisplay(window.stateUuid, 'number', 'number');
            },
            'failed': (e) => {
                //console.error('call failed with cause: ' + (JSON.stringify(e)));
                setFailed(e);

                try { RNCallKeep.endCall(window.stateUuid); }
                catch (e) { console.log("Error ending the callkeep: " + e.message); }

                try { rtc && rtc.terminate ? rtc.terminate(options) : ""; }
                catch (e) { console.log("Error remote ending the rtc call: " + e.message); }
                try { myUa && myUa.terminateSessions ? myUa.terminateSessions(options) : ""; }
                catch (e) { console.log("Error remote ending the myUa call: " + e.message); }
                try { ua && ua.terminateSessions ? ua.terminateSessions(options) : ''; }
                catch (e) { console.log("Error remote ending the ua call: " + e.message); }
                //window.myUa && window.myUa.terminateSessions ? window.myUa.terminateSessions(options) : "";
                //ua && ua.terminateSessions ? ua.terminateSessions(options) : "";
                window.inCall = false;
                setInCall(false);
                setMakingCall(false);
                setCallTo(null);

                setStateUuid(null);
                window.stateUuid = null;
                window.fromPushKit = false;

                if (!state.handUp) displatch(newCallHandUp());
                if (state.inCall) displatch(newInCall());
                //try {
                try { window.myUa && window.myUa.isRegistered() ? window.myUa.unregister() : ""; }
                catch (e) { console.log("Error unregistering the window.myUa call: " + e.message); }
                try { myUa && myUa.isRegistered() ? myUa.unregister() : ""; }
                catch (e) { console.log("Error unregistering the myUa call: " + e.message); }
                try { ua && ua.isRegistered() ? ua.unregister() : ""; }
                catch (e) { console.log("Error unregistering the ua call: " + e.message); }
                window.myUa = null;
                setMyUa(null);

                window.rtc = null;
            },
            'ended': (e) => {
                //console.log('call ended with cause: ' + JSON.stringify(e));
                setEnded(e/*.data.cause*/);
                try { RNCallKeep.endCall(window.stateUuid); }
                catch (e) { console.log("Error ending the callkeep: " + e.message); }

                try { rtc && rtc.terminate ? rtc.terminate(options) : ""; }
                catch (e) { console.log("Error remote ending the rtc call: " + e.message); }
                try { myUa && myUa.terminateSessions ? myUa.terminateSessions(options) : ""; }
                catch (e) { console.log("Error remote ending the myUa call: " + e.message); }
                try { ua && ua.terminateSessions ? ua.terminateSessions(options) : ''; }
                catch (e) { console.log("Error remote ending the ua call: " + e.message); }
                //window.myUa && window.myUa.terminateSessions ? window.myUa.terminateSessions(options) : "";
                //ua && ua.terminateSessions ? ua.terminateSessions(options) : "";
                window.inCall = false;
                setInCall(false);
                setMakingCall(false);
                setCallTo(null);

                setStateUuid(null);
                window.stateUuid = null;
                window.fromPushKit = false;

                if (!state.handUp) displatch(newCallHandUp());
                if (state.inCall) displatch(newInCall());
                //try {
                try { window.myUa && window.myUa.isRegistered() ? window.myUa.unregister() : ""; }
                catch (e) { console.log("Error unregistering the window.myUa call: " + e.message); }
                try { myUa && myUa.isRegistered() ? myUa.unregister() : ""; }
                catch (e) { console.log("Error unregistering the myUa call: " + e.message); }
                try { ua && ua.isRegistered() ? ua.unregister() : ""; }
                catch (e) { console.log("Error unregistering the ua call: " + e.message); }
                window.myUa = null;
                setMyUa(null);

                window.rtc = null;

            },
            'confirmed': (e) => {
                console.log('call confirmed -> [didReceiveStartCallAction]', window.stateUuid);
                setConfirmed(e);
                //RNCallKeep.startCall(window.stateUuid, 'number', 'number');
                //RNCallKeep.updateDisplay(window.stateUuid, 'number', 'number');
                try { RNCallKeep.setCurrentCallActive(window.stateUuid); }
                catch (e) { console.log("Error setCurrentCallActive the callkeep: " + e.message); }

                window.inCall = true;
                setInCall(true);
                if (!state.inCall) displatch(newInCall());
            }

        };

        const uuidV4 = () => {
            return uuid.v4().toLowerCase();
        }

        const addCall = (callUUID, number) => {
            setHeldCalls({ ...heldCalls, [callUUID]: false });
            setCalls({ ...calls, [callUUID]: number });
        };

        const removeCall = (callUUID) => {
            const { [callUUID]: _, ...updated } = calls;
            const { [callUUID]: __, ...updatedHeldCalls } = heldCalls;

            setCalls(updated);
            setCalls(updatedHeldCalls);
        };

        const setCallHeld = (callUUID, held) => {
            setHeldCalls({ ...heldCalls, [callUUID]: held });
        };

        const setCallMuted = (callUUID, muted) => {
            setMutedCalls({ ...mutedCalls, [callUUID]: muted });
        };

        const log = (text) => {
            console.info(text);
            setLog(logText + "\n" + text);
        };

        //init funtions
        //############################################
        const initializeCallKeep = async () => {
            try {
                RNCallKeep.setup(optionsCallKeep);
                RNCallKeep.setAvailable(true);

                //voipNotification = new PushNotification; //only ios
                //voipNotification.componentDidMount(RNCallKeep); //only ios
            } catch (err) {
                console.error('initializeCallKeep error:', err.message);
            }

            /*RNCallKeep.addListener("RNCallKeepDidReceiveStartCallAction", async (event) => {
                console.log("RNCallKeepDidReceiveStartCallAction events: ",event);
            }).catch((e)=>{console.error(e)});*/

            // Add RNCallKit Events
            //RNCallKeep.addEventListener('didReceiveStartCallAction', onNativeCall);
            //RNCallKeep.addEventListener('didReceiveStartCallAction', didReceiveStartCallAction);
            //RNCallKeep.addEventListener('answerCall', onAnswerCallAction);
            //RNCallKeep.addEventListener('endCall', onEndCallAction);
            /*RNCallKeep.addEventListener('didDisplayIncomingCall', onIncomingCallDisplayed);
            RNCallKeep.addEventListener('didPerformSetMutedCallAction', onToggleMute);
            RNCallKeep.addEventListener('didPerformDTMFAction', onDTMF);*/
        };

        const initializeJssip = async () => {
            ua.on('newRTCSession', (newRtc) => {
                //console.log('newRTCSession: ', newRtc.session);
                //console.log("_id:",rtc.session._id);
                let tmpId = newRtc.session._id;
                //console.log("tmpIp:",tmpId);
                //console.log("_ua_contact:",rtc.session._ua._contact);
                /*console.log("_from_tag:",rtc._from_tag);*/
                //console.log("_user:",rtc.session._ua._dialogs[tmpId]._remote_uri._user);

                //'candidate:2815500354 1 udp 1686052607 99.59.227.193 50769 typ srflx raddr 172.40.20.20 rport 50769 generation 0 ufrag Wwsx network-id 1 network-cost 10'
                newRtc.session.on('icecandidate', (event) => {
                    console.log('Trying Stun or Turn Server Data:', JSON.stringify(event.candidate).indexOf("typ srflx"), JSON.stringify(event.candidate));
                    /*if (JSON.stringify(event.candidate).indexOf("typ srflx") !== -1 &&
                        (!iceData && !window.iceData) &&
                        newRtc.originator !== 'remote') {
                        console.log('Valid Stun Server Data:', JSON.stringify(event.candidate).indexOf("typ srflx"), JSON.stringify(event.candidate));
                        event.ready();
                    } else if ((iceData || window.iceData) && JSON.stringify(event.candidate).indexOf("typ relay") !== -1) {
                        console.log('Valid Turn Server Data:', JSON.stringify(event.candidate).indexOf("typ relay"), JSON.stringify(event.candidate));
                        //setIceData(null);
                        event.ready();
                    } else*/ if(JSON.stringify(event.candidate).indexOf("typ relay") !== -1){
                        console.log('Valid Turn Server Data:', JSON.stringify(event.candidate).indexOf("typ relay"), JSON.stringify(event.candidate),JSON.stringify(iceData),JSON.stringify(window.iceData));
                        event.ready();
                    }
                });

                let tempUuid = uuidV4();
                setRtc(newRtc.session);
                window.rtc = newRtc.session;

                if (!stateUuid && !window.fromPushKit) setStateUuid(tempUuid);
                if (!window.stateUuid && !window.fromPushKit) window.stateUuid = tempUuid;

                //console.log("UUID [didReceiveStartCallAction]:",tempUuid);

                setCallType(newRtc.originator);
                window.originator = newRtc.originator;

                //const id = hola._id;
                const dialogs = newRtc.session._ua._dialogs;
                const values = Object.values(dialogs);
                //console.log("ID:",String(hola._id));

                //RNCallKeep.startCall(tempUuid, number, 'number');

                if (newRtc.originator === 'remote') {

                    let number = values[0]["_remote_uri"]["_user"];
                    //console.log("Number: ",values[0]["_remote_uri"]["_user"]);

                    if (!window.fromPushKit) {
                        addCall(tempUuid, number);
                        console.log("Incoming Call Active [answerCall]: ", tempUuid, number, newRtc.originator);
                        RNCallKeep.displayIncomingCall(tempUuid, number);
                    }
                    else {
                        addCall(window.stateUuid, number);
                        console.log("Incoming Call Active [answerCall]: ", window.stateUuid, number, newRtc.originator);
                        //RNCallKeep.updateDisplay(window.stateUuid, number ,'number');
                    }


                    //console.log('rtc incoming: ',rtc);
                } else /*if (newRtc.originator === 'local')*/ {

                    //let number = values[0]["_remote_uri"]["_user"];
                    let number = callTo;
                    //console.log("Number: ", newRtc.session._ua/*["_remote_uri"]["_user"]*/);

                    addCall(tempUuid, number);
                    //console.log("Outbound Call Active [didReceiveStartCallAction]:", tempUuid, number, newRtc.originator);

                    setMakingCall(true);
                    //console.log("Outbound Call Active RNCallKeep",RNCallKeep);
                    //RNCallKeep.startCall(tempUuid, number, 'number');
                    ///////RNCallKeep.setCurrentCallActive(tempUuid)
                    //setTimeout(()=>RNCallKeep.setCurrentCallActive(tempUuid),3000);
                    //RNCallKeep.displayIncomingCall(/*rtc.session._id*/tempUuid, number); //
                    //console.log("Outbound Call Active RNCallKeep.startCall:",RNCallKeep.startCall(tempUuid, number, 'number'));
                    //setTimeout(()=>RNCallKeep.setCurrentCallActive(tempUuid),1000);

                }//setRtc(newRtc.session);
            });
            ua.on('sipEvent', (event) => {
                console.log('Ronald sipEvent:', event.event);
                //console.log('Ronald RTC State Ended?:',window.rtc?window.rtc.isEnded():"No RTC");
            });

            //console.log('Ready to make Registration! -> Notification');
            try {

                ua.start();
                ua.register();
                /*setTimeout(() => {
                    ua.register();
                }, 2000);*/

            } catch (e) {
                console.error("Start or Registration Error for JsSip:", e.message);
            }

            //console.log('Registration Completed! -> Notification');

            setMyUa(ua);
            window.myUa = ua;
        }
        //############################
        const init = async () => {
            console.log("LOADING PHONE INIT()");
            try {

                //initializeJssip();
                await initializeCallKeep();

            } catch (e) {
                console.error("PHONE->INIT ERROR LOADING!", e.message);
            }


        }
        const initJssip = async () => {
            console.log("LOADING PHONE INITJSSIP()");
            try {

                await initializeJssip();
                //await initializeCallKeep();

            } catch (e) {
                console.error("PHONE->INITJSSIP ERROR LOADING!", e.message);
            }

        }
        //############################

        //let iceServers = [];

        let options = {
            'eventHandlers': eventHandlers,
            'mediaConstraints': { 'audio': true, 'video': false },

            'pcConfig': { // to much delay, but fix: "488 Incompatible SDP" when trying to send invite request to FreeSwitch with jssip library
                iceServers
            }
        };
        window.options = options;

        //#########################################
        const onAnswerCallAction = ({ callUUID }) => {

            getIceDataInfo(); //Get Stun and Turn Data for the call

            const number = calls[callUUID];
            log(`answer the call [answerCall] ${callUUID}, number: ${number}`);
            //console.log("I did answer the call using CallKeep!");

            //RNCallKeep.startCall(callUUID, 'number', 'number');

            if (!window.rtc || window.rtc === {}) setTimeout(() => {
                console.log("wait for window.rtc", window.rtc);

                if (window.rtc && window.rtc !== {} && window.rtc.answer) try { RNCallKeep.setCurrentCallActive(callUUID); }
                    catch (e) { console.log("Error setCurrentCallActive the callkeep: " + e.message); }

                if (window.rtc && window.rtc !== {} && window.rtc.answer) try {

                    window.rtc && window.rtc !== {} && window.rtc.answer ? window.rtc.answer(window.options) : "";
                    window.inCall = true;
                    setInCall(true);
                    if (!state.inCall) displatch(newInCall());

                } catch (e) {
                    console.error("Error answering the call: " + e.message);
                }

            }, 3000);
            else {
                console.log("no wait for window.rtc", window.rtc);
                if (window.rtc && window.rtc !== {} && window.rtc.answer) try { RNCallKeep.setCurrentCallActive(callUUID); }
                    catch (e) { console.log("Error setCurrentCallActive the callkeep: " + e.message); }

                setTimeout(()=>{if (window.rtc && window.rtc !== {} && window.rtc.answer) try {

                    window.rtc && window.rtc !== {} && window.rtc.answer ? window.rtc.answer(window.options) : "";
                    window.inCall = true;
                    setInCall(true);
                    if (!state.inCall) displatch(newInCall());

                    console.log("answer -> iceData and options:",JSON.stringify(window.options),JSON.stringify(iceData));
                } catch (e) {
                    console.error("Error answering the call: " + e.message);
                }},2000);

            }

            //if (!state.inCall) displatch(newInCall());
        };

        const onEndCallAction = ({ callUUID }) => {
            const handle = calls[callUUID];
            log(`[endCall] ${callUUID}, number: ${handle}`);
            //console.log("I did end the call using CallKeep!");
            try { RNCallKeep.endCall(callUUID); }
            catch (e) { console.log("Error ending the callkeep: " + e.message); }

            try { window.rtc && window.rtc !== {} && window.rtc.terminate ? window.rtc.terminate() : ""; } //Terminate call
            catch (e) { console.log("Error ending the window.rtc call: " + e.message); }

            window.inCall = false;
            setInCall(false);
            setCallType(null);
            setMakingCall(false);

            setStateUuid(null);
            window.stateUuid = null;
            window.fromPushKit = false;

            if (!state.handUp) displatch(newCallHandUp());
            if (state.inCall) displatch(newInCall());
            //try {
            try { window.myUa && window.myUa.isRegistered() ? window.myUa.unregister() : ""; }
            catch (e) { console.log("Error unregistering the window.myUa call: " + e.message); }
            try { myUa && myUa.isRegistered() ? myUa.unregister() : ""; }
            catch (e) { console.log("Error unregistering the myUa call: " + e.message); }
            try { ua && ua.isRegistered() ? ua.unregister() : ""; }
            catch (e) { console.log("Error unregistering the ua call: " + e.message); }
            window.myUa = null;
            setMyUa(null);

            window.rtc = null;

        };

        const didPerformDTMFAction = ({ callUUID, digits }) => {
            const number = calls[callUUID];
            log(`[didPerformDTMFAction] ${callUUID}, number: ${number} (${digits})`);

            try {
                window.rtc && window.rtc !== {} && window.rtc.sendDTMF ? window.rtc.sendDTMF(digits, options) : "";
            }
            catch (e) { console.log("Error sendingDTMF window.rtc: " + e.message); }
        };

        const didReceiveStartCallAction = ({ handle, callUUID = uuidV4(), name = callTo ? callTo : '' }) => {
            if (!handle) {
                // @TODO: sometime we receive `didReceiveStartCallAction` with handle` undefined`
                console.error('[didReceiveStartCallAction] with handler undefined');
                return;
            }
            //const callUUID = uuidV4();
            if (handle) {
                addCall(callUUID, handle);
                //setCallTo(handle);

                console.log(`[didReceiveStartCallAction] ${callUUID}, number: ${handle}`);
            }

            //RNCallKeep.startCall(callUUID, /*handle*/'number', 'number');
            //console.log(`[didReceiveStartCallAction] RNCallKeep: ${RNCallKeep}`);
            //console.log("[didReceiveStartCallAction] RNCallKeep.startCall(callUUID, /*handle*/'number', 'number', 'number', false);", RNCallKeep.startCall(callUUID, /*handle*/'number', 'number', 'number', false));

            //BackgroundTimer.setTimeout(() => {
            //log(`[setCurrentCallActive] ${callUUID}, number: ${callTo}`);
            //RNCallKeep.setCurrentCallActive(callUUID);
            //}, 2000);

            /*window.myUa ? window.myUa.call('sip:' + callTo + '@fusionpbxclient.teczz.com', options) : '';
            ua ? ua.call('sip:' + callTo + '@fusionpbxclient.teczz.com', options) : '';
            window.inCall = true;
            setInCall(true);
    
            displatch(newOutgoingCall());*/
        };

        const didPerformSetMutedCallAction = ({ muted, callUUID }) => {
            const number = calls[callUUID];
            log(`[didPerformSetMutedCallAction] ${callUUID}, number: ${number} (${muted})`);

            setCallMuted(callUUID, muted);

            if (window.rtc && window.rtc !== {} && !state.mute) {
                try { window.rtc.mute(); }
                catch (e) { console.log("Error muting the window.rtc call: " + e.message); }
                //window.hold = true;
            } else if (window.rtc && window.rtc !== {} && state.mute) {
                try { window.rtc.unmute(); }
                catch (e) { console.log("Error unmuting the window.rtc call: " + e.message); }
                //window.hold = false;
            }
        };

        const didToggleHoldCallAction = ({ hold, callUUID }) => {
            const number = calls[callUUID];
            log(`[didToggleHoldCallAction] ${callUUID}, number: ${number} (${hold})`);

            setCallHeld(callUUID, hold);

            if (window.rtc && window.rtc !== {} && !state.hold) {
                try { window.rtc.hold(); }
                catch (e) { console.log("Error hold for window.rtc call: " + e.message); }
                //window.hold = true;
            } else if (window.rtc && window.rtc !== {} && state.hold) {
                try { window.rtc.unhold(); }
                catch (e) { console.log("Error unhold for window.rtc call: " + e.message); }
                //window.hold = false;
            }

        };

        const didLoadWithEvents = ({ events }) => {
            //const number = calls[callUUID];
            console.log(`[didLoadWithEvents] ${events}`);

            //setCallMuted(callUUID, muted);
        };

        const didReceiveRemoteNotification = () => {
            console.log("runned didReceiveRemoteNotification");
        }

        const onIncomingCallDisplayed = ({ error, callUUID, handle, localizedCallerName, hasVideo, fromPushKit, payload }) => {
            //const number = calls[callUUID];
            if (fromPushKit) {
                displatch(newIncomingCall());
                displatch(setCallFrom({
                    number: handle,
                    name: localizedCallerName
                }))
                if (state.callTo) displatch(setCallTo(null));
                if ((window.myUa && window.myUa.isRegistered()) && (ua && ua.isRegistered()) && (myUa && myUa.isRegistered())) {
                    //Jssip it is registered
                } else { initJssip(); } //Pbx registration
                if (!window.fromPushKit) window.fromPushKit = true;
                if (!stateUuid) setStateUuid(callUUID);
                if (!window.stateUuid) window.stateUuid = callUUID;
            }

            console.log(`[onIncomingCallDisplayed] from voip token ${callUUID} ${fromPushKit}`);

            setTimeout(() => {
                if (!window.inCall) try { RNCallKeep.endCall(callUUID); }
                    catch (e) { console.log("Error ending the callkeep: " + e.message); }
            }, 30000);
            //setCallMuted(callUUID, muted);
        };
        //#########################################


        //init();
        //ua.start();
        //ua.register();

        const makeCall = async (RNCallKeep = null) => {

            if (!makingCall) {

                //displatch(setGoHome(false));
                getIceDataInfo(); //Get Stun and Turn Data for the call

                let tempUuid = uuidV4();
                setStateUuid(tempUuid);
                window.stateUuid = tempUuid;

                let callKeep = null;
                if (RNCallKeep) try {
                    //console.log("startingCall for callkeep -> RNCallKeep.startCall",RNCallKeep.startCall);
                    await RNCallKeep.getInitialEvents();
                    await RNCallKeep.startCall(tempUuid, callTo, callTo, 'generic', false);

                    //if(callKeep) console.log("startingCall for callkeep",callKeep);
                }
                    catch (e) { console.log("Error startingCall for callkeep: " + e.message); }

                try {
                    //if ((ua && !ua.isRegistered()) || (myUa && !myUa.isRegistered())) {
                    await initJssip();
                    console.log("Registration to make Call!", callTo);
                    //setTimeout(() => { console.log("Wait for registration to make Call!",callTo) }, 2000);
                    //}
                    if (ua && ua.call) {
                        try {
                            //ua.call('sip:' + callTo + '@' + (state.user && state.user.pbx_domain ? state.user.pbx_domain : 'localhost'), options);
                            //console.log("Call was done now after Registration to make Call");
                            setTimeout(() => {
                                let options = window.options;
                                console.log("call -> iceData and options:",JSON.stringify(options),JSON.stringify(iceData));
                                ua && ua.call ? ua.call('sip:' + callTo + '@' + (state.user && state.user.pbx_domain ? state.user.pbx_domain : 'localhost'), options) : ''
                                console.log("Registration to make Call -> Call was done now!");
                            }, 4000);
                        }
                        catch (e) {
                            console.error("Error making the call -> ua.call: " + e.message);
                        }
                    }
                    /*setTimeout(() => { 
                        ua && ua.call ? ua.call('sip:' + callTo + '@' + (state.user && state.user.pbx_domain ? state.user.pbx_domain : 'localhost'), options) : '' 
                        console.log("Registration to make Call -> Call was done now!");
                    }, 2000);*/
                    //ua && ua.call ? ua.call('sip:' + callTo + '@' + (state.user && state.user.pbx_domain ? state.user.pbx_domain : 'localhost'), options) : '';
                    //console.log("After make Call!",callTo,ua.isRegistered());
                    //setTimeout(() => { displatch(setCallTo(null)) }, 1000);
                } catch (e) {
                    console.error("Error making the call: " + e.message);
                }

                //setTimeout(() => { console.log("startingCall for callkeep",callKeep),2000});
                console.log("Outbound Call Active makeCall -> [didReceiveStartCallAction]:", tempUuid);

            }

        }

        const makeHandup = (RNCallKeep) => {
            setAnswered(false);
            setCallType(null);

            //try {
            try { rtc && rtc.terminate ? rtc.terminate(options) : ""; }
            catch (e) { console.log("Error local ending the rtc call: " + e.message); }
            try { myUa && myUa.terminateSessions ? myUa.terminateSessions(options) : ""; }
            catch (e) { console.log("Error local ending the myUa call: " + e.message); }
            try { ua && ua.terminateSessions ? ua.terminateSessions(options) : ''; }
            catch (e) { console.log("Error local ending the ua call: " + e.message); }
            //} catch (e) {
            //console.error("Error local ending the call: " + e.message);
            //}

            //if (!state.goHome && state.inCall && state.handUp /*&& (state.incommingCall || state.outgoingCall)*/) displatch(setGoHome(true));

            setRtc({});

            console.log("[didReceiveStartCallAction] handup execution", rtc, myUa, ua);

            window.inCall = false;
            setInCall(false);
            window.stateUuid ? RNCallKeep.endCall(window.stateUuid) : "";
            setCallType(null);
            setCallTo(null);

            setStateUuid(null);
            window.stateUuid = null;
            window.fromPushKit = false;

            if (state.incommingCall) displatch(newIncomingCallHandUp());
            if (state.outgoingCall) displatch(newOutgoingCallHandUp());
            if (state.handUp) displatch(newCallHandUp());
            if (state.inCall) displatch(newInCall());

            //try {
            try { window.myUa && window.myUa.isRegistered() ? window.myUa.unregister() : ""; }
            catch (e) { console.log("Error unregistering the window.myUa call: " + e.message); }
            try { myUa && myUa.isRegistered() ? myUa.unregister() : ""; }
            catch (e) { console.log("Error unregistering the myUa call: " + e.message); }
            try { ua && ua.isRegistered() ? ua.unregister() : ""; }
            catch (e) { console.log("Error unregistering the ua call: " + e.message); }
            window.myUa = null;
            setMyUa(null);

            window.rtc = null;

        }

        const makeAnswer = (RNCallKeep = null) => {

            getIceDataInfo(); //Get Stun and Turn Data for the call
            //try {

            setTimeout(()=>{if (window.rtc && window.rtc !== {} && window.rtc.answer) try { window.rtc && window.rtc !== {} && window.rtc.answer ? window.rtc.answer(options) : ""; }
                catch (e) { console.log("Error answering window.rtc: " + e.message); }
            if (rtc && rtc !== {} && rtc.answer) try { rtc && rtc !== {} && rtc.answer ? rtc.answer(options) : ""; }
                catch (e) { console.log("Error answering rtc: " + e.message); }

            if ((window.rtc && window.rtc !== {} && window.rtc.answer) || (rtc && rtc !== {} && rtc.answer)) {

                window.inCall = true;
                setInCall(true);
                if (!state.inCall) displatch(newInCall());

            }},2000);

            //} catch (e) {
            //console.error("Error answering the call: " + e.message);
            //}


        }

        const makeHold = (RNCallKeep = null) => {
            //try {
            console.log("make hold", window.rtc && window.rtc.hold ? window.rtc.hold : "", rtc && rtc.hold ? rtc.hold : "");
            if (holdCall) {
                //try { window.rtc && window.rtc !== {} && window.rtc.hold ? window.rtc.hold() : ""; }
                //catch (e) { console.log("Error holding window.rtc: " + e.message); }
                try { rtc && rtc !== {} && rtc.hold ? rtc.hold() : ""; }
                catch (e) { console.log("Error holding rtc: " + e.message); }
            } else {
                //try { window.rtc && window.rtc !== {} && window.rtc.unhold ? window.rtc.unhold() : ""; }
                //catch (e) { console.log("Error unholding window.rtc: " + e.message); }
                try { rtc && rtc !== {} && rtc.unhold ? rtc.unhold() : ""; }
                catch (e) { console.log("Error unholding rtc: " + e.message); }
            }

            console.log("isOnHold()", window.rtc && window.rtc.isOnHold ? window.rtc.isOnHold() : "", rtc && rtc.isOnHold ? rtc.isOnHold() : "");
            //window.inCall = true;
            //setInCall(true);

            //} catch (e) {
            //console.error("Error holding the call: " + e.message);
            //}


            //if (!state.inCall) displatch(newInCall());
        }

        const makeMute = (RNCallKeep = null, options = null) => {
            //try {
            console.log("make mute", window.rtc && window.rtc.mute ? window.rtc.mute : "", rtc && rtc.mute ? rtc.mute : "");

            /*try {
                window.rtc && window.rtc !== {} && window.rtc.mute ? window.rtc.mute() : "";
            }
            catch (e) { console.log("Error muting window.rtc: " + e.message); }
            //if (window.rtc && window.rtc.adjustRecordingSignalVolumen) window.rtc.adjustRecordingSignalVolumen(0);
            console.log("isMuted()", window.rtc && window.rtc.isMuted ? window.rtc.isMuted().audio : "", rtc && rtc.isMuted ? rtc.isMuted().audio : "");*/

            try {
                rtc && rtc !== {} && rtc.mute ? rtc.mute({ audio: true }) : "";
                rtc && rtc !== {} && rtc.renegotiate ? rtc.renegotiate({ offerToReceiveAudio: false }, (r) => { console.log("mute using renegotiation:", r) }) : "";
            }
            catch (e) { console.log("Error muting rtc: " + e.message); }
            if (RNCallKeep && stateUuid) RNCallKeep.setMutedCall(stateUuid, true);
            //if (rtc && rtc.adjustRecordingSignalVolumen) rtc.adjustRecordingSignalVolumen(0);
            /*console.log("getAudioTracks",window.MediaStream && window.MediaStream.getAudioTracks?window.MediaStream.getAudioTracks():"");
            window.MediaStream && window.MediaStream.getAudioTracks?window.MediaStream.getAudioTracks().forEach((track) => {
                track.enabled = false;
                track.muted = true;
            }):"";*/

            //window.inCall = true;
            //setInCall(true);
            console.log("isMuted()", window.rtc && window.rtc.isMuted ? window.rtc.isMuted().audio : "", rtc && rtc.isMuted ? rtc.isMuted().audio : "");
            //} catch (e) {
            //console.error("Error muting the call: " + e.message);
            //}
            //if (!state.inCall) displatch(newInCall());
        }

        const makeUnMute = (RNCallKeep = null, options = null) => {
            //try {
            console.log("make mute", window.rtc && window.rtc.unmute ? window.rtc.unmute : "", rtc && rtc.unmute ? rtc.unmute : "");

            /*try { window.rtc && window.rtc !== {} && window.rtc.unmute ? window.rtc.unmute() : ""; }
            catch (e) { console.log("Error unmuting window.rtc: " + e.message); }
            //if (window.rtc && window.rtc.adjustRecordingSignalVolumen) window.rtc.adjustRecordingSignalVolumen(50);

            console.log("isMuted()", window.rtc && window.rtc.isMuted ? window.rtc.isMuted().audio : "", rtc && rtc.isMuted ? rtc.isMuted().audio : "");*/

            try {
                rtc && rtc !== {} && rtc.unmute ? rtc.unmute({ audio: true }) : "";
                rtc && rtc !== {} && rtc.renegotiate ? rtc.renegotiate({ offerToReceiveAudio: true }, (r) => { console.log("mute using renegotiation:", r) }) : "";
            }
            catch (e) { console.log("Error unmuting rtc: " + e.message); }
            if (RNCallKeep && stateUuid) RNCallKeep.setMutedCall(stateUuid, false);
            //if (rtc && rtc.adjustRecordingSignalVolumen) rtc.adjustRecordingSignalVolumen(50);
            /*console.log("getAudioTracks",window.MediaStream && window.MediaStream.getAudioTracks?window.MediaStream.getAudioTracks():"");
            window.MediaStream && window.MediaStream.getAudioTracks?window.MediaStream.getAudioTracks().forEach((track) => {
                track.enabled = true;
                track.muted = false;
            }):"";*/

            //window.inCall = true;
            //setInCall(true);
            console.log("isMuted()", window.rtc && window.rtc.isMuted ? window.rtc.isMuted().audio : "", rtc && rtc.isMuted ? rtc.isMuted().audio : "");
            //} catch (e) {
            //console.error("Error muting the call: " + e.message);
            //}
            //if (!state.inCall) displatch(newInCall());
        }

        const makeSendDTMF = (RNCallKeep = null, options = null, tones) => {
            //try {
            console.log("make send of DTMF", window.rtc && window.rtc.sendDTMF ? window.rtc.sendDTMF : "", rtc && rtc.sendDTMF ? rtc.sendDTMF : "");

            /*try {
                window.rtc && window.rtc !== {} && window.rtc.sendDTMF ? window.rtc.sendDTMF(tones, options) : "";
            }
            catch (e) { console.log("Error sendingDTMF window.rtc: " + e.message); }*/
            //if (window.rtc && window.rtc.adjustRecordingSignalVolumen) window.rtc.adjustRecordingSignalVolumen(0);
            //console.log("isMuted()", window.rtc && window.rtc.isMuted ? window.rtc.isMuted().audio : "", rtc && rtc.isMuted ? rtc.isMuted().audio : "");

            try {
                rtc && rtc !== {} && rtc.sendDTMF ? rtc.sendDTMF(tones, options) : "";
            }
            catch (e) { console.log("Error sendingDTMF rtc: " + e.message); }
            //if (rtc && rtc.adjustRecordingSignalVolumen) rtc.adjustRecordingSignalVolumen(0);

            //window.inCall = true;
            //setInCall(true);
            //console.log("isMuted()", window.rtc && window.rtc.isMuted ? window.rtc.isMuted().audio : "", rtc && rtc.isMuted ? rtc.isMuted().audio : "");
            //} catch (e) {
            //console.error("Error muting the call: " + e.message);
            //}
            //if (!state.inCall) displatch(newInCall());
        }

        /*const register = () => {
            ua.start();
            ua.register();
            ua.isRegistered() ? setMyUa(ua) : '';
        }
    
        const unRegister = () => {
            myUa.isRegistered() ? myUa.unregister() : '';
            ua.isRegistered() ? ua.unregister() : "";
            setMyUa({});
        }
    
        const makeAnswerCallKeep = (rtc) => {
            //if(answered && callType === 'remote' && rtc && !answeredOnce) {
            setAnsweredOnce(true);
            rtc ? rtc.answer(options) : "";
            //}
        }
    
        const makeHandupCallKeep = (rtc, myUa) => {
            setAnswered(false);
            setCallType(null);
            rtc ? rtc.terminate(options) : "";
            myUa ? myUa.terminateSessions(options) : "";
            setRtc({});*/

        /*if(!answered && callType === 'remote' && rtc && answeredOnce) {
          setAnsweredOnce(false);
          rtc.terminate(options);
        }
    }*/

        useEffect(() => {
            if (!window.myUa) {
                init();
                RNCallKeep.addEventListener('didReceiveStartCallAction', didReceiveStartCallAction);
                RNCallKeep.addEventListener('answerCall', onAnswerCallAction);
                RNCallKeep.addEventListener('endCall', onEndCallAction);
                RNCallKeep.addEventListener('didDisplayIncomingCall', onIncomingCallDisplayed);
                RNCallKeep.addEventListener('didPerformSetMutedCallAction', didPerformSetMutedCallAction);
                RNCallKeep.addEventListener('didPerformDTMFAction', didPerformDTMFAction);
                RNCallKeep.addEventListener('didToggleHoldCallAction', didToggleHoldCallAction);

                RNCallKeep.addEventListener('didLoadWithEvents', didLoadWithEvents);

                //RNCallKeep.addEventListener('didReceiveRemoteNotification', didReceiveRemoteNotification);

                window.RNCallKeep = RNCallKeep;
                setMyRNCallKeep(RNCallKeep);
            }

            /*if(!iceData)*/ //getIceDataInfo();

            return () => {
                RNCallKeep.removeEventListener('answerCall', onAnswerCallAction);
                RNCallKeep.removeEventListener('didPerformDTMFAction', didPerformDTMFAction);
                RNCallKeep.removeEventListener('didReceiveStartCallAction', didReceiveStartCallAction);
                RNCallKeep.removeEventListener('didPerformSetMutedCallAction', didPerformSetMutedCallAction);
                RNCallKeep.removeEventListener('didToggleHoldCallAction', didToggleHoldCallAction);
                RNCallKeep.removeEventListener('endCall', onEndCallAction);
                RNCallKeep.addEventListener('didDisplayIncomingCall', onIncomingCallDisplayed);
                RNCallKeep.removeEventListener('didLoadWithEvents', didLoadWithEvents);

                //RNCallKeep.removeEventListener('didReceiveRemoteNotification', didReceiveRemoteNotification);
            }
            //console.log("phoneState: ",phoneState);
        }, [])

        //useEffect(() => {

        //answered && !answeredOnce && rtc && rtc !== {} ? rtc.answer(options):"";
        //answered && !answeredOnce? setAnsweredOnce(true):"";

        //}, [inCall, callType])

        useEffect(() => {

            //displatch(newOutgoingCall());
            if (state.callTo && state.callTo.number && state.callTo.number !== "") {
                setCallTo(state.callTo.number);
                /*displatch(setCallTo({
                    number: "",
                    name: ""
                }))*/
            }

            console.log("IceData:", JSON.stringify(iceData));

        }, [state.callTo])

        useEffect(() => {
            if (callTo && !makingCall) {
                //RNCallKeep.addEventListener('didReceiveStartCallAction', didReceiveStartCallAction);
                //setTimeout(() => makeCall(RNCallKeep), 3000);
                //RNCallKeep.startCall(stateUuid, callTo, 'number');
                makeCall(RNCallKeep);

                /*displatch(setCallTo({
                    number: "",
                    name: ""
                }))*/

                return () => {

                    //RNCallKeep.removeEventListener('didReceiveStartCallAction', didReceiveStartCallAction);

                }
            }

        }, [callTo])

        useEffect(() => {

            if (state.handUp) {

                /*RNCallKeep.endCall(stateUuid);
    
                if (!inCall) { //Reject call
                    rtc && rtc !== {} ? rtc.answer(options) : "";
                    setTimeout(() => rtc && rtc !== {} ? rtc.terminate() : "", 2000);
                } else rtc && rtc !== {} ? rtc.terminate() : ""; //Terminate call
    
                setInCall(false);
                setCallType(null);
                
                if (state.inCall) displatch(newInCall());*/
                console.log("goHome was set to false->makeHandup: state.goHome && state.inCall && state.handUp", state.goHome, state.inCall, state.handUp);

                makeHandup(RNCallKeep);

            }

        }, [state.handUp])

        useEffect(() => {

            if (state.answer && rtc && rtc !== {} && rtc.answer) {

                makeAnswer();

            }

        }, [state.answer]);

        useEffect(() => {

            //if (state.answer && rtc && rtc !== {} && rtc.answer) {

            //makeHold();
            if (state.hold) setHoldCall(true);
            else setHoldCall(false);

            //}

        }, [state.hold]);

        useEffect(() => {

            //if (state.answer && rtc && rtc !== {} && rtc.answer) {

            makeHold();

            //}

        }, [holdCall]);

        useEffect(() => {

            //if (state.answer && rtc && rtc !== {} && rtc.answer) {

            if (state.mute) setMuteCall(true);
            else setMuteCall(false);

            //}

        }, [state.mute])

        useEffect(() => {

            //if (state.answer && rtc && rtc !== {} && rtc.answer) {

            if (muteCall) makeMute(RNCallKeep, options);
            else makeUnMute(RNCallKeep, options);

            //}

        }, [muteCall])

        useEffect(() => {

            //if (state.answer && rtc && rtc !== {} && rtc.answer) {

            if (state.dtmf) {
                makeSendDTMF(null, options, state.dtmf);
                displatch(setDtmf(null));
            }
            //else makeUnMute(null, null);

            //}

        }, [state.dtmf])

        /*useEffect(() => {

            if (!iceData) {
                setIceServers([
                    {
                        'urls': ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
                    }
                ]);
                //getIceDataInfo();
            }
            else if (iceData && iceData.v && iceData.v.iceServers) setIceServers(iceData.v.iceServers);

        }, [iceData])*/

        useEffect(() => {

            console.log("options:", JSON.stringify(options));

        }, [iceServers])

        //console.log("Before the Phone return -> Notification");

        return (
            <>
                {/*
                    window.inCall && (
                        <>

                            <Button title="Hold" onPress={() => { window.rtc && window.rtc.hold? window.rtc.hold() : '' }} />
                            <Button title="Un Hold" onPress={() => { window.rtc && window.rtc.unhold ? window.rtc.unhold() : '' }} />

                        </>
                    )*/}

            </>
        );
        return (
            <>
                <SafeAreaView>
                    <Text>PHONE!</Text>
                    {!window.inCall && <Button title="Call to Number" onPress={() => {
                        
                        makeCall()
                    }} />}
                    {window.inCall && <Button title="HandUp" onPress={() => {
                        makeHandup()
                    }} />}
                    {/*<Button title="Connet" onPress={() => {
                    register()
                }} />
                <Button title="Disconnet" onPress={() => {
                    unRegister()
                }} />*/}
                    {/*!window.inCall && window.originator === 'remote' && <Button title="Answer" onPress={() => {
                    if(rtc){
                    rtc.answer(options);
                    window.inCall = true;
                    setInCall(true);
                    RNCallKeep.startCall(window.stateUuid, 'number', 'number');
                    RNCallKeep.setCurrentCallActive(window.stateUuid);
                    }}} />*/}
                    {/*window.inCall && (<><Button title="Hold" onPress={() => rtc ? rtc.hold() : ''} />
                <Button title="Un Hold" onPress={() => rtc ? rtc.unhold() : ''} /></>)*/}
                </SafeAreaView>

            </>
        );

    } else return null;

};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.lighter,
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    body: {
        backgroundColor: Colors.white,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
});

export default Phone;
