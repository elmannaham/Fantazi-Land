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
import { signIn, signUp, signOut, getCurrentUser, type AuthUser } from '../../lib/auth/session';
import { createProfile, type CreateProfileDto } from '../../lib/api/profiles';
import type { ProfileCategory } from '../../lib/types';

export default function ProfileScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Profile Creation states
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileCategory, setProfileCategory] = useState<ProfileCategory>('Photographie');
  const [profileBio, setProfileBio] = useState('');
  const [profileBaseRate, setProfileBaseRate] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  const handleSignUp = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Email et mot de passe requis');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setIsSigningIn(true);
    try {
      await signUp(email.trim(), password);
      Alert.alert(
        'Succès',
        'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.'
      );
      setIsSignUp(false);
      setPassword('');
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Inscription échouée');
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
            setIsCreatingProfile(false);
          },
        },
      ]
    );
  }, []);

  const handleCreateProfileSubmit = useCallback(async () => {
    if (!profileName.trim()) {
      Alert.alert('Erreur', 'Le nom du profil est requis');
      return;
    }
    const rate = parseFloat(profileBaseRate);
    if (profileBaseRate && isNaN(rate)) {
      Alert.alert('Erreur', 'Le tarif de base doit être un nombre valide');
      return;
    }

    setIsSavingProfile(true);
    try {
      const dto: CreateProfileDto = {
        name: profileName.trim(),
        category: profileCategory,
        bio: profileBio.trim() || null,
        baseRate: profileBaseRate ? rate : null,
        currency: 'EUR',
        isPublic: true,
        isAvailable: true,
      };
      await createProfile(dto);
      Alert.alert('Succès', 'Votre profil de créateur a été créé avec succès !');
      setIsCreatingProfile(false);
      setProfileName('');
      setProfileBio('');
      setProfileBaseRate('');
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Création du profil échouée');
    } finally {
      setIsSavingProfile(false);
    }
  }, [profileName, profileCategory, profileBio, profileBaseRate]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (user) {
    if (isCreatingProfile) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.formHeader}>
            <Pressable style={styles.backBtn} onPress={() => setIsCreatingProfile(false)}>
              <Feather name="arrow-left" size={18} color="#7c3aed" />
              <Text style={styles.backBtnText}>Annuler</Text>
            </Pressable>
            <Text style={styles.formTitle}>Créer un Profil Créateur</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Nom professionnel / Pseudonyme</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Clara d'Exception"
              placeholderTextColor="#94a3b8"
              value={profileName}
              onChangeText={setProfileName}
            />

            <Text style={styles.inputLabel}>Catégorie d'Activité</Text>
            <View style={styles.categoryPicker}>
              {(['Photographie', 'Vidéographie', 'Contenu Mode', 'Beauté', 'Lifestyle', 'Gaming'] as const).map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.categoryBadge, profileCategory === cat && styles.categoryBadgeActive]}
                  onPress={() => setProfileCategory(cat)}
                >
                  <Text style={[styles.categoryBadgeText, profileCategory === cat && styles.categoryBadgeTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Tarif horaire (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 250"
              placeholderTextColor="#94a3b8"
              value={profileBaseRate}
              onChangeText={setProfileBaseRate}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Biographie / Présentation</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Présentez votre univers, vos compétences..."
              placeholderTextColor="#94a3b8"
              value={profileBio}
              onChangeText={setProfileBio}
              multiline
              numberOfLines={4}
            />
          </View>

          <Pressable
            style={[styles.signInBtn, isSavingProfile && styles.signInBtnDisabled]}
            onPress={handleCreateProfileSubmit}
            disabled={isSavingProfile}
          >
            {isSavingProfile ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.signInText}>Publier mon profil sur l'agence</Text>
            )}
          </Pressable>
        </ScrollView>
      );
    }

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

        {/* Actions Créateurs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Espace Agence & Création</Text>
          <Pressable style={styles.menuItem} onPress={() => setIsCreatingProfile(true)}>
            <Feather name="plus-circle" size={20} color="#7c3aed" />
            <Text style={styles.menuText}>Devenir Créateur / Créer un Profil</Text>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </Pressable>
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
      <Feather name={isSignUp ? "user-plus" : "lock"} size={48} color="#7c3aed" />
      <Text style={styles.loginTitle}>{isSignUp ? "Inscription" : "Connexion"}</Text>
      <Text style={styles.loginSubtitle}>
        {isSignUp ? "Créez votre compte Fantazi-Land" : "Accédez à votre espace Fantazi-Land"}
      </Text>

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
        onPress={isSignUp ? handleSignUp : handleSignIn}
        disabled={isSigningIn}
      >
        {isSigningIn ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.signInText}>{isSignUp ? "S'inscrire" : "Se connecter"}</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.toggleModeBtn}
        onPress={() => {
          setIsSignUp(!isSignUp);
          setPassword('');
        }}
      >
        <Text style={styles.toggleModeText}>
          {isSignUp ? "Déjà un compte ? Se connecter" : "Vous n'avez pas de compte ? S'inscrire"}
        </Text>
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
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
    height: 40,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryBadgeActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#c084fc',
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryBadgeTextActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  toggleModeBtn: {
    marginTop: 20,
    paddingVertical: 10,
  },
  toggleModeText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
  },
});
