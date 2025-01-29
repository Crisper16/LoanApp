import React, { useState } from 'react';
import { View, StyleSheet, Modal,Alert } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EligibilityScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    existingEMI: '',
    loanAmount: '',
    tenure: '',
    age: '',
    employmentType: 'salaried',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState(null);

  const calculateEligibility = () => {
    const income = parseFloat(formData.monthlyIncome);
    const existingEMI = parseFloat(formData.existingEMI) || 0;
    const age = parseInt(formData.age);
    
    if (!income || !formData.loanAmount || !age) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const maxEMIAllowed = income * 0.5;
    const availableEMI = maxEMIAllowed - existingEMI;

    if (age < 21 || age > 65) {
      setResult({
        eligible: false,
        message: 'Age must be between 21 and 65 years',
        maxLoanAmount: 0,
      });
      setModalVisible(true);
      return;
    }

    if (availableEMI <= 0) {
      setResult({
        eligible: false,
        message: 'Existing EMIs exceed maximum allowed limit',
        maxLoanAmount: 0,
      });
      setModalVisible(true);
      return;
    }

    const maxLoanAmount = availableEMI * 60;

    setResult({
      eligible: true,
      message: 'Congratulations! You are eligible for a loan.',
      maxLoanAmount: maxLoanAmount,
    });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Icon name="check-circle" size={40} color="#2196F3" />
        <Text style={styles.headerTitle}>Loan Eligibility Check</Text>
        <Text style={styles.headerSubtitle}>
          Fill in the details below to check your loan eligibility
        </Text>
      </Surface>

      <Surface style={styles.form}>
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
          label="Existing Monthly EMI"
          value={formData.existingEMI}
          onChangeText={(text) => setFormData({ ...formData, existingEMI: text })}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          left={<TextInput.Affix text="E" />}
        />

        <TextInput
          label="Required Loan Amount"
          value={formData.loanAmount}
          onChangeText={(text) => setFormData({ ...formData, loanAmount: text })}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          left={<TextInput.Affix text="E" />}
        />

        <TextInput
          label="Age"
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        <Button
          mode="contained"
          onPress={calculateEligibility}
          style={styles.checkButton}
        >
          Check Eligibility
        </Button>
      </Surface>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent}>
            <Icon
              name={result?.eligible ? 'check-circle' : 'error'}
              size={50}
              color={result?.eligible ? '#4caf50' : '#f44336'}
            />
            <Text style={[
              styles.resultText,
              { color: result?.eligible ? '#2e7d32' : '#c62828' }
            ]}>
              {result?.message}
            </Text>
            {result?.eligible && (
              <Text style={styles.maxLoanText}>
                Maximum Loan Amount: E{result.maxLoanAmount.toFixed(2)}
              </Text>
            )}
            <Button
              mode="contained"
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              Close
            </Button>
          </Surface>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gold',
    padding: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: 'gold',

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
    borderColor:'white',
    borderBlockColor: '#fff',
  },
  checkButton: {
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: '#00796B',

  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    fontWeight: '500',
  },
  maxLoanText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 10,
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 8,
    width: '100%',
    backgroundColor: 'red',

  },
});

export default EligibilityScreen; 