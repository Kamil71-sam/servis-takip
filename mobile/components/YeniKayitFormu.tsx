import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, Platform, ScrollView, Alert, KeyboardAvoidingView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniKayitFormu({ visible, onClose }: Props) {
  const [form, setForm] = useState({
    adSoyad: '', tel: '', email: '', adres: '', faks: '',
    marka: '', model: '', seriNo: '', garanti: 'Garantisiz',
    aksesuar: '', gorunum: '', not: '',
    personel: '', randevuTarihi: '', randevuDurumu: 'Beklemede'
  });

  const scrollRef = useRef<ScrollView>(null);
  // TÜM ZİNCİRİ BURAYA MÜHÜRLEDİK
  const r1 = useRef<TextInput>(null); // Ad Soyad
  const r2 = useRef<TextInput>(null); // Tel
  const r3 = useRef<TextInput>(null); // Email
  const r4 = useRef<TextInput>(null); // Adres
  const r5 = useRef<TextInput>(null); // Faks
  const r6 = useRef<TextInput>(null); // Marka
  const r7 = useRef<TextInput>(null); // Model
  const r8 = useRef<TextInput>(null); // Seri No
  const r9 = useRef<TextInput>(null); // Arıza/Çizik Notu
  const r10 = useRef<TextInput>(null); // Personel

  const handleFocus = (y: number) => {
    scrollRef.current?.scrollTo({ y, animated: true });
  };

  const handleSave = async () => {
    if (!form.adSoyad || !form.tel || !form.email) {
      Alert.alert("Dur Müdür!", "Ad, Tel ve Email zorunludur!");
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
        Alert.alert("MÜHÜRLENDİ!", `Takip No: ${data.id}`);
        onClose();
      }
    } catch (error) {
      Alert.alert("Hata", "Server'a ulaşılamadı kaptan!");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onShow={() => setTimeout(() => r1.current?.focus(), 300)}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
          
          <View style={styles.header}>
            <Text style={styles.title}>TEKNİK SERVİS KAYIT FORMU</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={35} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView ref={scrollRef} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
            
            <View style={styles.section}><Text style={styles.st}>1. KİŞİSEL / FİRMA BİLGİLERİ</Text></View>
            
            <Text style={styles.L}>AD SOYAD / FİRMA ADI *</Text>
            <TextInput ref={r1} style={styles.I} placeholder="Müşteri Kimliği" returnKeyType="next" onSubmitEditing={() => r2.current?.focus()} onChangeText={(v)=>setForm({...form, adSoyad: v})} onFocus={() => handleFocus(0)} />

            <View style={styles.row}>
              <View style={{flex:1}}><Text style={styles.L}>TEL *</Text>
              <TextInput ref={r2} style={styles.I} keyboardType="numeric" returnKeyType="next" onSubmitEditing={() => r3.current?.focus()} onChangeText={(v)=>setForm({...form, tel: v})} onFocus={() => handleFocus(50)} /></View>
              <View style={{flex:1}}><Text style={styles.L}>EMAIL *</Text>
              <TextInput ref={r3} style={styles.I} autoCapitalize="none" returnKeyType="next" onSubmitEditing={() => r4.current?.focus()} onChangeText={(v)=>setForm({...form, email: v})} onFocus={() => handleFocus(50)} /></View>
            </View>

            <Text style={styles.L}>ADRES</Text>
            <TextInput ref={r4} style={styles.I} placeholder="Adres Bilgisi" returnKeyType="next" onSubmitEditing={() => r5.current?.focus()} onChangeText={(v)=>setForm({...form, adres: v})} onFocus={() => handleFocus(100)} />

            <Text style={styles.L}>FAKS</Text>
            <TextInput ref={r5} style={styles.I} placeholder="Faks No" returnKeyType="next" onSubmitEditing={() => r6.current?.focus()} onChangeText={(v)=>setForm({...form, faks: v})} onFocus={() => handleFocus(150)} />

            <View style={styles.section}><Text style={styles.st}>2. CİHAZ VE ARIZA BİLGİLERİ</Text></View>

            <View style={styles.row}>
              <View style={{flex:1}}><Text style={styles.L}>MARKA</Text>
              <TextInput ref={r6} style={styles.I} returnKeyType="next" onSubmitEditing={() => r7.current?.focus()} onChangeText={(v)=>setForm({...form, marka: v})} onFocus={() => handleFocus(220)} /></View>
              <View style={{flex:1}}><Text style={styles.L}>MODEL</Text>
              <TextInput ref={r7} style={styles.I} returnKeyType="next" onSubmitEditing={() => r8.current?.focus()} onChangeText={(v)=>setForm({...form, model: v})} onFocus={() => handleFocus(220)} /></View>
            </View>

            <Text style={styles.L}>SERİ NO / GARANTİ DURUMU</Text>
            <TextInput ref={r8} style={styles.I} placeholder="Cihaz Seri No" returnKeyType="next" onSubmitEditing={() => r9.current?.focus()} onChangeText={(v)=>setForm({...form, seriNo: v})} onFocus={() => handleFocus(300)} />

            <Text style={styles.L}>AKSESUAR / GÖRÜNÜM / ARIZA NOTU</Text>
            <TextInput ref={r9} style={[styles.I, {height: 60}]} placeholder="Çizik, Kırık, Şarj aleti vb." returnKeyType="next" onSubmitEditing={() => r10.current?.focus()} onChangeText={(v)=>setForm({...form, not: v})} onFocus={() => handleFocus(350)} />

            <View style={styles.section}><Text style={styles.st}>3. PERSONEL VE RANDEVU</Text></View>

            <Text style={styles.L}>YÖNLENDİRİLECEK PERSONEL</Text>
            <TextInput ref={r10} style={styles.I} placeholder="Usta Adı" returnKeyType="done" onChangeText={(v)=>setForm({...form, personel: v})} onFocus={() => handleFocus(450)} />

            <View style={{height: 350}} />
          </ScrollView>

          <TouchableOpacity style={styles.btn} onPress={handleSave}>
            <Ionicons name="save-outline" size={22} color="#fff" style={{marginRight: 10}} />
            <Text style={styles.btntxt}>KAYDI SİSTEME MÜHÜRLE</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '95%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 18, fontWeight: '900', color: '#000' },
  section: { padding: 10, borderRadius: 10, marginBottom: 12, marginTop: 15, backgroundColor: '#444' }, // 2 NUMARALI ETİKET RENGİ
  st: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  L: { fontSize: 10, fontWeight: '900', color: '#666', marginBottom: 4, marginTop: 4, marginLeft: 5 },
  I: { backgroundColor: '#f8f8f8', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, height: 48, fontSize: 14, color: '#000', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10 },
  btn: { backgroundColor: '#444', height: 60, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }, // BUTON RENGİ 2 NUMARA
  btntxt: { color: '#fff', fontSize: 16, fontWeight: '900' }
});