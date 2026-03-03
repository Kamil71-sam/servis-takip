import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Keyboard, findNodeHandle
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [role, setRole] = useState<'user' | 'expert'>('user');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const captchaRef = useRef<TextInput>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // HATASIZ ODAKLANMA: TypeScript hatalarını (ts2345) önlemek için tip kontrolü eklendi
  const handleFocus = (ref: React.RefObject<TextInput>) => {
    if (!ref.current || !scrollRef.current) return;
    
    setTimeout(() => {
      ref.current?.measureLayout(
        findNodeHandle(scrollRef.current) as number,
        (x, y) => {
          // Son girişte (Captcha) butonun tam görünmesi için y değerini daha çok itiyoruz
          const offset = ref === captchaRef ? y - 20 : y - 60;
          scrollRef.current?.scrollTo({ y: offset, animated: true });
        },
        () => {}
      );
    }, 200);
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
            contentContainerStyle={[styles.scrollContent, !isKeyboardVisible && { flex: 1, justifyContent: 'center' }]} 
            keyboardShouldPersistTaps="handled"
            scrollEnabled={isKeyboardVisible}
            bounces={false}
          >
            <View style={styles.headerContainer}>
              <View style={styles.logoSquare}>
                <Ionicons name="shield-checkmark" size={50} color="#fff" />
              </View>
              <Text style={styles.brandName}>KALANDAR YAZILIM</Text>
              <Text style={styles.appTitle}>Teknik Servis Takip v1.6</Text>
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
                <Ionicons name="mail-outline" size={20} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  ref={emailRef}
                  style={styles.input} 
                  placeholder="E-posta" 
                  returnKeyType="next"
                  onFocus={() => handleFocus(emailRef)}
                  onSubmitEditing={() => passwordRef.current?.focus()}
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
                  onFocus={() => handleFocus(passwordRef)}
                  onSubmitEditing={() => captchaRef.current?.focus()}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="calculator-outline" size={20} color="#666" style={{marginRight: 10}} />
                <TextInput 
                  ref={captchaRef}
                  style={styles.input} 
                  placeholder="Güvenlik Sonucu" 
                  keyboardType="numeric"
                  onFocus={() => handleFocus(captchaRef)}
                />
              </View>
              
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>SİSTEME GİRİŞ YAP</Text>
              </TouchableOpacity>
            </View>

            {/* BUTONU YUKARI İTEN DİNAMİK ALAN */}
            {isKeyboardVisible && <View style={{ height: 450 }} />} 
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 25 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logoSquare: { width: 85, height: 85, backgroundColor: '#333', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  brandName: { fontSize: 28, fontWeight: '900', color: '#333' },
  appTitle: { fontSize: 14, color: '#007bff', fontWeight: 'bold' },
  formContainer: { width: '100%' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  roleContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  roleButton: { flex: 1, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fdfdfd' },
  roleActive: { backgroundColor: '#333', borderColor: '#333' },
  roleText: { marginLeft: 8, fontSize: 14, color: '#666', fontWeight: 'bold' },
  roleTextActive: { color: '#fff' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, marginBottom: 15, borderWidth: 1.5, borderColor: '#eee', paddingHorizontal: 15, height: 60 },
  input: { flex: 1, height: '100%', fontSize: 16 },
  button: { width: '100%', height: 60, backgroundColor: '#333', borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});