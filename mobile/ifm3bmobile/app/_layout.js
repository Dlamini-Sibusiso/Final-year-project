import React, { children } from "react";
import { Slot } from "expo-router";
//import { Stack } from "expo-router";
//import { ActivityIndicator, View } from "react-native";
//import { useAuth } from '../hooks/useAuth';

import { AuthProvider } from "../hooks/useAuth";

const Layout = () => {
    return(//<Stack screenOptions={{ headerShown: false }} />
       <AuthProvider>
            <Slot />
       </AuthProvider>
    );
}
export default Layout;