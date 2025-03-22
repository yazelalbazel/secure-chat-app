import { View, Text, StyleSheet, TextInput, Pressable, Modal, ActivityIndicator, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { useContactStore } from '@/store/contactStore';
import { peerConnection } from '@/utils/peer';

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddContactModal({ visible, onClose }: AddContactModalProps) {
  const [name, setName] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; publicKey?: string }>({});
  
  const addContact = useContactStore((state) => state.addContact);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; publicKey?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!publicKey.trim()) {
      newErrors.publicKey = 'Public key is required';
    } else if (publicKey.trim().length < 10) {
      newErrors.publicKey = 'Public key is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Try to establish a connection with the peer to verify it exists
      const connection = peerConnection.connect(publicKey.trim());
      
      // Add contact to the store
      addContact({
        id: publicKey.trim(), // Use the publicKey as the ID for easier connection
        name: name.trim(),
        publicKey: publicKey.trim(),
        status: connection ? 'online' : 'offline',
        lastSeen: new Date(),
      });

      // Reset form and close modal
      setName('');
      setPublicKey('');
      onClose();
      
    } catch (error) {
      console.error('Failed to add contact:', error);
      Alert.alert('Error', 'Failed to add contact. Please check the public key and try again.');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.modalTitle}>Add Contact</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Enter contact name"
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Public Key</Text>
              <TextInput
                style={[styles.input, errors.publicKey && styles.inputError]}
                value={publicKey}
                onChangeText={(text) => {
                  setPublicKey(text);
                  if (errors.publicKey) setErrors({ ...errors, publicKey: undefined });
                }}
                placeholder="Enter contact's public key"
                multiline
              />
              {errors.publicKey ? <Text style={styles.errorText}>{errors.publicKey}</Text> : null}
            </View>

            <Pressable 
              style={[
                styles.submitButton, 
                (!name.trim() || !publicKey.trim()) && styles.submitButtonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={loading || !name.trim() || !publicKey.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Add Contact</Text>
              )}
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
  inputError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});