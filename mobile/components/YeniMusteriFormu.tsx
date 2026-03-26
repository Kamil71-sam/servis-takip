import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { createCustomer } from '../services/api';

// --- P2 DURUM PENCERESİ (GECE MODU DESTEKLİ) ---
const StatusModal = ({ visible, type, message, onConfirm, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.selectOverlay}>
      <View style={[styles.miniStatusContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }, type === 'error' && { borderColor: '#FF3B30', borderWidth: 1.5 }]}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusMainText, { color: isDarkMode ? '#fff' : '#1A1A1A' }, type === 'error' && { color: '#FF3B30' }]}>
              {type === 'success' ? 'KAYIT TAMAMLANDI' : 'EKSİK BİLGİ'}
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

export default function YeniMusteriFormu({ visible, onClose, isDarkMode }: any) {
  const initialState = { adSoyad: '', tel: '', faks: '', email: '', adres: '' };
  const [customer, setCustomer] = useState(initialState);
  const [focusField, setFocusField] = useState<string>('ad');
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '' });

  const r1=useRef<TextInput>(null); const r2=useRef<TextInput>(null); 
  const r3=useRef<TextInput>(null); const r4=useRef<TextInput>(null); 
  const r5=useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setCustomer(initialState);
      setTimeout(() => r1.current?.focus(), 600);
      setFocusField('ad');
    }
  }, [visible]);



const handleSaveAttempt = async () => {

  if (!customer.adSoyad || !customer.tel || !customer.email) {
    setStatus({ visible: true, type: 'error', msg: 'Zorunlu alanları (* ) doldurunuz.' });
    return;
  }

  try {




    const data = await createCustomer(
  customer.adSoyad,
  customer.tel,
  customer.faks,
  customer.email,
  customer.adres
   );
    


    if (data?.error) {
      setStatus({ visible: true, type: 'error', msg: data.error });
      return;
    }

    Keyboard.dismiss();

    setStatus({
      visible: true,
      type: 'success',
      msg: 'Müşteri veritabanına kaydedildi.'
    });

  } catch (error) {

    setStatus({
      visible: true,
      type: 'error',
      msg: 'Server bağlantısı kurulamadı.'
    });

  }
};



  /*

  const handleSaveAttempt = () => {
    if (!customer.adSoyad || !customer.tel || !customer.email) {
      setStatus({ visible: true, type: 'error', msg: 'Zorunlu alanları (* ) doldurunuz.' });
      return;
    }
    Keyboard.dismiss();
    setStatus({ visible: true, type: 'success', msg: 'Müşteri başarıyla kaydedildi.' });
  };


*/

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
        
        {/* ANDROID'DE EKRAN KAYMASI İÇİN OFFSET KULLANILDI */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          keyboardVerticalOffset={Platform.OS === "android" ? 40 : 0}
          style={{flex: 1}}
        >
          <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
              <View style={[styles.titleBadge, { backgroundColor: theme.badgeBtnBg }]}><Text style={styles.title}>MÜŞTERİ KARTI</Text></View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{ paddingBottom: 150 }} // MÜDÜR: ESNEME PAYINI ARTIRDIM
            >
              <View style={[styles.sectionDivider, { backgroundColor: theme.dividerBg }]}><Text style={[styles.sectionText, { color: theme.dividerText }]}>KİMLİK VE İLETİŞİM</Text></View>

              <Text style={[styles.label, { color: theme.labelColor }]}>AD SOYAD / ÜNVAN *</Text>
              <TextInput ref={r1} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'ad' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                onFocus={() => setFocusField('ad')} value={customer.adSoyad}
                onChangeText={(v)=>setCustomer({...customer, adSoyad: v})}
                returnKeyType="next" onSubmitEditing={()=>r2.current?.focus()} blurOnSubmit={false} />

              <View style={styles.rowLayout}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={[styles.label, { color: theme.labelColor }]}>TELEFON *</Text>
                  <TextInput ref={r2} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'tel' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                    onFocus={() => setFocusField('tel')} keyboardType="phone-pad" value={customer.tel}
                    onChangeText={(v)=>setCustomer({...customer, tel: v})}
                    returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={[styles.label, { color: theme.labelColor }]}>FAKS</Text>
                  <TextInput ref={r3} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'faks' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                    onFocus={() => setFocusField('faks')} keyboardType="phone-pad" value={customer.faks}
                    onChangeText={(v)=>setCustomer({...customer, faks: v})}
                    returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} />
                </View>
              </View>

              <Text style={[styles.label, { color: theme.labelColor }]}>E-POSTA ADRESİ *</Text>
              <TextInput ref={r4} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'email' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                onFocus={() => setFocusField('email')} keyboardType="email-address" value={customer.email}
                onChangeText={(v)=>setCustomer({...customer, email: v})}
                returnKeyType="next" onSubmitEditing={()=>r5.current?.focus()} blurOnSubmit={false} />

              <Text style={[styles.label, { color: theme.labelColor }]}>ADRES</Text>
              {/* MÜDÜR: ADRES KUTUSUNA 30px MARJİN (BOŞLUK) MÜHÜRLEDİM, KLAVYEYLE ÖPÜŞMEZ */}
              <TextInput ref={r5} style={[styles.input, {height: 80, backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor, marginBottom: 30}, focusField === 'adres' && [styles.focusedBorder, { backgroundColor: theme.cardBg }]]} 
                onFocus={() => setFocusField('adres')} multiline value={customer.adres}
                onChangeText={(v)=>setCustomer({...customer, adres: v})}
                returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} blurOnSubmit={true} />

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.badgeBtnBg }]} onPress={handleSaveAttempt}>
                <Text style={styles.saveButtonText}>KAYDI TAMAMLA</Text>
              </TouchableOpacity>

            </ScrollView>

            <StatusModal visible={status.visible} type={status.type} message={status.msg} isDarkMode={isDarkMode}
              onConfirm={() => { if (status.type === 'success') { setCustomer(initialState); onClose(); } setStatus({...status, visible: false}); }} />
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
  sectionDivider: { padding: 10, borderRadius: 10, marginVertical: 15 },
  sectionText: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 15, marginBottom: 15 },
  focusedBorder: { borderColor: '#FF3B30' },
  rowLayout: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 40, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  miniStatusContent: { width: '90%', borderRadius: 15, padding: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900' },
  statusSubText: { fontSize: 14, marginTop: 2 },
  miniConfirmBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});