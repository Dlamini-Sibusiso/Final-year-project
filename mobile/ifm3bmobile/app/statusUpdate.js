import { TouchableOpacity, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatusUpdate() {
  return (
    <SafeAreaView>
      <View>
        <Text>Status Update Screen for Clerk</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}