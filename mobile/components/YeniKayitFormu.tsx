import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, Alert, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniKayitFormu({ visible, onClose }: Props) {
  const [form, setForm] = useState({
    adSoyad: '', tel: '', email: '', adres: '', faks: '',
    marka: '', model: '', seriNo: '', not: '', personel: ''
  });

  const scrollRef = useRef<ScrollView>(null);
  const r = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  // --- SARSINTI ENGELLİ KAYDIRMA (Zıplamayı Bitirir) ---
  const goTo = (y: number) => {
    // ScrollView'ı önce durdurup sonra kaydırıyoruz ki 'bounce' yapmasın
    scrollRef.current?.scrollTo({ y, animated: false }); 
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 50);
  };

  const handleSave = async () => {
    if (!form.adSoyad || !form.tel || !form.email) {
      Alert.alert("Eksik", "Zorunlu alanları doldurmadan mühür basılmaz!");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/yeni-servis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("BAŞARILI!", `Takip No: ${data.id}`);
        onClose();
      }
    } catch (error) {
      Alert.alert("Hata", "Server bağlantısı yok müdür!");
    }
  };

  return (
    <Modal visible={visible} animationType="none" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>TEKNİK SERVİS KAYIT FORMU</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={35} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollRef} 
            keyboardShouldPersistTaps="always" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 700 }}
          >
            <View style={styles.section}><Text style={styles.st}>1. KİŞİSEL / FİRMA BİLGİLERİ</Text></View>
            <Text style={styles.L}>AD SOYAD / FİRMA ADI *</Text>
            <TextInput ref={r[0]} style={styles.I} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => r[1].current?.focus()} onChangeText={(v)=>setForm({...form, adSoyad: v})} onFocus={() => goTo(0)} />

            <View style={styles.row}>
              <View style={{flex:1}}><Text style={styles.L}>TEL *</Text>
              <TextInput ref={r[1]} style={styles.I} keyboardType="numeric" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => r[2].current?.focus()} onChangeText={(v)=>setForm({...form, tel: v})} onFocus={() => goTo(30)} /></View>
              <View style={{flex:1}}><Text style={styles.L}>EMAIL *</Text>
              <TextInput ref={r[2]} style={styles.I} autoCapitalize="none" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => r[3].current?.focus()} onChangeText={(v)=>setForm({...form, email: v})} onFocus={() => goTo(30)} /></View>
            </View>

            <Text style={styles.L}>ADRES</Text>
            <TextInput ref={r[3]} style={styles.I} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => r[4].current?.focus()} onChangeText={(v)=>setForm({...form, adres: v})} onFocus={() => goTo(110)} />
            <Text style={styles.L}>FAKS</Text>
            <TextInput ref={r[4]} style={styles.I} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => r[5].current?.focus()} onChangeText={(v)=>setForm({...form, faks: v})} onFocus={() => goTo(170)} />

            <View style={styles.section}><Text style={styles.st}>2. CİHAZ VE ARIZA BİLGİLERİ</Text></View>
            <View style={styles.row}>
              <View style={{flex:1}}><Text style={styles.L}>MARKA</Text>
              <TextInput ref={r[5]} style={styles.I} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => r[6].current?.focus()} onChangeText={(v)=>setForm({...form, marka: v})} onFocus={() => goTo(250)} /></View>
              <View style={{flex:1}}><Text style={styles.L}>MODEL</Text>
              <TextInput ref={r[6]} style={styles.I} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => r[7].current?.focus()} onChangeText={(v)=>setForm({...form, model: v})} onFocus={() => goTo(250)} /></View>
            </View>

            <Text style={styles.L}>SERİ NO</Text>
            <TextInput ref={r[7]} style={styles.I} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => r[8].current?.focus()} onChangeText={(v)=>setForm({...form, seriNo: v})} onFocus={() => goTo(330)} />
            
            <Text style={styles.L}>AKSESUAR / GÖRÜNÜM / ARIZA NOTU</Text>
            {/* Zıplamayı kesmek için 390'a mühürledik */}
            <TextInput ref={r[8]} style={[styles.I, {height: 48}]} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => r[9].current?.focus()} onChangeText={(v)=>setForm({...form, not: v})} onFocus={() => goTo(390)} />

            <View style={styles.section}><Text style={styles.st}>3. PERSONEL VE RANDEVU</Text></View>
            <Text style={styles.L}>YÖNLENDİRİLECEK PERSONEL</Text>
            <TextInput ref={r[9]} style={styles.I} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} onChangeText={(v)=>setForm({...form, personel: v})} onFocus={() => goTo(530)} />
          </ScrollView>

          <TouchableOpacity style={styles.btn} onPress={handleSave}>
            <Text style={styles.btntxt}>KAYDI SİSTEME MÜHÜRLE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '95%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '900' },
  section: { padding: 10, borderRadius: 10, marginBottom: 8, marginTop: 15, backgroundColor: '#444' }, // ANTRASİT
  st: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  L: { fontSize: 10, fontWeight: '900', color: '#666', marginBottom: 4, marginTop: 4, marginLeft: 5 },
  I: { backgroundColor: '#f9f9f9', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, height: 48, fontSize: 14, color: '#000', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10 },
  btn: { backgroundColor: '#444', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btntxt: { color: '#fff', fontSize: 16, fontWeight: '900' }
});