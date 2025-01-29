import Dashboard from '../Dashbord'; // Ensure the Dashboard component is properly imported
import { StyleSheet, Text, TouchableOpacity, View,Image } from 'react-native';


const DocumentViewer = ({ route, navigation }) => {
  const { url } = route.params;

  return (
    <Dashboard>
      <View style={styles.viewerContainer}>
        <Image source={{ uri: url }} style={styles.image} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Dashboard>
  );
};

const styles = StyleSheet.create({
    showButton: {
      backgroundColor: '#191970', // Midnight Blue
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginVertical: 5,
    },
    showButtonText: {
      color: '#F5F5F5', // Smoke White
      fontSize: 14,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    viewerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
      padding: 20,
    },
    image: {
      width: '100%',
      height: '80%',
      resizeMode: 'contain',
      borderRadius: 10,
    },
    closeButton: {
      backgroundColor: '#191970',
      padding: 10,
      borderRadius: 10,
      marginTop: 20,
    },
    closeButtonText: {
      color: '#F5F5F5',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: 'bold',
    },
  });
  

export default DocumentViewer;
