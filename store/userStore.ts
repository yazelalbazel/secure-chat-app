import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { generateKeyPair } from '@/utils/encryption';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  createUser: (name: string) => Promise<User>;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      
      createUser: async (name: string) => {
        if (!name.trim()) {
          set({ error: "Name is required" });
          throw new Error("Name is required");
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Generate a new key pair for the user
          const { publicKey, privateKey } = await generateKeyPair();
          
          const user: User = {
            id: publicKey, // Using public key as ID
            name: name.trim(),
            publicKey,
            privateKey, // Store private key securely
          };
          
          set({ user, isLoading: false });
          return user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create user";
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },
      
      setUser: (user: User) => {
        set({ user, error: null });
      },
      
      logout: () => {
        set({ user: null });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);