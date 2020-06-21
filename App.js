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
import BottomSheetComponent from './src/components/BottomSheetComponent'


const App: () => React$Node = () => {
    const [ open, setOpen ] = React.useState(false)

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
                onPress={() => setOpen(true)}
            >
                <Text>
                    Touch me 🤧
                </Text>
            </TouchableOpacity>

            <BottomSheetComponent
                shouldOpen={open}
                onClose={() => setOpen(false)}
                renderContent={renderContent}
            />
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
    }
});

export default App;
