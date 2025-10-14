import { TouchableOpacity, View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../assets/style/styles';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function EmpHistory() {
  const { userId, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://10.0.2.2:5289/api/bookings"); 
      //getting only the current user past bookings
      const filtered = response.data.filter((b) => b.employee_Number === Number(userId));
      setBookings(filtered);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert('Error', 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  //logging out
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  //Upcoming employee bookings
  const handleUpcomingBooking = () => {
    router.push('/(employ)/upcomingBookings');
  };

  const renderHistory = ({ item: booking }) => {
    if (!booking)
    {
      return null;
    }

    return(
      <View style={styles.bookingCard}>
        <Text style={styles.field}><Text style={{fontWeight:'bold',}}>Booking ID:</Text> {booking.id}</Text>
        <Text style={styles.field}><Text style={{fontWeight:'bold',}}>Room ID:</Text> {booking.roomId}</Text>
        <Text style={styles.field}><Text style={{fontWeight:'bold',}}>Start Time:</Text> {new Date(booking.sesion_Start).toLocaleString()}</Text>
        <Text style={styles.field}><Text style={{fontWeight:'bold',}}>End Time:</Text> {new Date(booking.sesion_End).toLocaleString()}</Text>
        <Text style={styles.field}><Text style={{fontWeight:'bold',}}>Status:</Text> {booking.status}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Buttons */}
        <View style={styles.topButtons}>
          <TouchableOpacity style={styles.topButton} onPress={handleLogout}>
            <Text style={styles.topButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.statusButtons}>
            <TouchableOpacity style={styles.statusButton} onPress={handleUpcomingBooking}>
              <Text style={styles.statusButtonText}>Upcoming Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statusButton} onPress={() => router.replace('/home')}>
              <Text style={styles.statusButtonText}>Back Home</Text>
            </TouchableOpacity>
          </View>
        </View>

      {/* List of Bookings */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : bookings.length === 0 ? (
          <Text style={styles.noDataText}>No bookings found.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(booking) => booking.id}
          ListHeaderComponent={
            <Text style={styles.homeTitle}>Booking History</Text>
          }
          renderItem={renderHistory}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  )
}
