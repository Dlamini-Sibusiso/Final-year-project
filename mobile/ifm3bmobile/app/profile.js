import { ActivityIndicator, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../assets/style/styles';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

export default function Profile() {
  const { userId, logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);//single user
  //const [showPassword, setShowPassword] = useState(false);
  //const [passView, setPassView] = useState('');

  //console.log('User id',userId  ?? 'userId is undefined')
  const fetchUser = async () => {
    
    try {
      const res = await axios.get(`http://10.0.2.2:5289/api/Register/${userId}`);
      //console.log("User details:", res.data);
            
      setUserDetails(res.data);
    } catch (err) {
        if (err.response && err.response.status === 404) 
        {
          console.warn(`User not found for ID ${userId}. Response:`, err.response?.data);
        } else {
          console.error('Error fetching user details:', err.message);
        }
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchUser();
  },[]); 

  //logging out
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

const handleProfile = () => {
  router.push('/(prof)/profileEdit');
};

/*
  const handlePass = () => {
    setPassView(userId);
  };
*/
  return (
    <SafeAreaView style={[styles.container, {paddingHorizontal: 20}]}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Top Buttons */}
        <View style={styles.topButtons}>
          <TouchableOpacity style={styles.topButton} onPress={handleLogout}>
            <Text style={styles.topButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.statusButtons}>
            <TouchableOpacity style={styles.statusButton} onPress={() => router.back()}>
              <Text style={styles.statusButtonText}>   Back   </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : !userDetails ? (
              <Text style={styles.noDataText}>No user details was found.</Text>
        ) : (
          <View>
            {/**User Details */}
            <Text style={styles.header}>Personal Details:</Text>
            <Text style={{padding: 5, fontWeight:'bold', fontSize: 15,}}>Employee Number: {userDetails.id}</Text>
            <Text style={{padding: 5, fontWeight:'bold', fontSize: 15,}}>Username: {userDetails.username}</Text>
            {/**<Text>Password: {userDetails.password}</Text>*/}
            <Text style={{padding: 5, fontWeight:'bold', fontSize: 15,}}>Department: {userDetails.department}</Text>
            <Text style={{padding: 5, fontWeight:'bold', fontSize: 15,}}>Phone Number: {userDetails.phone_Number}</Text>
            <Text style={{padding: 5, fontWeight:'bold', fontSize: 15,}}>Email: {userDetails.email}</Text>
            <Text style={{padding: 5, fontWeight:'bold', fontSize: 15,}}>Role: {userDetails.role}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleProfile()}>
                <Text style={styles.buttonText}> Edit Profile </Text>
              </TouchableOpacity>
          
              <TouchableOpacity style={styles.actionButton} onPress={() => handlePass(userDetails)}>
                <Text style={styles.buttonText}>View Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}