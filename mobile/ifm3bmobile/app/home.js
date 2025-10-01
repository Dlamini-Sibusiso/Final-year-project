import { ActivityIndicator, TouchableOpacity, ScrollView, View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'expo-router';
//import * as SecureStore from 'expo-secure-store';
import styles from '../assets/style/styles';

export default function Home() {
  const { isLoggedIn, isLoading, username, role, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      // Navigate only after render, in useEffect
      router.replace('/');
    }
  }, [isLoading, isLoggedIn]);

  if (isLoading) 
  {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems:'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  if (!isLoggedIn) 
  {
    //router.replace('/');
    return null;
  }

  const handleBooking = () => {
    router.push('/bookings')
  };

  const handleStatus = () => {
    router.push('/statusUpdate')
  };

  const handleEmpHistory = () => {
    router.push('/empBookings')
  };

  const handleProfile = () => {
    router.push('/profile')
  };

  const handleLogout = async () => {
    try {
      await logout();

      //logging out to login page
      console.log("Logout success:");
      router.replace('/');
    } catch (err) {
      console.error('Logout failed:', err)
    }
  };

  return (
    <SafeAreaView style={{ padding: 30}}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View>
        <Text style={styles.homeTitle}>Welcome {username} to conference room Booking</Text>

        {/*Clerk options*/}
        {role === "Clerk" && ( <>
        <TouchableOpacity style={styles.button} onPress={handleBooking}>
          <Text style={styles.buttonText}>bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleStatus}>
          <Text style={styles.buttonText}>Status Update</Text>
        </TouchableOpacity>
        </>)}
    
        {/*Employee options*/}
        {role === "Employee" && ( <>
        <TouchableOpacity style={styles.button} onPress={handleEmpHistory}>
          <Text style={styles.buttonText}>Booking History</Text>
        </TouchableOpacity>
        </>)}

        <TouchableOpacity style={styles.button} onPress={handleProfile}>
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>
    
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>        
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}