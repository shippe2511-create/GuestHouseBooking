import { useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../constants/theme';
import { supabase } from '../lib/supabase';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  bucket?: string;
  folder?: string;
}

export default function ImagePicker({
  images,
  onImagesChange,
  maxImages = 5,
  bucket = 'images',
  folder = 'rooms',
}: ImagePickerProps) {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);

  const pickImage = async (useCamera = false) => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `Maximum ${maxImages} images allowed`);
      return;
    }

    const permissionMethod = useCamera
      ? ExpoImagePicker.requestCameraPermissionsAsync
      : ExpoImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionMethod();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        `Please grant ${useCamera ? 'camera' : 'photo library'} access`
      );
      return;
    }

    const launchMethod = useCamera
      ? ExpoImagePicker.launchCameraAsync
      : ExpoImagePicker.launchImageLibraryAsync;

    const result = await launchMethod({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

      onImagesChange([...images, urlData.publicUrl]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {images.map((uri, index) => (
          <View
            key={uri}
            style={{
              width: 100,
              height: 70,
              borderRadius: 8,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <Pressable
              onPress={() => removeImage(index)}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={12} color="#fff" strokeWidth={2.5} />
            </Pressable>
          </View>
        ))}

        {images.length < maxImages && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => pickImage(false)}
              disabled={uploading}
              style={({ pressed }) => ({
                width: 70,
                height: 70,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: theme.line,
                borderStyle: 'dashed',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: pressed ? theme.chip : 'transparent',
                opacity: uploading ? 0.5 : 1,
              })}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={colors.light.primary} />
              ) : (
                <ImagePlus size={20} color={theme.muted} strokeWidth={1.5} />
              )}
            </Pressable>

            <Pressable
              onPress={() => pickImage(true)}
              disabled={uploading}
              style={({ pressed }) => ({
                width: 70,
                height: 70,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: theme.line,
                borderStyle: 'dashed',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: pressed ? theme.chip : 'transparent',
                opacity: uploading ? 0.5 : 1,
              })}
            >
              <Camera size={20} color={theme.muted} strokeWidth={1.5} />
            </Pressable>
          </View>
        )}
      </View>

      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
          color: theme.muted,
        }}
      >
        {images.length}/{maxImages} images
      </Text>
    </View>
  );
}
