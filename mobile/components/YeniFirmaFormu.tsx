import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- P2 DURUM PENCERESİ (GECE MODU DESTEKLİ) ---
const StatusModal = ({ visible, type, message, onConfirm, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.selectOverlay}>
      <View style={[styles.miniStatusContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }, type === 'error' && { borderColor: '#FF3B30', borderWidth: 1.5 }]}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusMainText, { color: isDarkMode ? '#fff' : '#1A1A1A' }, type === 'error' && { color: '#FF3B30' }]}>
              {type === 'success' ? 'BAŞARILI' : 'EKSİK BİLGİ'}
            </Text>
            <Text style={[styles.statusSubText, { color: isDarkMode ? '#aaa' : '#666' }]}>{message}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.miniConfirmBtn, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }, type === 'error' && { backgroundColor: '#FF3B30' }]} 
            onPress={onConfirm}
          >
            <Ionicons name={type === 'success' ? "arrow-forward" : "close"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function YeniFirmaFormu({ visible, onClose, isDarkMode }: any) {
  const initialState = { firma_adi: '', yetkili_kisi: '', tel: '', email: '', adres: '', vergi_no: '' };
  const [firma, setFirma] = useState(initialState);
  const [focusField, setFocusField] = useState<string>('ad');
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '' });

  const r1=useRef<TextInput>(null); const r2=useRef<TextInput>(null); 
  const r3=useRef<TextInput>(null); const r4=useRef<TextInput>(null); 
  const r5=useRef<TextInput>(null); const r6=useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setFirma(initialState);
      setTimeout(() => r1.current?.focus(), 600);
      setFocusField('ad');
    }
  }, [visible]);

  const handleSaveAttempt = () => {
    if (!firma.firma_adi || !firma.tel || !firma.email) {
      setStatus({ visible: true, type: 'error', msg: 'Yıldızlı (*) alanlar mecburidir.' });
      return;
    }
    Keyboard.dismiss();
    setStatus({ visible: true, type: 'success', msg: 'Firma başarıyla kaydedildi.' });
  };

  // DİNAMİK STİLLER (Şaltere Bağlı)
  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    borderColor: isDarkMode ? '#444' : '#eee',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#333',
    badgeBtnBg: isDarkMode ? '#333' : '#1A1A1A',
    dividerBg: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    dividerText: isDarkMode ? '#888' : '#444'
  };

  return (
    // MÜDÜR: MODALI ŞEFFAF YAPTIK, ARKADAN BEYAZLIK SIZMASIN DİYE
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      
      {/* DIŞ KAPLAMA: TÜM BOŞLUKLARI GECE MODU RENGİYLE DOLDURUR */}
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        
        {/* ANDROID'DE EKRAN KAYMASI İÇİN OFFSET GERİ GETİRİLDİ */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          keyboardVerticalOffset={Platform.OS === "android" ? 40 : 0}
          style={{flex: 1}}
        >
          <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
            
            <View style={styles.header}>
              <View style={[styles.titleBadge, { backgroundColor: theme.badgeBtnBg }]}><Text style={styles.title}>FİRMA KAYDI</Text></View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={42} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{ paddingBottom: 150 }}>
              
              <View style={[styles.sectionDivider, { backgroundColor: theme.dividerBg }]}>
                <Text style={[styles.sectionText, { color: theme.dividerText }]}>FİRMA VE İLETİŞİM BİLGİLERİ</Text>
              </View>

              <Text style={[styles.label, { color: theme.labelColor }]}>FİRMA ADI / ÜNVANI *</Text>
              <TextInput ref={r1} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'ad' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                onFocus={() => setFocusField('ad')} value={firma.firma_adi}
                onChangeText={(v)=>setFirma({...firma, firma_adi: v})}
                returnKeyType="next" onSubmitEditing={()=>r2.current?.focus()} blurOnSubmit={false} />

              <Text style={[styles.label, { color: theme.labelColor }]}>YETKİLİ KİŞİ</Text>
              <TextInput ref={r2} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'yetkili' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                onFocus={() => setFocusField('yetkili')} value={firma.yetkili_kisi}
                onChangeText={(v)=>setFirma({...firma, yetkili_kisi: v})}
                returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} />

              <View style={styles.rowLayout}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={[styles.label, { color: theme.labelColor }]}>TELEFON *</Text>
                  <TextInput ref={r3} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'tel' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                    onFocus={() => setFocusField('tel')} keyboardType="phone-pad" value={firma.tel}
                    onChangeText={(v)=>setFirma({...firma, tel: v})}
                    returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={[styles.label, { color: theme.labelColor }]}>VERGİ NO</Text>
                  <TextInput ref={r4} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'vergi' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                    onFocus={() => setFocusField('vergi')} keyboardType="numeric" value={firma.vergi_no}
                    onChangeText={(v)=>setFirma({...firma, vergi_no: v})}
                    returnKeyType="next" onSubmitEditing={()=>r5.current?.focus()} blurOnSubmit={false} />
                </View>
              </View>

              <Text style={[styles.label, { color: theme.labelColor }]}>E-POSTA ADRESİ *</Text>
              <TextInput ref={r5} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'email' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                onFocus={() => setFocusField('email')} keyboardType="email-address" value={firma.email}
                onChangeText={(v)=>setFirma({...firma, email: v})}
                returnKeyType="next" onSubmitEditing={()=>r6.current?.focus()} blurOnSubmit={false} />

              <Text style={[styles.label, { color: theme.labelColor }]}>ADRES</Text>
              {/* MÜDÜR: ADRES KUTUSUNA 30px MARJİN (BOŞLUK) MÜHÜRLEDİM, KLAVYEYLE ÖPÜŞMEZ ARTIK */}
              <TextInput ref={r6} style={[styles.input, {height: 80, backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor, marginBottom: 30}, focusField === 'adres' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                onFocus={() => setFocusField('adres')} multiline value={firma.adres}
                onChangeText={(v)=>setFirma({...firma, adres: v})}
                returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} blurOnSubmit={true} />

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.badgeBtnBg }]} onPress={handleSaveAttempt}>
                <Text style={styles.saveButtonText}>KAYDI TAMAMLA</Text>
              </TouchableOpacity>
            </ScrollView>

            <StatusModal visible={status.visible} type={status.type} message={status.msg} isDarkMode={isDarkMode}
              onConfirm={() => { setStatus({...status, visible: false}); if (status.type === 'success') onClose(); }} />
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
  sectionDivider: { padding: 10, borderRadius: 10, marginVertical: 15 },
  sectionText: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 15, marginBottom: 15 },
  focusedBorder: { borderColor: '#FF3B30' },
  rowLayout: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 35, marginBottom: 40, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  miniStatusContent: { width: '90%', borderRadius: 15, padding: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900' },
  statusSubText: { fontSize: 14, marginTop: 2 },
  miniConfirmBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});