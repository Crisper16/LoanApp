import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Switch, Text, Divider } from 'react-native-paper';
import { ref, update, onValue } from 'firebase/database';
import { auth, database } from '../../config/firebase';

const NotificationsSettingsScreen = () => {
  const [settings, setSettings] = useState({
    pushNotifications: {
      loanUpdates: true,
      paymentReminders: true,
      promotionalOffers: false,
    },
    emailNotifications: {
      loanUpdates: true,
      paymentReminders: true,
      promotionalOffers: false,
    },
    smsNotifications: {
      loanUpdates: true,
      paymentReminders: true,
      promotionalOffers: false,
    },
  });

  useEffect(() => {
    const userRef = ref(database, `users/${auth.currentUser.uid}/notifications`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = async (category, setting) => {
    try {
      const newSettings = {
        ...settings,
        [category]: {
          ...settings[category],
          [setting]: !settings[category][setting],
        },
      };
      
      setSettings(newSettings);
      
      const userRef = ref(database, `users/${auth.currentUser.uid}/notifications`);
      await update(userRef, newSettings);
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const NotificationSection = ({ title, category }) => (
    <Surface style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Divider style={styles.divider} />
      
      <View style={styles.setting}>
        <Text>Loan Updates</Text>
        <Switch
          value={settings[category].loanUpdates}
          onValueChange={() => handleToggle(category, 'loanUpdates')}
        />
      </View>
      
      <View style={styles.setting}>
        <Text>Payment Reminders</Text>
        <Switch
          value={settings[category].paymentReminders}
          onValueChange={() => handleToggle(category, 'paymentReminders')}
        />
      </View>
      
      <View style={styles.setting}>
        <Text>Promotional Offers</Text>
        <Switch
          value={settings[category].promotionalOffers}
          onValueChange={() => handleToggle(category, 'promotionalOffers')}
        />
      </View>
    </Surface>
  );

  return (
    <ScrollView style={styles.container}>
      <NotificationSection 
        title="Push Notifications" 
        category="pushNotifications" 
      />
      <NotificationSection 
        title="Email Notifications" 
        category="emailNotifications" 
      />
      <NotificationSection 
        title="SMS Notifications" 
        category="smsNotifications" 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    marginVertical: 8,
  },
});

export default NotificationsSettingsScreen; 