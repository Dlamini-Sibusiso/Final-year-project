import { Stack } from "expo-router";

const tabLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="Home" options={{ headerShown:false }} />
    </Stack>
  )
}

export default tabLayout;