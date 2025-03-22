import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Search } from 'lucide-react-native';

export function ContactHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts</Text>
      <Pressable style={styles.button}>
        <Search size={24} color="#1E3A8A" />
      </Pressable>
    </View>
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
  button: {
    padding: 8,
  },
});