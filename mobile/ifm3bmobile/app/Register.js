import { Text, View, ImageBackground, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import styles from '../assets/style/styles';
import welcome  from '../assets/images/welcome.png';
import { useLocalSearchParams, useRouter } from 'expo-router';

const Register = () => {
  const router = useRouter();
  const { role, empNumber } = useLocalSearchParams();
  
  const userNum = Number(empNumber);

  const signUp = () => {
      router.push('/(tabs)/Home')
    };

  const signingIn = () => {
        router.push('/')
    };

  return (
    <SafeAreaView>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <ImageBackground 
                source={welcome}
                style={styles.background}
                resizeMode='cover'
            >  
            
                <View style={styles.introcontainer}>
                    <Text style={styles.introTitle}>Register/ Sign Up</Text>
                          
                            <Text style={styles.label}>Password:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Password'/>

                            <Text style={styles.label}>Username:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Username'/>

                            <Text style={styles.label}>Department:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Department'/>

                            <Text style={styles.label}>Phone number:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Phone Number'/>

                            <Text style={styles.label}>Email:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Email'/>

                            <Text style={styles.label}>Employee Number:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Employee Number' value={empNumber}/>

                            <Text style={styles.label}>Role:</Text>
                            <TextInput style={styles.textInput} placeholder='Enter Role' value={role}/>


                            <TouchableOpacity style={styles.button}>
                                <Text style={styles.buttonText} onPress={() => signUp()}>Sign Up</Text>
                            </TouchableOpacity>
                            <Text style={styles.label}>Have an account? <Text style={styles.labelLink} onPress={() => signingIn()}> Sign In</Text></Text>                  
                        
                        </View>  
               
            </ImageBackground>
        </ScrollView>
    </SafeAreaView>
  )
}

export default Register;

