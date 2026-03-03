import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Küçük logo/ikon için

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.innerContainer}>
        
        {/* LOGO VE BAŞLIK BÖLÜMÜ */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="construct" size={40} color="#fff" />
          </View>
          <Text style={styles.brandName}>KALANDAR YAZILIM</Text>
          <Text style={styles.appTitle}>Teknik Servis Takip Programı</Text>
        </View>

        {/* GİRİŞ ALANLARI */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="E-posta" 
              placeholderTextColor="#999"
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Şifre" 
              placeholderTextColor="#999"
              secureTextEntry 
              onChangeText={setPassword}
            />
          </View>
          
          <TouchableOpacity style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>SİSTEME GİRİŞ YAP</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.footerText}>© 2026 Kalandar Yazılım | Güvenli Erişim</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 25 },
  headerContainer: { alignItems: 'center', marginBottom: 50 },
  logoCircle: { width: 80, height: 80, backgroundColor: '#007bff', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 },
  brandName: { fontSize: 28, fontWeight: '900', color: '#333', letterSpacing: 1 },
  appTitle: { fontSize: 16, color: '#007bff', fontWeight: '600', marginTop: 5 },
  formContainer: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee', paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 55, fontSize: 16, color: '#333' },
  button: { width: '100%', height: 55, backgroundColor: '#333', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 3 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerText: { marginTop: 40, color: '#bbb', textAlign: 'center', fontSize: 11 }
});