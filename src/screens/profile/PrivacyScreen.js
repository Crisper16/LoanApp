import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';

const PrivacyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: March 2024</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.content}>
          We collect information that you provide directly to us, including:{'\n\n'}
          • Personal identification information{'\n'}
          • Contact information{'\n'}
          • Financial information{'\n'}
          • Employment information{'\n'}
          • Device and usage information
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.content}>
          We use the information we collect to:{'\n\n'}
          • Process your loan applications{'\n'}
          • Communicate with you about our services{'\n'}
          • Improve our services{'\n'}
          • Comply with legal obligations{'\n'}
          • Prevent fraud
        </Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.content}>
          We do not sell your personal information. We may share your information 
          with:{'\n\n'}
          • Service providers{'\n'}
          • Legal authorities when required{'\n'}
          • Financial partners for loan processing
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.content}>
          We implement appropriate technical and organizational measures to protect 
          your personal information against unauthorized access, alteration, 
          disclosure, or destruction.
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

export default PrivacyScreen; 