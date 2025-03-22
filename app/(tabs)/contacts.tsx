import { View, StyleSheet, FlatList } from 'react-native';
import { useContactStore } from '@/store/contactStore';
import { ContactHeader } from '@/components/ContactHeader';
import { ContactListItem } from '@/components/ContactListItem';
import { AddContactButton } from '@/components/AddContactButton';

export default function ContactsScreen() {
  const contacts = useContactStore((state) => state.contacts);

  return (
    <View style={styles.container}>
      <ContactHeader />
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ContactListItem contact={item} />}
      />
      <AddContactButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
});