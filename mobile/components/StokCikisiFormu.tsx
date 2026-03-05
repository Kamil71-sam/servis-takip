import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- P2 DURUM PENCERESİ ---
const StatusModal = ({ visible, type, message, onConfirm, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onConfirm}>
      <View style={[styles.miniStatusContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }, type === 'error' && { borderColor: '#FF3B30', borderWidth: 1.5 }]}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusMainText, { color: isDarkMode ? '#fff' : '#1A1A1A' }, type === 'error' && { color: '#FF3B30' }]}>
              {type === 'success' ? 'İŞLEM TAMAMLANDI' : 'EKSİK BİLGİ'}
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
    </TouchableOpacity>
  </Modal>
);

export default function StokCikisiFormu({ visible, onClose, isDarkMode }: any) {
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

  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f9f9f9',
    borderColor: isDarkMode ? '#444' : '#eee',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#555',
    badgeBtnBg: isDarkMode ? '#333' : '#1A1A1A',
    dbBoxBg: isDarkMode ? '#1a1a1a' : '#f2f2f2',
    dbBoxBorder: isDarkMode ? '#444' : '#ccc',
    dbLabelColor: isDarkMode ? '#888' : '#999',
    dbValueColor: isDarkMode ? '#666' : '#bbb',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      
      {/* DIŞ KAPLAMA: BEYAZ ÇİZGİYİ ENGELLER */}
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        
        {/* MÜDÜR: OFFSET DEĞERİNİ GERİ GETİRDİM Kİ KLAVYE EKRANI YETERİNCE YUKARI İTSİN */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          keyboardVerticalOffset={40} 
          style={{flex: 1}}
        >
          <SafeAreaView style={styles.safe}>
            
            <View style={styles.header}>
              <View style={[styles.badge, { backgroundColor: theme.badgeBtnBg }]}><Text style={styles.bt}>YENİ STOK ÇIKIŞI</Text></View>
              <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{paddingBottom: 150}}>
              
              <Text style={[styles.label, { color: theme.labelColor }]}>MARKA</Text>
              <TextInput ref={rMarka} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'marka' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('marka')} value={f.marka} onChangeText={(v)=>setF({...f, marka:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rIsim.current?.focus()} />

              <Text style={[styles.label, { color: theme.labelColor }]}>PARÇA İSMİ (*)</Text>
              <TextInput ref={rIsim} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'isim' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('isim')} value={f.isim} onChangeText={(v)=>setF({...f, isim:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rNo.current?.focus()} />

              <Text style={[styles.label, { color: theme.labelColor }]}>PARÇA NO (*)</Text>
              <TextInput ref={rNo} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor, marginBottom: 25 }, focus === 'no' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('no')} value={f.no} onChangeText={(v)=>setF({...f, no:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rAdet.current?.focus()} />

              <Text style={[styles.label, { color: theme.labelColor }]}>ÇIKIŞ ADEDİ (*)</Text>
              {/* MÜDÜR: ÇIKIŞ ADEDİ KUTUSUNA DA 30px MARJİN (BOŞLUK) MÜHÜRLEDİM */}
              <TextInput ref={rAdet} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor, marginBottom: 30 }, focus === 'adet' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('adet')} keyboardType="numeric" value={f.adet} onChangeText={(v)=>setF({...f, adet:v})} />

              <View style={[styles.dbPriceBox, { backgroundColor: theme.dbBoxBg, borderColor: theme.dbBoxBorder }]}>
                <Text style={[styles.dbPriceLabel, { color: theme.dbLabelColor }]}>DB SATIŞ FİYATI (ADET)</Text>
                <Text style={[styles.dbPriceValue, { color: theme.dbValueColor }]}>DB'den Alınacak...</Text>
              </View>

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.badgeBtnBg }]} onPress={handleSaveAttempt}>
                <Text style={styles.saveBtnText}>KAYDI TAMAMLA</Text>
              </TouchableOpacity>
            </ScrollView>

            <StatusModal 
              visible={status.visible} 
              type={status.type} 
              message={status.msg} 
              onConfirm={handleConfirmAction} 
              isDarkMode={isDarkMode}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 15 },
  badge: { padding: 12, borderRadius: 12 },
  bt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  label: { fontSize: 11, fontWeight: '900', marginTop: 15, marginBottom: 5 },
  input: { borderRadius: 12, padding: 15, borderWidth: 1.5, fontSize: 16, fontWeight: '500' },
  redBorder: { borderColor: '#FF3B30' },
  dbPriceBox: { padding: 20, borderRadius: 15, marginTop: 25, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1 },
  dbPriceLabel: { fontSize: 10, fontWeight: '900' },
  dbPriceValue: { fontSize: 20, fontWeight: '500', marginTop: 5 },
  saveBtn: { height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  miniStatusContent: { width: '90%', borderRadius: 15, padding: 20, elevation: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900' },
  statusSubText: { fontSize: 14, marginTop: 5, fontWeight: '500' },
  miniConfirmBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});