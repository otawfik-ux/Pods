import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PodsStackParamList, PodCategory } from '../../types';
import { PodBannerColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { POD_CATEGORIES } from '../../constants/categories';
import { useAuth } from '../../context/AuthContext';
import { createPod } from '../../services/pods';
import CategoryChip from '../../components/CategoryChip';

type Props = { navigation: NativeStackNavigationProp<PodsStackParamList, 'CreatePod'> };

export default function CreatePodScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { userProfile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PodCategory>('Social');
  const [isPrivate, setIsPrivate] = useState(false);
  const [bannerColor, setBannerColor] = useState(PodBannerColors[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Please enter a pod name');
    if (!description.trim()) return Alert.alert('Error', 'Please enter a description');
    if (!userProfile) return;
    setLoading(true);
    try {
      const podId = await createPod({ name: name.trim(), description: description.trim(), category, visibility: isPrivate ? 'private' : 'public', bannerColor, createdBy: userProfile.uid }, userProfile.uid);
      await refreshProfile();
      navigation.replace('PodDetail', { podId });
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={s.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={26} color={colors.text} /></TouchableOpacity>
          <Text style={s.navTitle}>Create Pod</Text>
          <TouchableOpacity onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={s.createBtn}>Create</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={[s.previewBanner, { backgroundColor: bannerColor }]}>
            <Text style={s.previewBannerText}>{name ? name[0].toUpperCase() : '?'}</Text>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Pod Name *</Text>
            <TextInput style={s.input} placeholder="e.g. BU Basketball Club" placeholderTextColor={colors.subtext}
              value={name} onChangeText={setName} maxLength={50} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Description *</Text>
            <TextInput style={[s.input, s.textarea]} placeholder="What is this pod about?" placeholderTextColor={colors.subtext}
              value={description} onChangeText={setDescription} multiline numberOfLines={3} maxLength={200} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Category *</Text>
            <View style={s.chipsRow}>
              {POD_CATEGORIES.map((cat) => (
                <CategoryChip key={cat} label={cat} selected={category === cat} onPress={() => setCategory(cat)} />
              ))}
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Banner Color</Text>
            <View style={s.colorRow}>
              {PodBannerColors.map((color) => (
                <TouchableOpacity key={color} style={[s.colorSwatch, { backgroundColor: color }, bannerColor === color && s.colorSwatchSelected]} onPress={() => setBannerColor(color)}>
                  {bannerColor === color && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.switchRow}>
            <View style={s.switchInfo}>
              <Text style={s.switchLabel}>Private Pod</Text>
              <Text style={s.switchSub}>Only joinable by invite link</Text>
            </View>
            <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ true: colors.primary }} thumbColor="#FFFFFF" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
  navTitle: { fontSize: 17, fontWeight: '700', color: c.text },
  createBtn: { fontSize: 17, fontWeight: '700', color: c.primary },
  previewBanner: { height: 120, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  previewBannerText: { fontSize: 48, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  scroll: { padding: 20, paddingBottom: 60 },
  field: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 10 },
  input: { backgroundColor: c.inputBackground, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: c.text, borderWidth: 1.5, borderColor: c.border },
  textarea: { height: 90, textAlignVertical: 'top' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  colorSwatchSelected: { borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12, padding: 16 },
  switchInfo: { flex: 1 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: c.text },
  switchSub: { fontSize: 12, color: c.subtext, marginTop: 2 },
});
