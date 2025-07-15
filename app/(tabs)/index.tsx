import * as Clipboard from 'expo-clipboard';
import * as SecureStore from "expo-secure-store";
import React, { JSX, useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import uuid from "react-native-uuid";

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

  useEffect(() => {
    loadPasswords();
  }, []);

  const loadPasswords = async () => {
    try {
      const saved = await SecureStore.getItemAsync("passwords");
      if (saved) {
        const parsed: PasswordEntry[] = JSON.parse(saved);
        setEntries(parsed);
      }
    } catch (e) {
      console.error("Failed to load passwords", e);
    }
  };

  const savePasswords = async (data: PasswordEntry[]) => {
    try {
      await SecureStore.setItemAsync("passwords", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save passwords", e);
    }
  };

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
    savePasswords(updated);

    setService("");
    setUsername("");
    setPassword("");
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    savePasswords(updated);
  };

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
