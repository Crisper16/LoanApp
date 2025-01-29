import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { onValue, ref, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, database, storage } from '../config/firebase';

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigation.replace('Login');
        return;
      }

      const userRef = ref(database, `users/${user.uid}`);
      const unsubscribeDB = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.val());
        }
        setLoading(false);
      });

      return () => unsubscribeDB();
    });

    return () => unsubscribeAuth();
  }, [navigation]);

  const menuItems = [
    { icon: 'person', title: 'Personal Information', route: 'PersonalInfo' },
    { icon: 'folder', title: 'My Documents', route: 'Documents' },
    { icon: 'settings', title: 'Settings', route: 'ProfileSettings' },
    { icon: 'security', title: 'Security Settings', route: 'Security' },
    { icon: 'notifications', title: 'Notifications', route: 'Notifications' },
    { icon: 'help', title: 'Help & Support', route: 'Support' },
    { icon: 'description', title: 'Terms & Conditions', route: 'Terms' },
    { icon: 'privacy-tip', title: 'Privacy Policy', route: 'Privacy' },
  ];

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfileImage = async (uri) => {
    if (!uri) return;
    setUploading(true);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const filename = `profile_${auth.currentUser.uid}_${Date.now()}.jpg`;
      const imageRef = storageRef(storage, `profileImages/${filename}`);

      await uploadBytes(imageRef, blob);
      
      const downloadURL = await getDownloadURL(imageRef);

      const userRef = ref(database, `users/${auth.currentUser.uid}`);
      await update(userRef, {
        profileImage: downloadURL,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Login'); // Navigate to Login screen after logout
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <Icon name={icon} size={24} color="#666" />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.profileImageContainer}>
          {uploading ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <Image
              source={
                userProfile?.profileImage
                  ? { uri: userProfile.profileImage }
                  : require('../../assets/icon.png') // Make sure to add this image
              }
              style={styles.profileImage}
            />
          )}
          <TouchableOpacity
            style={styles.editImageButton}
            onPress={handleImagePick}
            disabled={uploading}
          >
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{userProfile?.fullName || 'User'}</Text>
        <Text style={styles.email}>{userProfile?.email || ''}</Text>
        {userProfile?.phone && (
          <Text style={styles.phone}>{userProfile.phone}</Text>
        )}
      </Surface>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            title={item.title}
            onPress={() => navigation.navigate(item.route)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Icon name="logout" size={24} color="#fff" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-between',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#dc3545',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
});

export default ProfileScreen;