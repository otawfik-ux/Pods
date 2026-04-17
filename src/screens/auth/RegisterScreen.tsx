import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { registerUser } from '../../services/auth';
import { isEduEmail, getUniversityFromEmail } from '../../constants/categories';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const detectedUniversity = email.includes('@') && isEduEmail(email) ? getUniversityFromEmail(email) : null;

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setFormError('');
    setEmailError(val.includes('@') && !isEduEmail(val) ? 'Please use a valid college email address.' : '');
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setFormError('');
    if (!val.length) {
      setPasswordError('');
      return;
    }

    setPasswordError(val.length < 6 ? 'Password must be at least 6 characters.' : '');
  };

  const showFormError = (message: string) => {
    setFormError(message);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert(message);
      }
      return;
    }

    Alert.alert('Registration Failed', message);
  };

  const handleRegister = async () => {
    setFormError('');
    if (!displayName.trim()) return showFormError('Please enter your name.');
    if (!isEduEmail(email)) return showFormError('Please use a valid college email address.');
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return showFormError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await registerUser(email.trim().toLowerCase(), password, displayName.trim());
    } catch (err: any) {
      showFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Join your campus community</Text>

          <View style={s.field}>
            <Text style={s.label}>Display Name</Text>
            <TextInput style={s.input} placeholder="Your name" placeholderTextColor={colors.subtext}
              value={displayName} onChangeText={setDisplayName} autoCapitalize="words" />
          </View>

          <View style={s.field}>
            <Text style={s.label}>College Email</Text>
            <TextInput style={[s.input, emailError ? s.inputError : null]} placeholder="you@university.edu"
              placeholderTextColor={colors.subtext} value={email} onChangeText={handleEmailChange}
              keyboardType="email-address" autoCapitalize="none" />
            {emailError ? (
              <Text style={s.errorText}>{emailError}</Text>
            ) : detectedUniversity ? (
              <View style={s.universityDetected}>
                <Text style={s.universityText}>🎓 {detectedUniversity}</Text>
              </View>
            ) : null}
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <TextInput style={[s.input, passwordError ? s.inputError : null]} placeholder="Min. 6 characters" placeholderTextColor={colors.subtext}
              value={password} onChangeText={handlePasswordChange} secureTextEntry />
            {passwordError ? <Text style={s.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity style={[s.submitBtn, loading && s.submitBtnDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.submitBtnText}>Create Account</Text>}
          </TouchableOpacity>

          {formError ? <Text style={s.formErrorText}>{formError}</Text> : null}

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginLink}>
            <Text style={s.loginLinkText}>Already have an account? <Text style={s.loginLinkBold}>Log In</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scroll: { padding: 24 },
  backBtn: { marginBottom: 24 },
  backBtnText: { fontSize: 16, color: c.primary, fontWeight: '500' },
  title: { fontSize: 30, fontWeight: '800', color: c.text, marginBottom: 6 },
  subtitle: { fontSize: 16, color: c.subtext, marginBottom: 32 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 8 },
  input: { backgroundColor: c.inputBackground, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.text, borderWidth: 1.5, borderColor: c.border },
  inputError: { borderColor: c.danger },
  errorText: { color: c.danger, fontSize: 12, marginTop: 6 },
  universityDetected: { backgroundColor: c.primaryGlow, borderRadius: 8, padding: 10, marginTop: 8 },
  universityText: { color: c.success, fontWeight: '600', fontSize: 13 },
  submitBtn: { backgroundColor: c.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 17 },
  formErrorText: { color: c.danger, fontSize: 13, textAlign: 'center', marginBottom: 16 },
  loginLink: { alignItems: 'center' },
  loginLinkText: { color: c.subtext, fontSize: 15 },
  loginLinkBold: { color: c.primary, fontWeight: '700' },
});
