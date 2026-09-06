import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { fetchProfiles } from '../../lib/api/profiles';
import { cacheProfiles, getCachedProfiles } from '../../lib/cache/mmkv';
import { ProfileCard } from '../../components/molecules/ProfileCard';
import type { ProfileWithStats } from '../../lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProfiles({ limit: 20 });
      setProfiles(data);
      cacheProfiles(data);
    } catch (err) {
      const cached = getCachedProfiles();
      if (cached) {
        setProfiles(cached);
      } else {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const featuredProfiles = profiles.slice(0, 3);

  return (
    <View style={styles.container}>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadProfiles}
            tintColor="#7c3aed"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heroTitle}>Fantazi-Land</Text>
            <Text style={styles.heroSubtitle}>
              Réservez les meilleures hôtesses d'exception
            </Text>
            <View style={styles.badge}>
              <Feather name="star" size={12} color="#7c3aed" />
              <Text style={styles.badgeText}>
                {profiles.length} profils disponibles
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ProfileCard
            profile={item}
            onPress={() => router.push(`/profiles/${item.id}`)}
            onBook={() => router.push(`/booking/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Feather name="inbox" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {error || 'Aucun profil disponible'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { paddingHorizontal: 12, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  header: { paddingTop: 16, paddingBottom: 24, alignItems: 'center' },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#7c3aed' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: '#94a3b8', marginTop: 12 },
});
