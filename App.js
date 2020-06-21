/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

console.disableYellowBox = true;

const {height} = Dimensions.get('window');
const duration = 500;
const maxHeight = height * .9;
const allowedDragUpSize = 50;

const App: () => React$Node = () => {

    const [contentHeight, setContentHeight] = React.useState(0); // height of the content inside the bottom sheet
    const threshold = contentHeight * 0.1; // minimum height to drag to close the bottom sheet
    const opacity = new Animated.Value(0); // manage the opacity of the background when bottom sheet is open
    const parentTranslateY = new Animated.Value(height); // manage position of the bottom sheet
    const pan = new Animated.ValueXY(0); // { x: Number, y: Number }

    // get the size of the content inside the bottom sheet
    const onLayout = (event) => {
        const {height} = event.nativeEvent.layout;
        setContentHeight(height);
    };

    // open the bottom sheet
    const open = () => {
        Animated.parallel([
            Animated.timing(
                parentTranslateY,
                {
                    toValue: 0,
                    duration: duration,
                    useNativeDriver: true,
                },
            ),
            Animated.timing(
                opacity,
                {
                    toValue: 0.2,
                    delay: duration,
                    duration: 0,
                    useNativeDriver: true,
                },
            ),
        ]).start();
    };

    // close the bottom sheet
    const close = () => {
        Animated.parallel([
            Animated.timing(
                opacity,
                {
                    toValue: 0,
                    duration: 5,
                    useNativeDriver: true,
                },
            ),
            Animated.timing(
                parentTranslateY,
                {
                    toValue: height,
                    duration: duration,
                    useNativeDriver: true,
                },
            ),
        ]).start(() => pan.setValue({x: 0, y: 0}));
    };

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderMove: Animated.event(
            [
                null, // ignore the native event
                {
                    // extract dx and dy from gestureState
                    // like 'pan.x = gestureState.dx, pan.y = gestureState.dy'
                    dx: pan.x,
                    dy: pan.y,
                },
            ],
            {
                useNativeDriver: false, // Animated.event doesn't support the native driver
                listener: (event, gestureState) => null, // don't want to add some logic so return null
            },
        ),
        onPanResponderRelease: (e, {vx, vy}) => {
            const {y} = pan;
            y._value > threshold ? close() : (
                Animated.spring( // go back to origin state
                    pan,
                    {
                        toValue: {x: 0, y: 0},
                        useNativeDriver: true,
                    },
                ).start()
            );
            pan.flattenOffset(); // reset pan { x: 0, y: 0}
        },
    });

    const renderContent = () => (
        <View style={styles.content}>
            <Text>Hi, i'm the bottom sheet =)</Text>
            <View style={{ height: 300, backgroundColor: 'grey' }} />
            <View style={{ height: 100, backgroundColor: 'blue' }} />
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={open}
            >
                <Text>
                    Touch me
                </Text>
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.containerBottomSheet,
                    {
                        transform: [
                            {
                                translateY: parentTranslateY,
                            },
                        ],
                    },
                ]}
            >
                <View style={{flex: 1, position: 'relative'}}>
                    <TouchableWithoutFeedback
                        style={styles.layoutBottomSheet}
                        onPress={close}
                    >
                        <Animated.View
                            style={[
                                styles.layoutBottomSheet,
                                {
                                    opacity: opacity,
                                },
                                opacity !== 0 && {
                                    backgroundColor: '#333',
                                }
                            ]}
                        />
                    </TouchableWithoutFeedback>
                    <Animated.View
                        style={[
                            styles.bottomSheet,
                            {
                                transform: [
                                    {
                                        translateY: pan.y,
                                    },
                                ],
                            },
                        ]}
                        onLayout={onLayout}
                    >
                        <View
                            {...panResponder.panHandlers}
                            style={styles.anchorView}
                        >
                            <View style={styles.anchor}/>
                        </View>
                        {contentHeight <= maxHeight ? (
                            <View>
                                {renderContent()}
                            </View>
                        ) : ( // content > maxHeight so we need to scroll inside our bottom sheet
                            <ScrollView>
                                {renderContent()}
                            </ScrollView>
                        )}
                    </Animated.View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        marginVertical: 5,
    },
    containerBottomSheet: {
        position: 'absolute',
        height: '100%',
        width: '100%',
    },
    layoutBottomSheet: {
        height: height,
    },
    layoutOpacity: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    bottomSheet: {
        maxHeight: height * 0.9,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#ffffff',
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
        zIndex: 15,
    },
    anchorView: {
        height: 30,
        padding: 10,
        backgroundColor: '#ffffff',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
    },
    anchor: {
        alignSelf: 'center',
        height: 5,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, .2)',
        borderRadius: 30,
    },
    content: {
        padding: 25,
    },
});

export default App;
