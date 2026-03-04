import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // TÜL EFEKTİ İÇİN

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniMusteriFormu({ visible, onClose }: Props) {
  const [customer, setCustomer] = useState({ adSoyad: '', tel: '', faks: '', email: '', adres: '' });
  const r1=useRef<TextInput>(null); const r2=useRef<TextInput>(null); const r3=useRef<TextInput>(null); const r4=useRef<TextInput>(null); const r5=useRef<TextInput>(null);

  const handleSave = async () => {
    if (!customer.adSoyad || !customer.tel) { Alert.alert("HATA", "Ad Soyad ve Telefon girmeden kayıt yapılamaz!"); return; }
    try {
      const response = await fetch('http://192.168.1.43:5000/api/customers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(customer)
      });
      if ((await response.json()).success) {
        Keyboard.dismiss();
        Alert.alert("BAŞARILI", "Kayıt başarıyla tamamlandı.", [{ text: "Tamam", onPress: () => onClose() }]);
      }
    } catch (err) { Alert.alert("HATA", "Sunucu bağlantısı koptu!"); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.overlay}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 50} // Asansör dengesi
      >
        <View style={styles.modalContent}>
          
          {/* --- ÜST TÜL (GRADYAN) --- */}
          <LinearGradient colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']} style={styles.topGradient} pointerEvents="none" />

          <View style={styles.header}>
            <View style={styles.titleBadge}>
              <Text style={styles.title}>YENİ MÜŞTERİ KARTI</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={38} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
            <View style={styles.sectionDivider}><Text style={styles.sectionText}>KİMLİK VE İLETİŞİM</Text></View>
            
            <Text style={styles.label}>AD SOYAD / ÜNVAN *</Text>
            <TextInput ref={r1} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r2.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setCustomer({...customer, adSoyad: v})} />

            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}><Text style={styles.label}>TELEFON *</Text>
              <TextInput ref={r2} style={styles.input} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setCustomer({...customer, tel: v})} /></View>
              <View style={{flex: 1}}><Text style={styles.label}>FAKS</Text>
              <TextInput ref={r3} style={styles.input} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setCustomer({...customer, faks: v})} /></View>
            </View>

            <Text style={styles.label}>E-POSTA ADRESİ</Text>
            <TextInput ref={r4} style={styles.input} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" onSubmitEditing={()=>r5.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setCustomer({...customer, email: v})} />

            <Text style={styles.label}>TAM ADRES</Text>
            <TextInput ref={r5} style={[styles.input, {height: 65}]} returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} onChangeText={(v)=>setCustomer({...customer, adres: v})} />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}><Text style={styles.saveButtonText}>KAYDI TAMAMLA</Text></TouchableOpacity>
          </ScrollView>

          {/* --- ALT TÜL (GRADYAN) - PASTA GRAFİĞİ KAPATMAK İÇİN --- */}
          <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']} style={styles.bottomGradient} pointerEvents="none" />
        
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 25, 
    height: '93%', // Zemin mühürü için boyu uzattık
    paddingBottom: 0, // Alt tül için boşluğu sıfırladık
    marginTop: 20, // 0.5 cm aşağı kaydırma
    elevation: 15,
    overflow: 'hidden' // Tüllerin taşmaması için
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, zIndex: 10 },
  titleBadge: { backgroundColor: '#2C2C2C', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15 }, 
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  scrollContent: { paddingBottom: 60 }, // Alt tülün altında kalmamak için
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 40, zIndex: 5, borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, zIndex: 5 },
  sectionDivider: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 10, marginVertical: 10 },
  sectionText: { fontSize: 11, fontWeight: 'bold', color: '#666', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 5 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e9ecef', borderRadius: 12, padding: 14, fontSize: 16, color: '#000' },
  row: { flexDirection: 'row' },
  saveButton: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 35, marginBottom: 10, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' }
});