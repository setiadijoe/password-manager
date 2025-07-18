import * as SecureStore from "expo-secure-store";

interface PasswordEntry {
    id: string;
    service: string;
    username: string;
    password: string;
}

export const SavePassword = async (data: PasswordEntry[]) => {
    try {
        await SecureStore.setItemAsync("password", JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save passwords", e);
    }
}

export const LoadPassword = async () => {
    try {
        const saved = await SecureStore.getItemAsync("password");
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load passwords", e);
    }
}

export const DeletePassword = async (id: string) => {
    try {
        const saved = await SecureStore.getItemAsync("password");
        if (saved) {
            const parsed: PasswordEntry[] = JSON.parse(saved);
            const filtered = parsed.filter((entry) => entry.id !== id);
            await SecureStore.setItemAsync("password", JSON.stringify(filtered));
        }
    } catch (e) {
        console.error("Failed to delete password", e);
    }
}
