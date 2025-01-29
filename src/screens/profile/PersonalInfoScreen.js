import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Surface, Text } from 'react-native-paper';
import { ref, update, onValue } from 'firebase/database';
import { auth, database } from '../../config/firebase';

const PersonalInfoScreen = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    dateOfBirth: '',
    occupation: '',
    employer: '',
  });

  useEffect(() => {
    if (auth.currentUser) {
      const userRef = ref(database, `users/${auth.currentUser.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setFormData(prevState => ({
            ...prevState,
            ...userData,
          }));
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const userRef = ref(database, `users/${auth.currentUser.uid}`);
      await update(userRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        <Surface style={styles.surface}>
          <TextInput
            label="Full Name"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            mode="outlined"
            style={styles.input}
          />

<TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TextInput
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            mode="outlined"
            style={styles.input}
            multiline
          />

          <TextInput
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
            mode="outlined"
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />

          <TextInput
            label="Occupation"
            value={formData.occupation}
            onChangeText={(text) => setFormData({ ...formData, occupation: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Employer"
            value={formData.employer}
            onChangeText={(text) => setFormData({ ...formData, employer: text })}
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleUpdate}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Update Profile
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
});

export default PersonalInfoScreen; 