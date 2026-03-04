import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export default function YeniMusteriFormu({ visible, onClose }: any) {
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

  const handleSaveAttempt = () => {
    if (!customer.adSoyad || !customer.tel || !customer.email) {
      setStatus({ visible: true, type: 'error', msg: 'Zorunlu alanları (* ) doldurunuz.' });
      return;
    }
    Keyboard.dismiss();
    setStatus({ visible: true, type: 'success', msg: 'Müşteri başarıyla kaydedildi.' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "android" ? 40 : 0}
        style={styles.fullContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.titleBadge}><Text style={styles.title}>MÜŞTERİ KARTI</Text></View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ paddingBottom: 60 }} // BUTONUN ALTINDAKİ SON BOŞLUK
          >
            <View style={styles.sectionDivider}><Text style={styles.sectionText}>KİMLİK VE İLETİŞİM</Text></View>

            <Text style={styles.label}>AD SOYAD / ÜNVAN *</Text>
            <TextInput ref={r1} style={[styles.input, focusField === 'ad' && styles.focusedBorder]} 
              onFocus={() => setFocusField('ad')} value={customer.adSoyad}
              onChangeText={(v)=>setCustomer({...customer, adSoyad: v})}
              returnKeyType="next" onSubmitEditing={()=>r2.current?.focus()} blurOnSubmit={false} />

            <View style={styles.rowLayout}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>TELEFON *</Text>
                <TextInput ref={r2} style={[styles.input, focusField === 'tel' && styles.focusedBorder]} 
                  onFocus={() => setFocusField('tel')} keyboardType="phone-pad" value={customer.tel}
                  onChangeText={(v)=>setCustomer({...customer, tel: v})}
                  returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>FAKS</Text>
                <TextInput ref={r3} style={[styles.input, focusField === 'faks' && styles.focusedBorder]} 
                  onFocus={() => setFocusField('faks')} keyboardType="phone-pad" value={customer.faks}
                  onChangeText={(v)=>setCustomer({...customer, faks: v})}
                  returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} />
              </View>
            </View>

            <Text style={styles.label}>E-POSTA ADRESİ *</Text>
            <TextInput ref={r4} style={[styles.input, focusField === 'email' && styles.focusedBorder]} 
              onFocus={() => setFocusField('email')} keyboardType="email-address" value={customer.email}
              onChangeText={(v)=>setCustomer({...customer, email: v})}
              returnKeyType="next" onSubmitEditing={()=>r5.current?.focus()} blurOnSubmit={false} />

            <Text style={styles.label}>ADRES</Text>
            <TextInput ref={r5} style={[styles.input, {height: 80}, focusField === 'adres' && styles.focusedBorder]} 
              onFocus={() => setFocusField('adres')} multiline value={customer.adres}
              onChangeText={(v)=>setCustomer({...customer, adres: v})}
              returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} blurOnSubmit={true} />

            {/* BUTON ARTIK DOĞAL SIRASINDA, EN ALTTA */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAttempt}>
              <Text style={styles.saveButtonText}>KAYDI TAMAMLA</Text>
            </TouchableOpacity>

          </ScrollView>

          <StatusModal visible={status.visible} type={status.type} message={status.msg} 
            onConfirm={() => { if (status.type === 'success') { setCustomer(initialState); onClose(); } setStatus({...status, visible: false}); }} />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 52 : 32, marginBottom: 20 },
  titleBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  sectionDivider: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 10, marginVertical: 15 },
  sectionText: { fontSize: 12, fontWeight: 'bold', color: '#444', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#f2f2f2', borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, padding: 12, fontSize: 15, color: '#000', marginBottom: 15 },
  focusedBorder: { borderColor: '#FF3B30', backgroundColor: '#fff' },
  rowLayout: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 40, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  miniStatusContent: { backgroundColor: '#fff', width: '90%', borderRadius: 15, padding: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900' },
  statusSubText: { fontSize: 14, color: '#666', marginTop: 2 },
  miniConfirmBtn: { backgroundColor: '#1A1A1A', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});