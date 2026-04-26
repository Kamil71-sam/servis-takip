import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { login } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();

  const [role, setRole] = useState<'user' | 'expert'>('user');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const captchaRef = useRef<TextInput>(null);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ num1: n1, num2: n2, result: n1 + n2 });
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (role === 'user') {
      setEmail('');
      setPassword('');
    } else {
      setEmail(''); 
      setPassword('');
    }
  }, [role]);

  const handleLogin = async () => {
    // ====================================================================
    // 🛡️ MÜDÜRÜN GİZLİ GEÇİDİ (S1 KODU)
    // ====================================================================
    if (email === 'S1') {
      await AsyncStorage.setItem('userToken', 'mudur-gizli-token-1905');
      router.replace('/dashboard'); 
      return;
    }

    if (parseInt(captchaInput) !== captcha.result) {
      Alert.alert('Hatalı İşlem', 'Matematik mühürü tutmadı müdür!');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);

      if (!data.success) {
        Alert.alert('Giriş Başarısız', data.error || "Bilgiler hatalı");
        generateCaptcha();
        return;
      }

      // MÜDÜR: Sunucudan gelen VIP kartı (token) telefonun kalıcı hafızasına kaydediyoruz!
      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
      }

      // --- TRAFİK POLİSİ ---
      const userRole = data.user.role;

      setTimeout(() => {
        if (userRole === 'usta') {
          // Uzman girdiğinde gideceği yer (Yeni sayfa yapacağız)
          router.replace('/dashboard_uzman'); 
        } else {
          // Admin girdiğinde gideceği senin o meşhur ana butonların olduğu yer
          router.replace('/dashboard'); 
        }
      }, 100);

    } catch (error) {
      console.log("💥 GİZLİ HATA YAKALANDI:", error); // Terminale yazdırır
      Alert.alert('Gerçek Hata Ne?', String(error)); // Ekrana yazdırır
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="always"
            bounces={false}
          >
            <View style={styles.headerContainer}>
              <View style={styles.logoSquare}>
                <Ionicons name="shield-checkmark" size={40} color="#fff" />
              </View>
              <Text style={styles.brandName}>KALANDAR YAZILIM</Text>
              <Text style={styles.appTitle}>TEKNİK SERVİS TAKİP PROGRAMI</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Erişim Türü</Text>

              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'user' && styles.roleActive]}
                  onPress={() => setRole('user')}
                >
                  <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>
                    Kullanıcı
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, role === 'expert' && styles.roleActive]}
                  onPress={() => setRole('expert')}
                >
                  <Text style={[styles.roleText, role === 'expert' && styles.roleTextActive]}>
                    Uzman
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#666" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Personel Kodu veya E-posta"
                  placeholderTextColor="#888888"
                  autoCapitalize="none"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#666" style={{ marginRight: 10 }} />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Şifre"
                  placeholderTextColor="#888888"
                  secureTextEntry
                  onSubmitEditing={() => captchaRef.current?.focus()}
                />
              </View>

              <Text style={styles.label}>
                Doğrulama: {captcha.num1} + {captcha.num2} = ?
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons name="calculator-outline" size={18} color="#666" style={{ marginRight: 10 }} />
                <TextInput
                  ref={captchaRef}
                  style={styles.input}
                  value={captchaInput}
                  onChangeText={setCaptchaInput}
                  placeholder="Sonuç"
                  placeholderTextColor="#888888"
                  keyboardType="number-pad" 
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  importantForAutofill="no"
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SİSTEME GİRİŞ YAP</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 25, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 30, width: '100%' },
  logoSquare: {
    width: 65,
    height: 65,
    backgroundColor: '#333',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
  },
  brandName: { fontSize: 22, fontWeight: '900', color: '#333' },
  appTitle: { fontSize: 13, color: '#666', fontWeight: '900' },
  formContainer: { width: '100%' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, width: '100%' },
  roleButton: {
    width: '48%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fdfdfd',
  },
  roleActive: { backgroundColor: '#333', borderColor: '#333' },
  roleText: { fontSize: 13, color: '#666', fontWeight: 'bold' },
  roleTextActive: { color: '#fff' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#eee',
    paddingHorizontal: 10,
    height: 48,
  },
  input: { flex: 1, height: '100%', fontSize: 14, color: '#333' },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF3B30', 
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});