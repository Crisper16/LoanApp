import * as ImagePicker from 'expo-image-picker';
import { ref as databaseRef, onValue, push, serverTimestamp, set } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, database, storage } from '../config/firebase';

const LoanApplicationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    loanAmount: '',
    purpose: '',
    employmentStatus: '',
    monthlyIncome: '',
    address: '',
    phoneNumber: '',
    idDocument: null,
    proofOfResidence: null,
    bankStatement: null,
  });

  const [loading, setLoading] = useState(false);

  const pickDocument = async (fieldName) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your media library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setFormData({
          ...formData,
          [fieldName]: {
            uri: asset.uri,
            type: asset.type || 'application/octet-stream',
            name: asset.fileName || 'document',
          },
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick the document');
      console.error(err);
    }
  };

  const uploadFile = async (uri, path) => {
    if (!uri) return null;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, blob);

      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      const userRef = databaseRef(database, `users/${auth.currentUser.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          setFormData((prevState) => ({
            ...prevState,
            fullName: userData.fullName || '',
            phoneNumber: userData.phone || '',
            email: userData.email || '',  // Assuming email is stored in the database as well
          }));
        }
      });
    }
  }, []);
  
  const handleSubmit = async () => {
    if (!formData.fullName || !formData.idNumber || !formData.loanAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

   

    setLoading(true);
    try {
      const idDocUrl = formData.idDocument ?
        await uploadFile(
          formData.idDocument.uri,
          `documents/${auth.currentUser.uid}/id_${Date.now()}`
        ) : null;

      const residenceDocUrl = formData.proofOfResidence ?
        await uploadFile(
          formData.proofOfResidence.uri,
          `documents/${auth.currentUser.uid}/residence_${Date.now()}`
        ) : null;

      const bankDocUrl = formData.bankStatement ?
        await uploadFile(
          formData.bankStatement.uri,
          `documents/${auth.currentUser.uid}/bank_${Date.now()}`
        ) : null;

      const loanApplicationsRef = databaseRef(database, 'loanApplications');
      const newLoanRef = push(loanApplicationsRef);

      await set(newLoanRef, {
        userId: auth.currentUser.uid,
        fullName: formData.fullName,
        idNumber: formData.idNumber,
        loanAmount: parseFloat(formData.loanAmount) || 0,
        purpose: formData.purpose || '',
        employmentStatus: formData.employmentStatus || '',
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        address: formData.address || '',
        phoneNumber: formData.phoneNumber || '',
        idDocumentUrl: idDocUrl,
        proofOfResidenceUrl: residenceDocUrl,
        bankStatementUrl: bankDocUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        'Success',
        'Your loan application has been submitted successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit loan application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.header}>
          <Icon name="description" size={40} color="#2196F3" />
          <Text style={styles.headerTitle}>Loan Application</Text>
          <Text style={styles.headerSubtitle}>
            Fill in your details to apply for a loan
          </Text>
        </Surface>

        <Surface style={styles.form}>
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
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="ID Number"
            value={formData.idNumber}
            onChangeText={(text) => setFormData({ ...formData, idNumber: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Loan Amount"
            value={formData.loanAmount}
            onChangeText={(text) => setFormData({ ...formData, loanAmount: text })}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            left={<TextInput.Affix text="E" />}
          />

          <TextInput
            label="Purpose of Loan"
            value={formData.purpose}
            onChangeText={(text) => setFormData({ ...formData, purpose: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Employment Status"
            value={formData.employmentStatus}
            onChangeText={(text) => setFormData({ ...formData, employmentStatus: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Monthly Income"
            value={formData.monthlyIncome}
            onChangeText={(text) => setFormData({ ...formData, monthlyIncome: text })}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            left={<TextInput.Affix text="E" />}
          />

          <TextInput
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            mode="outlined"
            style={styles.input}
          />

<TextInput
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
          />

          <Button
            mode="outlined"
            onPress={() => pickDocument('idDocument')}
            style={styles.documentButton}
            icon="file-upload"
          >
            {formData.idDocument ? 'ID Document Selected' : 'Upload ID Document'}
          </Button>

          <Button
            mode="outlined"
            onPress={() => pickDocument('proofOfResidence')}
            style={styles.documentButton}
            icon="file-upload"
          >
            {formData.proofOfResidence ? 'Proof of Residence Selected' : 'Upload Proof of Residence'}
          </Button>

          <Button
            mode="outlined"
            onPress={() => pickDocument('bankStatement')}
            style={styles.documentButton}
            icon="file-upload"
          >
            {formData.bankStatement ? 'Bank Statement Selected' : 'Upload Bank Statement'}
          </Button>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
          >
            Submit Application
          </Button>
        </Surface>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gold',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: 'gold',
    elevation: 39, borderColor: 'white',
    borderBlockColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  form: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: 'gold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'gold',
    elevation: 9,
    padding: 0,
    borderColor: 'white',
    borderBlockColor: '#fff',
  },
  documentButton: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
});

export default LoanApplicationScreen;