import React, { useState, useRef, useEffect } from 'react';
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
  // İlk açılışta ve kapanışta temizlik için başlangıç durumu
  const initialState = {
    adSoyad: '', tel: '', email: '', adres: '', faks: '',
    marka: '', model: '', seriNo: '', not: '', personel: ''
  };

  const [form, setForm] = useState(initialState);

  // MÜHÜR: Sayfa her açıldığında formu sıfırla
  useEffect(() => {
    if (visible) {
      setForm(initialState);
    }
  }, [visible]);

  const scrollRef = useRef<ScrollView>(null);
  const r = [
    useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), 
    useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), 
    useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), 
    useRef<TextInput>(null)
  ];

  // --- SARSINTI ENGELLİ KAYDIRMA ---
  const goTo = (y: number) => {
    scrollRef.current?.scrollTo({ y, animated: false }); 
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 50);
  };

  const handleSave = async () => {
    if (!form.adSoyad || !form.tel || !form.email) {
      Alert.alert("Eksik Bilgi", "Zorunlu alanları (* işaretli) doldurmadan kayıt mühürlenemez!");
      return;
    }
    
    try {
      // Motor Bağlantısı: index.js'deki /api/yeni-servis ucuna gider
      const response = await fetch('http://192.168.1.43:5000/api/yeni-servis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert("KAYIT MÜHÜRLENDİ!", `Sistem Takip No: ${data.id}`);
        onClose(); // Kayıt sonrası pencereyi kapatır
      } else {
        Alert.alert("Hata", "Veritabanı kaydı reddetti.");
      }
    } catch (error) {
      Alert.alert("Bağlantı Hatası", "Server motoruna ulaşılamıyor. Terminali kontrol edin!");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>TEKNİK SERVİS KAYIT FORMU</Text>
            {/* Kırmızı-Beyaz Kapatma Mührü */}
            <TouchableOpacity onPress={onClose} style={styles.closeArea}>
              <Ionicons name="close-circle" size={35} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollRef} 
            keyboardShouldPersistTaps="always" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 700 }}
            bounces={false}
          >
            <View style={styles.section}><Text style={styles.st}>1. KİŞİSEL / FİRMA BİLGİLERİ</Text></View>
            <Text style={styles.L}>AD SOYAD / FİRMA ADI *</Text>
            <TextInput 
              ref={r[0]} 
              style={styles.I} 
              value={form.adSoyad}
              placeholder="Müşteri veya Şirket İsmi"
              returnKeyType="next" 
              blurOnSubmit={false} 
              onSubmitEditing={() => r[1].current?.focus()} 
              onChangeText={(v)=>setForm({...form, adSoyad: v})} 
              onFocus={() => goTo(0)} 
            />

            <View style={styles.row}>
              <View style={{flex:1}}><Text style={styles.L}>TEL *</Text>
              <TextInput 
                ref={r[1]} 
                style={styles.I} 
                value={form.tel}
                placeholder="05xx..."
                keyboardType="numeric" 
                returnKeyType="next" 
                blurOnSubmit={false} 
                onSubmitEditing={() => r[2].current?.focus()} 
                onChangeText={(v)=>setForm({...form, tel: v})} 
                onFocus={() => goTo(30)} 
              /></View>
              
              <View style={{flex:1}}><Text style={styles.L}>EMAIL *</Text>
              <TextInput 
                ref={r[2]} 
                style={styles.I} 
                value={form.email}
                placeholder="ornek@mail.com"
                autoCapitalize="none" 
                returnKeyType="next" 
                blurOnSubmit={false} 
                onSubmitEditing={() => r[3].current?.focus()} 
                onChangeText={(v)=>setForm({...form, email: v})} 
                onFocus={() => goTo(30)} 
              /></View>
            </View>

            <Text style={styles.L}>ADRES</Text>
            <TextInput 
              ref={r[3]} 
              style={styles.I} 
              value={form.adres}
              placeholder="Açık Adres Bilgisi"
              returnKeyType="next" 
              blurOnSubmit={false} 
              onSubmitEditing={() => r[4].current?.focus()} 
              onChangeText={(v)=>setForm({...form, adres: v})} 
              onFocus={() => goTo(110)} 
            />
            
            <Text style={styles.L}>FAKS</Text>
            <TextInput 
              ref={r[4]} 
              style={styles.I} 
              value={form.faks}
              placeholder="Faks Numarası"
              returnKeyType="next" 
              blurOnSubmit={false} 
              onSubmitEditing={() => r[5].current?.focus()} 
              onChangeText={(v)=>setForm({...form, faks: v})} 
              onFocus={() => goTo(170)} 
            />

            <View style={styles.section}><Text style={styles.st}>2. CİHAZ VE ARIZA BİLGİLERİ</Text></View>
            <View style={styles.row}>
              <View style={{flex:1}}><Text style={styles.L}>MARKA</Text>
              <TextInput 
                ref={r[5]} 
                style={styles.I} 
                value={form.marka}
                placeholder="Cihaz Markası"
                returnKeyType="next" 
                blurOnSubmit={false} 
                onSubmitEditing={() => r[6].current?.focus()} 
                onChangeText={(v)=>setForm({...form, marka: v})} 
                onFocus={() => goTo(250)} 
              /></View>
              
              <View style={{flex:1}}><Text style={styles.L}>MODEL</Text>
              <TextInput 
                ref={r[6]} 
                style={styles.I} 
                value={form.model}
                placeholder="Cihaz Modeli"
                returnKeyType="next" 
                blurOnSubmit={false} 
                onSubmitEditing={() => r[7].current?.focus()} 
                onChangeText={(v)=>setForm({...form, model: v})} 
                onFocus={() => goTo(250)} 
              /></View>
            </View>

            <Text style={styles.L}>SERİ NO</Text>
            <TextInput 
              ref={r[7]} 
              style={styles.I} 
              value={form.seriNo}
              placeholder="Cihaz Seri Numarası"
              returnKeyType="next" 
              blurOnSubmit={false} 
              onSubmitEditing={() => r[8].current?.focus()} 
              onChangeText={(v)=>setForm({...form, seriNo: v})} 
              onFocus={() => goTo(330)} 
            />
            
            <Text style={styles.L}>AKSESUAR / GÖRÜNÜM / ARIZA NOTU</Text>
            <TextInput 
              ref={r[8]} 
              style={[styles.I, {height: 48}]} 
              value={form.not}
              placeholder="Detaylı Arıza Notu..."
              returnKeyType="next" 
              blurOnSubmit={false} 
              onSubmitEditing={() => r[9].current?.focus()} 
              onChangeText={(v)=>setForm({...form, not: v})} 
              onFocus={() => goTo(390)} 
            />

            <View style={styles.section}><Text style={styles.st}>3. PERSONEL VE RANDEVU</Text></View>
            <Text style={styles.L}>YÖNLENDİRİLECEK PERSONEL</Text>
            <TextInput 
              ref={r[9]} 
              style={styles.I} 
              value={form.personel}
              placeholder="Teknisyen Adı"
              returnKeyType="done" 
              onSubmitEditing={() => Keyboard.dismiss()} 
              onChangeText={(v)=>setForm({...form, personel: v})} 
              onFocus={() => goTo(530)} 
            />
          </ScrollView>

          <TouchableOpacity style={styles.btn} onPress={handleSave} activeOpacity={0.8}>
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
  closeArea: { backgroundColor: '#fff', borderRadius: 18 },
  section: { padding: 10, borderRadius: 10, marginBottom: 8, marginTop: 15, backgroundColor: '#444' },
  st: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  L: { fontSize: 10, fontWeight: '900', color: '#666', marginBottom: 4, marginTop: 4, marginLeft: 5 },
  I: { backgroundColor: '#f9f9f9', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, height: 48, fontSize: 14, color: '#000', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10 },
  btn: { backgroundColor: '#444', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  btntxt: { color: '#fff', fontSize: 16, fontWeight: '900' }
});