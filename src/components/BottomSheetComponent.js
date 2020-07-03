import React, {
    useState,
    useRef,
    useEffect,
} from 'react'
import {
    Animated,
    BackHandler,
    Keyboard,
    PanResponder,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    Dimensions,
    Platform
} from 'react-native'
import PropTypes from 'prop-types'

const { height } = Dimensions.get('window')
const { OS } = Platform
const duration = 500
const maxHeight = height * 0.9

// Why use useRef with animated value : https://github.com/facebook/react-native/issues/25069
const BottomSheetComponent = ({ shouldOpen, scrollEnabled, persistent, onClose, renderContent, }) => {
    const [ isOpen, setIsOpen ] = useState(false)
    const [ contentHeight, setContentHeight ] = useState(0) // height of the content inside the bottom sheet
    const [ keyboardHeight, setKeyboardHeight ] = useState(0) // get size of the keyboard
    const [ keyboardOpen, setKeyboardOpen ] = useState(false) // want to know if the keyboard is open or not
    const [ animated, setAnimated ] = useState(false)

    const opacity = useRef(new Animated.Value(0)).current // manage the opacity of the background when bottom sheet is open
    const translateY = useRef(new Animated.Value(height)).current // manage position of the container's bottom sheet
    const underKeyboardHeight = useRef(new Animated.Value(0)).current // size of the view under the keyboard on ios to avoid keyboard over the content
    const dragTopBackgroundHeight = useRef(new Animated.Value(0)).current

    const pan = new Animated.ValueXY(0) // { x: Number, y: Number }

    const threshold = contentHeight * 0.1 // minimum height to drag to close the bottom sheet

    useEffect(() => {
        if (shouldOpen && !isOpen) {
            openBottomSheet()
        } else if (!shouldOpen && isOpen) {
            closeBottomSheet()
        }
    }, [ shouldOpen, isOpen ])

    useEffect(() => {
        keyboardHeight !== 0 && !animated ? keyboardShow() : keyboardDismiss()
    }, [ keyboardHeight ])

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (event) => (OS === 'ios' && setKeyboardHeight(event.endCoordinates.height), setKeyboardOpen(true)),
        )
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => (OS === 'ios' && setKeyboardHeight(0), setKeyboardOpen(false)),
        )

        return () => {
            keyboardDidHideListener.remove()
            keyboardDidShowListener.remove()
        }
    }, [])

    // handle back button on android
    OS === 'android' && useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                closeBottomSheet()
                return true
            },
        )

        return () => backHandler.remove()
    })

    // get the size of the content inside the bottom sheet
    const onLayout = (event) => {
        const { height } = event.nativeEvent.layout
        setContentHeight(height)
    }

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
        ]).start(() => setIsOpen(true))
    }

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
            pan.setValue({
                x: 0,
                y: 0,
            })
            onClose()
            setIsOpen(false)
        })
    }

    const keyboardShow = () => {
        setAnimated(true)
        Animated.timing(
            underKeyboardHeight,
            {
                toValue: keyboardHeight,
                duration: 250,
                useNativeDriver: false,
            },
        ).start(({ finished }) => finished && setAnimated(false))
    }

    const keyboardDismiss = () => {
        setAnimated(true)
        Animated.timing(
            underKeyboardHeight,
            {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            },
        ).start(({ finished }) => finished && setAnimated(false))
    }

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
                listener: (event, { dy }) => {
                    if (dy <= 0) { // if drag to the top, we grow up our view because don't want that the user seen nothing
                        const dyAbs = Math.abs(dy) // ex : -20 => 20
                        dragTopBackgroundHeight.setValue(dyAbs)
                    }
                },
            },
        ),
        onPanResponderRelease: (e, { vx, vy }) => {
            const { y } = pan
            y.__getValue() > threshold && !persistent ? closeBottomSheet() : (
                Animated.parallel([
                    Animated.spring( // go back to origin state
                        pan,
                        {
                            toValue: {
                                x: 0,
                                y: 0,
                            },
                            useNativeDriver: false,
                        },
                    ),
                    Animated.spring(
                        dragTopBackgroundHeight,
                        {
                            toValue: 0,
                            useNativeDriver: false,
                        },
                    ),
                ]).start()
            )
            pan.flattenOffset()
            // reset pan { x: 0, y: 0}
        },
    })

    return (
        <>
            <Animated.View
                style={[
                    styles.containerBottomSheet,
                    {
                        transform: [
                            {
                                translateY,
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.parentContent}>
                    <TouchableWithoutFeedback
                        style={styles.layoutBottomSheet}
                        onPress={() => !persistent && closeBottomSheet()}
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
                        {!persistent && (
                            <View
                                {...panResponder.panHandlers}
                                style={styles.anchorView}
                            >
                                <View style={styles.anchor} />
                            </View>
                        )}
                        <ScrollView
                            scrollEnabled={scrollEnabled || keyboardOpen}
                            keyboardShouldPersistTaps='always'
                        >
                            {renderContent()}
                            {OS === 'ios' && (
                                <Animated.View style={{ height: underKeyboardHeight }} />
                            )}
                        </ScrollView>
                    </Animated.View>
                    <Animated.View
                        style={[ styles.dragTopBackground, { height: dragTopBackgroundHeight } ]}
                    />
                </View>
            </Animated.View>
        </>
    )
}

BottomSheetComponent.propType = {
    shouldOpen: PropTypes.bool,
    scrollEnable: PropTypes.bool,
    persistent: PropTypes.bool,
    onClose: PropTypes.func,
    renderContent: PropTypes.func,
}

BottomSheetComponent.defaultProps = {
    shouldOpen: false,
    scrollEnable: false,
    persistent: false
}


const styles = StyleSheet.create({
    containerBottomSheet: {
        zIndex: 35,
        position: 'absolute',
        height: '100%',
        width: '100%',
    },
    parentContent: {
        flex: 1,
        position: 'relative',
    },
    layoutBottomSheet: {
        height: height,
    },
    layoutOpacity: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    bottomSheet: {
        maxHeight: maxHeight,
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
    dragTopBackground: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#ffffff',
        width: '100%',
    },
})

export default BottomSheetComponent
