import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- ÖZEL SEÇİM PENCERESİ (TÜR SEÇİMİ İÇİN) ---
const CustomSelect = ({ visible, title, data, onSelect, onClose, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
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

// --- DURUM PENCERESİ ---
const StatusModal = ({ visible, type, message, onConfirm, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onConfirm}>
      <View style={[styles.miniStatusContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }, type === 'error' && { borderColor: '#FF3B30', borderWidth: 1.5 }]}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusMainText, { color: isDarkMode ? '#fff' : '#1A1A1A' }, type === 'error' && { color: '#FF3B30' }]}>
              {type === 'success' ? 'ÇIKIŞ İŞLENDİ' : 'EKSİK BİLGİ'}
            </Text>
            <Text style={[styles.statusSubText, { color: isDarkMode ? '#aaa' : '#666' }]}>{message}</Text>
          </View>
          <TouchableOpacity style={[styles.miniConfirmBtn, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }, type === 'error' && { backgroundColor: '#FF3B30' }]} onPress={onConfirm}>
            <Ionicons name={type === 'success' ? "arrow-forward" : "close"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
);

// MÜDÜR: PARA FORMATLAMA MOTORU
const formatMoney = (val: string) => {
  if (!val) return '';
  let clean = val.toString().replace(/\./g, '').replace(',', '.');
  let num = parseFloat(clean);
  if (isNaN(num)) return '';
  
  let parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(',');
};

const parseMoney = (val: string) => {
  if (!val) return 0;
  let clean = val.toString().replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
};

