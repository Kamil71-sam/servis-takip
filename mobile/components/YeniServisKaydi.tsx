import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- P2 ÖZEL SEÇİM PENCERESİ ---
const CustomSelect = ({ visible, title, data, onSelect, onClose }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.selectOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.selectContent}>
        <Text style={styles.selectTitle}>{title}</Text>
        {data.map((item: string) => (
          <TouchableOpacity key={item} style={styles.selectItem} onPress={() => onSelect(item)}>
            <Text style={styles.selectItemText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

// --- P2 BAŞARI PENCERESİ (HATASIZ ŞIK VERSİYON) ---
const SuccessModal = ({ visible, onConfirm }: any) => (
  <Modal 
    visible={visible} 
    transparent 
    animationType="fade" // "bounce" hatası burada "fade" yapılarak çözüldü!
  >
    <View style={styles.selectOverlay}>
      <View style={[styles.selectContent, { alignItems: 'center', paddingVertical: 30 }]}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={[styles.selectTitle, { borderBottomWidth: 0, fontSize: 22 }]}>İŞLEM BAŞARILI</Text>
        <Text style={styles.successSubText}>Cihaz kaydı sisteme mühürlendi.</Text>
        <TouchableOpacity style={styles.successConfirmBtn} onPress={onConfirm}>
          <Text style={styles.successConfirmBtnText}>ANLAŞILDI</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function YeniServisKaydi({ visible, onClose }: any) {
  const [servis, setServis] = useState({
    cihaz_sahibi: '', cihaz_turu: 'Seçiniz...', marka: '', model: '',
    seri_no: '', garanti: 'Yok', muster_notu: '', aksesuar: '', ariza_notu: '', usta: 'Usta 1'
  });

  const [modalType, setModalType] = useState<'tür' | 'garanti' | 'usta' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const r1=useRef<TextInput>(null); const r2=useRef<TextInput>(null);
  const r3=useRef<TextInput>(null); const r4=useRef<TextInput>(null);
  const r5=useRef<TextInput>(null); const r6=useRef<TextInput>(null);
  const r7=useRef<TextInput>(null);

  const handleFinalSave = () => {
    if (!servis.cihaz_sahibi || !servis.marka || !servis.ariza_notu) {
      alert("Eksikleri doldur müdür!");
      return;
    }
    Keyboard.dismiss();
    setShowSuccess(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.fullContainer}>
        <SafeAreaView style={styles.safeArea}>
          
          <View style={styles.header}>
            <View style={styles.titleBadge}><Text style={styles.title}>CİHAZ BİLGİLERİ</Text></View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={40} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="always">
            
            <Text style={styles.label}>MÜŞTERİ ARA *</Text>
            <View style={styles.row}>
              <TextInput ref={r1} style={[styles.input, {flex: 1}]} placeholder="İsim veya Tel..." onChangeText={(v)=>setServis({...servis, cihaz_sahibi: v})} returnKeyType="next" onSubmitEditing={() => { Keyboard.dismiss(); setModalType('tür'); }} />
              <TouchableOpacity style={styles.searchBtn}><Ionicons name="search" size={24} color="#fff" /></TouchableOpacity>
            </View>

            <Text style={styles.label}>CİHAZ TÜRÜ</Text>
            <TouchableOpacity style={styles.p2SelectBox} onPress={() => { Keyboard.dismiss(); setModalType('tür'); }}>
              <Text style={styles.p2SelectText}>{servis.cihaz_turu}</Text>
              <Ionicons name="chevron-down" size={20} color="#1A1A1A" />
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>MARKA *</Text>
                <TextInput ref={r2} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, marka: v})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>MODEL</Text>
                <TextInput ref={r3} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, model: v})} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>SERİ NUMARASI</Text>
                <TextInput ref={r4} style={styles.input} returnKeyType="next" onSubmitEditing={() => { Keyboard.dismiss(); setModalType('garanti'); }} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, seri_no: v})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>GARANTİ</Text>
                <TouchableOpacity style={styles.p2SelectBox} onPress={() => { Keyboard.dismiss(); setModalType('garanti'); }}>
                  <Text style={styles.p2SelectText}>{servis.garanti}</Text>
                  <Ionicons name="shield-checkmark" size={18} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.label}>MÜŞTERİ NOTU</Text>
            <TextInput ref={r5} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r6.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, muster_notu: v})} />

            <Text style={styles.label}>CİHAZ / AKSESUAR DURUMU</Text>
            <TextInput ref={r6} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r7.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, aksesuar: v})} />

            <Text style={styles.label}>ARIZA VEYA ŞİKAYET BİLGİSİ *</Text>
            <TextInput ref={r7} style={[styles.input, {height: 60}]} returnKeyType="next" onSubmitEditing={() => { Keyboard.dismiss(); setModalType('usta'); }} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, ariza_notu: v})} />

            <Text style={styles.label}>ATANAN USTA</Text>
            <TouchableOpacity style={[styles.p2SelectBox, {borderColor: '#1A1A1A', borderWidth: 1.5}]} onPress={() => { Keyboard.dismiss(); setModalType('usta'); }}>
              <Text style={styles.p2SelectText}>{servis.usta}</Text>
              <Ionicons name="people" size={20} color="#1A1A1A" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleFinalSave}>
              <Text style={styles.saveButtonText}>KAYDI TAMAMLA</Text>
            </TouchableOpacity>

          </ScrollView>

          <CustomSelect visible={modalType === 'tür'} title="CİHAZ TÜRÜ" data={['Cep Telefonu', 'Masaüstü Bilgisayar', 'Notebook', 'Yazıcı', 'TV']} onSelect={(v: string) => { setServis({...servis, cihaz_turu: v}); setModalType(null); setTimeout(() => r2.current?.focus(), 400); }} onClose={() => setModalType(null)} />
          <CustomSelect visible={modalType === 'garanti'} title="GARANTİ" data={['Yok', 'Var (Resmi)', 'Var (Dükkan)']} onSelect={(v: string) => { setServis({...servis, garanti: v}); setModalType(null); setTimeout(() => r5.current?.focus(), 400); }} onClose={() => setModalType(null)} />
          <CustomSelect visible={modalType === 'usta'} title="USTA ATAMA" data={['Usta 1', 'Usta 2', 'Usta 3', 'Usta 4', 'Usta 5']} onSelect={(v: string) => { setServis({...servis, usta: v}); setModalType(null); }} onClose={() => setModalType(null)} />
          
          <SuccessModal visible={showSuccess} onConfirm={() => { setShowSuccess(false); onClose(); }} />

        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: Platform.OS === 'android' ? 10 : 0 },
  titleBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 5 },
  input: { backgroundColor: '#f2f2f2', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, fontSize: 15, color: '#000' },
  p2SelectBox: { backgroundColor: '#f2f2f2', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  p2SelectText: { fontSize: 15, color: '#000', fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  searchBtn: { backgroundColor: '#1A1A1A', width: 48, height: 48, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  saveButton: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 35, marginBottom: 30 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  selectContent: { backgroundColor: '#fff', width: '85%', borderRadius: 25, padding: 20, elevation: 20 },
  selectTitle: { fontSize: 17, fontWeight: '900', color: '#1A1A1A', textAlign: 'center', marginBottom: 15, borderBottomWidth: 1.5, borderBottomColor: '#f0f0f0', paddingBottom: 15 },
  selectItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9', alignItems: 'center' },
  selectItemText: { fontSize: 16, color: '#333', fontWeight: '700' },
  successIconCircle: { marginBottom: 15 },
  successSubText: { fontSize: 15, color: '#666', marginBottom: 25, textAlign: 'center' },
  successConfirmBtn: { backgroundColor: '#1A1A1A', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15 },
  successConfirmBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 }
});