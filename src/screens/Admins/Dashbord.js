import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onValue, ref, remove, set,push, serverTimestamp } from 'firebase/database';
import { database, auth } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';

const Card = ({ children, style, onPress }) => (
  <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
    {children}
  </TouchableOpacity>
);

const Dashboard = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigation = useNavigation();
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [currentLoan, setCurrentLoan] = useState(null);
  const [missingDetails, setMissingDetails] = useState([]);
  const [declinedLoans, setDeclinedLoans] = useState([]);



  useEffect(() => {
    const loanApplicationsRef = ref(database, 'loanApplications');
    const unsubscribe = onValue(loanApplicationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const applications = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setLoanApplications(applications);
        setPendingLoans(applications.filter((app) => app.status === 'pending'));
        setApprovedLoans(applications.filter((app) => app.status === 'approved'));
      }
    });

    return () => unsubscribe();
  }, []);

  const approveLoan = async (loan) => {
    try {
      const approvedLoansRef = ref(database, `approvedLoans/${loan.id}`);
      const loanApplicationsRef = ref(database, `loanApplications/${loan.id}`);

      await set(approvedLoansRef, { ...loan, status: 'approved' });
      await remove(loanApplicationsRef);
      setPendingLoans((prev) => prev.filter((item) => item.id !== loan.id));
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const declineLoan = async (loan, declineMessage, missingDetails) => {
    try {
      const declinedLoansRef = ref(database, `declinedLoans/${loan.id}`);
      const loanApplicationsRef = ref(database, `loanApplications/${loan.id}`);
      const userNotificationsRef = ref(database, `notifications/${loan.userId}`);
  
      await set(declinedLoansRef, {
        ...loan,
        status: 'declined',
        declineMessage,
        missingDetails,
      });
      await remove(loanApplicationsRef);
  
      // Add a notification for the user
      const newNotificationRef = push(userNotificationsRef);
      await set(newNotificationRef, {
        message: `Your loan application for E${loan.loanAmount} has been declined.`,
        timestamp: serverTimestamp(),
        read: false,
      });
  
      setPendingLoans((prev) => prev.filter((item) => item.id !== loan.id));
    } catch (error) {
      console.error('Error declining loan:', error);
    }
  };

  const toggleMissingDetail = (detail) => {
    setMissingDetails((prev) =>
      prev.includes(detail)
        ? prev.filter((item) => item !== detail)
        : [...prev, detail]
    );
  };

  useEffect(() => {
    const declinedLoansRef = ref(database, 'declinedLoans');
    const unsubscribe = onValue(declinedLoansRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const applications = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setDeclinedLoans(applications);
      }
    });

    return () => unsubscribe();
  }, []);

  // Delete a pending loan application
  const deleteLoanApplication = async (loanId) => {
    try {
      const loanApplicationsRef = ref(database, `loanApplications/${loanId}`);
      await remove(loanApplicationsRef);
      setPendingLoans((prev) => prev.filter((item) => item.id !== loanId));
    } catch (error) {
      console.error('Error deleting loan application:', error);
    }
  };

  // Delete a declined loan application
  const deleteDeclinedLoan = async (loanId) => {
    try {
      const declinedLoansRef = ref(database, `declinedLoans/${loanId}`);
      await remove(declinedLoansRef);
      setDeclinedLoans((prev) => prev.filter((item) => item.id !== loanId));
    } catch (error) {
      console.error('Error deleting declined loan application:', error);
    }
  };

  // Update statistics in the header section (includes declined applications count)
  useEffect(() => {
    const declinedLoansRef = ref(database, 'declinedLoans');
    const unsubscribe = onValue(declinedLoansRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const applications = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setDeclinedLoans(applications);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeclineSubmit = () => {
    if (currentLoan) {
      declineLoan(currentLoan, declineReason, missingDetails);
      setDeclineModalVisible(false);
      setDeclineReason('');
      setMissingDetails([]);
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        alert('Logged Out');
        navigation.replace('Login');
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.headerButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Text style={styles.statsValue}>{loanApplications.length}</Text>
          <Text style={styles.statsLabel}>Total Applications</Text>
        </Card>
        <Card style={styles.statsCard}>
          <Text style={styles.statsValue}>
            ${loanApplications.reduce((sum, app) => sum + parseFloat(app.loanAmount || 0), 0)}
          </Text>
          <Text style={styles.statsLabel}>Total Loan Amount</Text>
        </Card>
        <Card style={styles.statsCard}>
          <Text style={styles.statsValue}>{declinedLoans.length}</Text>
          <Text style={styles.statsLabel}>Declined Applications</Text>
        </Card>
      </View>


      {/* Loan Applications */}
      <Text style={styles.title}>Pending Loan Applications</Text>
      {pendingLoans.map((application) => (
        <Card key={application.id} style={styles.loanCard}>
          <Text style={styles.applicationText}>Full Name: {application.fullName}</Text>
          <Text style={styles.applicationText}>ID Number: {application.idNumber}</Text>
          <Text style={styles.applicationText}>Loan Amount: {application.loanAmount}</Text>
          <Text style={styles.applicationText}>Purpose: {application.purpose}</Text>
          <Text style={styles.applicationText}>Employment Status: {application.employmentStatus}</Text>
          <Text style={styles.applicationText}>Monthly Income: {application.monthlyIncome}</Text>
          <Text style={styles.applicationText}>Address: {application.address}</Text>
          <Text style={styles.applicationText}>Phone Number: {application.phoneNumber}</Text>
          <Text style={styles.applicationText}>Status: {application.status}</Text>

          {/* Document buttons */}
          <TouchableOpacity
            style={styles.showButton}
            onPress={() => setSelectedDocument(application.proofOfResidenceUrl)}
          >
            <Text style={styles.showButtonText}>Show Proof of Residence</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.showButton}
            onPress={() => setSelectedDocument(application.bankStatementUrl)}
          >
            <Text style={styles.showButtonText}>Show Bank Statement</Text>
          </TouchableOpacity>

          {/* Approve Button */}
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => approveLoan(application)}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => {
              setCurrentLoan(application);
              setDeclineModalVisible(true);
            }}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteDeclinedLoan(application.id)}
          >
            <Ionicons name="trash-bin" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </Card>
      ))}
      <Text style={styles.title}>Declined Loan Applications</Text>
      {declinedLoans.length === 0 ? (
        <Text>No declined applications yet.</Text>
      ) : (
        declinedLoans.map((application) => (
          <Card key={application.id} style={styles.loanCard}>
            <Text style={styles.applicationText}>Full Name: {application.fullName}</Text>
            <Text style={styles.applicationText}>ID Number: {application.idNumber}</Text>
            <Text style={styles.applicationText}>Loan Amount: {application.loanAmount}</Text>
            <Text style={styles.applicationText}>Status: {application.status}</Text>
            <Text style={styles.applicationText}>Reason: {application.declineMessage}</Text>
            <Text style={styles.applicationText}>Missing Details:</Text>
            {['Proof of Residence', 'Bank Statement', 'Employment Status', 'Monthly Income', 'Address'].map((detail) => (
              <Text
                key={detail}
                style={{
                  fontSize: 16,
                  marginLeft: 16,
                  color: application.missingDetails?.includes(detail) ? '#FF3B30' : '#34A853',
                }}
              >
                {application.missingDetails?.includes(detail) ? `❌ ${detail}` : `✔️ ${detail}`}
              </Text>
            ))}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteDeclinedLoan(application.id)}
            >
              <Ionicons name="trash-bin" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </Card>
        ))
      )}

      {/* Document Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedDocument}
        onRequestClose={() => setSelectedDocument(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedDocument }}
              style={styles.documentImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => setSelectedDocument(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Updated Decline Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={declineModalVisible}
        onRequestClose={() => setDeclineModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 16 }}>Reason for Decline:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter decline reason"
              value={declineReason}
              onChangeText={setDeclineReason}
            />

            <Text style={{ fontSize: 16, marginVertical: 16 }}>Missing Details:</Text>
            {[
              'Proof of Residence',
              'Bank Statement',
              'Employment Status',
              'Monthly Income',
              'Address',
            ].map((detail) => (
              <TouchableOpacity
                key={detail}
                style={[
                  styles.detailOption,
                  missingDetails.includes(detail) && styles.selectedDetailOption,
                ]}
                onPress={() => toggleMissingDetail(detail)}
              >
                <Text
                  style={{
                    color: missingDetails.includes(detail) ? '#FFF' : '#000',
                    flex: 1,
                  }}
                >
                  {detail}
                </Text>
                {missingDetails.includes(detail) ? (
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                ) : (
                  <Ionicons name="checkmark-circle" size={20} color="#34A853" />
                )}
              </TouchableOpacity>
            ))}
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity
                style={styles.declineConfirmButton}
                onPress={async () => {
                  if (declineReason.trim() && missingDetails.length > 0) {
                    await declineLoan(currentLoan, declineReason, missingDetails);
                    setDeclineModalVisible(false);
                    setDeclineReason('');
                    setMissingDetails([]);
                  } else {
                    alert('Please provide a reason and select missing details.');
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setDeclineModalVisible(false);
                  setMissingDetails([]);
                }}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#191970',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191970',
  },
  statsLabel: {
    fontSize: 14,
    color: '#555',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loanCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  applicationText: {
    fontSize: 16,
    marginBottom: 8,
  },
  showButton: {
    backgroundColor: '#191970',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  showButtonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  approveButton: {
    backgroundColor: '#34A853',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  approveButtonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  documentImage: {
    width: '100%',
    height: 300,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 4,
  },
  closeButtonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  declineButtonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    padding: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    marginBottom: 16,
  },
  declineConfirmButton: {
    backgroundColor: '#34A853',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  confirmButtonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  detailOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  selectedDetailOption: {
    backgroundColor: '#191970',
  },
});

export default Dashboard;
