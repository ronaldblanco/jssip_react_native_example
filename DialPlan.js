import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Input, Button, Divider, Icon } from "react-native-elements";
import { newMessages, setCallTo, newOutgoingCall, newCallHandUp, newCallAnswer, holdCall, muteCall, setDtmf, newOutgoingCallHandUp } from '../reducers/userReducer';
import { useStore } from '../utils/context';

// Import the react-native-sound module
import Sound from 'react-native-sound';

const DialPlan = ({ onCancel, onCall = null, onActiveCall = false }) => {
    const [state, displatch] = useStore();
    const [number, setNumber] = useState("");

    const [width, setWidth] = useState(50);

    if (state.callTo && !state.inCall) displatch(setCallTo(null));

    const addNumber = (v) => {
        console.log("addNumber ", v)
        setNumber(number + v);

    }

    const setCallToNumber = number => {
        number = number.replace("+1", "");
        number = number.replace("+", "");
        if ((state.callTo && state.callTo.number && state.callTo.number !== "+1" + number && number !== "" && number.indexOf("*") === -1 && String(number).length > 9) || (!state.callTo && number.indexOf("*") === -1 && String(number).length > 9)) displatch(setCallTo({
            number: "+1" + number,
            name: "+1" + number
        }));
        else displatch(setCallTo({
            number: number,
            name: number
        }));
        onCancel();

        //navigation.replace("ActiveCall");
        //return;
    };

    const redial = () => {
        displatch(setCallTo())
        onCancel();
    };

    var num1 = new Sound('./public/phone_keys/wav_1.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('1 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('1 duration in seconds: ' + num1.getDuration() + ' number of channels: ' + num1.getNumberOfChannels());

    });

    var num2 = new Sound('./public/phone_keys/wav_2.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('2 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('2 duration in seconds: ' + num2.getDuration() + ' number of channels: ' + num2.getNumberOfChannels());

    });

    var num3 = new Sound('./public/phone_keys/wav_3.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('3 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('3 duration in seconds: ' + num3.getDuration() + ' number of channels: ' + num3.getNumberOfChannels());

    });

    var num4 = new Sound('./public/phone_keys/wav_4.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('4 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('4 duration in seconds: ' + num4.getDuration() + ' number of channels: ' + num4.getNumberOfChannels());

    });

    var num5 = new Sound('./public/phone_keys/wav_5.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('5 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('5 duration in seconds: ' + num5.getDuration() + ' number of channels: ' + num5.getNumberOfChannels());

    });

    var num6 = new Sound('./public/phone_keys/wav_6.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('6 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('6 duration in seconds: ' + num6.getDuration() + ' number of channels: ' + num6.getNumberOfChannels());

    });

    var num7 = new Sound('./public/phone_keys/wav_7.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('7 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('7 duration in seconds: ' + num7.getDuration() + ' number of channels: ' + num7.getNumberOfChannels());

    });

    var num8 = new Sound('./public/phone_keys/wav_8.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('8 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('8 duration in seconds: ' + num8.getDuration() + ' number of channels: ' + num8.getNumberOfChannels());

    });

    var num9 = new Sound('./public/phone_keys/wav_9.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('9 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('9 duration in seconds: ' + num9.getDuration() + ' number of channels: ' + num9.getNumberOfChannels());

    });

    var num0 = new Sound('./public/phone_keys/wav_0.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('0 failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('0 duration in seconds: ' + num0.getDuration() + ' number of channels: ' + num0.getNumberOfChannels());

    });

    var numStar = new Sound('./public/phone_keys/wav_star.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('* failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('* duration in seconds: ' + numStar.getDuration() + ' number of channels: ' + numStar.getNumberOfChannels());

    });

    var numHash = new Sound('./public/phone_keys/wav_hash.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('# failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('# duration in seconds: ' + numHash.getDuration() + ' number of channels: ' + numHash.getNumberOfChannels());

    });

    return (
        <View style={styles.container} onLayout={(event) => {
            var { x, y, width, height } = event.nativeEvent.layout;
            setWidth(width);
        }}>
            <Input
                rightIcon={<Icon
                    name='cancel'
                    size={24}
                    color='brown'
                    onPress={() => setNumber("")}
                />
                }
                inputStyle={!onActiveCall ? styles.inputNoInCall : styles.inputInCall}
                value={number}
                onChangeText={value => setNumber(value)}
            />

            <View style={{ flexDirection: 'row' }}>
                <Button
                    title="1"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num1.setVolume(1);
                        num1.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 1');
                            } else {
                                console.log('playback failed due to audio decoding errors in 1');
                            }
                        });
                        addNumber(1);
                        if (state.inCall) displatch(setDtmf(1));
                    }}
                />
                <Button
                    title="2"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num2.setVolume(1);
                        num2.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 2');
                            } else {
                                console.log('playback failed due to audio decoding errors in 2');
                            }
                        });
                        addNumber(2);
                        if (state.inCall) displatch(setDtmf(2))
                    }}
                />
                <Button
                    title="3"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num3.setVolume(1);
                        num3.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 3');
                            } else {
                                console.log('playback failed due to audio decoding errors in 3');
                            }
                        });
                        addNumber(3);
                        if (state.inCall) displatch(setDtmf(3))
                    }}
                />
            </View>

            <Divider orientation="horizontal" />
            <Text>{"\n"}</Text>
            {/*width > 380 && width < 400 && <Text>{'__________________________________'+width}</Text>*/}
            {/*width > 740 && width < 760 && <Text>{'______________________________________________________________________'+width}</Text>*/}

            <View style={{ flexDirection: 'row' }}>
                <Button
                    title="4"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num4.setVolume(1);
                        num4.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 4');
                            } else {
                                console.log('playback failed due to audio decoding errors in 4');
                            }
                        });
                        addNumber(4);
                        if (state.inCall) displatch(setDtmf(4))
                    }}
                />
                <Button
                    title="5"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num5.setVolume(1);
                        num5.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 5');
                            } else {
                                console.log('playback failed due to audio decoding errors in 5');
                            }
                        });
                        addNumber(5);
                        if (state.inCall) displatch(setDtmf(5))
                    }}
                />
                <Button
                    title="6"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num6.setVolume(1);
                        num6.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 6');
                            } else {
                                console.log('playback failed due to audio decoding errors in 6');
                            }
                        });
                        addNumber(6);
                        if (state.inCall) displatch(setDtmf(6))
                    }}
                />
            </View>
            <Divider orientation="horizontal" />
            <Text>{"\n"}</Text>

            <View style={{ flexDirection: 'row' }}>
                <Button
                    title="7"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num7.setVolume(1);
                        num7.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 7');
                            } else {
                                console.log('playback failed due to audio decoding errors in 7');
                            }
                        });
                        addNumber(7);
                        if (state.inCall) displatch(setDtmf(7))
                    }}
                />
                <Button
                    title="8"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num8.setVolume(1);
                        num8.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 8');
                            } else {
                                console.log('playback failed due to audio decoding errors in 8');
                            }
                        });
                        addNumber(8);
                        if (state.inCall) displatch(setDtmf(8));
                    }}
                />
                <Button
                    title="9"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num9.setVolume(1);
                        num9.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 9');
                            } else {
                                console.log('playback failed due to audio decoding errors in 9');
                            }
                        });
                        addNumber(9);
                        if (state.inCall) displatch(setDtmf(9));
                    }}
                />
            </View>
            <Divider orientation="horizontal" />
            <Text>{"\n"}</Text>

            <View style={{ flexDirection: 'row' }}>
                <Button
                    title="*"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        numStar.setVolume(1);
                        numStar.play((success) => {
                            if (success) {
                                console.log('successfully finished playing *');
                            } else {
                                console.log('playback failed due to audio decoding errors in *');
                            }
                        });
                        addNumber("*");
                        if (state.inCall) displatch(setDtmf("*"))
                    }}
                />
                <Button
                    title="0"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        num0.setVolume(1);
                        num0.play((success) => {
                            if (success) {
                                console.log('successfully finished playing 0');
                            } else {
                                console.log('playback failed due to audio decoding errors in 0');
                            }
                        });
                        addNumber(0);
                        if (state.inCall) displatch(setDtmf(0))
                    }}
                />
                <Button
                    title="#"
                    titleStyle={styles.roundButton1Title}
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => {
                        numHash.setVolume(1);
                        numHash.play((success) => {
                            if (success) {
                                console.log('successfully finished playing #');
                            } else {
                                console.log('playback failed due to audio decoding errors in #');
                            }
                        });
                        addNumber("#");
                        if (state.inCall) displatch(setDtmf("#"))
                    }}
                />
            </View>
            <Divider orientation="horizontal" />
            <Text>{"\n"}</Text>

            <View style={{ flexDirection: 'row' }}>
                <Button
                    icon={
                        <Icon
                            name="cancel"
                            size={35}
                            color="white"
                        />
                    }
                    title=""
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButtonCancel : styles.roundButtonCancel}
                    onPress={onCancel}
                />
                {/*!state.inCall && */<Button
                    disabled={!state.inCall ? false : true}
                    icon={!state.inCall ?
                        <Icon
                            name="call"
                            size={35}
                            color="white"
                        /> : <></>
                    }
                    title=""
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButtonCall : styles.roundButtonCallDisabled}
                    onPress={() =>
                        setCallToNumber(
                            number
                        )
                    }
                />}
                <Button
                    disabled={number.length > 0 ? false : true}
                    icon={
                        number.length > 0 ? <Icon
                            name="backspace"
                            size={35}
                            color="white"
                        /> : <></>
                    }
                    title=""
                    type="clear"
                    buttonStyle={!onActiveCall ? styles.roundButton1 : styles.roundButton1}
                    onPress={() => setNumber(number.substring(0, number.length - 1))}
                />
            </View>
        </View>
    );
};
export default DialPlan;
const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        borderStyle: 'solid',
        borderRadius: 1,
        borderWidth: 1,
        borderColor: '#999',
        padding: 10,
        width: "100%",
        display: "flex",
        flexGrow: 0,
        flexShrink: 0,
        flexWrap: "wrap",
        justifyContent: "center"
    },
    keypad: {
        width: 100,
        borderStyle: 'solid',
        borderRadius: 1,
        borderWidth: 1,
        borderColor: '#CCC',
    },
    keypadBlack: {
        width: 100,
        borderStyle: 'solid',
        borderRadius: 1,
        borderWidth: 1,
        borderColor: '#CCC',
        backgroundColor: "black"
    },
    keypad2: {
        width: 200,
        borderStyle: 'solid',
        borderRadius: 1,
        borderWidth: 1,
        borderColor: '#CCC',
    },
    button: {
        width: 200,
        marginTop: 10,
        //backgroundColor: "black"
    },
    buttonBlack: {
        width: 200,
        marginTop: 10,
        backgroundColor: "black"
    },
    roundButton1: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        backgroundColor: 'grey',
        //color: "white"
        //color:"#841584"
    },
    roundButton1Title: {
        color: "white",
        fontSize: 35,
    },
    roundButtonCall: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        backgroundColor: 'green',
    },
    roundButtonCallDisabled: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        backgroundColor: 'grey',
    },
    roundButtonCancel: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        backgroundColor: 'brown',
    },
    inputNoInCall: {
        color: "black",
        fontSize: 35,
    },
    inputInCall: {
        color: "white",
        fontSize: 35,
    }
});
