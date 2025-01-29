import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Image, TouchableOpacity } from 'react-native';
import { auth, database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import LoanApplicationScreen from '../screens/LoanApplicationScreen';
import LoanManagementScreen from '../screens/LoanManagementScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import PaymentScreen from '../screens/PaymentScreen';
import EligibilityScreen from '../screens/EligibilityScreen';
import LoanDetailsScreen from '../screens/LoanDetailsScreen';

// Profile Screens
import ProfileScreen from '../screens/ProfileScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import SecuritySettingsScreen from '../screens/profile/SecuritySettingsScreen';
import NotificationsSettingsScreen from '../screens/profile/NotificationsSettingsScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import ProfileSettingsScreen from '../screens/profile/ProfileSettingsScreen';
import DocumentsScreen from '../screens/profile/DocumentsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: '#00796B',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: '' }} />
    <Stack.Screen name="Calculator" component={CalculatorScreen} options={{ title: 'Loan Calculator' }} />
    <Stack.Screen name="Eligibility" component={EligibilityScreen} options={{ title: 'Check Eligibility' }} />
    <Stack.Screen name="LoanApplication" component={LoanApplicationScreen} options={{ title: 'Apply for Loan' }} />
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Make Payment' }} />
    <Stack.Screen name="Loans" component={LoanManagementScreen} options={{ title: 'My Loans' }} />
  </Stack.Navigator>
);

// Loan Stack Navigator
const LoanStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen 
      name="LoanManagement" 
      component={LoanManagementScreen} 
      options={{ 
        title: 'My Loans',
        headerRight: ({ tintColor }) => (
          <TouchableOpacity 
            style={{ marginRight: 16 }}
            onPress={() => navigation.navigate('LoanApplication')}
          >
            <Icon name="add" size={24} color={tintColor} />
          </TouchableOpacity>
        ),
      }} 
    />
    <Stack.Screen 
      name="LoanApplication" 
      component={LoanApplicationScreen} 
      options={{ title: 'Apply for Loan' }} 
    />
    <Stack.Screen 
      name="LoanDetails" 
      component={LoanDetailsScreen} 
      options={{ title: 'Loan Details' }} 
    />
    <Stack.Screen 
      name="Payment" 
      component={PaymentScreen} 
      options={{ title: 'Make Payment' }} 
    />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ title: 'Personal Information' }} />
    <Stack.Screen name="Security" component={SecuritySettingsScreen} options={{ title: 'Security Settings' }} />
    <Stack.Screen name="Notifications" component={NotificationsSettingsScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Help & Support' }} />
    <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms & Conditions' }} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy Policy' }} />
    <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="Documents" component={DocumentsScreen} options={{ title: 'My Documents' }} />
  </Stack.Navigator>
);

// Main Tab Navigator with Profile Image
const MainTabs = () => {
  const [userProfile, setUserProfile] = React.useState(null);

  React.useEffect(() => {
    if (auth.currentUser) {
      const userRef = ref(database, `users/${auth.currentUser.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.val());
        }
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Profile') {
            return (
              <Image
                source={
                  userProfile?.profileImage
                    ? { uri: userProfile.profileImage }
                    : require('../../assets/icon.png')
                }
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: focused ? 2 : 0,
                  borderColor: color,
                }}
              />
            );
          }

          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Loans':
              iconName = 'account-balance';
              break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00796B',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack}  options={{ headerShown: false }} />
      <Tab.Screen name="Loans" component={LoanStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
  </Stack.Navigator>
);

export default AppNavigator;