import * as SecureStore from "expo-secure-store";
import CryptoJS from "crypto-js";

interface PasswordEntry {
    id: string;
    service: string;
    username: string;
    password: string;
}

const ENCRYPTION_KEY_ID = "vault_key";

// Generate a 256-bit random key
const generateRandomKey = (): string => {
    return CryptoJS.lib.WordArray.random(32).toString(); // 256 bits
  }

// Get or create encryption key protected in SecureStore
export const getOrCreateKey = async (): Promise<string> => {
    let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID);
    if (!key) {
      key = generateRandomKey();
      await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, key);
    }
    return key;
};

export const SavePassword = async (data: PasswordEntry[]) => {
    try {
        let key = await getOrCreateKey();

        const plaintext = JSON.stringify(data)
        const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();

        await SecureStore.setItemAsync("password", encrypted);
    } catch (e) {
        console.error("Failed to save passwords", e);
    }
}

export const LoadPassword = async (): Promise<PasswordEntry[] | null> => {
    try {
        const encrypted = await SecureStore.getItemAsync("password");
        const key = await getOrCreateKey();

        if (!encrypted || !key ) return [];

        const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
    } catch (e) {
        console.error("Failed to load passwords", e);
        return null;
    }
}

export const DeletePassword = async (id: string): Promise<boolean> => {
    try {
        const existing = await LoadPassword();
        if (!existing) return false;
    
        const updated = existing.filter((entry) => entry.id !== id);
        await SavePassword(updated);
        return true;
    } catch (e) {
        console.error("Failed to delete password", e);
        return false;
    }
}
