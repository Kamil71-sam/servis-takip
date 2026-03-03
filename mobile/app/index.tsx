import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [role, setRole] = useState<'admin' | 'staff'>('admin'); // Varsayılan Yönetici
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaResult, setCaptchaResult] = useState({ num1: 0, num2: 0, sum: 0 });

  const passwordRef = useRef<TextInput>(null);
  const captchaRef = useRef<TextInput>(null);

  useEffect(() => { generateCaptcha(); }, []);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptchaResult({ num1: n1, num2: n2, sum: n1 + n2 });
    setCaptchaAnswer('');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            
            <View style={styles.headerContainer}>
              <View style={styles.logoSquare}>
                <Ionicons name="shield-checkmark" size={50} color="#fff" />
              </View>
              <Text style={styles.brandName}>KALANDAR YAZILIM</Text>
              <Text style={styles.appTitle}>Teknik Servis Takip v1.1</Text>
            </View>

            <View style={styles.formContainer}>
              {/* ROL SEÇİCİ ALANI */}
              <Text style={styles.label}>Giriş Yetkisi</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'admin' && styles.roleActive]} 
                  onPress={() => setRole('admin')}
                >
                  <Ionicons name="person" size={18} color={role === 'admin' ? '#fff' : '#666'} />
                  <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Yönetici</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.roleButton, role === 'staff' && styles.roleActive]} 
                  onPress={() => setRole('staff')}
                >
                  <Ionicons name="hammer" size={18} color={role === 'staff' ? '#fff' : '#666'} />
                  <Text style={[styles.roleText, role === 'staff' && styles.roleTextActive]}>Personel</Text>
                </TouchableOpacity>
              </View>

              {/* GİRİŞ ALANLARI */}
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  style={styles.input} 
                  placeholder="E-posta" 
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onChangeText={setEmail}
                />
              </View>
              
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  ref={passwordRef}
                  style={styles.input} 
                  placeholder="Şifre" 
                  secureTextEntry 
                  returnKeyType="next"
                  onSubmitEditing={() => captchaRef.current?.focus()}
                  onChangeText={setPassword}
                />
              </View>

              {/* GÜVENLİK SORUSU */}
              <Text style={styles.label}>Güvenlik: {captchaResult.num1} + {captchaResult.num2} = ?</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  ref={captchaRef}
                  style={styles.input} 
                  placeholder="Sonucu yazınız" 
                  keyboardType="numeric"
                  value={captchaAnswer}
                  onChangeText={setCaptchaAnswer}
                />
              </View>
              
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>SİSTEME GİRİŞ YAP</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logoSquare: { width: 80, height: 80, backgroundColor: '#333', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  brandName: { fontSize: 26, fontWeight: '900', color: '#333' },
  appTitle: { fontSize: 14, color: '#666' },
  formContainer: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, marginLeft: 5 },
  roleContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  roleButton: { flex: 1, height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#eee', backgroundColor: '#f9f9f9' },
  roleActive: { backgroundColor: '#333', borderColor: '#333' },
  roleText: { marginLeft: 8, fontSize: 14, color: '#666', fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdfdfd', borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee', paddingHorizontal: 15, height: 55 },
  input: { flex: 1, height: '100%', fontSize: 16 },
  button: { width: '100%', height: 55, backgroundColor: '#333', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});