import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Keyboard, Dimensions 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router'; // useRouter eklendi

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter(); // Sayfa geçişi için anahtar
  const [role, setRole] = useState<'user' | 'expert'>('user');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  const scrollRef = useRef<ScrollView>(null);
  const passwordRef = useRef<TextInput>(null);
  const captchaRef = useRef<TextInput>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Dashboard'a gitme fonksiyonu
  const handleLogin = () => {
    // Şimdilik direkt geçiş yapıyoruz, ilerde şifre kontrolü ekleyeceğiz
    router.replace('/dashboard'); 
  };

  const handleNextFocus = (nextRef: React.RefObject<TextInput | null>, scrollY: number) => {
    nextRef.current?.focus();
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: scrollY, animated: true });
    }, 50);
  };

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            ref={scrollRef}
            contentContainerStyle={[
              styles.scrollContent, 
              !isKeyboardVisible && { height: SCREEN_HEIGHT - 60 }
            ]} 
            scrollEnabled={isKeyboardVisible}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.headerContainer}>
              <View style={styles.logoSquare}>
                <Ionicons name="shield-checkmark" size={40} color="#fff" />
              </View>
              <Text style={styles.brandName}>KALANDAR YAZILIM</Text>
              <Text style={styles.appTitle}>Teknik Servis Takip Programı</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Erişim Türü</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'user' && styles.roleActive]} 
                  onPress={() => setRole('user')}
                >
                  <Ionicons name="person-circle" size={18} color={role === 'user' ? '#fff' : '#666'} />
                  <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Kullanıcı</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'expert' && styles.roleActive]} 
                  onPress={() => setRole('expert')}
                >
                  <Ionicons name="construct" size={18} color={role === 'expert' ? '#fff' : '#666'} />
                  <Text style={[styles.roleText, role === 'expert' && styles.roleTextActive]}>Uzman</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  style={styles.input} 
                  placeholder="E-posta" 
                  autoCapitalize="none"
                  returnKeyType="next"
                  onFocus={() => scrollRef.current?.scrollTo({ y: 150, animated: true })}
                  onSubmitEditing={() => handleNextFocus(passwordRef, 230)}
                />
              </View>
              
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  ref={passwordRef}
                  style={styles.input} 
                  placeholder="Şifre" 
                  secureTextEntry 
                  returnKeyType="next"
                  onFocus={() => scrollRef.current?.scrollTo({ y: 230, animated: true })}
                  onSubmitEditing={() => handleNextFocus(captchaRef, 330)}
                />
              </View>

              <Text style={styles.label}>Doğrulama: 3 + 2 = ?</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calculator-outline" size={18} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  ref={captchaRef}
                  style={styles.input} 
                  placeholder="Sonuç" 
                  keyboardType="numeric"
                  returnKeyType="done"
                  onFocus={() => scrollRef.current?.scrollTo({ y: 330, animated: true })}
                  onSubmitEditing={handleLogin}
                />
              </View>
              
              <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleLogin}>
                <Text style={styles.buttonText}>SİSTEME GİRİŞ YAP</Text>
              </TouchableOpacity>
            </View>

            {isKeyboardVisible && <View style={{ height: SCREEN_HEIGHT * 0.55 }} />}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 60 }, 
  headerContainer: { alignItems: 'center', marginBottom: 15 }, 
  logoSquare: { width: 65, height: 65, backgroundColor: '#333', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }, 
  brandName: { fontSize: 22, fontWeight: '900', color: '#333' },
  appTitle: { fontSize: 13, color: '#666', fontWeight: '600' }, 
  formContainer: { width: '100%', marginTop: 35 }, 
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  roleContainer: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  roleButton: { flex: 1, height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fdfdfd' },
  roleActive: { backgroundColor: '#333', borderColor: '#333' },
  roleText: { marginLeft: 8, fontSize: 13, color: '#666', fontWeight: 'bold' },
  roleTextActive: { color: '#fff' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, borderWidth: 1.5, borderColor: '#eee', paddingHorizontal: 10, height: 48 },
  input: { flex: 1, height: '100%', fontSize: 14, color: '#333' },
  button: { width: '100%', height: 50, backgroundColor: '#333', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});