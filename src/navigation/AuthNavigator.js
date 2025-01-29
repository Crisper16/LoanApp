import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import your authentication screens (create these if they don't exist)
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';


const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeStack} options={{ headerShown: true}} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />

      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 