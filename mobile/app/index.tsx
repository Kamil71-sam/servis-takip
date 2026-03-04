import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, Keyboard 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'expert'>('user');
  const [email, setEmail] = useState('user@kalandar.com');
  const [password, setPassword] = useState('user123');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });

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
      setEmail('user@kalandar.com');
      setPassword('user123');
    } else {
      setEmail('expert1@kalandar.com');
      setPassword('expert123');
    }
  }, [role]);

  // ANA2: Klavyeyi kapatan ama girişi tetiklemeyen yeni fonksiyon
  const handleDone = () => {
    Keyboard.dismiss(); // Klavyeyi indirir
    // Buraya router.push eklemiyoruz ki direkt girmesin, butona basmanı beklesin.
  };

  const handleLogin = () => {
    if (parseInt(captchaInput) !== captcha.result) {
      Alert.alert("Hatalı İşlem", "Matematik mühürü tutmadı müdür!");
      generateCaptcha();
      return;
    }
    
    if (role === 'user' && email !== 'user@kalandar.com') {
      Alert.alert("Hata", "Kullanıcı seçiliyken sadece kullanıcı maili ile girebilirsin.");
      generateCaptcha();
      return;
    }

    if (role === 'expert' && !email.startsWith('expert')) {
      Alert.alert("Hata", "Uzman seçiliyken uzman maili girmelisin.");
      generateCaptcha();
      return;
    }

    router.push('/dashboard'); 
    setTimeout(() => generateCaptcha(), 500);
  };

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'android' ? 30 : 0} 
        >
          <ScrollView 
            scrollEnabled={false} 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="always" 
            bounces={false} 
          >
            <View style={styles.headerContainer}>
              <View style={styles.logoSquare}><Ionicons name="shield-checkmark" size={40} color="#fff" /></View>
              <Text style={styles.brandName}>KALANDAR YAZILIM</Text>
              <Text style={styles.appTitle}>TEKNİK SERVİS TAKİP PROGRAMI</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Erişim Türü</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity style={[styles.roleButton, role === 'user' && styles.roleActive]} onPress={() => setRole('user')}>
                  <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Kullanıcı</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.roleButton, role === 'expert' && styles.roleActive]} onPress={() => setRole('expert')}>
                  <Text style={[styles.roleText, role === 'expert' && styles.roleTextActive]}>Uzman</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  style={styles.input} 
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-posta" 
                  autoCapitalize="none" 
                  blurOnSubmit={false} 
                  onSubmitEditing={() => passwordRef.current?.focus()} 
                />
              </View>
              
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  ref={passwordRef} 
                  style={styles.input} 
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Şifre" 
                  secureTextEntry 
                  blurOnSubmit={false} 
                  onSubmitEditing={() => captchaRef.current?.focus()} 
                />
              </View>

              <Text style={styles.label}>Doğrulama: {captcha.num1} + {captcha.num2} = ?</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calculator-outline" size={18} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  ref={captchaRef} 
                  style={styles.input} 
                  value={captchaInput}
                  onChangeText={setCaptchaInput}
                  placeholder="Sonuç" 
                  keyboardType="numeric" 
                  returnKeyType="done"
                  onSubmitEditing={handleDone} // ARTIK DİREKT GİRMEZ, KLAVYEYİ KAPATIR
                />
              </View>
              
              <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleLogin}>
                <Text style={styles.buttonText}>SİSTEME GİRİŞ YAP</Text>
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
  scrollContent: { flex: 1, paddingHorizontal: 25, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 20, width: '100%' }, 
  logoSquare: { width: 65, height: 65, backgroundColor: '#333', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }, 
  brandName: { fontSize: 22, fontWeight: '900', color: '#333' },
  appTitle: { fontSize: 13, color: '#666', fontWeight: '900' },
  formContainer: { width: '100%' }, 
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  roleContainer: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  roleButton: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fdfdfd' },
  roleActive: { backgroundColor: '#333', borderColor: '#333' },
  roleText: { fontSize: 13, color: '#666', fontWeight: 'bold' },
  roleTextActive: { color: '#fff' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, borderWidth: 1.5, borderColor: '#eee', paddingHorizontal: 10, height: 48 },
  input: { flex: 1, height: '100%', fontSize: 14, color: '#333' },
  button: { width: '100%', height: 50, backgroundColor: '#333', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});