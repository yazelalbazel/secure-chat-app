import { StyleSheet, Pressable } from 'react-native';
import { UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { AddContactModal } from './AddContactModal';

export function AddContactButton() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
        <UserPlus size={24} color="#FFFFFF" />
      </Pressable>
      <AddContactModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});