import { TouchableOpacity, View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../assets/style/styles';
import { useRouter } from 'expo-router';

export default function EmpBookings() {
  const router = useRouter();
  return (
    <SafeAreaView>
      <View>
        <Text>Employee Bookings Screen</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}