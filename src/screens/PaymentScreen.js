import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ref, push, set, serverTimestamp, get, update } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { loanId, remainingAmount } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [loanDetails, setLoanDetails] = useState(null);

  const [paymentData, setPaymentData] = useState({
    loanId: loanId || '',
    amount: '',
    paymentMethod: '',
    reference: '',
  });

  const [errors, setErrors] = useState({
    amount: '',
    paymentMethod: '',
    reference: '',
  });

  const paymentMethods = [
    { label: 'Select Payment Method', value: '' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Mobile Money', value: 'mobile_money' },
    { label: 'Cash Deposit', value: 'cash_deposit' },
  ];

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      const loanRef = ref(database, `successfulLoans/${loanId}`);
      const snapshot = await get(loanRef);
      
      if (snapshot.exists()) {
        setLoanDetails(snapshot.val());
      } else {
        Alert.alert('Error', 'Loan details not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
      Alert.alert('Error', 'Failed to fetch loan details');
    }
  };

  const validatePayment = () => {
    let isValid = true;
    const newErrors = {
      amount: '',
      paymentMethod: '',
      reference: '',
    };

    const amount = parseFloat(paymentData.amount);
    const remaining = parseFloat(remainingAmount);

    if (!amount || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
      isValid = false;
    } else if (amount > remaining) {
      newErrors.amount = 'Amount cannot exceed remaining balance';
      isValid = false;
    }

    if (!paymentData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
      isValid = false;
    }

    if (!paymentData.reference.trim()) {
      newErrors.reference = 'Please enter a payment reference';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setLoading(true);
    try {
      // Get the loan reference
      const loanRef = ref(database, `successfulLoans/${paymentData.loanId}`);
      const loanSnapshot = await get(loanRef);

      if (!loanSnapshot.exists()) {
        Alert.alert('Error', 'Loan not found');
        return;
      }

      const loanData = loanSnapshot.val();
      const currentRemaining = parseFloat(loanData.remainingAmount || loanData.loanAmount);
      const paymentAmount = parseFloat(paymentData.amount);
      const newRemainingAmount = Math.max(0, currentRemaining - paymentAmount).toFixed(2);

      // Create payment record
      const paymentsRef = ref(database, 'payments');
      const newPaymentRef = push(paymentsRef);
      
      const paymentRecord = {
        userId: auth.currentUser.uid,
        loanId: paymentData.loanId,
        amount: paymentAmount,
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference,
        status: 'completed',
        timestamp: serverTimestamp(),
        previousBalance: currentRemaining,
        newBalance: newRemainingAmount,
      };

      // Update loan status if fully paid
      const loanUpdates = {
        remainingAmount: newRemainingAmount,
        lastPaymentDate: serverTimestamp(),
        status: newRemainingAmount <= 0 ? 'paid' : 'active',
      };

      await Promise.all([
        set(newPaymentRef, paymentRecord),
        update(loanRef, loanUpdates),
      ]);

      Alert.alert(
        'Success',
        'Payment processed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('LoanManagement'),
          },
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!loanDetails && loanId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading loan details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Icon name="payment" size={40} color="#2196F3" />
        <Text style={styles.headerTitle}>Make Payment</Text>
        <Text style={styles.headerSubtitle}>
          Pay your loan installment securely
        </Text>
      </Surface>

      <Surface style={styles.form}>
        <TextInput
          label="Loan ID"
          value={paymentData.loanId}
          onChangeText={(text) => setPaymentData({ ...paymentData, loanId: text })}
          mode="outlined"
          style={styles.input}
          disabled={!!loanId}
        />

        {remainingAmount && (
          <Text style={styles.remainingText}>
            Remaining Balance: E{remainingAmount}
          </Text>
        )}

        <TextInput
          label="Amount"
          value={paymentData.amount}
          onChangeText={(text) => {
            setPaymentData({ ...paymentData, amount: text });
            setErrors({ ...errors, amount: '' });
          }}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          left={<TextInput.Affix text="E" />}
          error={!!errors.amount}
        />
        <HelperText type="error" visible={!!errors.amount}>
          {errors.amount}
        </HelperText>

        <View style={[styles.pickerContainer, errors.paymentMethod && styles.pickerError]}>
          <Picker
            selectedValue={paymentData.paymentMethod}
            onValueChange={(value) => {
              setPaymentData({ ...paymentData, paymentMethod: value });
              setErrors({ ...errors, paymentMethod: '' });
            }}
            style={styles.picker}
          >
            {paymentMethods.map((method) => (
              <Picker.Item 
                key={method.value} 
                label={method.label} 
                value={method.value} 
              />
            ))}
          </Picker>
        </View>
        <HelperText type="error" visible={!!errors.paymentMethod}>
          {errors.paymentMethod}
        </HelperText>

        <TextInput
          label="Reference Number"
          value={paymentData.reference}
          onChangeText={(text) => {
            setPaymentData({ ...paymentData, reference: text });
            setErrors({ ...errors, reference: '' });
          }}
          mode="outlined"
          style={styles.input}
          error={!!errors.reference}
          placeholder="Enter transaction reference"
        />
        <HelperText type="error" visible={!!errors.reference}>
          {errors.reference}
        </HelperText>

        <Button
          mode="contained"
          onPress={handlePayment}
          style={styles.payButton}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Make Payment'}
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gold',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  payButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 4,
    marginTop: 8,
  },
  pickerError: {
    borderColor: '#dc3545',
  },
  picker: {
    height: 50,
  },
  remainingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default PaymentScreen; 