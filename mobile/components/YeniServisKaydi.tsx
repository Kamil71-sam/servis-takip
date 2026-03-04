import React, { useState, useRef, useEffect } from 'react';
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

// --- P2 DURUM PENCERESİ ---
const StatusModal = ({ visible, type, message, onConfirm }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.selectOverlay}>
      <View style={[styles.miniStatusContent, type === 'error' && { borderColor: '#FF3B30', borderWidth: 1.5 }]}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusMainText, type === 'error' && { color: '#FF3B30' }]}>
              {type === 'success' ? 'KAYIT TAMAMLANDI' : 'EKSİK BİLGİ'}
            </Text>
            <Text style={styles.statusSubText}>{message}</Text>
          </View>
          <TouchableOpacity style={[styles.miniConfirmBtn, type === 'error' && { backgroundColor: '#FF3B30' }]} onPress={onConfirm}>
            <Ionicons name={type === 'success' ? "arrow-forward" : "close"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function YeniServisKaydi({ visible, onClose }: any) {
  const initialState = {
    cihaz_sahibi: '', cihaz_turu: 'Seçiniz...', marka: '', model: '',
    seri_no: '', garanti: 'Yok', muster_notu: '', aksesuar: '', ariza_notu: '', usta: 'Seçilmedi'
  };

  const [servis, setServis] = useState(initialState);
  const [focusField, setFocusField] = useState<string>('sahibi');
  const [modalType, setModalType] = useState<'tür' | 'garanti' | 'usta' | null>(null);
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '' });

  const r1=useRef<TextInput>(null); const r2=useRef<TextInput>(null);
  const r3=useRef<TextInput>(null); const r4=useRef<TextInput>(null);
  const r5=useRef<TextInput>(null); const r6=useRef<TextInput>(null);
  const r7=useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => r1.current?.focus(), 600);
      setFocusField('sahibi');
    }
  }, [visible]);

  const handleSaveAttempt = () => {
    if (!servis.cihaz_sahibi || servis.cihaz_sahibi.trim().length < 2) {
      setStatus({ visible: true, type: 'error', msg: 'Müşteri ismi girmek mecburidir.' });
      return;
    }
    if (servis.cihaz_turu === 'Seçiniz...') {
      setStatus({ visible: true, type: 'error', msg: 'Lütfen cihaz türünü seçiniz.' });
      return;
    }
    if (!servis.marka || servis.marka.trim().length < 1) {
      setStatus({ visible: true, type: 'error', msg: 'Cihaz markası mecburi giriştir.' });
      return;
    }
    if (!servis.ariza_notu || servis.ariza_notu.trim().length < 3) {
      setStatus({ visible: true, type: 'error', msg: 'Arıza detayı kesinlikle gereklidir.' });
      return;
    }
    Keyboard.dismiss();
    setStatus({ visible: true, type: 'success', msg: 'Cihaz başarıyla sisteme işlendi.' });
  };

  const resetFormAndClose = () => {
    setServis(initialState);
    setStatus({ ...status, visible: false });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.fullContainer}>
        <SafeAreaView style={styles.safeArea}>
          
          {/* BAŞLIK VE ÇARPI 4MM DAHA AŞAĞI (TOPLAM 48MM ANDROID) */}
          <View style={styles.header}>
            <View style={styles.titleBadge}><Text style={styles.title}>CİHAZ BİLGİLERİ</Text></View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={42} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            bounces={false} 
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ paddingBottom: 100 }} // KLAVYE PAYI İÇİN ASANSÖR ALTI BOŞALTILDI
          >
            
            <Text style={styles.label}>MÜŞTERİ ARA *</Text>
            <View style={styles.row}>
              <TextInput 
                ref={r1} 
                style={[styles.input, {flex: 1}, focusField === 'sahibi' && styles.focusedBorder]} 
                placeholder="İsim veya Tel..." 
                onFocus={() => setFocusField('sahibi')}
                value={servis.cihaz_sahibi}
                onChangeText={(v)=>setServis({...servis, cihaz_sahibi: v})} 
                returnKeyType="next" 
                onSubmitEditing={() => { Keyboard.dismiss(); setModalType('tür'); }} 
              />
              <TouchableOpacity style={styles.searchBtn}>
                <Ionicons name="search" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>CİHAZ TÜRÜ *</Text>
            <TouchableOpacity style={[styles.p2SelectBox, focusField === 'tür' && styles.focusedBorder]} onPress={() => { setFocusField('tür'); Keyboard.dismiss(); setModalType('tür'); }}>
              <Text style={styles.p2SelectText}>{servis.cihaz_turu}</Text>
              <Ionicons name="chevron-down" size={20} color="#1A1A1A" />
            </TouchableOpacity>

            <View style={styles.rowLayout}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>MARKA *</Text>
                <TextInput ref={r2} style={[styles.input, focusField === 'marka' && styles.focusedBorder]} 
                  onFocus={() => setFocusField('marka')} value={servis.marka}
                  returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, marka: v})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>MODEL</Text>
                <TextInput ref={r3} style={[styles.input, focusField === 'model' && styles.focusedBorder]} 
                  onFocus={() => setFocusField('model')} value={servis.model}
                  returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, model: v})} />
              </View>
            </View>

            <View style={styles.rowLayout}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>SERİ NUMARASI</Text>
                <TextInput ref={r4} style={[styles.input, focusField === 'seri' && styles.focusedBorder]} 
                  onFocus={() => setFocusField('seri')} value={servis.seri_no}
                  returnKeyType="next" onSubmitEditing={() => { Keyboard.dismiss(); setModalType('garanti'); }} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, seri_no: v})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>GARANTİ</Text>
                <TouchableOpacity style={[styles.p2SelectBox, focusField === 'garanti' && styles.focusedBorder]} onPress={() => { setFocusField('garanti'); Keyboard.dismiss(); setModalType('garanti'); }}>
                  <Text style={styles.p2SelectText}>{servis.garanti}</Text>
                  <Ionicons name="shield-checkmark" size={18} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.label}>MÜŞTERİ NOTU</Text>
            <TextInput ref={r5} style={[styles.input, focusField === 'not' && styles.focusedBorder]} 
              onFocus={() => setFocusField('not')} value={servis.muster_notu}
              returnKeyType="next" onSubmitEditing={()=>r6.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, muster_notu: v})} />

            <Text style={styles.label}>AKSESUAR DURUMU</Text>
            <TextInput ref={r6} style={[styles.input, focusField === 'aksesuar' && styles.focusedBorder]} 
              onFocus={() => setFocusField('aksesuar')} value={servis.aksesuar}
              returnKeyType="next" onSubmitEditing={()=>r7.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, aksesuar: v})} />

            <Text style={styles.label}>ARIZA / ŞİKAYET BİLGİSİ *</Text>
            <TextInput ref={r7} style={[styles.input, {height: 60}, focusField === 'ariza' && styles.focusedBorder]} 
              onFocus={() => setFocusField('ariza')} value={servis.ariza_notu}
              returnKeyType="next" onSubmitEditing={() => { Keyboard.dismiss(); setModalType('usta'); }} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, ariza_notu: v})} />

            <Text style={styles.label}>ATANAN USTA</Text>
            <TouchableOpacity style={[styles.p2SelectBox, focusField === 'usta' && styles.focusedBorder]} onPress={() => { setFocusField('usta'); Keyboard.dismiss(); setModalType('usta'); }}>
              <Text style={styles.p2SelectText}>{servis.usta}</Text>
              <Ionicons name="people" size={20} color="#1A1A1A" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAttempt}>
              <Text style={styles.saveButtonText}>KAYDI TAMAMLA</Text>
            </TouchableOpacity>

          </ScrollView>

          <CustomSelect visible={modalType === 'tür'} title="CİHAZ TÜRÜ" data={['Cep Telefonu', 'Masaüstü Bilgisayar', 'Notebook', 'Yazıcı', 'TV', 'Tablet']} onSelect={(v: string) => { setServis({...servis, cihaz_turu: v}); setModalType(null); setFocusField('marka'); setTimeout(() => r2.current?.focus(), 450); }} onClose={() => setModalType(null)} />
          <CustomSelect visible={modalType === 'garanti'} title="GARANTİ" data={['Yok', 'Var (Resmi)', 'Var (Dükkan)']} onSelect={(v: string) => { setServis({...servis, garanti: v}); setModalType(null); setFocusField('not'); setTimeout(() => r5.current?.focus(), 450); }} onClose={() => setModalType(null)} />
          <CustomSelect visible={modalType === 'usta'} title="USTA ATAMA" data={['Seçilmedi', 'Usta 1', 'Usta 2', 'Usta 3', 'Usta 4', 'Usta 5']} onSelect={(v: string) => { setServis({...servis, usta: v}); setModalType(null); setFocusField('usta'); }} onClose={() => setModalType(null)} />
          
          <StatusModal visible={status.visible} type={status.type} message={status.msg} onConfirm={() => { if (status.type === 'success') resetFormAndClose(); else setStatus({ ...status, visible: false }); }} />

        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: Platform.OS === 'android' ? 48 : 28, // 4MM DAHA ASAĞI ALINDI
    marginBottom: 20 
  },
  titleBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  closeBtn: { padding: 5 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#f2f2f2', borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, padding: 12, fontSize: 15, color: '#000', marginBottom: 15 }, // ASANSÖR KATLARI ARALANDI
  focusedBorder: { borderColor: '#FF3B30', backgroundColor: '#fff' },
  p2SelectBox: { backgroundColor: '#f2f2f2', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', marginBottom: 15 }, 
  p2SelectText: { fontSize: 15, color: '#000', fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  rowLayout: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  searchBtn: { backgroundColor: '#1A1A1A', width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10, marginBottom: 15 },
  saveButton: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 35, marginBottom: 40, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  selectContent: { backgroundColor: '#fff', width: '85%', borderRadius: 25, padding: 20, elevation: 20 },
  selectTitle: { fontSize: 17, fontWeight: '900', color: '#1A1A1A', textAlign: 'center', marginBottom: 15, borderBottomWidth: 1.5, borderBottomColor: '#f0f0f0', paddingBottom: 15 },
  selectItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9', alignItems: 'center' },
  selectItemText: { fontSize: 16, color: '#333', fontWeight: '700' },
  miniStatusContent: { backgroundColor: '#fff', width: '90%', borderRadius: 15, padding: 20, elevation: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  statusSubText: { fontSize: 14, color: '#666', marginTop: 2 },
  miniConfirmBtn: { backgroundColor: '#1A1A1A', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});