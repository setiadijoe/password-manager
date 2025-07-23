import * as Clipboard from 'expo-clipboard';
import React, { JSX, useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  View,
  AppState,
} from "react-native";
import uuid from "react-native-uuid";
import { LoadPassword, SavePassword } from "./password-managers/password-manager";
import * as LocalAuthentication from 'expo-local-authentication';

interface PasswordEntry {
  id: string;
  service: string;
  username: string;
  password: string;
}

export default function App(): JSX.Element {
  const [service, setService] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // const checkBiometric = async () => {
    //   const hasHardware = await LocalAuthentication.hasHardwareAsync();
    //   const supported = await LocalAuthentication.isEnrolledAsync();
  
    //   if (hasHardware && supported) {
    //     const result = await LocalAuthentication.authenticateAsync({
    //       promptMessage: 'Authenticate to unlock vault',
    //     });
  
    //     if (!result.success) {
    //       Alert.alert('Authentication failed', 'You cannot access the vault.');
    //       // Optional: Exit or lock the app
    //     } else {
    //       // Mark app as unlocked
    //       setIsUnlocked(true);
    //       const loaded = await LoadPassword();
    //       if (loaded) setEntries(loaded);
    //     }
    //   } else {
    //     Alert.alert('Biometric not available', 'Please use a supported device.');
    //   }
    // };
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        setIsUnlocked(false); // lock app when backgrounded
      }
    });
    
    // checkBiometric();
    return () => sub.remove();
  }, []);

  const addEntry = () => {
    if (!service || !username || !password) {
      Alert.alert("Missing fields");
      return;
    }

    const newEntry: PasswordEntry = {
      id: uuid.v4().toString(),
      service,
      username,
      password,
    };

    const updated = [...entries, newEntry];
    setEntries(updated);
    SavePassword(updated);

    setService("");
    setUsername("");
    setPassword("");
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    SavePassword(updated);
  };

  const handleManualUnlock = async () => {
    if (isUnlocked) return;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to unlock vault',
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      setIsUnlocked(true);
      const loaded = await LoadPassword();
      if (loaded) setEntries(loaded);
    } else {
      Alert.alert('Authentication failed');
    }
  };

  if (!isUnlocked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <Text style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>🔐 Locked</Text>
        <Button title="Unlock Vault" onPress={handleManualUnlock} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Password Manager</Text>

      <TextInput
        placeholder="Service"
        value={service} 
        onChangeText={setService}
        style={styles.input}
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"  
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title="Add Password" onPress={addEntry} />

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryText}>
                📌 {item.service}
              </Text>

              <View style={styles.itemRow}>
                <Text style={styles.subText}>👤 {item.username}</Text>
                <Button
                  title="Copy"
                  onPress={() => Clipboard.setStringAsync(item.username)}
                />
              </View>

              <View style={styles.itemRow}>
                <Text style={styles.passwordText}>🔐 ********</Text>
                <Button
                  title="Copy"
                  onPress={() => Clipboard.setStringAsync(item.password)}
                />
              </View>

              <View style={styles.deleteButton}>
                <Button
                  title="Delete"
                  onPress={() => deleteEntry(item.id)}
                  color="red"
                />
              </View>
              </View>
          </View>
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ebddb9",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    backgroundColor: "#d1c8ae",
  },
  entry: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#eee",
    marginBottom: 5,
    borderRadius: 5,
  },
  passwordText: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
    fontStyle: "italic",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  entryText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 15,
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  deleteButton: {
    marginTop: 10,
  },
});
