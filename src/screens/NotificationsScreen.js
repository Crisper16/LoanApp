import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ref, onValue, update } from 'firebase/database';
import { auth, database } from '../config/firebase';

const NotificationsScreen = ({ navigation }) => {
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

  const markAsRead = async (notificationId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const notificationRef = ref(database, `notifications/${currentUser.uid}/${notificationId}`);
    await update(notificationRef, { read: true });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {notifications.map((notification) => (
        <TouchableOpacity
          key={notification.id}
          style={[styles.notificationCard, !notification.read && styles.unreadNotification]}
          onPress={() => markAsRead(notification.id)}
        >
          <Text style={styles.notificationText}>{notification.message}</Text>
          <Text style={styles.notificationTimestamp}>
            {new Date(notification.timestamp).toLocaleString()}
          </Text>
        </TouchableOpacity>
      ))}
      {notifications.length === 0 && (
        <Text style={styles.noNotificationsText}>No notifications</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#e0f7fa',
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default NotificationsScreen;