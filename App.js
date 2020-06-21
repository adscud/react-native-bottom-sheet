/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import BottomSheetComponent from './src/components/BottomSheetComponent';


const App: () => React$Node = () => {
    const [openFirst, setOpenFirst] = React.useState(false);
    const [openSecond, setOpenSecond] = React.useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setOpenFirst(true)}
            >
                <Text>
                    Touch me 🤧
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setOpenSecond(true)}
            >
                <Text>
                    Touch me 🤧
                </Text>
            </TouchableOpacity>

            <BottomSheetComponent
                shouldOpen={openFirst}
                onClose={() => setOpenFirst(false)}
                renderContent={() => (
                    <View style={styles.content}>
                        <Text>Hi, i'm the bottom sheet =)</Text>
                        <View style={{height: 300, backgroundColor: 'grey'}}/>
                        <View style={{height: 100, backgroundColor: 'blue'}}/>
                    </View>
                )}
            />

            <BottomSheetComponent
                shouldOpen={openSecond}
                onClose={() => setOpenSecond(false)}
                renderContent={() => (
                    <View style={styles.content}>
                        <Text>Hi, i'm an other bottom sheet =)</Text>
                    </View>
                )}
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
    },
});

export default App;
