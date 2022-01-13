import React, { useState, useContext, useRef, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    StyleSheet,
} from 'react-native';
import {
    Card,
    Avatar,
    ListItem,
    Icon,
    Button,
    Text

} from 'react-native-elements';
import { useStore } from '../utils/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/api';
import { newMessages, setCallTo, newOutgoingCall, setTimer, setGoHome, newCallHandUp, setCallFrom, newCallAnswer, holdCall, muteCall, speakerCall, setDtmf, newOutgoingCallHandUp } from '../reducers/userReducer';
import DialPlan from '../components/DialPlan';

//import LoudSpeaker from 'react-native-loud-speaker';

import BackgroundTimer from 'react-native-background-timer';
import { Stopwatch, Timer } from 'react-native-stopwatch-timer'

//import Timer from '../components/Timer';

/*const Timer = () => {

    const [timer, setTimer] = useState(null);
    const [counter, setCounter] = useState(0);

    const [state, displatch] = useStore();

    let myTimer = setInterval(() => {
        console.log('fire!', counter);
        setCounter(counter + 1);
    }, 15000);
    useEffect(() => {
        if (!timer && state) setTimer({ myTimer });

        //return () => clearInterval(timer)
    }, [])

    return counter;
}*/

const ActiveCallScreen = ({ navigation }/*,timer*/) => {
    const [state, displatch] = useStore();
    const { user, unread } = state;

    const [showdial, setShowdial] = useState(false);

    const [speaker, setSpeaker] = useState(false);

    const [timerStart, setTimerStart] = useState(false);
    const [stopwatchStart, setStopwatchStart] = useState(false);
    const [totalDuration, setTotalDuration] = useState(90000);
    const [timerReset, setTimerReset] = useState(false);
    const [stopwatchReset, setStopwatchReset] = useState(false);

    //const [timer, setTimer] = useState({'Timer':timer});
    //const [counter, setCounter] = useState(0);
    //window.timer = 0;

    //const timerPlus = () =>{
    //window.timer = window.timer + 1;
    //}

    /*const tick =() => {
        console.log("timer: ",counter);
        setCounter(
          counter + 1
        );
    }
    let myTimer = setInterval(tick(), 1000);*/
    //setTimer({myTimer});

    const hangUp = () => {
        displatch(setCallTo(null));
        displatch(setCallFrom(null));
        displatch(newCallHandUp());
        navigation.replace('Home');

        //if(state.timer) displatch(setTimer());
    }

    const close = () => {
        //displatch(setCallTo(null));
        //displatch(newCallHandUp());
        navigation.replace('Home');
    }

    const answer = () => {
        displatch(newCallAnswer());
        //navigation.replace('Home');

        //if(!state.timer) displatch(setTimer());
    }

    const speakerOn = () => {
        //LoudSpeaker.open(true)
    }

    const speakerOff = () => {
        //LoudSpeaker.open(false)
    }

    const getFormattedTime = (time) => {
        console.log(time);
    };
    //const myTimer = Timer;

    /*let counter = 0;
    BackgroundTimer.start();
    // Do whatever you want incuding setTimeout;
    setInterval(() => {
        console.log('fire!', counter);
        counter = counter + 1;
        //setCounter(counter + 1);
    }, 15000);
    BackgroundTimer.stop();*/

    useEffect(() => {
        //console.log('user ', user);
        //if(state.goHome) displatch(setGoHome());
        //if(state.outgoingCall) setInterval(timerPlus(), 1000);
        //if(!timer) setTimer({myTimer});

        //if(!state.timer) displatch(setTimer());
        //let myTimer = Timer;
        //setStopwatchStart(true);
    }, []);

    useEffect(() => {
        //console.log('user ', user);
        //if(state.goHome) displatch(setGoHome());
        //if(state.outgoingCall) setInterval(timerPlus(), 1000);
        //if(!timer) setTimer({myTimer});

        //if(!state.timer) displatch(setTimer());
    }, [state.timer]);

    useEffect(() => {
        if (state.inCall) setStopwatchStart(true);
        //console.log('user ', user);
        //if(state.goHome) displatch(setGoHome());
        //if(state.inCall && state.incommingCall) setInterval(timerPlus(), 1000);
    }, [state.inCall]);

    useEffect(() => {

        if (state.callTo) displatch(newOutgoingCall());
        //setTimeout(()=>setCallTo(state.callTo.number),2000);

    }, [state.callTo])

    useEffect(() => {

        if (state.goHome) {
            displatch(setCallTo(null));
            displatch(setCallFrom(null));
            console.log("1goHome was set to false", state.goHome);
            displatch(setGoHome(false));
            console.log("2goHome was set to false", state.goHome);
            navigation.replace("Home");
            //return;
        }

    }, [state.goHome])

    useEffect(() => {

        if (state.handUp) {
            //displatch(setCallTo(null));
            //console.log("1goHome was set to false",state.goHome);
            if (!state.goHome) displatch(setGoHome(true));
            //console.log("2goHome was set to false",state.goHome);
            //navigation.replace("Home");
            //return;
        }

    }, [state.handUp])

    /*React.useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <Button
              onPress={() => {
                if(!showdial) setShowdial(true);
                else setShowdial(false);
              }}
              icon={<Icon name="dialpad" />}
              type="clear"
            />
          ),
        });
      }, [navigation]);*/

    return (
        <SafeAreaView style={styles.container}>
            {showdial && state.inCall && <DialPlan onCancel={() => setShowdial(false)} onCall={null} onActiveCall={true} />}

            {!showdial && <><Avatar rounded icon={{ name: 'account-circle' }} size="xlarge" />

                <Text h3 style={styles.whiteColor}>
                    {state.callFrom && !state.inCall ? "Incoming..." : ((state.incommingCall || state.outgoingCall) && state.inCall) ? "Stablished" : 'Calling...'}
                </Text>
                <Text h2 style={styles.whiteColor}>
                    {state.callFrom ? state.callFrom.number : state.callTo ? state.callTo.number : 'Private Number'}
                </Text>
                <Text h4 style={styles.whiteColor}>
                    {state.callFrom ? state.callFrom.name : state.callTo ? state.callTo.name : 'Unknow'}
                </Text></>}

            <Stopwatch
                laps
                msecs={false}
                start={stopwatchStart}
                reset={stopwatchReset}
                options={options}
                getTime={getFormattedTime}
                startTime={0}
            />

            {!state.mute && state.incommingCall ? <Icon name="mic"
                size={35}
                color="white" /> : state.mute && state.incommingCall ? <Icon name="mic-off"
                    size={35}
                    color="white" /> : <></>}

            {/*<Text h4 style={styles.whiteColor}>{counter}</Text>*/}
            {/*state.timer &&*/ /*<Timer />*/}
            {/*<Text h4 style={styles.whiteColor}>{timer.Timer()}</Text>*/}
            {/*<Text h4 style={styles.whiteColor}>{counter}</Text>*/}

            {/*<><Text>{state.incommingCall ? "state.incommingCall: " + state.incommingCall : "no state.incommingCall or false"}</Text>
                <Text>{state.outgoingCall ? "state.outgoingCall: " + state.outgoingCall : "no state.outgoingCall or false"}</Text>
                <Text>{state.handUp ? "state.handUp: " + state.handUp : "no state.handUp or false"}</Text>
            <Text>{state.goHome ? "state.goHome: " + state.goHome : "no state.goHome or false"}</Text></>*/}
            {/*<Text>{"state.callTo: " + JSON.stringify(state.callTo)}</Text>*/}
            {/*<Text>{"state.callFrom: " + JSON.stringify(state.callFrom)}</Text>*/}

            {!showdial && <View style={styles.hangUpWrapper}>
                {(state.incommingCall || state.outgoingCall) && state.inCall && <>
                    <Button
                        title=""
                        containerStyle={{
                            width: 200,

                        }}
                        buttonStyle={styles.hangUpBtn}
                        onPress={() => hangUp()}
                        icon={<Icon name="call-end"
                            size={35}
                            color="white" />}
                    />
                    <Button
                        title=""
                        containerStyle={{
                            width: 200,

                        }}
                        buttonStyle={styles.keypadBtn}
                        onPress={() => {
                            if (!showdial) setShowdial(true);
                            else setShowdial(false);
                        }}
                        icon={<Icon name="dialpad"
                            size={35}
                            color="white" />}

                    //type="clear"
                    />
                    {/*<Button
                        title={!speaker?"SPEAKER ON":"SPEAKER OFF"}
                        containerStyle={{
                            width: 200,

                        }}
                        buttonStyle={styles.keypadBtn}
                        onPress={() => {
                            if (!speaker) speakerOn();
                            else speakerOff();
                        }}
                    //icon={<Icon name="dialpad" />}
                    //type="clear"
                    />*/}
                </>}
                {(state.outgoingCall && !state.inCall) &&
                    <Button
                        title=""
                        containerStyle={{
                            width: 200,

                        }}
                        buttonStyle={styles.hangUpBtn}
                        onPress={() => hangUp()}
                        icon={<Icon name="call-end"
                            size={35}
                            color="white" />}
                    />
                }
                {state.incommingCall && !state.inCall && <Button
                    title=""
                    containerStyle={{
                        width: 200,

                    }}
                    icon={<Icon name="call-received"
                            size={35}
                            color="white" />}
                    buttonStyle={styles.answerBtn}
                    onPress={() => answer()}
                />}
                {(!state.incommingCall && !state.outgoingCall) && !state.inCall && <Button
                    title=""
                    containerStyle={{
                        width: 200,

                    }}
                    icon={<Icon name="cancel"
                            size={35}
                            color="white" />}
                    buttonStyle={styles.hangUpBtn}
                    onPress={() => close()}
                />}
                {(state.incommingCall /*|| state.outgoingCall*/) && state.inCall && <Button
                    title={state.mute ? "" : ""}
                    containerStyle={{
                        width: 200,

                    }}
                    icon={state.mute ? <Icon name="mic"
                        size={35}
                        color="white" /> : <Icon name="mic-off"
                            size={35}
                            color="white" />}
                    buttonStyle={styles.keypadBtn}
                    onPress={() => {
                        displatch(muteCall());

                    }} />}
            </View>}

        </SafeAreaView>
    );
};
export default ActiveCallScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        flexDirection: "column",
        backgroundColor: "black",
    },
    whiteColor: {
        color: "white"
    },
    scrollView: {
        marginHorizontal: 20,
        flex: 1,
        width: '100%',

    },
    avatar: {
        width: '50%',
        height: 250,
    },
    hangUpWrapper: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 36
    },
    hangUpBtn: {
        borderRadius: 30,
        backgroundColor: "red"
    },
    answerBtn: {
        borderRadius: 30,
        backgroundColor: "green"
    },
    keypadBtn: {
        borderRadius: 30,
        backgroundColor: "brown"
    }
});

const options = {
    container: {
        backgroundColor: 'black',
        padding: 5,
        borderRadius: 5,
        width: 180,
    },
    text: {
        fontSize: 30,
        color: "white",
        marginLeft: 7,
    }
};
