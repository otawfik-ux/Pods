import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';

// WelcomeScreen keeps its own branded purple — theme-independent
type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'> };

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>PODS</Text>
          <View style={styles.logoDot} />
        </View>
        <Text style={styles.tagline}>Do what you want to do,{'\n'}with good company.</Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '🏘️', label: 'Join campus communities' },
          { icon: '📅', label: 'Coordinate real activities' },
          { icon: '💬', label: 'Temporary group chats' },
        ].map((f) => (
          <View key={f.label} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6C63FF' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logoText: { fontSize: 64, fontWeight: '900', color: '#FFFFFF', letterSpacing: 8 },
  logoDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFFFFF', marginTop: -8 },
  tagline: { fontSize: 20, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 30 },
  features: { paddingHorizontal: 40, marginBottom: 32 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  featureIcon: { fontSize: 22, marginRight: 16 },
  featureLabel: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  buttons: { paddingHorizontal: 24, paddingBottom: 40 },
  primaryBtn: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#6C63FF', fontWeight: '700', fontSize: 17 },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
});
