import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, ArrowLeft, Check, CheckCheck } from 'lucide-react-native';
import { useChatStore } from '@/store/chatStore';
import { Message as MessageType, EncryptedContent } from '@/types';
import { useUserStore } from '@/store/userStore';
import { peerConnection, PeerMessageEvent } from '@/utils/peer';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [peerStatus, setPeerStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('offline');
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const hasLoadedRef = useRef(false);
  
  // Get chat from store
  const chat = useChatStore((state) => state.chats.find((c) => c.id === id));
  const addMessage = useChatStore((state) => state.addMessage);
  const getMessages = useChatStore((state) => state.getMessages);
  const markAsRead = useChatStore((state) => state.markAsRead);
  
  // Get current user
  const currentUser = useUserStore((state) => state.user);
  
  // Initialize peer connection
  const initializePeer = useCallback(async () => {
    if (!chat || !currentUser) return;
    
    try {
      setPeerStatus('connecting');
      
      // Find the recipient
      const recipient = chat.participants.find(p => p.id !== currentUser.id);
      if (!recipient) {
        setPeerStatus('offline');
        return;
      }
      
      // Initialize peer and connect
      const peerId = await peerConnection.initialize();
      if (peerId) {
        const conn = peerConnection.connect(recipient.id);
        if (conn) {
          setPeerStatus('connected');
        } else {
          setPeerStatus('offline');
        }
      } else {
        setPeerStatus('error');
      }
    } catch (error) {
      console.error('Failed to initialize peer:', error);
      setPeerStatus('error');
    }
  }, [chat, currentUser]);
  
  // Memoize the loadMessages function to prevent recreation on every render
  const loadMessages = useCallback(async () => {
    if (!chat) return;
    
    try {
      setLoading(true);
      const decryptedMessages = await getMessages(chat.id);
      setMessages(decryptedMessages);
      
      // Mark messages as read when viewing chat
      markAsRead(chat.id);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chat, getMessages, markAsRead]);
  
  // Handle peer messages
  const handlePeerMessage = useCallback((event: PeerMessageEvent) => {
    if (event.type === 'message' && event.data?.type === 'chat_message') {
      // If the message is for this chat, add it
      if (event.data.chatId === id) {
        // Add message to store
        addMessage(id as string, event.data.message);
        
        // Reload messages - this ensures we see the decrypted message
        loadMessages();
      }
    } else if (event.type === 'status') {
      if (event.data === 'connected') {
        setPeerStatus('connected');
      } else if (event.data === 'disconnected') {
        setPeerStatus('offline');
      }
    } else if (event.type === 'error') {
      console.error('Peer connection error:', event.data);
      setPeerStatus('error');
    }
  }, [id, addMessage, loadMessages]);
  
  // Load messages on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    
    loadMessages();
    initializePeer();
    hasLoadedRef.current = true;
    
    // Set up peer message listener
    const removeListener = peerConnection.addEventListener(handlePeerMessage);
    
    return () => {
      // Clean up listener when component unmounts
      removeListener();
    };
  }, [loadMessages, handlePeerMessage, initializePeer]);

  const sendMessage = async () => {
    if (!message.trim() || !chat || !currentUser) return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      content: message.trim(),
      senderId: currentUser.id,
      timestamp: new Date(),
      status: 'sent',
      type: 'text',
    };

    // Clear input immediately for better UX
    setMessage('');
    if (inputRef.current) {
      inputRef.current.clear();
    }
    
    try {
      // Add message to local store
      await addMessage(chat.id, newMessage);
      
      // Reload messages to see the latest
      loadMessages();
      
      // If connected to peer, send the message
      const recipient = chat.participants.find(p => p.id !== currentUser.id);
      if (recipient) {
        const success = peerConnection.sendMessage(recipient.id, {
          type: 'chat_message',
          chatId: chat.id,
          message: newMessage
        });
        
        if (!success && peerStatus !== 'error' && peerStatus !== 'offline') {
          // If sending failed, try to reconnect
          initializePeer();
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleGoBack = () => {
    router.back();
  };
  
  const focusInput = () => {
    inputRef.current?.focus();
  };

  if (!chat) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </Pressable>
          <Text style={styles.name}>Chat</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundText}>Chat not found</Text>
        </View>
      </View>
    );
  }

  const participant = chat.participants.find(p => p.id !== currentUser?.id) || chat.participants[0];

  // Update the status styling to reflect peer status
  const getStatusStyle = (status: 'connecting' | 'connected' | 'error' | 'offline') => {
    switch (status) {
      case 'connected':
        return styles.statusOnline;
      case 'connecting':
        return styles.statusConnecting;
      case 'error':
        return styles.statusError;
      case 'offline':
      default:
        return styles.statusOffline;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </Pressable>
        <Image
          source={{ 
            uri: participant.avatar || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random` 
          }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{participant.name}</Text>
          <Text style={[styles.status, getStatusStyle(peerStatus)]}>
            {peerStatus === 'connected' 
              ? 'Online' 
              : peerStatus === 'connecting'
                ? 'Connecting...'
                : peerStatus === 'error'
                  ? 'Connection error'
                  : 'Offline'}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted
          renderItem={({ item }) => (
            <Message
              message={item}
              isOwn={item.senderId === currentUser?.id}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Pressable onPress={focusInput}>
                <Text style={styles.emptySubtext}>Say hello!</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          multiline
        />
        <Pressable 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Send size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

// Memoize the Message component to prevent unnecessary re-renders
const Message = memo(({ message, isOwn }: { message: MessageType, isOwn: boolean }) => {
  // Handle display when the content is an encrypted object
  const messageContent = typeof message.content === 'string' 
    ? message.content 
    : '[Encrypted message]';
    
  const StatusIcon = () => {
    if (message.status === 'read') {
      return <CheckCheck size={14} color={isOwn ? "#E5E7EB" : "#6B7280"} />;
    } else if (message.status === 'delivered') {
      return <Check size={14} color={isOwn ? "#E5E7EB" : "#6B7280"} />;
    } else {
      return <Check size={14} color={isOwn ? "#E5E7EB" : "#6B7280"} opacity={0.5} />;
    }
  };

  return (
    <View style={[styles.messageContainer, isOwn && styles.ownMessage]}>
      <View style={[styles.messageBubble, isOwn && styles.ownBubble]}>
        <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
          {messageContent}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isOwn && <StatusIcon />}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  status: {
    fontSize: 14,
  },
  statusOnline: {
    color: '#10B981',
  },
  statusOffline: {
    color: '#6B7280',
  },
  statusConnecting: {
    color: '#F59E0B',
  },
  statusError: {
    color: '#EF4444',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: '#6B7280',
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageListContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#1E3A8A',
    marginTop: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownBubble: {
    backgroundColor: '#1E3A8A',
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937',
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  ownMessageTime: {
    color: '#E5E7EB',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#1E3A8A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});