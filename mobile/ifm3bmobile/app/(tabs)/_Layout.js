import React from "react";
import { useAuth } from '../../hooks/useAuth';
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
//import { Ionicons } from "@expo/vector-icons";
//import { TouchableOpacity } from "react-native";

const Layout = () => {
  const { role, isLoading } = useAuth();
  const router = useRouter();
  //console.log('TabsLayout role:', role);

  if (isLoading) 
  {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems:'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  return (
    <Stack>
        <Stack.Screen name="home"/>
        <Stack.Screen name="statusUpdate"/>
        <Stack.Screen name="empBookings"/>
        <Stack.Screen name="bookings"/>
        <Stack.Screen name="profile"/>
        <Stack.Screen name="logout"/>
    </Stack>
  );
}

export default Layout;

