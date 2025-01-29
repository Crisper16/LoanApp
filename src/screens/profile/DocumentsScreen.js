import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Surface, Text, Button, List, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { ref as storageRef, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { ref as databaseRef, set, onValue } from 'firebase/database';
import { auth, storage, database } from '../../config/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DocumentsScreen = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const userDocsRef = databaseRef(database, `users/${auth.currentUser.uid}/documents`);
      onValue(userDocsRef, (snapshot) => {
        if (snapshot.exists()) {
          const docsData = snapshot.val();
          setDocuments(Object.values(docsData));
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading documents:', error);
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (type) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const filename = `documents/${auth.currentUser.uid}/${type}_${Date.now()}`;
        const fileRef = storageRef(storage, filename);
        
        await uploadBytes(fileRef, blob);
        const downloadURL = await getDownloadURL(fileRef);

        const newDoc = {
          id: Date.now().toString(),
          type,
          url: downloadURL,
          filename,
          uploadDate: new Date().toISOString(),
          status: 'pending',
        };

        const userDocRef = databaseRef(
          database,
          `users/${auth.currentUser.uid}/documents/${newDoc.id}`
        );
        await set(userDocRef, newDoc);

        Alert.alert('Success', 'Document uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const documentTypes = [
    { id: 'id', title: 'ID Document', icon: 'card-membership' },
    { id: 'proof_address', title: 'Proof of Address', icon: 'home' },
    { id: 'bank_statement', title: 'Bank Statement', icon: 'account-balance' },
    { id: 'payslip', title: 'Payslip', icon: 'receipt' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Upload Documents</Text>
        {documentTypes.map((docType) => (
          <List.Item
            key={docType.id}
            title={docType.title}
            left={() => <List.Icon icon={docType.icon} />}
            right={() => (
              <Button
                mode="contained"
                onPress={() => handleDocumentUpload(docType.id)}
                disabled={uploading}
              >
                Upload
              </Button>
            )}
          />
        ))}
      </Surface>

      <Surface style={styles.surface}>
        <Text style={styles.title}>Uploaded Documents</Text>
        {documents.length === 0 ? (
          <Text style={styles.emptyText}>No documents uploaded yet</Text>
        ) : (
          documents.map((doc) => (
            <List.Item
              key={doc.id}
              title={documentTypes.find(t => t.id === doc.type)?.title || doc.type}
              description={`Uploaded on ${new Date(doc.uploadDate).toLocaleDateString()}`}
              left={() => <List.Icon icon={documentTypes.find(t => t.id === doc.type)?.icon || 'file'} />}
              right={() => (
                <View style={styles.statusContainer}>
                  <Text style={[styles.status, styles[doc.status]]}>
                    {doc.status.toUpperCase()}
                  </Text>
                </View>
              )}
            />
          ))
        )}
      </Surface>
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
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  statusContainer: {
    justifyContent: 'center',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  pending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  approved: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  rejected: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
});

export default DocumentsScreen; 