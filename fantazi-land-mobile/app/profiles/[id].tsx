import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Linking,
  Alert,
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
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!id) {
      setError('ID de profil invalide');
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await fetchProfileById(id);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSocialLink = useCallback(
    (url: string | null | undefined, platform: string) => {
      if (!url) {
        Alert.alert('Indisponible', `Aucun lien ${platform} disponible`);
        return;
      }
      Linking.openURL(url).catch(() => {
        Alert.alert('Erreur', `Impossible d'ouvrir le lien ${platform}`);
      });
    },
    []
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Profil introuvable'}</Text>
        <Pressable style={styles.retryBtn} onPress={loadProfile}>
          <Text style={styles.retryBtnText}>Réessayer</Text>
        </Pressable>
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

      {/* Social Links */}
      {(profile.instagram_url || profile.tiktok_url || profile.twitter_url || profile.website_url) && (
        <View style={styles.socialsSection}>
          <Text style={styles.sectionTitle}>Réseaux & Contact</Text>
          <View style={styles.socialsContainer}>
            {profile.instagram_url && (
              <Pressable
                style={styles.socialBtn}
                onPress={() => handleSocialLink(profile.instagram_url, 'Instagram')}
              >
                <Feather name="instagram" size={20} color="#e1306c" />
                <Text style={styles.socialLabel}>Instagram</Text>
              </Pressable>
            )}
            {profile.tiktok_url && (
              <Pressable
                style={styles.socialBtn}
                onPress={() => handleSocialLink(profile.tiktok_url, 'TikTok')}
              >
                <Feather name="music" size={20} color="#000" />
                <Text style={styles.socialLabel}>TikTok</Text>
              </Pressable>
            )}
            {profile.twitter_url && (
              <Pressable
                style={styles.socialBtn}
                onPress={() => handleSocialLink(profile.twitter_url, 'Twitter')}
              >
                <Feather name="twitter" size={20} color="#1da1f2" />
                <Text style={styles.socialLabel}>Twitter</Text>
              </Pressable>
            )}
            {profile.website_url && (
              <Pressable
                style={styles.socialBtn}
                onPress={() => handleSocialLink(profile.website_url, 'Site web')}
              >
                <Feather name="globe" size={20} color="#7c3aed" />
                <Text style={styles.socialLabel}>Website</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Reviews Section */}
      {profile.reviews && profile.reviews.length > 0 && (
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Avis ({profile.reviews.length})</Text>
          {profile.reviews.slice(0, 3).map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewStars}>
                  {[...Array(5)].map((_, i) => (
                    <Feather
                      key={i}
                      name={i < review.rating ? 'star' : 'star'}
                      size={14}
                      color={i < review.rating ? '#f59e0b' : '#cbd5e1'}
                    />
                  ))}
                </View>
                <Text style={styles.reviewName}>{review.client_name || 'Anonyme'}</Text>
              </View>
              {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Portfolio */}
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

      {/* Booking Button */}
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  avatar: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#e2e8f0',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 16,
  },
  categoryBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
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
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
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
  rateLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  rateValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7c3aed',
    marginTop: 4,
  },
  rateUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#94a3b8',
  },
  socialsSection: {
    marginTop: 24,
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  },
  socialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    minWidth: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  socialLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  reviewsSection: {
    marginTop: 24,
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  reviewItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  reviewComment: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  photosSection: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
  photosList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  photo: {
    width: 160,
    height: 200,
    borderRadius: 12,
  },
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
  bookBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
