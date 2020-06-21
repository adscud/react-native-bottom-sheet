/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {Animated, TouchableOpacity, Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View, ScrollView} from 'react-native';

const {height} = Dimensions.get('window');
const duration = 500;
const maxHeight = height * .9

const App: () => React$Node = () => {

    const [ contentHeight, setContentHeight ] = React.useState(0)
    const opacity = new Animated.Value(0);
    const translateY = new Animated.Value(height);

    const onLayout = (event) => {
        const { height } = event.nativeEvent.layout
        setContentHeight(height)
    }

    const open = () => {
        Animated.parallel([
            Animated.timing(
                translateY,
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
                translateY,
                {
                    toValue: height,
                    duration: duration,
                    useNativeDriver: true,
                },
            ),
        ]).start();
    };

    const content = () => (
        <View  style={styles.content}>
            <Text>
                Hi, i'm the bottom sheet
            </Text>
            <View style={{ height: 1000, backgroundColor: 'pink' }} />
        </View>
    )

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={{ zIndex: 1 }}
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
                        transform: [{translateY: translateY}],
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
                            ]}
                        />
                    </TouchableWithoutFeedback>
                    <View
                        style={styles.bottomSheet}
                        onLayout={onLayout}
                    >
                        <View style={styles.anchorView}>
                            <View style={styles.anchor}/>
                        </View>
                        {contentHeight <= maxHeight ? (
                            <View>
                                {content()}
                            </View>
                        ) : (
                            <ScrollView>
                                {content()}
                            </ScrollView>
                        )}
                    </View>
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
    containerBottomSheet: {
        position: 'absolute',
        height: '100%',
        width: '100%',
    },
    layoutBottomSheet: {
        height: height,
        backgroundColor: '#333',
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
        zIndex: 15
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
