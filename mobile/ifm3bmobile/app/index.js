import { Alert, ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../assets/style/styles';
import welcome  from '../assets/images/welcome.png';
import { useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const Login = () => {
    const router = useRouter();

    const [logginData, setData] = useState({
        Username:"",
        Password:"",
    });
    const [loading, setLoading] = useState(false);

    const hangleChange = (name, value) => {
        setData(prev => ({...prev, [name]: value,}));
    };

    const signingIn = async () => {
        setLoading(true)

        Alert.alert("Debug", `username: ${logginData.Username}\nPassword: ${logginData.Password}`);
        console.log("Sending data:", logginData);

        try {
            const response = await axios.post('http://10.0.2.2:5289/api/Register/login', 
                { Username: logginData.Username, Password: logginData.Password,},
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            console.log("Login success:", response.data);
            const { token } = response.data;

            //save the token securely
            await SecureStore.setItemAsync('userToken', token);
            console.log("Login success:", response.data);

            //move to home page after saving
            router.push('/(tabs)/Home');
        } catch (error) {
            console.log('Login error:', error.message);
            console.log('Error response:', error.response?.data);
            const msg = error.response?.data?.message || 'Login Failed. Please check credentials';
            Alert.alert('Login error', msg);
        } finally {
            setLoading(false);
        }
    };

    const Handlepress = (namechoice) => {
            const encodedName = encodeURIComponent(namechoice);
            router.push(`/RegisterStart?name=${encodedName}`);
    };

    return (
        <SafeAreaView>
            <ScrollView contentContainerStyle={{ height:'100%'}}>
                    <ImageBackground 
                        source={welcome}
                        style={styles.background}
                        resizeMode='cover'
                    >                         
                        <View style={styles.introcontainer}>
                            <Text style={styles.introTitle}>Login</Text>
                            <Text style={styles.label}>Username:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Username' value={logginData.Username} onChangeText={value => hangleChange('Username', value)} autoCapitalize="none"/>
                            <Text style={styles.label}>Password:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Password' value={logginData.Password} onChangeText={value => hangleChange('Password', value)} secureTextEntry/>
                            
                            <TouchableOpacity style={styles.button} onPress={signingIn}>
                                <Text style={styles.buttonText}>
                                    {loading ? 'signing in...' : 'Sign in'}
                                </Text>
                            </TouchableOpacity>
                            <Text style={styles.label}>Don't have an account? <Text style={styles.labelLink} onPress={() => Handlepress("signingup")}> Sign Up</Text> Or <Text style={styles.labelLink} onPress={() => Handlepress("forgotpass")}> Forgot password</Text></Text>
                        </View>                      
                    </ImageBackground>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Login;

