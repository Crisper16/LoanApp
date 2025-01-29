import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, List, Surface, Text } from 'react-native-paper';

const SupportScreen = () => {
  const faqs = [
    {
      question: 'How do I apply for a loan?',
      answer: 'You can apply for a loan by navigating to the "Apply for Loan" section from the home screen and following the application process.',
    },
    {
      question: 'What documents do I need?',
      answer: "You'll need to provide your ID document, proof of residence, and recent bank statements.",
    },
    {
      question: 'How long does approval take?',
      answer: 'Loan applications are typically processed within 24-48 hours.',
    },
    // Add more FAQs as needed
  ];

  const contactMethods = [
    {
      icon: 'phone',
      title: 'Call Us',
      subtitle: '+1 234 567 8900',
      action: () => Linking.openURL('tel:+12345678900'),
    },
    {
      icon: 'email',
      title: 'Email Support',
      subtitle: 'support@loanapp.com',
      action: () => Linking.openURL('mailto:support@loanapp.com'),
    },
    {
      icon: 'chat',
      title: 'Live Chat',
      subtitle: 'Available 24/7',
      action: () => {/* Implement chat functionality */},
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        {contactMethods.map((method, index) => (
          <Button
            key={index}
            mode="outlined"
            icon={method.icon}
            onPress={method.action}
            style={styles.contactButton}
            accessibilityLabel={`${method.title}: ${method.subtitle}`}
          >
            <View>
              <Text>{method.title}</Text>
              <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
            </View>
          </Button>
        ))}
      </Surface>

      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <List.Accordion
            key={index}
            title={faq.question}
            style={styles.faqItem}
          >
            <List.Item
              description={faq.answer}
              descriptionNumberOfLines={0}
              style={styles.faqAnswer}
            />
          </List.Accordion>
        ))}
      </Surface>

      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Business Hours</Text>
        <View style={styles.businessHours}>
          {[
            'Monday - Friday: 9:00 AM - 6:00 PM',
            'Saturday: 10:00 AM - 2:00 PM',
            'Sunday: Closed'
          ].map((hours, index) => (
            <Text key={index} style={styles.businessHoursText}>{hours}</Text>
          ))}
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactButton: {
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: '#fff',
  },
  faqAnswer: {
    backgroundColor: '#f8f9fa',
  },
  businessHours: {
    padding: 8,
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  businessHoursText: {
    marginVertical: 4,
    fontSize: 16,
  },
});

export default SupportScreen; 