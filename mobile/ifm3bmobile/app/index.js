import { ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../assets/style/styles';
import welcome  from '../assets/images/welcome.png';

const Login = () => {
    const router = useRouter();

    const signingIn = () => {
        router.push('/(tabs)/Home')
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
                            <TextInput style={styles.textInput} placeholder='Enter Username'/>
                            <Text style={styles.label}>Password:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Password'/>
                            
                            <TouchableOpacity style={styles.button}>
                                <Text style={styles.buttonText} onPress={() => signingIn()}>Sign in</Text>
                            </TouchableOpacity>
                            <Text style={styles.label}>Don't have an account? <Text style={styles.labelLink} onPress={() => Handlepress("signingup")}> Sign Up</Text> Or <Text style={styles.labelLink} onPress={() => Handlepress("forgotpass")}> Forgot password</Text></Text>
                        </View>                      
                    </ImageBackground>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Login;

