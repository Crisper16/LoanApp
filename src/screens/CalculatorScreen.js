import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CalculatorScreen = () => {
  const [loanData, setLoanData] = useState({
    amount: '',
    interestRate: '',
    tenure: '',
  });
  const [result, setResult] = useState(null);

  const calculateEMI = () => {
    const P = parseFloat(loanData.amount);
    const R = parseFloat(loanData.interestRate) / 12 / 100;
    const N = parseFloat(loanData.tenure) * 12;

    if (!P || !R || !N) {
      return;
    }

    const emi = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
    const totalAmount = emi * N;
    const totalInterest = totalAmount - P;

    setResult({
      emi: emi.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
    });
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Icon name="calculate" size={40} color="#2196F3" />
        <Text style={styles.headerTitle}>Loan Calculator</Text>
        <Text style={styles.headerSubtitle}>
          Calculate your monthly EMI payments
        </Text>
      </Surface>

      <Surface style={styles.form}>
        <TextInput
          label="Loan Amount"
          value={loanData.amount}
          onChangeText={(text) => setLoanData({ ...loanData, amount: text })}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          left={<TextInput.Affix text="E" />}
        />

        <TextInput
          label="Interest Rate (%)"
          value={loanData.interestRate}
          onChangeText={(text) => setLoanData({ ...loanData, interestRate: text })}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        <TextInput
          label="Loan Tenure (Years)"
          value={loanData.tenure}
          onChangeText={(text) => setLoanData({ ...loanData, tenure: text })}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        <Button
          mode="contained"
          onPress={calculateEMI}
          style={styles.calculateButton}
        >
          Calculate EMI
        </Button>

        {result && (
          <Surface style={styles.resultContainer}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Monthly EMI</Text>
              <Text style={styles.resultValue}>E{result.emi}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total Interest</Text>
              <Text style={styles.resultValue}>E{result.totalInterest}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total Amount</Text>
              <Text style={styles.resultValue}>E{result.totalAmount}</Text>
            </View>
          </Surface>
        )}
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
  calculateButton: {
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: '#00796B',

  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 10,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default CalculatorScreen; 