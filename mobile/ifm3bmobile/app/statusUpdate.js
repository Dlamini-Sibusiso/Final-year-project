import { TouchableOpacity, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../assets/style/styles';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function statusUpdate() {
  const { logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statMasg, setStatMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://10.0.2.2:5289/api/Bookings');
      console.log("All bookings from API:", res.data);
      //selecting bookings with status approve
      const approvedBookings = res.data.filter(b => b.status === 'Approve');
      
      console.log("Filtered approved bookings:", approvedBookings);
      setBookings(approvedBookings);
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
    router.push({ pathname: '/(book)/viewStatusDetails', params: { id: booking.id } });
  };

   //Status reset to available
  const handleStatus = async (booking, newStatus) => {
  
    if (!newStatus || newStatus.trim() ==='') 
    {
      setStatMsg('Please select a status.')
      return;
    }
        
    setStatMsg('');
    console.log('Handle Update. New status:', newStatus);

    try {
      setIsSubmitting(true);
      await axios.put(`http://10.0.2.2:5289/api/Bookings/status/${booking.id}`, 
      {
        Status: newStatus, 
      });
            
     // Alert.alert('Success', 'Status updated successfully.');
      fetchBookings(); // Refresh booking info
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
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
            <Text style={styles.buttonText}>Verify Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleStatus(booking, 'Closed')}>
            <Text style={styles.buttonText}>Reset Status</Text>
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
        <TouchableOpacity style={styles.statusButton} onPress={() => router.replace('/home')}>
          <Text style={styles.statusButtonText}>Back Home</Text>
        </TouchableOpacity>
        </View>
      </View>

      {/* List of Bookings */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : bookings.length === 0 ? (
        <Text style={styles.noDataText}>No approve bookings found.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(booking) => booking.id}
          ListHeaderComponent={
            <Text style={styles.homeTitle}>Status Update</Text>
          }
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  )
}

