import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Button, Text, TextInput } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  // User Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Employee Login States
  const [employeeID, setEmployeeID] = useState('');
  const [eEmail, setEEmail] = useState('');
  const [passkey, setPasskey] = useState('');
  const [employeeError, setEmployeeError] = useState('');
  const [employeeLoading, setEmployeeLoading] = useState(false);

  // Shared States
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Handle User Login
  const handleUserLogin = async () => {
    setUserLoading(true);
    setUserError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', email),
        where('userType', '==', 'User')
      );

      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        navigation.replace('MainTabs');
      } else {
        setUserError('Invalid login for User.');
      }
    } catch (error) {
      setUserError('Failed to log in. Please check your credentials and try again.');
    } finally {
      setUserLoading(false);
    }
  };

  // Handle Employee Login
  const handleEmployeeLogin = async () => {
    setEmployeeLoading(true);
    setEmployeeError('');
    try {
      const employeeQuery = query(
        collection(db, 'users'),
        where('employeeID', '==', employeeID.trim()),
        where('email', '==', eEmail.trim()),
        where('passkey', '==', passkey.trim())
      );

      const querySnapshot = await getDocs(employeeQuery);

      if (!querySnapshot.empty) {
        const employeeDoc = querySnapshot.docs[0].data();
        if (employeeDoc.userType === 'Admin') {
          navigation.replace('Dashboard');
        } else {
          setEmployeeError('You do not have admin access.');
        }
      } else {
        setEmployeeError('Invalid EmployeeID, Email, or Passkey.');
      }
    } catch (error) {
      setEmployeeError('Failed to log in. Please check your credentials and try again.');
    } finally {
      setEmployeeLoading(false);
    }
  };

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* User Login */}
      <View style={[styles.container, { width }]}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello User</Text>
          <Text style={styles.subGreeting}>Sign in!</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="flat"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email-outline" />}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="flat"
            style={styles.input}
            secureTextEntry={secureTextEntry}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />
          <TouchableOpacity onPress={() => console.log('Forgot Password')}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>
          {userError ? <Text style={styles.errorText}>{userError}</Text> : null}
          <Button
            mode="contained"
            onPress={handleUserLogin}
            style={styles.loginButton}
            labelStyle={styles.buttonText}
            loading={userLoading}
          >
            SIGN IN
          </Button>
        </View>
      </View>

      {/* Employee Login */}
      <View style={[styles.container, { width }]}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello Employee</Text>
          <Text style={styles.subGreeting}>Sign in!</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            label="EmployeeID"
            value={employeeID}
            onChangeText={setEmployeeID}
            mode="flat"
            style={styles.input}
            keyboardType="default"
            autoCapitalize="none"
            left={<TextInput.Icon icon="id-card-outline" />}
          />
          <TextInput
            label="Email"
            value={eEmail}
            onChangeText={setEEmail}
            mode="flat"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email-outline" />}
          />
          <TextInput
            label="Passkey"
            value={passkey}
            onChangeText={setPasskey}
            mode="flat"
            style={styles.input}
            secureTextEntry={secureTextEntry}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />
          <TouchableOpacity onPress={() => console.log('Forgot Password')}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>
          {employeeError ? <Text style={styles.errorText}>{employeeError}</Text> : null}
          <Button
            mode="contained"
           // onPress={handleEmployeeLogin}
           onPress={() => navigation.navigate('Dashboard')}

            style={styles.loginButton}
            labelStyle={styles.buttonText}
            loading={employeeLoading}
          >
            SIGN IN
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F7CB07',
  },
  header: {
    marginBottom: 40,
  },
  greeting: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#E2A92D',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#4A00E0',
    fontSize: 14,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#8E2DE2',
    borderRadius: 8,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
