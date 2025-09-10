import { View, Text } from 'react-native'
import React from 'react'
import useAuth from '../../hooks/useAuth';

const Home = () => {
  const { isLoggedIn, username } = useAuth();

  if (!isLoggedIn)
  {
      return <Text>"You are not logged in."</Text>
  }

  return (
    <View>
      <Text>welcome {username} to Conference Room Booking</Text>
    </View>
  )
}

export default Home;