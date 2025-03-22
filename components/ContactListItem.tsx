import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Contact } from '@/types';
import { useChatStore } from '@/store/chatStore';
import { peerConnection } from '@/utils/peer';
import { useState } from 'react';

interface ContactListItemProps {
  contact: Contact;
}

export function ContactListItem({ contact }: ContactListItemProps) {
  const router = useRouter();
  const createChat = useChatStore((state) => state.createChat);
  const getChatWithContact = useChatStore((state) => state.getChatWithContact);
  const [isConnecting, setIsConnecting] = useState(false);

  const startChat = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      
      // Check if a chat already exists or create a new one
      const chat = getChatWithContact(contact.id) || createChat(contact);
      
      // Try to establish connection with the peer, but don't block navigation
      // if it fails - we'll just use mock mode
      try {
        // Make sure peer is initialized
        await peerConnection.initialize();
        // Connect to the contact
        peerConnection.connect(contact.id);
      } catch (error) {
        console.error('Failed to connect to peer:', error);
        // Continue anyway - we'll use mock mode
      }
      
      // Navigate to the chat screen
      router.push(`/chat/${chat.id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Pressable 
      style={styles.container} 
      onPress={startChat}
      disabled={isConnecting}
    >
      <Image
        source={{ 
          uri: contact.avatar || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random` 
        }}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.status}>
          {isConnecting 
            ? 'Connecting...' 
            : contact.status === 'online' 
              ? 'Online' 
              : 'Last seen ' + new Date(contact.lastSeen).toLocaleTimeString()}
        </Text>
      </View>
      <View 
        style={[
          styles.statusDot, 
          { 
            backgroundColor: isConnecting 
              ? '#FCD34D' 
              : contact.status === 'online' 
                ? '#10B981' 
                : '#6B7280' 
          }
        ]} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});