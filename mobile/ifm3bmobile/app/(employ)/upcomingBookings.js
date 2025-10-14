import { TouchableOpacity, View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../assets/style/styles';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

export default function UpcomingBookings() {
    const { userId, logout } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const response = await axios.get("http://10.0.2.2:5289/api/bookings"); 
            const filtered = response.data.filter(
                (b) => (b.status === "Pending" || b.status === "Disapprove") && b.employee_Number === Number(userId)
            );
            setBookings(filtered);
        } catch (error) {
            console.error("Error fetching upcoming bookings:", error);
            Alert.alert('Error', 'Failed to fetching upcoming bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateBooking = (booking) => {
        router.push({ pathname: '/empUpdateBooking', params: { id: booking.id } });
    };

    //logging out
    const handleLogout = async () => {
        await logout();
        router.replace('/');
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
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleUpdateBooking(booking)}>
            <Text style={styles.buttonText}>Update booking</Text>
          </TouchableOpacity>
        </View>
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
                <TouchableOpacity style={styles.statusButton} onPress={() => router.back()}>
                    <Text style={styles.statusButtonText}>   Back   </Text>
                </TouchableOpacity>
            </View>
        </View>

      {/* List of Bookings */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : bookings.length === 0 ? (
          <Text style={styles.noDataText}>No upcoming bookings found.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(booking) => booking.id}
          ListHeaderComponent={
            <Text style={styles.homeTitle}>Upcoming Bookings</Text>
          }
          renderItem={renderHistory}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  )
}