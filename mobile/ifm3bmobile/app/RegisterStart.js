import { Text, TouchableOpacity, View, TextInput, ScrollView, ImageBackground } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styles from '../assets/style/styles';
import welcome  from '../assets/images/welcome.png';

const RegisterStart = () => {
  const router = useRouter();
  const { name } = useLocalSearchParams();


  const verifyEmpNumber = (role, empNumber) => {
        //check if user forgot password or user want to register/sign in
        if (name === "forgotpass"){
            alert("forgot password, must send new password on email if user was found with the given employee number")
        }else
            {
                alert("signing in, must send employee number and role")
                
                
                const encodedName = encodeURIComponent(role)
                router.push(`/Register?role=${encodedName}&empNumber=${empNumber}`);
            }
      }

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ height:'100%'}}>
          <ImageBackground 
              source={welcome}
              style={styles.background}
              resizeMode='cover'
          >                         
              <View style={styles.introcontainer}>
                {name === "forgotpass" && (//if 
                <Text style={styles.introTitle}>Recover password</Text> )}  
                {name === "signingup" && (//else if
                <Text style={styles.introTitle}>Register/ Sign Up</Text>)}


                <Text style={styles.label}>Employee Number:</Text>
                <TextInput style={styles.textInput} placeholder='Enter Employee Number'/>
                            
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText} onPress={() => verifyEmpNumber("Employee", 258)}>Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
          </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  )

}
export default RegisterStart;

