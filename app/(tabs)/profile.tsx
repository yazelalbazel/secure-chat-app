import { View, Text, StyleSheet, Pressable, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Copy, Save, User as UserIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { generateKeyPair } from '@/utils/encryption';
import { useUserStore } from '@/store/userStore';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Access user store
  const user = useUserStore((state) => state.user);
  const createUser = useUserStore((state) => state.createUser);
  const setUser = useUserStore((state) => state.setUser);
  
  // Local profile state
  const [profile, setProfile] = useState({
    name: user?.name || 'Your Name',
    publicKey: user?.publicKey || '',
  });
  
  // For name editing
  const [editName, setEditName] = useState('');

  useEffect(() => {
    async function initializeProfile() {
      try {
        setLoading(true);
        
        // If user exists in store, use that data
        if (user) {
          setProfile({
            name: user.name,
            publicKey: user.publicKey,
          });
          setLoading(false);
          return;
        }
        
        // Otherwise generate new keys and create user
        const keys = await generateKeyPair();
        
        const newUser = {
          id: keys.publicKey,
          name: 'Your Name',
          publicKey: keys.publicKey,
          privateKey: keys.privateKey,
        };
        
        // Save to store
        setUser(newUser);
        
        // Update local state
        setProfile({
          name: newUser.name,
          publicKey: newUser.publicKey,
        });
        
      } catch (error) {
        console.error('Failed to initialize profile:', error);
        Alert.alert(
          'Initialization Error',
          'Could not generate secure keys. Using fallback mode.'
        );
      } finally {
        setLoading(false);
      }
    }
    
    initializeProfile();
  }, [user, createUser, setUser]);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    
    // On web, use the Clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      Alert.alert('Copied', 'Public key copied to clipboard');
    } else {
      // For React Native 
      Alert.alert('Copied', 'Public key copied to clipboard');
    }
  };
  
  const handleEditName = () => {
    setEditName(profile.name);
    setEditMode(true);
  };
  
  const handleSaveName = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    try {
      setSaving(true);
      
      if (user) {
        const updatedUser = {
          ...user,
          name: editName.trim()
        };
        
        // Update user in store
        setUser(updatedUser);
        
        // Update local profile
        setProfile(prev => ({
          ...prev,
          name: editName.trim()
        }));
      }
      
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save name:', error);
      Alert.alert('Error', 'Failed to save name');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.label}>Your Name</Text>
            
            {editMode ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  autoFocus
                />
                <Pressable 
                  style={styles.saveButton}
                  onPress={handleSaveName}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Save size={20} color="#FFFFFF" />
                  )}
                </Pressable>
              </View>
            ) : (
              <View style={styles.nameContainer}>
                <UserIcon size={20} color="#1E3A8A" style={styles.nameIcon} />
                <Text style={styles.value}>{profile.name}</Text>
                <Pressable onPress={handleEditName} style={styles.editButton}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Your Public Key</Text>
            <View style={styles.keyContainer}>
              <Text style={styles.key} numberOfLines={2}>
                {profile.publicKey}
              </Text>
              <Pressable 
                style={styles.copyButton}
                disabled={!profile.publicKey}
                onPress={() => copyToClipboard(profile.publicKey)}>
                <Copy size={20} color="#1E3A8A" />
              </Pressable>
            </View>
            <Text style={styles.hint}>
              Share your public key with friends to let them message you
            </Text>
          </View>
          
          <Text style={styles.subtitle}>About Encryption</Text>
          <Text style={styles.description}>
            This app uses end-to-end encryption to keep your messages private. Only you and the 
            recipient can read the messages you send.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 48,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameIcon: {
    marginRight: 8,
  },
  value: {
    fontSize: 18,
    color: '#1F2937',
    flex: 1,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  key: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});