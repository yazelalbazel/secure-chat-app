import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { NewChatModal } from './NewChatModal';

interface ChatHeaderProps {
  title: string;
}

export function ChatHeader({ title }: ChatHeaderProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.button}>
            <Search size={24} color="#1E3A8A" />
          </Pressable>
          <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
            <Plus size={24} color="#1E3A8A" />
          </Pressable>
        </View>
      </View>
      <NewChatModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    padding: 8,
  },
});