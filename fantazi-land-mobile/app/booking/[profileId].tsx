import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { fetchProfileById } from '../../lib/api/profiles';
import { createBooking } from '../../lib/api/bookings';
import type { ProfileWithStats } from '../../lib/types';

export default function BookingScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!profileId) return;
    fetchProfileById(profileId)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [profileId]);

  const handleSubmit = async () => {
    if (!projectTitle.trim()) {
      Alert.alert('Erreur', 'Le titre du projet est requis');
      return;
    }
    if (!profileId) return;

    setIsSubmitting(true);
    try {
      await createBooking({
        profileId,
        projectTitle: projectTitle.trim(),
        projectDescription: description.trim() || undefined,
        clientName: clientName.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        budget: budget ? Number(budget) : undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert(
        'Réservation envoyée ! ✨',
        'Votre demande a été transmise. Vous recevrez une confirmation bientôt.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {profile && (
          <View style={styles.profileSummary}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileCategory}>{profile.category}</Text>
            {profile.base_rate && (
              <Text style={styles.profileRate}>{profile.base_rate}€ / heure</Text>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Détails de la réservation</Text>

        <Text style={styles.label}>Titre du projet *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Événement VIP, Shooting photo..."
          placeholderTextColor="#94a3b8"
          value={projectTitle}
          onChangeText={setProjectTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez votre projet..."
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Votre nom</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre nom complet"
          placeholderTextColor="#94a3b8"
          value={clientName}
          onChangeText={setClientName}
        />

        <Text style={styles.label}>Votre email</Text>
        <TextInput
          style={styles.input}
          placeholder="email@exemple.com"
          placeholderTextColor="#94a3b8"
          value={clientEmail}
          onChangeText={setClientEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Budget (€)</Text>
        <TextInput
          style={styles.input}
          placeholder="500"
          placeholderTextColor="#94a3b8"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes additionnelles</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Horaires préférés, lieu, etc."
          placeholderTextColor="#94a3b8"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="send" size={16} color="#fff" />
              <Text style={styles.submitText}>Envoyer la demande</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileSummary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  profileName: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  profileCategory: { fontSize: 13, color: '#7c3aed', fontWeight: '600', marginTop: 2 },
  profileRate: { fontSize: 14, color: '#64748b', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
