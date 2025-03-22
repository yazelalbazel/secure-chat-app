import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message, User, EncryptedContent } from '@/types';
import { encryptMessage, decryptMessage } from '@/utils/encryption';
import { useUserStore } from './userStore';

interface ChatStore {
  chats: Chat[];
  addChat: (chat: Chat) => void;
  removeChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => Promise<void>;
  getMessages: (chatId: string) => Promise<Message[]>;
  markAsRead: (chatId: string) => void;
  getChatWithContact: (contactId: string) => Chat | undefined;
  createChat: (participant: User) => Chat;
}

// Helper function to ensure timestamp is a Date object
const ensureDateObject = (timestamp: Date | string | number): Date => {
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      
      addChat: (chat) => {
        // Check if chat already exists to avoid duplicates
        const existing = get().chats.find(c => c.id === chat.id);
        if (existing) return;
        
        // Ensure any messages in the chat have proper Date objects for timestamps
        const processedChat = {
          ...chat,
          messages: (chat.messages || []).map(msg => ({
            ...msg,
            timestamp: ensureDateObject(msg.timestamp)
          })),
          lastMessage: chat.lastMessage ? {
            ...chat.lastMessage,
            timestamp: ensureDateObject(chat.lastMessage.timestamp)
          } : undefined,
          unreadCount: chat.unreadCount || 0
        };
        
        set((state) => ({ 
          chats: [...state.chats, processedChat] 
        }));
      },
      
      removeChat: (chatId) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
        })),
        
      addMessage: async (chatId, message) => {
        try {
          // Check if the chat exists
          const chat = get().chats.find(c => c.id === chatId);
          if (!chat) {
            console.error('Chat not found:', chatId);
            return;
          }
          
          // Ensure timestamp is a Date object
          const processedMessage = {
            ...message,
            timestamp: ensureDateObject(message.timestamp)
          };
          
          // Get recipient's public key for encryption
          const user = useUserStore.getState().user;
          
          // Find the recipient (not the current user)
          const recipient = chat.participants.find(p => p.id !== user?.id);
          
          // Encrypt message content if it's a string and we have a recipient
          let encryptedContent: string | EncryptedContent = processedMessage.content;
          if (typeof processedMessage.content === 'string' && recipient) {
            encryptedContent = await encryptMessage(processedMessage.content, recipient.publicKey);
          }
          
          // Store the encrypted message
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: [...chat.messages, { ...processedMessage, content: encryptedContent }],
                    lastMessage: { 
                      ...processedMessage, 
                      content: typeof processedMessage.content === 'string' 
                        ? processedMessage.content 
                        : '[Encrypted message]'
                    }, // Keep plaintext in lastMessage for UI
                    unreadCount: chat.unreadCount + (processedMessage.senderId !== user?.id ? 1 : 0),
                  }
                : chat
            ),
          }));
        } catch (error) {
          console.error('Failed to add message:', error);
        }
      },
      
      getMessages: async (chatId) => {
        try {
          const chat = get().chats.find((c) => c.id === chatId);
          if (!chat) return [];
          
          const user = useUserStore.getState().user;
          if (!user) return chat.messages; // Can't decrypt without private key
          
          // Process all messages in parallel
          const decryptedMessages = await Promise.all(
            chat.messages.map(async (message) => {
              // Ensure timestamp is a Date object
              const timestamp = ensureDateObject(message.timestamp);
              
              // Decrypt content if needed
              const decryptedContent = typeof message.content === 'string' 
                ? message.content 
                : await decryptMessage(message.content, user.privateKey);
                
              return {
                ...message,
                timestamp,
                content: decryptedContent
              };
            })
          );
          
          return decryptedMessages;
        } catch (error) {
          console.error('Failed to get messages:', error);
          return [];
        }
      },
      
      markAsRead: (chatId) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
          ),
        }));
      },
      
      getChatWithContact: (contactId) => {
        return get().chats.find(chat => 
          !chat.isGroup && chat.participants.some(p => p.id === contactId)
        );
      },
      
      createChat: (participant) => {
        const user = useUserStore.getState().user;
        if (!user) throw new Error('User not authenticated');
        
        // Create a unique chat ID based on the two participants
        // Ensure the same ID is generated regardless of the order
        const chatId = [user.id, participant.id].sort().join('-');
        
        // Check if chat already exists
        const existingChat = get().getChatWithContact(participant.id);
        if (existingChat) return existingChat;
        
        // Create new chat
        const newChat: Chat = {
          id: chatId,
          participants: [user, participant],
          messages: [],
          unreadCount: 0,
          isGroup: false,
        };
        
        // Add to store
        get().addChat(newChat);
        
        return newChat;
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);