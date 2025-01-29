import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text, Switch, List } from 'react-native-paper';

const NotificationsSettingsScreen = () => {
  const [notifications, setNotifications] = React.useState({
    pushEnabled: true,
    emailEnabled: false,
    smsEnabled: true,
    marketingEnabled: false,
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        
        <List.Item
          title="Push Notifications"
          description="Receive instant updates on your device"
          right={() => (
            <Switch
              value={notifications.pushEnabled}
              onValueChange={() => toggleNotification('pushEnabled')}
            />
          )}
        />

        <List.Item
          title="Email Notifications"
          description="Get updates in your inbox"
          right={() => (
            <Switch
              value={notifications.emailEnabled}
              onValueChange={() => toggleNotification('emailEnabled')}
            />
          )}
        />

        <List.Item
          title="SMS Notifications"
          description="Receive text message alerts"
          right={() => (
            <Switch
              value={notifications.smsEnabled}
              onValueChange={() => toggleNotification('smsEnabled')}
            />
          )}
        />

        <List.Item
          title="Marketing Communications"
          description="Receive promotional offers and updates"
          right={() => (
            <Switch
              value={notifications.marketingEnabled}
              onValueChange={() => toggleNotification('marketingEnabled')}
            />
          )}
        />
      </Surface>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default NotificationsSettingsScreen; 