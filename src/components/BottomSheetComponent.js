import React from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';


const {height} = Dimensions.get('window');
const duration = 1000;
const maxHeight = height * .9;

// Why use React.useRef with animated value : https://github.com/facebook/react-native/issues/25069
const BottomSheetComponent = ({shouldOpen = false, onClose, renderContent, persistent = false}) => {
    const [contentHeight, setContentHeight] = React.useState(0); // height of the content inside the bottom sheet
    const threshold = contentHeight * 0.1; // minimum height to drag to close the bottom sheet
    const opacity = React.useRef(new Animated.Value(0)).current; // manage the opacity of the background when bottom sheet is open
    const translateY = React.useRef(new Animated.Value(height)).current; // manage position of the container's bottom sheet
    const pan = new Animated.ValueXY(0); // { x: Number, y: Number }
    const dragTopBackgroundHeight = new Animated.Value(0);

    React.useEffect(() => {
        shouldOpen && openBottomSheet();
    }, [shouldOpen]);


    // get the size of the content inside the bottom sheet
    const onLayout = (event) => {
        const {height} = event.nativeEvent.layout;
        setContentHeight(height);
    };

    const openBottomSheet = () => {
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

    // close the bottom sheet
    const closeBottomSheet = () => {
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
        ]).start(() => {
            pan.setValue({x: 0, y: 0});
            onClose();
        });
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
                listener: (event, {dy}) => {
                    if (dy <= 0) { // if drag to the top, we grow up our view because don't want that the user seen nothing
                        const dyAbs = Math.abs(dy); // ex : -20 => 20
                        dragTopBackgroundHeight.setValue(dyAbs);
                    }
                },
            },
        ),
        onPanResponderRelease: (e, {vx, vy}) => {
            const {y} = pan;
            y.__getValue() > threshold ? closeBottomSheet() : (
                Animated.parallel([
                    Animated.spring( // go back to origin state
                        pan,
                        {
                            toValue: {x: 0, y: 0},
                            useNativeDriver: false,
                        },
                    ),
                    Animated.spring(
                        dragTopBackgroundHeight,
                        {
                            toValue: 0,
                            useNativeDriver: false
                        }
                    )
                ]).start()
            )
            pan.flattenOffset();
            // reset pan { x: 0, y: 0}
        },
    });

    return (
        <>
            <Animated.View
                style={[
                    styles.containerBottomSheet,
                    {
                        transform: [
                            {
                                translateY: translateY,
                            },
                        ],
                    },
                ]}
            >
                <View style={{flex: 1, position: 'relative'}}>
                    <TouchableWithoutFeedback
                        style={styles.layoutBottomSheet}
                        onPress={closeBottomSheet}
                    >
                        <Animated.View
                            style={[
                                styles.layoutBottomSheet,
                                opacity !== 0 && {
                                    opacity: opacity,
                                    backgroundColor: '#333',
                                },
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
                    <Animated.View
                        style={[styles.dragTopBackground, {height: dragTopBackgroundHeight}]}
                    />
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
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
    dragTopBackground: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#ffffff',
        width: '100%',
    },
});

export default BottomSheetComponent;
