import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import welcome  from '../assets/images/welcome.png';

const Home = () => {
    return (
        <SafeAreaView>
            <ScrollView contentContainerStyle={{ height:'100%'}}>
                    <ImageBackground 
                        source={welcome}
                        style={styles.background}
                        resizeMode='cover'
                    > 
                        
                        <View style={styles.container}>   
                            <TextInput style={styles.textInput} placeholder='Enter Username'/>
                            <TextInput style={styles.textInput} placeholder='Enter Password'/>
                            

                            <TouchableOpacity style={styles.button}>
                                <Text style={styles.buttonText}>Sign in</Text>
                            </TouchableOpacity>

                            <Text>Don't have an account ? <Text style={{color: 'blue'}}> Sign Up</Text></Text>
                        </View>
                        
                    </ImageBackground>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Home;

const styles = StyleSheet.create({
    container: {
        padding: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#cccccc',
        width: '100%',
        backgroundColor:'white',
        borderRadius: 25,
        marginBottom: 10,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    button: {
        backgroundColor: 'rgba(1,32,93,0.6)',
        width: '100%',
        paddingVertical: 14,
        bordingRadius: 999,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});