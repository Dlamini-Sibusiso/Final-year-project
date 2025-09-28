import { TouchableOpacity, View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../assets/style/styles';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();
  return (
    <SafeAreaView>
      <View>
        <Text>Profile Srceen </Text>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}