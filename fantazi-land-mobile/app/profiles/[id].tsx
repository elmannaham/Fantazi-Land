import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { fetchProfileById } from '../../lib/api/profiles';
import type { ProfileWithStats } from '../../lib/types';

const { width } = Dimensions.get('window');

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProfileById(id)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Profil introuvable</Text>
      </View>
    );
  }

  const stats = profile.performance_stats;
  const photos = (profile.media_assets || []).filter((m) => m.file_type === 'image');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {profile.avatar_url ? (
        <Image
          source={{ uri: profile.avatar_url }}
          style={styles.avatar}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Feather name="user" size={48} color="#7c3aed" />
        </View>
      )}

      <Text style={styles.name}>{profile.name}</Text>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{profile.category}</Text>
      </View>

      {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avg_rating?.toFixed(1) || '—'}</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_projects}</Text>
            <Text style={styles.statLabel}>Projets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_reviews}</Text>
            <Text style={styles.statLabel}>Avis</Text>
          </View>
        </View>
      )}

      {profile.base_rate && (
        <View style={styles.rateCard}>
          <Text style={styles.rateLabel}>Tarif de base</Text>
          <Text style={styles.rateValue}>
            {profile.base_rate}€ <Text style={styles.rateUnit}>/ heure</Text>
          </Text>
        </View>
      )}

      {photos.length > 0 && (
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Portfolio ({photos.length})</Text>
          <FlatList
            data={photos}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.photosList}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.file_url }}
                style={styles.photo}
                contentFit="cover"
                transition={200}
              />
            )}
          />
        </View>
      )}

      <Pressable
        style={styles.bookBtn}
        onPress={() => router.push(`/booking/${profile.id}`)}
      >
        <Feather name="calendar" size={18} color="#fff" />
        <Text style={styles.bookBtnText}>Réserver maintenant</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { alignItems: 'center', paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#94a3b8' },
  avatar: { width: width, height: width * 0.8, backgroundColor: '#e2e8f0' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginTop: 16 },
  categoryBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  categoryText: { fontSize: 12, fontWeight: '700', color: '#7c3aed' },
  bio: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginTop: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  rateCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginHorizontal: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  rateLabel: { fontSize: 12, color: '#64748b' },
  rateValue: { fontSize: 28, fontWeight: '800', color: '#7c3aed', marginTop: 4 },
  rateUnit: { fontSize: 14, fontWeight: '400', color: '#94a3b8' },
  photosSection: { marginTop: 24, alignSelf: 'stretch' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  photosList: { paddingHorizontal: 20, gap: 8 },
  photo: { width: 160, height: 200, borderRadius: 12 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 32,
    marginHorizontal: 20,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
