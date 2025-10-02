import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, View, TextInput, Text, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../assets/style/styles';
import { useRouter } from 'expo-router';

export default function EditProfile() {
  const { userId, logout } = useAuth();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://10.0.2.2:5289/api/Register/${userId}`);
              
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
  
  const handleChange = (name, value) => {
    setUserDetails(prev => ({...prev, [name]: value,}));
  };

  const handleUpdate = async () => {
    if (userDetails.department === '' || userDetails.phone_Number === '' || userDetails.email === '')
    {
      Alert.alert("No Data entered", "Department, phone number and email can not be empty")
      return;
    }

    if (!/^\d{10}$/.test(userDetails.phone_Number)) {
      Alert.alert("Invalid phone number", "Phone number must be exactly 10 digits.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    try {
      const res = await axios.put(`http://10.0.2.2:5289/api/Register/updateprofile/${userId}`, 
        {
        department: userDetails.department,
        phone_Number: userDetails.phone_Number,
        email: userDetails.email
      });

      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data || "Update failed.");
    }
  };

  //logging out
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

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
        ) :  (

          <View>
              <Text style={styles.header}>Edit Personal Details:</Text>
              <Text style={styles.labelb}>Department:</Text>
              <TextInput style={styles.textInput} value={userDetails.department} onChangeText={value => handleChange('department', value)} placeholder="Department" />

              <Text style={styles.labelb}> Phone Number:</Text>
              <TextInput style={styles.textInput} value={userDetails.phone_Number} onChangeText={value => handleChange('phone_Number', value)} keyboardType="number-pad" placeholder="10-digit phone" />

              <Text style={styles.labelb}>Email:</Text>
              <TextInput style={styles.textInput} value={userDetails.email} onChangeText={value => handleChange('email', value)} keyboardType="email-address" placeholder="Email" />

              <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Submit Changes</Text>
              </TouchableOpacity>
            </View>

            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
