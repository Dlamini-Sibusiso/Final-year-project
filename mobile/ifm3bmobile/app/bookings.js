import { TouchableOpacity, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../assets/style/styles';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function Bookings() {
  const { logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://10.0.2.2:5289/api/Bookings');
      console.log("All bookings from API:", res.data);
      //selecting bookings with status pending
      const pendingBookings = res.data.filter(b => b.status === 'Pending');
      
      console.log("Filtered pending bookings:", pendingBookings);
      setBookings(pendingBookings);
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

  //logging out
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  //Booking details
  const handleViewDetails = (booking) => {
    router.push({ pathname: '/(book)/viewDetails', params: { id: booking.id } });
  };

  const handleAddStock = (booking) => {
    router.push({ pathname: '/(book)/addStock', params: { id: booking.id } });
  };

  const handleDisapproved = () => {
    router.push('/disapprovedBookings');
  };

  const handleClosed = () => {
    router.push('/closedBookings');
  };

  const renderBooking = ({ item: booking }) => {
    if (!booking)
    {
      return null;
    }

    return(
      <View style={styles.bookingCard}>
        <Text style={styles.field}>Room ID: {booking.roomId}</Text>
        <Text style={styles.field}>Start Time: {new Date(booking.sesion_Start).toLocaleString()}</Text>
        <Text style={styles.field}>Status: {booking.status}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleViewDetails(booking)}>
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => handleAddStock(booking)}>
            <Text style={styles.buttonText}>Add Stock</Text>
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
        <TouchableOpacity style={styles.statusButton} onPress={handleDisapproved}>
          <Text style={styles.statusButtonText}>Disapproved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statusButton} onPress={handleClosed}>
          <Text style={styles.statusButtonText}>Closed Bookings</Text>
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
        <Text style={styles.noDataText}>No pending bookings found.</Text>
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

