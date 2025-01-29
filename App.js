import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { onValue, ref } from 'firebase/database';
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, database } from './src/config/firebase';
import { NavigationContainer } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Provider as PaperProvider } from 'react-native-paper';
import theme from './src/config/theme';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/RegisterScreen';

// Main Screens
import CalculatorScreen from './src/screens/CalculatorScreen';
import EligibilityScreen from './src/screens/EligibilityScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoanApplicationScreen from './src/screens/LoanApplicationScreen';
import LoanDetailsScreen from './src/screens/LoanDetailsScreen';
import LoanManagementScreen from './src/screens/LoanManagementScreen';
import PaymentScreen from './src/screens/PaymentScreen';

// Profile Screens
import ProfileScreen from './src/screens/ProfileScreen';
import DocumentsScreen from './src/screens/profile/DocumentsScreen';
import NotificationsSettingsScreen from './src/screens/profile/NotificationsSettingsScreen';
import PersonalInfoScreen from './src/screens/profile/PersonalInfoScreen';
import PrivacyScreen from './src/screens/profile/PrivacyScreen';
import ProfileSettingsScreen from './src/screens/profile/ProfileSettingsScreen';
import SecuritySettingsScreen from './src/screens/profile/SecuritySettingsScreen';
import SupportScreen from './src/screens/profile/SupportScreen';
import TermsScreen from './src/screens/profile/TermsScreen';
import Dashboard from './src/screens/Admins/Dashbord';
import DocumentViewer from './src/screens/Admins/components/DocumentViewer';
import NotificationsScreen from './src/screens/NotificationsScreen';



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
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Calculator" component={CalculatorScreen} options={{ title: 'Loan Calculator' }} />
    <Stack.Screen name="Eligibility" component={EligibilityScreen} options={{ title: 'Check Eligibility' }} />
    <Stack.Screen name="LoanApplication" component={LoanApplicationScreen} options={{ title: 'Apply for Loan' }} />
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Make Payment' }} />
    <Stack.Screen name="Loans" component={LoanManagementScreen} options={{ title: 'My Loans' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />

  </Stack.Navigator>
);

// Loan Stack Navigator
const LoanStack = ({ navigation }) => (
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
    <Stack.Screen name="DocumentViewer" component={DocumentViewer} />

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
                    : require('./assets/logos.png')
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
        tabBarActiveBackgroundColor: 'gold',
        tabBarInactiveBackgroundColor: 'gold',
        tabBarElevation: 7,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Loans" component={LoanStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const auth = getAuth();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Dashboard" component={Dashboard} />
              <Stack.Screen name="DocumentViewer" component={DocumentViewer} />


              <Stack.Screen name="Home" component={HomeScreen} />

              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}