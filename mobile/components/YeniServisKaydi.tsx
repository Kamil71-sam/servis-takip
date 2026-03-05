import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- P2 ÖZEL SEÇİM PENCERESİ (GECE MODU) ---
const CustomSelect = ({ visible, title, data, onSelect, onClose, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.selectOverlay} activeOpacity={1} onPress={onClose}>
      <View style={[styles.selectContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
        <Text style={[styles.selectTitle, { color: isDarkMode ? '#fff' : '#1A1A1A', borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>{title}</Text>
        {data.map((item: string) => (
          <TouchableOpacity key={item} style={[styles.selectItem, { borderBottomColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]} onPress={() => onSelect(item)}>
            <Text style={[styles.selectItemText, { color: isDarkMode ? '#ddd' : '#333' }]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

// --- P2 DURUM PENCERESİ (GECE MODU) ---
const StatusModal = ({ visible, type, message, recordNo, onConfirm, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.selectOverlay}>
      <View style={[styles.miniStatusContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }, type === 'error' && { borderColor: '#FF3B30', borderWidth: 1.5 }]}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusMainText, { color: isDarkMode ? '#fff' : '#1A1A1A' }, type === 'error' && { color: '#FF3B30' }]}>
              {type === 'success' ? 'KAYIT TAMAMLANDI' : 'EKSİK BİLGİ'}
            </Text>
            {type === 'success' && recordNo && (
              <View style={[styles.recordNoBadge, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }]}>
                <Text style={styles.recordNoText}>NO: {recordNo}</Text>
              </View>
            )}
            <Text style={[styles.statusSubText, { color: isDarkMode ? '#aaa' : '#666' }]}>{message}</Text>
          </View>
          <TouchableOpacity style={[styles.miniConfirmBtn, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }, type === 'error' && { backgroundColor: '#FF3B30' }]} onPress={onConfirm}>
            <Ionicons name={type === 'success' ? "arrow-forward" : "close"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function YeniServisKaydi({ visible, onClose, isDarkMode }: any) {
  const initialState = {
    cihaz_sahibi: '', cihaz_turu: 'Seçiniz...', marka: '', model: '',
    seri_no: '', garanti: 'Yok', muster_notu: '', aksesuar: '', ariza_notu: '', usta: 'Seçilmedi'
  };

  const [servis, setServis] = useState(initialState);
  const [focusField, setFocusField] = useState<string>('sahibi');
  const [modalType, setModalType] = useState<'tür' | 'garanti' | 'usta' | null>(null);
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '', recordNo: '', errorTarget: '' });

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

  const generateRecordNo = () => {
    const d = new Date();
    const yy = d.getFullYear().toString().slice(-2);
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yy}${mm}${dd}01`;
  };

  const handleSaveAttempt = () => {
    if (!servis.cihaz_sahibi || servis.cihaz_sahibi.trim().length < 2) {
      setStatus({ visible: true, type: 'error', msg: 'Müşteri ismi mecburidir.', recordNo: '', errorTarget: 'sahibi' });
      return;
    }
    if (servis.cihaz_turu === 'Seçiniz...') {
      setStatus({ visible: true, type: 'error', msg: 'Cihaz türünü seçiniz.', recordNo: '', errorTarget: 'tür' });
      return;
    }
    if (!servis.marka || servis.marka.trim().length < 1) {
      setStatus({ visible: true, type: 'error', msg: 'Cihaz markası mecburidir.', recordNo: '', errorTarget: 'marka' });
      return;
    }
    if (!servis.ariza_notu || servis.ariza_notu.trim().length < 3) {
      setStatus({ visible: true, type: 'error', msg: 'Arıza notu mecburidir.', recordNo: '', errorTarget: 'ariza' });
      return;
    }
    Keyboard.dismiss();
    setStatus({ visible: true, type: 'success', msg: 'Cihaz başarıyla işlendi.', recordNo: generateRecordNo(), errorTarget: '' });
  };

  const handleErrorConfirm = () => {
    setStatus({ ...status, visible: false });
    setTimeout(() => {
      if (status.errorTarget === 'sahibi') r1.current?.focus();
      else if (status.errorTarget === 'tür') { setFocusField('tür'); setModalType('tür'); }
      else if (status.errorTarget === 'marka') r2.current?.focus();
      else if (status.errorTarget === 'ariza') r7.current?.focus();
    }, 150); 
  };

  const resetFormAndClose = () => {
    setServis(initialState);
    setStatus({ ...status, visible: false });
    onClose();
  };

  // DİNAMİK STİLLER
  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    borderColor: isDarkMode ? '#444' : '#eee',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#333',
    badgeBtnBg: isDarkMode ? '#333' : '#1A1A1A'
  };

  return (
    // MÜDÜR: ŞEFFAF MODAL MÜHÜRÜ (Işık sızıntısı yok)
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      
      {/* DIŞ KAPLAMA: BEYAZLIĞI KESTİ */}
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        
        {/* ANDROID OFFSET GERİ GETİRİLDİ */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "android" ? 40 : 0} style={{flex: 1}}>
          <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
            
            <View style={styles.header}>
              <View style={[styles.titleBadge, { backgroundColor: theme.badgeBtnBg }]}><Text style={styles.title}>CİHAZ BİLGİLERİ</Text></View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={42} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="always" contentContainerStyle={{ paddingBottom: 150 }}>
              
              <Text style={[styles.label, { color: theme.labelColor }]}>MÜŞTERİ ARA (*) </Text>
              <View style={styles.row}>
                <TextInput ref={r1} style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'sahibi' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} placeholder="İsim veya Tel..." placeholderTextColor={isDarkMode ? '#666' : '#999'} onFocus={() => setFocusField('sahibi')} value={servis.cihaz_sahibi} onChangeText={(v)=>setServis({...servis, cihaz_sahibi: v})} returnKeyType="next" onSubmitEditing={() => { Keyboard.dismiss(); setModalType('tür'); }} />
                <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.badgeBtnBg }]}><Ionicons name="search" size={24} color="#fff" /></TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.labelColor }]}>CİHAZ TÜRÜ (*) </Text>
              <TouchableOpacity style={[styles.p2SelectBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focusField === 'tür' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} onPress={() => { setFocusField('tür'); Keyboard.dismiss(); setModalType('tür'); }}>
                <Text style={[styles.p2SelectText, { color: theme.textColor }]}>{servis.cihaz_turu}</Text>
                <Ionicons name="chevron-down" size={20} color={theme.textColor} />
              </TouchableOpacity>

              <View style={styles.rowLayout}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={[styles.label, { color: theme.labelColor }]}>MARKA (*) </Text>
                  <TextInput ref={r2} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'marka' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} onFocus={() => setFocusField('marka')} value={servis.marka} onChangeText={(v)=>setServis({...servis, marka: v})} returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={[styles.label, { color: theme.labelColor }]}>MODEL</Text>
                  <TextInput ref={r3} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'model' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} onFocus={() => setFocusField('model')} value={servis.model} onChangeText={(v)=>setServis({...servis, model: v})} returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} />
                </View>
              </View>

              <View style={styles.rowLayout}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={[styles.label, { color: theme.labelColor }]}>SERİ NUMARASI</Text>
                  <TextInput ref={r4} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'seri' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} onFocus={() => setFocusField('seri')} value={servis.seri_no} onChangeText={(v)=>setServis({...servis, seri_no: v})} returnKeyType="next" onSubmitEditing={() => { Keyboard.dismiss(); setModalType('garanti'); }} blurOnSubmit={false} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={[styles.label, { color: theme.labelColor }]}>GARANTİ</Text>
                  <TouchableOpacity style={[styles.p2SelectBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focusField === 'garanti' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} onPress={() => { setFocusField('garanti'); Keyboard.dismiss(); setModalType('garanti'); }}>
                    <Text style={[styles.p2SelectText, { color: theme.textColor }]}>{servis.garanti}</Text>
                    <Ionicons name="shield-checkmark" size={18} color={theme.textColor} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.label, { color: theme.labelColor }]}>MÜŞTERİ NOTU</Text>
              <TextInput ref={r5} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'not' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} onFocus={() => setFocusField('not')} value={servis.muster_notu} onChangeText={(v)=>setServis({...servis, muster_notu: v})} returnKeyType="next" onSubmitEditing={()=>r6.current?.focus()} blurOnSubmit={false} />

              <Text style={[styles.label, { color: theme.labelColor }]}>AKSESUAR DURUMU</Text>
              <TextInput ref={r6} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'aksesuar' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} onFocus={() => setFocusField('aksesuar')} value={servis.aksesuar} onChangeText={(v)=>setServis({...servis, aksesuar: v})} returnKeyType="next" onSubmitEditing={()=>r7.current?.focus()} blurOnSubmit={false} />

              <Text style={[styles.label, { color: theme.labelColor }]}>ARIZA / ŞİKAYET BİLGİSİ (*) </Text>
              <TextInput ref={r7} style={[styles.input, { height: 60, backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'ariza' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} onFocus={() => setFocusField('ariza')} value={servis.ariza_notu} onChangeText={(v)=>setServis({...servis, ariza_notu: v})} returnKeyType="next" onSubmitEditing={() => { Keyboard.dismiss(); setModalType('usta'); }} blurOnSubmit={false} />

              <Text style={[styles.label, { color: theme.labelColor }]}>ATANAN USTA</Text>
              {/* MÜDÜR: SON KUTUYA 30px MARJİN (BOŞLUK) MÜHÜRLEDİM */}
              <TouchableOpacity style={[styles.p2SelectBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, marginBottom: 30 }, focusField === 'usta' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} onPress={() => { setFocusField('usta'); Keyboard.dismiss(); setModalType('usta'); }}>
                <Text style={[styles.p2SelectText, { color: theme.textColor }]}>{servis.usta}</Text>
                <Ionicons name="people" size={20} color={theme.textColor} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.badgeBtnBg }]} onPress={handleSaveAttempt}><Text style={styles.saveButtonText}>KAYDI TAMAMLA</Text></TouchableOpacity>
            </ScrollView>

            <CustomSelect visible={modalType === 'tür'} title="CİHAZ TÜRÜ" data={['Cep Telefonu', 'Masaüstü Bilgisayar', 'Notebook', 'Yazıcı', 'TV', 'Tablet']} isDarkMode={isDarkMode} onSelect={(v: string) => { setServis({...servis, cihaz_turu: v}); setModalType(null); setFocusField('marka'); setTimeout(() => r2.current?.focus(), 450); }} onClose={() => setModalType(null)} />
            <CustomSelect visible={modalType === 'garanti'} title="GARANTİ" data={['Yok', 'Var (Resmi)', 'Var (Dükkan)']} isDarkMode={isDarkMode} onSelect={(v: string) => { setServis({...servis, garanti: v}); setModalType(null); setFocusField('not'); setTimeout(() => r5.current?.focus(), 450); }} onClose={() => setModalType(null)} />
            <CustomSelect visible={modalType === 'usta'} title="USTA ATAMA" data={['Seçilmedi', 'Usta 1', 'Usta 2', 'Usta 3', 'Usta 4', 'Usta 5']} isDarkMode={isDarkMode} onSelect={(v: string) => { setServis({...servis, usta: v}); setModalType(null); setFocusField('usta'); }} onClose={() => setModalType(null)} />
            
            <StatusModal visible={status.visible} type={status.type} message={status.msg} recordNo={status.recordNo} isDarkMode={isDarkMode}
              onConfirm={() => { if (status.type === 'success') resetFormAndClose(); else handleErrorConfirm(); }} />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 52 : 32, marginBottom: 20 },
  titleBadge: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  closeBtn: { padding: 8, marginRight: -8 },
  label: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 15, marginBottom: 15 },
  focusedBorder: { borderColor: '#FF3B30' },
  p2SelectBox: { borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, marginBottom: 15 },
  p2SelectText: { fontSize: 15, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  rowLayout: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  searchBtn: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10, marginBottom: 15 },
  saveButton: { height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 35, marginBottom: 40, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  selectContent: { width: '85%', borderRadius: 25, padding: 20, elevation: 20 },
  selectTitle: { fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 15, borderBottomWidth: 1.5, paddingBottom: 15 },
  selectItem: { paddingVertical: 15, borderBottomWidth: 1, alignItems: 'center' },
  selectItemText: { fontSize: 16, fontWeight: '700' },
  miniStatusContent: { width: '90%', borderRadius: 15, padding: 20, elevation: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900' },
  statusSubText: { fontSize: 14, marginTop: 2 },
  miniConfirmBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recordNoBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginVertical: 8, alignSelf: 'flex-start' },
  recordNoText: { color: '#fff', fontWeight: '900', fontSize: 14 }
});