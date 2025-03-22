import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { Moon, Sun, Key, Bell, Shield } from 'lucide-react-native';

export default function SettingsScreen() {
  const { darkMode, notifications, e2eEncryption, toggleDarkMode, toggleNotifications, toggleE2EEncryption } = useSettingsStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Pressable style={styles.setting} onPress={toggleDarkMode}>
          <View style={styles.settingLeft}>
            {darkMode ? <Moon size={24} color="#FFD700" /> : <Sun size={24} color="#1E3A8A" />}
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <Pressable style={styles.setting} onPress={toggleE2EEncryption}>
          <View style={styles.settingLeft}>
            <Shield size={24} color="#1E3A8A" />
            <Text style={styles.settingText}>End-to-End Encryption</Text>
          </View>
          <Switch value={e2eEncryption} onValueChange={toggleE2EEncryption} />
        </Pressable>
        <Pressable style={styles.setting} onPress={toggleNotifications}>
          <View style={styles.settingLeft}>
            <Bell size={24} color="#1E3A8A" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch value={notifications} onValueChange={toggleNotifications} />
        </Pressable>
        <Pressable style={styles.setting}>
          <View style={styles.settingLeft}>
            <Key size={24} color="#1E3A8A" />
            <Text style={styles.settingText}>Encryption Keys</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    marginTop: 48,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#1F2937',
  },
});