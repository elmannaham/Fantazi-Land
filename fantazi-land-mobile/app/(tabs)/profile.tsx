import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { signIn, signOut, getCurrentUser, type AuthUser } from '../../lib/auth/session';

export default function ProfileScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser).finally(() => setIsLoading(false));
  }, []);

  const handleSignIn = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Email et mot de passe requis');
      return;
    }
    setIsSigningIn(true);
    try {
      await signIn(email.trim(), password);
      const u = await getCurrentUser();
      setUser(u);
      setEmail('');
      setPassword('');
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Connexion échouée');
    } finally {
      setIsSigningIn(false);
    }
  }, [email, password]);

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            setUser(null);
          },
        },
      ]
    );
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User Avatar & Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={48} color="#7c3aed" />
          </View>
          <Text style={styles.userName}>{user.email || 'Utilisateur'}</Text>
          <Text style={styles.userRole}>{user.role === 'client' ? 'Client' : 'Créateur'}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Feather name="calendar" size={24} color="#7c3aed" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="star" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="message-square" size={24} color="#059669" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather name="bell" size={20} color="#7c3aed" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Notifications</Text>
                <Text style={styles.settingDesc}>Activer les notifications</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: '#bfdbfe' }}
              thumbColor={notificationsEnabled ? '#7c3aed' : '#94a3b8'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather name="moon" size={20} color="#7c3aed" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Mode sombre</Text>
                <Text style={styles.settingDesc}>Activer le thème sombre</Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#cbd5e1', true: '#bfdbfe' }}
              thumbColor={darkModeEnabled ? '#7c3aed' : '#94a3b8'}
            />
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aide & Support</Text>

          <Pressable style={styles.menuItem}>
            <Feather name="help-circle" size={20} color="#64748b" />
            <Text style={styles.menuText}>Centre d'aide</Text>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Feather name="shield" size={20} color="#64748b" />
            <Text style={styles.menuText}>Politique de confidentialité</Text>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Feather name="file-text" size={20} color="#64748b" />
            <Text style={styles.menuText}>Conditions d'utilisation</Text>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Fantazi-Land v1.0.0</Text>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutBtn} onPress={handleSignOut}>
          <Feather name="log-out" size={16} color="#ef4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.loginContent}>
      <Feather name="lock" size={48} color="#7c3aed" />
      <Text style={styles.loginTitle}>Connexion</Text>
      <Text style={styles.loginSubtitle}>Accédez à votre espace Fantazi-Land</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#94a3b8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={[styles.signInBtn, isSigningIn && styles.signInBtnDisabled]}
        onPress={handleSignIn}
        disabled={isSigningIn}
      >
        {isSigningIn ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.signInText}>Se connecter</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
  },
  userRole: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  settingDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  appVersion: {
    fontSize: 12,
    color: '#94a3b8',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  loginContent: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 20,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 12,
  },
  signInBtn: {
    width: '100%',
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signInBtnDisabled: {
    opacity: 0.6,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
