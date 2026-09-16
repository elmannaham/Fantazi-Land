import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Dimensions,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { fetchProfiles } from '../../lib/api/profiles';
import { PhotoLightbox } from '../../components/molecules/PhotoLightbox';
import type { ProfileWithStats, MediaAsset } from '../../lib/types';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GAP = 12;
const ITEM_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

interface GalleryItem extends MediaAsset {
  creatorName: string;
}

export default function PortfolioScreen() {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const allMedia = useMemo(() => {
    const items: GalleryItem[] = [];
    profiles.forEach((p) => {
      (p.media_assets || [])
        .filter((m) => m.file_type === 'image')
        .forEach((m) => {
          items.push({
            ...m,
            creatorName: p.name,
          });
        });
    });
    return items.sort(() => Math.random() - 0.5);
  }, [profiles]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchProfiles({ limit: 50 });
      setProfiles(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  const renderItem = useCallback(
    ({ item, index }: { item: GalleryItem; index: number }) => {
      const isLeftColumn = index % COLUMN_COUNT === 0;
      const marginRight = isLeftColumn ? GAP / 2 : 0;
      const marginLeft = !isLeftColumn ? GAP / 2 : 0;

      return (
        <Pressable
          style={[styles.imageWrapper, { marginRight, marginLeft }]}
          onPress={() => setSelectedImage(item.file_url)}
        >
          <Image
            source={{ uri: item.file_url }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.overlay}>
            <Text style={styles.creatorName} numberOfLines={1}>
              {item.creatorName}
            </Text>
          </View>
        </Pressable>
      );
    },
    []
  );

  if (isLoading && allMedia.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Chargement du portfolio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={allMedia}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#7c3aed"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Portfolio Exclusif</Text>
            <Text style={styles.subtitle}>
              {allMedia.length} photos et vidéos des créateurs
            </Text>
          </View>
        }
        renderItem={renderItem}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Feather name="image" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {error || 'Aucune photo disponible'}
              </Text>
              {error && (
                <Pressable style={styles.retryBtn} onPress={loadData}>
                  <Text style={styles.retryBtnText}>Réessayer</Text>
                </Pressable>
              )}
            </View>
          ) : null
        }
      />

      <PhotoLightbox
        visible={selectedImage !== null}
        photoUrl={selectedImage || ''}
        onClose={() => setSelectedImage(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
  },
  imageWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  creatorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
