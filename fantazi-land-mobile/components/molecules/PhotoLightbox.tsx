import { useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface PhotoLightboxProps {
  visible: boolean;
  photoUrl: string;
  onClose: () => void;
}

export function PhotoLightbox({ visible, photoUrl, onClose }: PhotoLightboxProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 10, mass: 1 });
    }
  }, [visible, scale]);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.backdrop}>
        {/* Dark background */}
        <Pressable style={styles.background} onPress={onClose} />

        {/* Image container */}
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: photoUrl }}
            style={[styles.image, animatedStyle]}
            resizeMode="contain"
          />
        </View>

        {/* Close button */}
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Feather name="x" size={24} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFill,
  },
  imageContainer: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
