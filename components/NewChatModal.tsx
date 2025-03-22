import { View, Text, StyleSheet, TextInput, Pressable, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { useContactStore } from '@/store/contactStore';
import { useChatStore } from '@/store/chatStore';

interface NewChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NewChatModal({ visible, onClose }: NewChatModalProps) {
  const [name, setName] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const addContact = useContactStore((state) => state.addContact);
  const addChat = useChatStore((state) => state.addChat);

  const handleSubmit = () => {
    if (!name.trim() || !publicKey.trim()) return;

    const newContact = {
      id: Date.now().toString(),
      name: name.trim(),
      publicKey: publicKey.trim(),
      status: 'offline' as const,
      lastSeen: new Date(),
    };

    addContact(newContact);
    addChat({
      id: Date.now().toString(),
      participants: [newContact],
      messages: [],
      unreadCount: 0,
      isGroup: false,
    });

    setName('');
    setPublicKey('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Chat</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter contact name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Public Key</Text>
              <TextInput
                style={styles.input}
                value={publicKey}
                onChangeText={setPublicKey}
                placeholder="Enter contact's public key"
                multiline
              />
            </View>

            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Start Chat</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});