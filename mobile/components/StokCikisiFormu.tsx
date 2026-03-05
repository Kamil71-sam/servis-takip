import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- P2 DURUM PENCERESİ (RESMİ VE OK İŞARETLİ) ---
const StatusModal = ({ visible, type, message, onConfirm }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onConfirm}>
      <View style={[styles.miniStatusContent, type === 'error' && { borderColor: '#FF3B30', borderWidth: 1.5 }]}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusMainText, type === 'error' && { color: '#FF3B30' }]}>
              {type === 'success' ? 'İŞLEM TAMAMLANDI' : 'EKSİK BİLGİ'}
            </Text>
            <Text style={styles.statusSubText}>{message}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.miniConfirmBtn, type === 'error' && { backgroundColor: '#FF3B30' }]} 
            onPress={onConfirm}
          >
            <Ionicons name={type === 'success' ? "arrow-forward" : "close"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
);

export default function StokCikisiFormu({ visible, onClose }: any) {
  const initialState = { marka: '', isim: '', no: '', adet: '1', satisFiyati: '0.00', aciklama: '' };
  const [f, setF] = useState(initialState);
  const [focus, setFocus] = useState(''); 
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '', errorTarget: '' });

  const rMarka = useRef<TextInput>(null);
  const rIsim = useRef<TextInput>(null);
  const rNo = useRef<TextInput>(null);
  const rAdet = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setF(initialState);
      setFocus('marka');
      setTimeout(() => rMarka.current?.focus(), 300);
    }
  }, [visible]);

  const handleConfirmAction = () => {
    if (status.type === 'success') {
      setStatus({ ...status, visible: false });
      onClose(); 
    } else {
      const target = status.errorTarget;
      setStatus({ ...status, visible: false });
      setTimeout(() => {
        if (target === 'marka') rMarka.current?.focus();
        else if (target === 'isim') rIsim.current?.focus();
        else if (target === 'no') rNo.current?.focus();
        else if (target === 'adet') rAdet.current?.focus();
      }, 300);
    }
  };

  const handleSaveAttempt = () => {
    if (!f.isim) { setStatus({ visible: true, type: 'error', msg: 'Lütfen Parça İsmi giriniz! (*)', errorTarget: 'isim' }); return; }
    if (!f.no) { setStatus({ visible: true, type: 'error', msg: 'Lütfen Parça No giriniz! (*)', errorTarget: 'no' }); return; }
    if (!f.adet || parseInt(f.adet) < 1) { setStatus({ visible: true, type: 'error', msg: 'Lütfen geçerli bir adet giriniz! (*)', errorTarget: 'adet' }); return; }

    Keyboard.dismiss();
    setStatus({ visible: true, type: 'success', msg: 'Stok kaydı yapıldı.', errorTarget: '' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={40} style={{flex: 1, backgroundColor: '#fff'}}>
        <SafeAreaView style={styles.safe}>
          
          <View style={styles.header}>
            <View style={[styles.badge, {backgroundColor: '#1A1A1A'}]}><Text style={styles.bt}>YENİ STOK ÇIKIŞI</Text></View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{paddingBottom: 150}}>
            
            <Text style={styles.label}>MARKA</Text>
            <TextInput ref={rMarka} style={[styles.input, focus === 'marka' && styles.redBorder]} onFocus={()=>setFocus('marka')} value={f.marka} onChangeText={(v)=>setF({...f, marka:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rIsim.current?.focus()} />

            <Text style={styles.label}>PARÇA İSMİ (*)</Text>
            <TextInput ref={rIsim} style={[styles.input, focus === 'isim' && styles.redBorder]} onFocus={()=>setFocus('isim')} value={f.isim} onChangeText={(v)=>setF({...f, isim:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rNo.current?.focus()} />

            <Text style={styles.label}>PARÇA NO (*)</Text>
            <TextInput ref={rNo} style={[styles.input, focus === 'no' && styles.redBorder, {marginBottom: 25}]} onFocus={()=>setFocus('no')} value={f.no} onChangeText={(v)=>setF({...f, no:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rAdet.current?.focus()} />

            <Text style={styles.label}>ÇIKIŞ ADEDİ (*)</Text>
            <TextInput ref={rAdet} style={[styles.input, focus === 'adet' && styles.redBorder]} onFocus={()=>setFocus('adet')} keyboardType="numeric" value={f.adet} onChangeText={(v)=>setF({...f, adet:v})} />

            {/* DB'DEN ALINACAK KUTUSU (ŞİMDİLİK SABİT VE SİLİK) */}
            <View style={styles.dbPriceBox}>
              <Text style={styles.dbPriceLabel}>DB SATIŞ FİYATI (ADET)</Text>
              <Text style={styles.dbPriceValue}>DB'den Alınacak...</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAttempt}>
              <Text style={styles.saveBtnText}>KAYDI TAMAMLA</Text>
            </TouchableOpacity>
          </ScrollView>

          <StatusModal 
            visible={status.visible} 
            type={status.type} 
            message={status.msg} 
            onConfirm={handleConfirmAction} 
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 15 },
  badge: { padding: 12, borderRadius: 12 },
  bt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  label: { fontSize: 11, fontWeight: '900', color: '#555', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 15, borderWidth: 1.5, borderColor: '#eee', fontSize: 16, fontWeight: '500' },
  redBorder: { borderColor: '#FF3B30', backgroundColor: '#fff' },
  // DB FİYAT KUTUSU (SABİT VE SİLİK NİZAM)
  dbPriceBox: { backgroundColor: '#f2f2f2', padding: 20, borderRadius: 15, marginTop: 25, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  dbPriceLabel: { fontSize: 10, fontWeight: '900', color: '#999' },
  dbPriceValue: { fontSize: 20, fontWeight: '500', color: '#bbb', marginTop: 5 },
  saveBtn: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  miniStatusContent: { backgroundColor: '#fff', width: '90%', borderRadius: 15, padding: 20, elevation: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  statusSubText: { fontSize: 14, color: '#666', marginTop: 5, fontWeight: '500' },
  miniConfirmBtn: { backgroundColor: '#1A1A1A', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});