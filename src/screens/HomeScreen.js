import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../config/firebase';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
const [notifications, setNotifications] = useState([]);

useEffect(() => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    navigation.replace('Login');
    return;
  }

  const notificationsRef = ref(database, `notifications/${currentUser.uid}`);
  const unsubscribeNotifications = onValue(notificationsRef, (snapshot) => {
    const notificationsData = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const notification = childSnapshot.val();
        notificationsData.push({
          id: childSnapshot.key,
          ...notification
        });
      });
    }
    setNotifications(notificationsData);
  });

  return () => {
    unsubscribeNotifications();
  };
}, [navigation]);

const unreadNotificationsCount = notifications.filter(notification => !notification.read).length;


  const emiCalculators = [
    { title: 'My Loans', icon: 'calculate', route: 'Loans' },
    { title: 'Request Loan', icon: 'check-circle', route: 'LoanApplication' },
    { title: 'Repay Loan', icon: 'compare', route: 'Payment' },
  ];

  const financialCalculators = [
    { title: 'Loan Calculator', icon: 'account-balance', route: 'Calculator' },
    { title: 'Check Eligibility', icon: 'savings', route: 'Eligibility' },
    { title: 'Loan Types', icon: 'account-balance-wallet', route: 'RD' },
    { title: 'Declined loans', icon: 'functions', route: 'SimpleCompound' },
    { title: 'Currency Conversion', icon: 'currency-exchange', route: 'Currency' },
    { title: 'Tax Calculator', icon: 'receipt', route: 'Tax' },
  ];

  const CalculatorItem = ({ title, icon, route }) => (
    <TouchableOpacity
      style={styles.calculatorItem}
      onPress={() => navigation.navigate(route)}
    >
      <Icon name={icon} size={32} color="#00796B" />
      <Text style={styles.calculatorText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cash Loan</Text>
        <Text style={styles.headerSubtitle}>EMI Calculator</Text>
        <TouchableOpacity style={styles.menuIcon} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="message" size={34} color="#fff" />
          {unreadNotificationsCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>{unreadNotificationsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner Section */}
      <View style={styles.banner}>
        <Image
          source={require('../../assets/logos.png')}
          style={styles.bannerImage}
        />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Keeping Your Money Save</Text>
          <Text style={styles.bannerSubtitle}>
            Save Your Time & get eligibility loans all at once!
          </Text>
        </View>
      </View>

      {/* EMI & Loan Calculator Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EMI & Loan Calculator</Text>
        <View style={styles.calculatorGrid}>
          {emiCalculators.map((item, index) => (
            <CalculatorItem key={index} {...item} />
          ))}
        </View>
      </View>

      {/* Financial Calculator Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Calculator</Text>
        <View style={styles.calculatorGrid}>
          {financialCalculators.map((item, index) => (
            <CalculatorItem key={index} {...item} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gold',
  },
  header: {
    backgroundColor: '#00796B',
    padding: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  menuIcon: {
    position: 'absolute',
    top: 0,
    right: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 19,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  banner: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: 'gold',
    borderRadius: 10,
    elevation: 16,
    alignItems: 'center',
    padding: 16,
    borderWidth: 0,
  },
  bannerImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 16,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'black',
    marginTop: 4,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: 'gold',
    borderRadius: 10,
    elevation: 69,
    borderTopWidth: 0,

  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'black',
  },
  calculatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    color: '#fff',

    justifyContent: 'space-between',
  },
  calculatorItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  calculatorText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
});

export default HomeScreen;