export default function ParaCikisiFormu({ visible, onClose, isDarkMode }: any) {
  const initialState = { tur: 'Seçiniz...', tutar: '', aciklama: '' };
  
  const [f, setF] = useState(initialState);
  const [focus, setFocus] = useState('');
  const [showTurModal, setShowTurModal] = useState(false);
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '', errorTarget: '' });

  const rTutar = useRef<TextInput>(null);
  const rAciklama = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setF(initialState);
      setFocus('tur');
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
        if (target === 'tur') setShowTurModal(true);
        else if (target === 'tutar') rTutar.current?.focus();
        else if (target === 'aciklama') rAciklama.current?.focus();
      }, 300);
    }
  };

  const handleSaveAttempt = () => {
    if (f.tur === 'Seçiniz...') { setStatus({ visible: true, type: 'error', msg: 'Lütfen işlem türünü seçiniz! (*)', errorTarget: 'tur' }); return; }
    
    const rawTutar = parseMoney(f.tutar);
    if (rawTutar <= 0) { setStatus({ visible: true, type: 'error', msg: 'Lütfen geçerli bir tutar giriniz! (*)', errorTarget: 'tutar' }); return; }

    Keyboard.dismiss();
    setStatus({ visible: true, type: 'success', msg: 'Tutar kasadan düşüldü.', errorTarget: '' });
  };

  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    borderColor: isDarkMode ? '#444' : '#eee',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#333',
    // MÜDÜR: BUTONLAR ANTRASİT, ETİKET İSE KIRMIZI (#FF3B30) OLACAK
    badgeBtnBg: isDarkMode ? '#333' : '#1A1A1A', 
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={40} style={{flex: 1}}>
          <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
            
            <View style={styles.header}>
              {/* MÜDÜR: ÇIKIŞ ETİKETİNE KIRMIZI FON MÜHRÜNÜ VURDUM */}
              <View style={[styles.badge, { backgroundColor: '#FF3B30' }]}>
                <Text style={styles.bt}>PARA ÇIKIŞI</Text>
              </View>
              <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color={theme.textColor} /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{paddingBottom: 150}}>
              
              <Text style={[styles.label, { color: theme.labelColor }]}>ÇIKIŞ TÜRÜ (*)</Text>
              <TouchableOpacity 
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focus === 'tur' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                onPress={() => { setShowTurModal(true); setFocus('tur'); Keyboard.dismiss(); }}
              >
                <Text style={{color: f.tur !== 'Seçiniz...' ? theme.textColor : '#aaa', fontWeight: '500'}}>{f.tur}</Text>
              </TouchableOpacity>

              {f.tur !== 'Seçiniz...' && (
                <>
                  <Text style={[styles.label, { color: theme.labelColor }]}>ÇIKIŞ TUTARI (₺) (*)</Text>
                  <TextInput 
                    ref={rTutar} 
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'tutar' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                    onFocus={()=>setFocus('tutar')} 
                    onBlur={() => setF({...f, tutar: formatMoney(f.tutar)})}
                    keyboardType="decimal-pad" 
                    value={f.tutar} 
                    onChangeText={(v)=>setF({...f, tutar:v})} 
                    returnKeyType="next" 
                    blurOnSubmit={false} 
                    onSubmitEditing={()=>rAciklama.current?.focus()} 
                  />

                  <Text style={[styles.label, { color: theme.labelColor }]}>AÇIKLAMA / NOT (Örn: Fatura, Tedarikçi vb.)</Text>
                  {/* MÜDÜR: KLAVYE ÖPÜŞME BOŞLUĞU (marginBottom: 30) VE BİTTİ TUŞU (blurOnSubmit) EKLENDİ */}
                  <TextInput 
                    ref={rAciklama} 
                    style={[styles.input, { height: 80, backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor, marginBottom: 30 }, focus === 'aciklama' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                    onFocus={()=>setFocus('aciklama')} 
                    multiline={true} 
                    blurOnSubmit={true} 
                    returnKeyType="done"
                    value={f.aciklama} 
                    onChangeText={(v)=>setF({...f, aciklama:v})} 
                    onSubmitEditing={() => Keyboard.dismiss()} 
                  />

                  {/* VİTRİN KUTUSU: ÇIKIŞ OLDUĞU İÇİN EKSİ VE KIRMIZI YAZACAK */}
                  <View style={[styles.dbPriceBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                    <Text style={[styles.dbPriceLabel, { color: theme.labelColor }]}>BU İŞLEMDE KASADAN ÇIKAN (GENEL TOPLAM)</Text>
                    <Text style={[styles.dbPriceValue, { color: '#FF3B30' }]}>
                      {f.tutar ? `- ${formatMoney(f.tutar)} ₺` : '- 0,00 ₺'}
                    </Text>
                  </View>

                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.badgeBtnBg }]} onPress={handleSaveAttempt}>
                    <Text style={styles.saveBtnText}>KASADAN DÜŞ</Text>
                  </TouchableOpacity>
                </>
              )}

            </ScrollView>

            <CustomSelect 
              visible={showTurModal} 
              title="ÇIKIŞ TÜRÜ" 
              data={['Genel Gider', 'Stok Alımı', 'Diğer Giderler']} 
              isDarkMode={isDarkMode} 
              onSelect={(v: string) => { 
                setF({...f, tur: v}); setShowTurModal(false); 
                setFocus('tutar'); setTimeout(() => rTutar.current?.focus(), 450); 
              }} 
              onClose={() => setShowTurModal(false)} 
            />

            <StatusModal visible={status.visible} type={status.type} message={status.msg} onConfirm={handleConfirmAction} isDarkMode={isDarkMode} />
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
  dbPriceBox: { padding: 20, borderRadius: 15, marginTop: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5 },
  dbPriceLabel: { fontSize: 10, fontWeight: '900' },
  dbPriceValue: { fontSize: 26, fontWeight: '900', marginTop: 5 },
  saveBtn: { height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  miniStatusContent: { width: '90%', borderRadius: 15, padding: 20, elevation: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900' },
  statusSubText: { fontSize: 14, marginTop: 5, fontWeight: '500' },
  miniConfirmBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  selectContent: { width: '85%', borderRadius: 25, padding: 20, elevation: 20 },
  selectTitle: { fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 15, borderBottomWidth: 1.5, paddingBottom: 15 },
  selectItem: { paddingVertical: 15, borderBottomWidth: 1, alignItems: 'center' },
  selectItemText: { fontSize: 16, fontWeight: '700' },
});