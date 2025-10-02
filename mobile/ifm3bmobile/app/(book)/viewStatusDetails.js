import { ActivityIndicator, ScrollView, TouchableOpacity, Text, TextInput, View, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../assets/style/styles';
import {useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const viewStatusDetails = () => {
    const { logout } = useAuth();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [bookingInfo, setBooking] = useState(null);//single booking
    const [loading, setLoading] = useState(true);

    //const [status, setStatus] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    //const [statusInfo, setStatusInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statMasg, setStatMsg] = useState('');

    //console.log("Id: ", id)
    const fetchBooking = async () => {
        try {
            const res = await axios.get(`http://10.0.2.2:5289/api/Bookings/${id}`);
            console.log("booking from API:", res.data);
            
            setBooking(res.data);
            //setStatus(res.data.status || '');
            //setStatusInfo(res.data.statusInfor || '');
        } catch (err) {
            console.error('Error fetching bookings:', err);
            Alert.alert('Error', 'Failed to fetch bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, []);

    //logging out
    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };
  
    const handleUpdateStatus = async () => {
        setStatMsg('');
        console.log('Handle Update. Current status: ', selectedStatus)
        if (!selectedStatus || selectedStatus.trim() ==='') 
        {
            setStatMsg('Please select a status.')
            return;
        }
    
        try {
            setIsSubmitting(true);
            await axios.put(`http://10.0.2.2:5289/api/Bookings/status/${id}`, 
                {
                    Status: selectedStatus, 
                });
            
            Alert.alert('Success', 'Status updated successfully.');
            fetchBooking(); // Refresh booking info
        } catch (err) {
            console.error('Error updating status:', err);
            Alert.alert('Error', 'Failed to update status.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const Info = ({ label, value, multiline = false }) => (
        <View style={{ marginBottom: 15 }}>
            <Text style={styles.labelb}>{label}:</Text>
            <TextInput style={multiline ? styles.textAreab : styles.textInputb} value={value} editable={false} multiline={multiline}/>
        </View>
    );

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
                ) : !bookingInfo ? (
                    <Text style={styles.noDataText}>No booking found.</Text>
                ) : (
                    <View>
                        {/**Booking Details */}
                        <Text style={styles.header}>Booking Details:</Text>

                        <Info label="Room Name" value={bookingInfo.roomId} />
                        <Info label="Booked By" value={bookingInfo.employee_Number.toString()} />
                        <Info label="Session Start" value={bookingInfo.sesion_Start} />
                        <Info label="Session End" value={bookingInfo.sesion_End} />
                        <Info label="Capacity" value={bookingInfo.capacity.toString()} />
                        <Info label="Amenities" value={bookingInfo.amenities} multiline />
                        <Info label="Stock" value={bookingInfo.stock} multiline />
                        <Info label="New Stock" value={bookingInfo.newStock} multiline />
                        <Info label="Current Status" value={bookingInfo.status} /> 

                        {/* Update Status Section */}
                        <View style={{ marginTop: 5 }}>
                            {statMasg && (
                                <Text style={{color: 'red'}}>{statMasg}</Text>
                            )}
                            <Text style={styles.sectionTitle}>Reset Status:</Text>
                            <View style={{ flexDirection: 'row', gap: 15, marginVertical: 10 }}>
                                <TouchableOpacity style={[styles.statusButton, selectedStatus === 'Closed' && { backgroundColor: '#4CAF50' },]} onPress={() => setSelectedStatus('Closed')}>
                                    <Text style={styles.statusButtonText}>Available</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateStatus} disabled={isSubmitting}>
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Changes'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}      
            </ScrollView>
        </SafeAreaView>
    );
};

export default viewStatusDetails

