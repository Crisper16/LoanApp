import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';

const TermsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.lastUpdated}>Last Updated: March 2024</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.content}>
          By accessing and using this application, you accept and agree to be bound 
          by the terms and provision of this agreement.
        </Text>

        <Text style={styles.sectionTitle}>2. Loan Services</Text>
        <Text style={styles.content}>
          2.1. Eligibility{'\n'}
          To be eligible for our loan services, you must:{'\n'}
          • Be at least 18 years old{'\n'}
          • Have a valid government-issued ID{'\n'}
          • Have a regular source of income{'\n'}
          • Meet our credit assessment criteria
        </Text>

        <Text style={styles.sectionTitle}>3. Privacy Policy</Text>
        <Text style={styles.content}>
          We collect and use personal information in accordance with our Privacy Policy. 
          By using our services, you agree to our data practices as described in our 
          Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
        <Text style={styles.content}>
          You are responsible for maintaining the confidentiality of your account 
          information and for all activities that occur under your account.
        </Text>

        {/* Add more sections as needed */}
      </Surface>
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
});

export default TermsScreen; 