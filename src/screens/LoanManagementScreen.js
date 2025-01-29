import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const LoanManagementScreen = ({ navigation }) => {
  const [loans, setLoans] = useState([]);
  const [declinedLoans, setDeclinedLoans] = useState([]); // Add this line
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('User');


    useEffect(() => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        navigation.replace('Login');
        return;
      }
    
      // Fetch user's loan applications from loanApplications collection
      const loansRef = ref(database, 'loanApplications');
      const userLoansQuery = query(
        loansRef,
        orderByChild('userId'),
        equalTo(currentUser.uid)
      );
    
      const unsubscribeLoans = onValue(userLoansQuery, (snapshot) => {
        const loansData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const loan = childSnapshot.val();
            loansData.push({
              id: childSnapshot.key,
              ...loan
            });
          });
        }
        setLoans(loansData);
      });
    
      // Fetch user's declined loans from declinedLoans collection
      const declinedLoansRef = ref(database, 'declinedLoans');
      const userDeclinedLoansQuery = query(
        declinedLoansRef,
        orderByChild('userId'),
        equalTo(currentUser.uid)
      );
    
      const unsubscribeDeclinedLoans = onValue(userDeclinedLoansQuery, (snapshot) => {
        const declinedLoansData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const loan = childSnapshot.val();
            declinedLoansData.push({
              id: childSnapshot.key,
              ...loan
            });
          });
        }
        setDeclinedLoans(declinedLoansData);
      });
    
      // Fetch user's name from the database (optional, you can use email if no name found)
      const userRef = ref(database, `users/${currentUser.uid}`);
      const unsubscribeUser = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserName(userData.fullName || currentUser.email.split('@')[0]);
        }
      });
    
      return () => {
        unsubscribeLoans();
        unsubscribeDeclinedLoans();
        unsubscribeUser();
      };
    }, [navigation]);
    
    // Ensure that setLoading is called after all data is fetched
    const handleDataFetched = () => {
      if (loans.length > 0 && declinedLoans.length > 0) {
        setLoading(false);
      }
    };
    
    // Call this function once the data has been fetched in the `onValue` listeners
    useEffect(() => {
      handleDataFetched();
    }, [loans, declinedLoans]);
    

  const calculateTotalBalance = () => {
    return loans.reduce((sum, loan) => {
      const remainingAmount = loan.remainingAmount !== undefined ? 
        parseFloat(loan.remainingAmount) : 
        parseFloat(loan.loanAmount);
      return sum + (remainingAmount || 0);
    }, 0).toFixed(2);
  };

  const getActiveLoanCount = () => {
    return loans.filter(loan => 
      loan.status === 'approved' || loan.status === 'active'
    ).length;
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Icon name="account-balance" size={40} color="#2196F3" />
        <Text style={styles.headerTitle}>
          Welcome, {userName}
        </Text>
        <Text style={styles.headerSubtitle}>
          Manage and track your active loans
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => navigation.navigate('LoanApplication')}
      >
        <Icon name="add" size={24} color="white" />
        <Text style={styles.applyButtonText}>Apply for New Loan</Text>
      </TouchableOpacity>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{getActiveLoanCount()}</Text>
          <Text style={styles.summaryLabel}>Active Loans</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            E{calculateTotalBalance()}
          </Text>
          <Text style={styles.summaryLabel}>Total Balance</Text>
        </View>
      </View>
    </>
  );

  const LoanCard = ({ loan }) => (
  <View style={styles.loanCard}>
    <View style={styles.loanHeader}>
      <Text style={styles.loanId}>Loan #{loan.id.slice(-6)}</Text>
      <View style={[
        styles.statusBadge,
        { backgroundColor: loan.status === 'active' 
          ? '#4caf50' 
          : (loan.status === 'declined' ? '#ff3b30' : '#ff9800') 
        }
      ]}>
        <Text style={styles.statusText}>
          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
        </Text>
      </View>
    </View>

    <View style={styles.loanDetails}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Loan Amount:</Text>
        <Text style={styles.detailValue}>E{loan.loanAmount}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Remaining:</Text>
        <Text style={styles.detailValue}>E{loan.remainingAmount}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Next Payment:</Text>
        <Text style={styles.detailValue}>{loan.nextPayment}</Text>
      </View>
      {loan.approvalDate && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Approval Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(loan.approvalDate).toLocaleDateString()}
          </Text>
        </View>
      )}
      {loan.status === 'declined' && (
        <>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Decline Reason:</Text>
            <Text style={styles.detailValue}>{loan.declineMessage}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Missing Details:</Text>
            <Text style={styles.detailValue}>{loan.missingDetails.join(', ')}</Text>
          </View>
        </>
      )}
    </View>

    <View style={styles.cardActions}>
      <TouchableOpacity 
        style={styles.viewDetailsButton}
        onPress={() => navigation.navigate('LoanDetails', { 
          loanId: loan.id,
          userId: auth.currentUser.uid 
        })}
      >
        <Icon name="info" size={20} color="white" />
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>

      {loan.status !== 'declined' && (
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => navigation.navigate('Payment', { 
            loanId: loan.id,
            remainingAmount: loan.remainingAmount || loan.loanAmount
          })}
        >
          <Icon name="payment" size={20} color="white" />
          <Text style={styles.payButtonText}>Make Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your loans...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {renderHeader()}
      <View style={styles.loansList}>
        {loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
        {loans.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Icon name="account-balance-wallet" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No active loans</Text>
            <Text style={styles.emptyStateSubtext}>
              Apply for a loan to get started
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const additionalStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gold',

  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    backgroundColor: 'gold',

  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  payButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  viewDetailsButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  viewDetailsText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    backgroundColor: 'gold',

  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  summary: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loansList: {
    padding: 16,
  },
  loanCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loanDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    color: '#333',
    fontWeight: '500',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    margin: 16,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  ...additionalStyles,
});

export default LoanManagementScreen; 