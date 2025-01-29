import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Surface, List, Switch, Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { ref, update, onValue } from 'firebase/database';
import { auth, database } from '../../config/firebase';
import * as Localization from 'expo-localization';

const ProfileSettingsScreen = () => {
  const [settings, setSettings] = useState({
    language: 'en',
    theme: 'light',
    biometricLogin: false,
    twoFactorAuth: false,
    currency: 'USD',
    timezone: Localization.timezone,
  });

  const [visible, setVisible] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    const userRef = ref(database, `users/${auth.currentUser.uid}/settings`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...snapshot.val()
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSettingUpdate = async (key, value) => {
    try {
      const userRef = ref(database, `users/${auth.currentUser.uid}/settings`);
      await update(userRef, { [key]: value });
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const showDialog = (type) => {
    setDialogType(type);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setTempValue('');
  };

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    // Add more languages as needed
  ];

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Theme"
            description={settings.theme === 'light' ? 'Light' : 'Dark'}
            onPress={() => handleSettingUpdate('theme', settings.theme === 'light' ? 'dark' : 'light')}
            right={() => <List.Icon icon={settings.theme === 'light' ? 'brightness-7' : 'brightness-3'} />}
          />
          <List.Item
            title="Language"
            description={languages.find(l => l.code === settings.language)?.name || 'English'}
            onPress={() => showDialog('language')}
            right={() => <List.Icon icon="translate" />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Security</List.Subheader>
          <List.Item
            title="Biometric Login"
            right={() => (
              <Switch
                value={settings.biometricLogin}
                onValueChange={(value) => handleSettingUpdate('biometricLogin', value)}
              />
            )}
          />
          <List.Item
            title="Two-Factor Authentication"
            right={() => (
              <Switch
                value={settings.twoFactorAuth}
                onValueChange={(value) => handleSettingUpdate('twoFactorAuth', value)}
              />
            )}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Regional</List.Subheader>
          <List.Item
            title="Currency"
            description={settings.currency}
            onPress={() => showDialog('currency')}
            right={() => <List.Icon icon="currency-usd" />}
          />
          <List.Item
            title="Time Zone"
            description={settings.timezone}
            right={() => <List.Icon icon="clock-time-four" />}
          />
        </List.Section>
      </Surface>

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>
            {dialogType === 'language' ? 'Select Language' : 'Select Currency'}
          </Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogContent}>
              {dialogType === 'language' ? (
                languages.map((lang) => (
                  <List.Item
                    key={lang.code}
                    title={lang.name}
                    onPress={() => {
                      handleSettingUpdate('language', lang.code);
                      hideDialog();
                    }}
                    right={() => settings.language === lang.code && <List.Icon icon="check" />}
                  />
                ))
              ) : (
                currencies.map((curr) => (
                  <List.Item
                    key={curr}
                    title={curr}
                    onPress={() => {
                      handleSettingUpdate('currency', curr);
                      hideDialog();
                    }}
                    right={() => settings.currency === curr && <List.Icon icon="check" />}
                  />
                ))
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    borderRadius: 12,
    elevation: 4,
  },
  dialogContent: {
    maxHeight: 300,
  },
});

export default ProfileSettingsScreen; 