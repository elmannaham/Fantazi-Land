import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import type { ProfileWithStats } from '../../lib/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

interface ProfileCardProps {
  profile: ProfileWithStats;
  onPress: () => void;
  onBook: () => void;
}

export function ProfileCard({ profile, onPress, onBook }: ProfileCardProps) {
  const stats = profile.performance_stats;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {profile.avatar_url ? (
        <Image
          source={{ uri: profile.avatar_url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Feather name="user" size={32} color="#cbd5e1" />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {profile.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {profile.category}
        </Text>

        <View style={styles.meta}>
          {stats && (
            <View style={styles.rating}>
              <Feather name="star" size={10} color="#f59e0b" />
              <Text style={styles.ratingText}>
                {stats.avg_rating?.toFixed(1) || '—'}
              </Text>
            </View>
          )}
          {profile.base_rate && (
            <Text style={styles.rate}>{profile.base_rate}€/h</Text>
          )}
        </View>
      </View>

      <Pressable style={styles.bookBtn} onPress={onBook}>
        <Feather name="calendar" size={12} color="#fff" />
        <Text style={styles.bookText}>Réserver</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#f1f5f9',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { padding: 10 },
  name: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  category: { fontSize: 11, color: '#7c3aed', fontWeight: '600', marginTop: 2 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  rate: { fontSize: 11, fontWeight: '700', color: '#059669' },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#7c3aed',
    paddingVertical: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  bookText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
