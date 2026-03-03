import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Keyboard, Dimensions 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
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

  const handleNextFocus = (nextRef: React.RefObject<TextInput | null>, scrollY: number) => {
    nextRef.current?.focus();
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: scrollY, animated: true });
    }, 50);
  };

  return (
    <SafeAreaProvider>
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
              !isKeyboardVisible && { height: SCREEN_HEIGHT - 40 } // Ekranı tam sığdırmak için pay bırakıldı
            ]} 
            scrollEnabled={isKeyboardVisible}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* LOGO BÖLÜMÜ - BOŞLUKLAR VE BOYUT KÜÇÜLTÜLDÜ */}
            <View style={styles.headerContainer}>
              <View style={styles.logoSquare}>
                <Ionicons name="shield-checkmark" size={45} color="#fff" />
              </View>
              <Text style={styles.brandName}>KALANDAR YAZILIM</Text>
              <Text style={styles.appTitle}>Teknik Servis Takip v1.5</Text>
            </View>

            {/* FORM ALANI - KUTUCUK VE YAZI BOYUTLARI DARALTILDI */}
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
                  onFocus={() => scrollRef.current?.scrollTo({ y: 50, animated: true })}
                  onSubmitEditing={() => handleNextFocus(passwordRef, 140)}
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
                  onFocus={() => scrollRef.current?.scrollTo({ y: 140, animated: true })}
                  onSubmitEditing={() => handleNextFocus(captchaRef, 240)}
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
                  onFocus={() => scrollRef.current?.scrollTo({ y: 240, animated: true })}
                />
              </View>
              
              <TouchableOpacity style={styles.button} activeOpacity={0.8}>
                <Text style={styles.buttonText}>SİSTEME GİRİŞ YAP</Text>
              </TouchableOpacity>
            </View>

            {isKeyboardVisible && <View style={{ height: SCREEN_HEIGHT * 0.45 }} />}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 25, paddingVertical: 10, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 20 }, // Boşluk daraltıldı
  logoSquare: { width: 75, height: 75, backgroundColor: '#333', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 4 }, // Boyut küçültüldü
  brandName: { fontSize: 24, fontWeight: '900', color: '#333', letterSpacing: 1 }, // Yazı küçültüldü
  appTitle: { fontSize: 13, color: '#007bff', fontWeight: 'bold' },
  formContainer: { width: '100%' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 6 }, // Etiket küçültüldü
  roleContainer: { flexDirection: 'row', marginBottom: 15, gap: 10 }, // Boşluk daraltıldı
  roleButton: { flex: 1, height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fdfdfd' }, // Yükseklik azaldı
  roleActive: { backgroundColor: '#333', borderColor: '#333' },
  roleText: { marginLeft: 8, fontSize: 13, color: '#666', fontWeight: 'bold' },
  roleTextActive: { color: '#fff' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, borderWidth: 1.5, borderColor: '#eee', paddingHorizontal: 12, height: 52 }, // Yükseklik ve padding azaldı
  input: { flex: 1, height: '100%', fontSize: 15, color: '#333' }, // Harf boyutu küçültüldü
  button: { width: '100%', height: 55, backgroundColor: '#333', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 3 }, // Yükseklik azaldı
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' } // Yazı boyutu ayarlandı
});