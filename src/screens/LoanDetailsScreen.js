import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';

const LoanDetailsScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loanRef = ref(database, `loanApplications/${loanId}`);
    const unsubscribe = onValue(loanRef, (snapshot) => {
      if (snapshot.exists()) {
        setLoan({ id: snapshot.key, ...snapshot.val() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loanId]);

  const handleMakePayment = () => {
    navigation.navigate('Payment', { loanId });
  };

  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loan not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="account-balance" size={40} color="#2196F3" />
          <Text style={styles.headerTitle}>Loan Details</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: loan.status === 'Active' ? '#4caf50' : '#ff9800' }
          ]}>
            <Text style={styles.statusText}>{loan.status}</Text>
          </View>
        </View>
      </Surface>

      {/* Loan Summary */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Loan Summary</Text>
        <DetailRow label="Loan ID" value={loan.id} />
        <DetailRow label="Amount" value={`E${loan.amount}`} />
        <DetailRow label="Remaining Amount" value={`E${loan.remainingAmount}`} />
        <DetailRow label="Next Payment" value={loan.nextPayment} />
        <DetailRow label="Status" value={loan.status} />
      </Surface>

      {/* Applicant Details */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Applicant Details</Text>
        <DetailRow label="Full Name" value={loan.fullName} />
        <DetailRow label="ID Number" value={loan.idNumber} />
        <DetailRow label="Phone Number" value={loan.phoneNumber} />
        <DetailRow label="Address" value={loan.address} />
      </Surface>

      {/* Loan Terms */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Loan Terms</Text>
        <DetailRow label="Purpose" value={loan.purpose} />
        <DetailRow label="Employment Status" value={loan.employmentStatus} />
        <DetailRow label="Monthly Income" value={`E${loan.monthlyIncome}`} />
      </Surface>

      {/* Documents */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Documents</Text>
        <TouchableOpacity style={styles.documentLink}>
          <Icon name="description" size={24} color="#2196F3" />
          <Text style={styles.documentText}>ID Document</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.documentLink}>
          <Icon name="home" size={24} color="#2196F3" />
          <Text style={styles.documentText}>Proof of Residence</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.documentLink}>
          <Icon name="account-balance" size={24} color="#2196F3" />
          <Text style={styles.documentText}>Bank Statement</Text>
        </TouchableOpacity>
      </Surface>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handleMakePayment}
        >
          <Icon name="payment" size={24} color="white" />
          <Text style={styles.buttonText}>Make Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => navigation.navigate('Support')}
        >
          <Icon name="help" size={24} color="white" />
          <Text style={styles.buttonText}>Get Support</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: 'white',
    elevation: 4,
    margin: 16,
    borderRadius: 12,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    color: '#666',
    flex: 1,
  },
  detailValue: {
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  documentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  documentText: {
    marginLeft: 12,
    color: '#2196F3',
    fontSize: 16,
  },
  actions: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default LoanDetailsScreen; 