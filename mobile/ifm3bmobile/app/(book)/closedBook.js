import { TouchableOpacity, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../assets/style/styles';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

export default function closedBook() {
  const { logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://10.0.2.2:5289/api/Bookings');
      console.log("All bookings from API:", res.data);
      //selecting bookings with status Closed
      const ClosedBookings = res.data.filter(b => b.status === 'Closed');
      
      console.log("Filtered closed bookings:", ClosedBookings);
      setBookings(ClosedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      Alert.alert('Error', 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  //Booking details
  const handleViewDetails = (booking) => {
    router.push({ pathname: '/viewClosedDetails', params: { id: booking.id } });
  };

  //logging out
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const renderBooking = ({ item: booking }) => {
    if (!booking)
    {
      return null;
    }

    return(
      <View style={styles.bookingCard}>
        <Text style={styles.field}><Text style={{fontWeight:'bold',}}>Booking ID:</Text> {booking.id}</Text>
        <Text style={styles.field}><Text style={{fontWeight:'bold',}}>Room ID:</Text> {booking.roomId}</Text>
        <Text style={styles.field}><Text style={{fontWeight:'bold',}}>End Time:</Text> {new Date(booking.sesion_End).toLocaleString()}</Text>
        <Text style={styles.field}><Text style={{fontWeight:'bold',}}>Status:</Text> {booking.status}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleViewDetails(booking)}>
            <Text style={styles.buttonText}>View Details</Text>
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
          <Text style={styles.statusButtonText}>  Back  </Text>
        </TouchableOpacity>
        </View>
      </View>

      {/* List of Bookings */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : bookings.length === 0 ? (
        <Text style={styles.noDataText}>No closed bookings found.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(booking) => booking.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  )
}