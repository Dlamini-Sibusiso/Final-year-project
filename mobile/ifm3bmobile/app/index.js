import { Alert, ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../assets/style/styles';
import welcome  from '../assets/images/welcome.png';
import axios from 'axios';
//import * as SecureStore from 'expo-secure-store';

import { useAuth } from '../hooks/useAuth';//new

const Login = () => {
    const router = useRouter();

    const { login } = useAuth();//new

    const [logginData, setData] = useState({
        Username:"",
        Password:"",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (name, value) => {
        setData(prev => ({...prev, [name]: value,}));
    };

    const signingIn = async () => {
        setLoading(true)

        //Alert.alert("Debug", `username: ${logginData.Username}\nPassword: ${logginData.Password}`);
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
            //const { token } = response.data;
            const token = response.data.token;

            //save the token securely
           // await SecureStore.setItemAsync('userToken', token);
            await login(token);
            //console.log("Login success:", response.data);
        
            //move to home page after saving
            router.replace('/home');
        } catch (error) {
            console.log('Login error:', error.message);
            console.log('Error response:', error.response?.data.message);
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
                            <TextInput style={styles.textInput} placeholder='Enter Username' value={logginData.Username} onChangeText={value => handleChange('Username', value)} autoCapitalize="none"/>
                            <Text style={styles.label}>Password:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Password' value={logginData.Password} onChangeText={value => handleChange('Password', value)} secureTextEntry/>
                            
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
