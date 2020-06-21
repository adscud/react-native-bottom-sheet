/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView} from 'react-native';
import BottomSheetComponent from './src/components/BottomSheetComponent';


const App: () => React$Node = () => {
    const [openFirst, setOpenFirst] = React.useState(false);
    const [openSecond, setOpenSecond] = React.useState(false);
    const [openThird, setOpenThird] = React.useState(false);

    const [ name, setName ] = React.useState('')

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
                    Touch me for a persistent bottom-sheet 🤧
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setOpenThird(true)}
            >
                <Text>
                    Touch me to tell me what is your name 🤧
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
                persistent
                renderContent={() => (
                    <View style={styles.content}>
                        <Text>Hi, i'm an other bottom sheet =)</Text>
                        <Text>I'm persistent, you cannot close me 🤩</Text>
                    </View>
                )}
            />

            <BottomSheetComponent
                shouldOpen={openThird}
                onClose={() => setOpenThird(false)}
                renderContent={() => (
                    <KeyboardAvoidingView style={styles.content}>
                        <Text>
                            Your name is : {name}
                        </Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                        />
                    </KeyboardAvoidingView>
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
    content: {
        padding: 25,
    },
});

export default App;
