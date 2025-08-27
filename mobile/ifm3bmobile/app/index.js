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

                            <Text style={styles.label}>Username:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Username'/>
                            <Text style={styles.label}>Password:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Password'/>
                            
                            <TouchableOpacity style={styles.button}>
                                <Text style={styles.buttonlblText}>Sign in</Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Don't have an account? <Text style={{color: 'orange', fontWeight:'bold'}}> Sign Up</Text> Or <Text style={{color: 'orange', fontWeight:'bold'}}> Forgot password</Text></Text>
                            
                        </View>                      
                    </ImageBackground>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Home;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        margin: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(1,32,93,0.6)',
    },
    label:{
        color:'white', 
        fontSize: 15,
    },
    textInput: {
        padding: 10,
        backgroundColor:'white',
        borderRadius: 5,
        marginVertical: 10,
    },
    background: {
        flex: 1,
        justifyContent: 'center',
    },
    button: {
        backgroundColor: 'orange',
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 10,
        overflow: 'hidden',
        paddingVertical: 7,
    },
    buttonlblText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});