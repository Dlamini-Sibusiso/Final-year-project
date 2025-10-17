import { ActivityIndicator, ScrollView, TouchableOpacity, Text, TextInput, View, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../assets/style/styles';
import {useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';


const UpdateBooking = () => {
    const { userId, logout } = useAuth();
    const router = useRouter();
    const { id } = useLocalSearchParams();//booking id
    const [bookingInfo, setBooking] = useState(null);//single booking
    const [roomCheck, setRoomCheck] = useState(true);//assume room is available on system
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        sesion_Start: "",
        sesion_End: "",
        capacity: "",
        amenities: [],
    });

    const [allAmenities, setAllAmenities] = useState([]);
    const [capacityErr, setCapacityErr] = useState("");
    const [validationError, setValidationError] = useState("");

    //loading booking
    useEffect(() => {
        const fetchBooking = async () => {
            if (!id) return; // prevent running with undefined id

            try {
                const response = await axios.get(`http://10.0.2.2:5289/api/Bookings`);
                const found = response.data.find((b) => b.id === id);
                if (found) {
                    setBooking(found);
                    setForm({
                        sesion_Start: found.sesion_Start || "",
                        sesion_End: found.sesion_End || "",
                        capacity: String(found.capacity || ""),
                        amenities: found.amenities.split(",").map((a) => a.trim()) || [],//found.amenities,
                    });
                } else {
                    alert("Booking not found");
                }
            } catch (error) {
                console.error("Error loading booking:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    // Load amenities
    useEffect(() => {
        if (!bookingInfo?.roomId) return;//Don't run if booking not loaded

        const fetchAmenities = async () => { 
            try{
                const response = await axios.get(`http://10.0.2.2:5289/api/Bookings/roomAmenities/${bookingInfo.roomId}`);
                
                setAllAmenities(response.data);
                setRoomCheck(true);//room is available on system
            } catch (error) {
                //console.error("Error loading amenities:", error);
                setRoomCheck(false);//room not available on system
            }
        };
        fetchAmenities();
    }, [bookingInfo?.roomId]);

    const toLocalIOString = (strDate) => {
        const localDate = new Date(strDate);
        const tzOffset = localDate.getTimezoneOffset() * 60000;
        return new Date(localDate.getTime() - tzOffset).toISOString();
    };

    const validateBeforeUpdate = async () => {
        if (!form.capacity) 
        {
            setValidationError('Please enter capacity');
            return;
        }

        if (parseInt(form.capacity) < 1) 
        {
            setCapacityErr('Capacity must be at least 1');
            return;
        }

        console.log("BookingGuidToExclude being sent:", id);
        console.log('RoomId', bookingInfo.roomId);
        const start = form.sesion_Start;
        const end = form.sesion_End;
        console.log('Start time', toLocalIOString(start));
        console.log('End time',toLocalIOString(end));
        console.log('Employee Id', userId);
        console.log('Start time', typeof toLocalIOString(start), toLocalIOString(start));

        try {
            const res = await axios.post("http://10.0.2.2:5289/api/Bookings/Updatesearchavailable", {
                BookingGuidToExclude: id,
                RoomId: bookingInfo.roomId,
                SesionStart: toLocalIOString(start),
                SesionEnd: toLocalIOString(end),
                EmployeeId: parseInt(userId),
            });
            console.log('Updating validation', res.data)
            return res.data?.message === "Room is available for update.";
        } catch (err) {
            console.error(err.response?.data || err.message);
            if (err.response?.data?.message) {
                setValidationError(err.response.data.message);
            } else {
                setValidationError("Error validating booking.");
            }
        return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCapacityErr("");
        setValidationError("");

        const isValid = await validateBeforeUpdate();
        if (!isValid)
        {
            return;
        }
        const start = form.sesion_Start;
        const end = form.sesion_End;

        try {
            await axios.put(`http://10.0.2.2:5289/api/Bookings/empUdateBooking/${id}`, 
                {
                SesionStart: toLocalIOString(start),
                SesionEnd: toLocalIOString(end),
                capacity: parseInt(form.capacity),
                amenities: form.amenities, 
            });

            Alert.alert('Success', 'Booking updated successfully');
            router.back() // Redirect back
        } catch (err) {
            //console.error("Update failed:");
            setCapacityErr(err?.response?.data?.message ?? "Unknown error occurred.");
        }
    };

    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const toggleAmenity = (amenity) => {
        setForm((prev) => {
        const selected = prev.amenities.includes(amenity)
            ? prev.amenities.filter((a) => a !== amenity)
            : [...prev.amenities, amenity];
        return { ...prev, amenities: selected };
        });
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
                ) : !bookingInfo ? (
                    <Text style={styles.noDataText}>loading Booking...</Text>
                )  : !roomCheck ? (
                    <Text style={styles.noDataText}>The room is no longer available...</Text>
                ) : (
                    <View>
                        <Text style={styles.header}>Update Booking</Text>

                        {validationError ? (
                            <Text style={styles.error}>{validationError}</Text>
                        ) : null}

                        {capacityErr ? (
                            <Text style={styles.error}>{capacityErr}</Text>
                        ) : null}

                        {/* Session Start */}
                        <Text style={styles.labelb}>Session Start</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="YYYY-MM-DD HH:mm"
                                value={form.sesion_Start}
                                //onChangeText={(text) => handleChange('sesion_Start', text)}
                                editable={false}
                            />

                        {/* Session End */}
                        <Text style={styles.labelb}>Session End</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="YYYY-MM-DD HH:mm"
                                value={form.sesion_End}
                                //onChangeText={(text) => handleChange('sesion_End', text)}
                                editable={false}
                            />

                        {/* Capacity */}
                        <Text style={styles.labelb}>Capacity</Text>
                            <TextInput
                                style={styles.textInput}
                                keyboardType="numeric"
                                placeholder="Enter room capacity"
                                value={form.capacity}
                                onChangeText={(text) => handleChange('capacity', text)}
                            />

                        {/* Amenities */}
                        <Text style={styles.labelb}>Select Amenities</Text>
                            {allAmenities.map((amenity, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.checkboxContainer}
                                    onPress={() => toggleAmenity(amenity)}
                                >
                                    <View style={styles.checkbox}>
                                        {form.amenities.includes(amenity) && <View style={styles.checked} />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>{amenity}</Text>
                                </TouchableOpacity>
                            ))}

                        {/* Submit Button */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

export default UpdateBooking