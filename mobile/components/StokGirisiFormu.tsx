import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- P2 DURUM PENCERESİ (GECE MODU DESTEKLİ) ---
const StatusModal = ({ visible, type, message, onConfirm, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onConfirm}>
      <View style={[styles.miniStatusContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }, type === 'error' && { borderColor: '#FF3B30', borderWidth: 1.5 }]}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusMainText, { color: isDarkMode ? '#fff' : '#1A1A1A' }, type === 'error' && { color: '#FF3B30' }]}>
              {type === 'success' ? 'KAYIT TAMAMLANDI' : 'İŞLEM ENGELLENDİ'}
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

export default function StokGirisiFormu({ visible, onClose, isDarkMode }: any) {
  const initialState = {
    tur: '', marka: '', isim: '', no: '', aciklama: '', firma: '',
    alis: '', kar: '30', kdv: '20', iskonto: '0', satis: '0.00'
  };
  
  const [f, setF] = useState(initialState);
  const [focus, setFocus] = useState(''); 
  const [showTurModal, setShowTurModal] = useState(false);
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '', errorTarget: '' });

  const rMarka = useRef<TextInput>(null);
  const rIsim = useRef<TextInput>(null);
  const rNo = useRef<TextInput>(null);
  const rAlis = useRef<TextInput>(null);
  const rKar = useRef<TextInput>(null);
  const rKdv = useRef<TextInput>(null);
  const rIsk = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setF(initialState);
      setFocus('tur');
    }
  }, [visible]);

  // HESAPLAMA MOTORU (KAR+ / KDV+ / İSKONTO-)
  useEffect(() => {
    const a = parseFloat(f.alis) || 0;
    const kr = parseFloat(f.kar) || 0;
    const kv = parseFloat(f.kdv) || 0;
    const is = parseFloat(f.iskonto) || 0;

    if (a > 0) {
      let ara = a + (a * kr / 100);
      let kdvli = ara + (ara * kv / 100);
      let son = kdvli - (kdvli * is / 100);
      setF(prev => ({ ...prev, satis: son.toFixed(2) }));
    } else {
      setF(prev => ({ ...prev, satis: '0.00' }));
    }
  }, [f.alis, f.kar, f.kdv, f.iskonto]);

  const handleConfirmAction = () => {
    if (status.type === 'success') {
      setStatus({ ...status, visible: false });
      onClose(); 
    } else {
      const target = status.errorTarget;
      setStatus({ ...status, visible: false });
      setTimeout(() => {
        if (target === 'tur') setShowTurModal(true);
        else if (target === 'isim') rIsim.current?.focus();
        else if (target === 'no') rNo.current?.focus();
        else if (target === 'alis') rAlis.current?.focus();
        else if (target === 'iskonto') rIsk.current?.focus();
      }, 300);
    }
  };

  const handleSaveAttempt = () => {
    const alisRakam = parseFloat(f.alis) || 0;
    const satisRakam = parseFloat(f.satis) || 0;

    // --- KRİTİK KONTROL: ZARARINA SATIŞ ENGELLİ ---
    if (alisRakam > 0 && satisRakam < alisRakam) {
      setStatus({ 
        visible: true, 
        type: 'error', 
        msg: 'Zararına işlem yapılamaz! Satış fiyatı alışın altında.', 
        errorTarget: 'iskonto' 
      });
      return;
    }

    if (!f.tur) { setStatus({ visible: true, type: 'error', msg: 'Lütfen İşlem Türü seçiniz! (*)', errorTarget: 'tur' }); return; }
    if (!f.isim) { setStatus({ visible: true, type: 'error', msg: 'Lütfen Parça İsmi giriniz! (*)', errorTarget: 'isim' }); return; }
    if (!f.no) { setStatus({ visible: true, type: 'error', msg: 'Lütfen Parça No giriniz! (*)', errorTarget: 'no' }); return; }
    if (!f.alis) { setStatus({ visible: true, type: 'error', msg: 'Lütfen Alış Fiyatı giriniz! (*)', errorTarget: 'alis' }); return; }

    Keyboard.dismiss();
    setStatus({ visible: true, type: 'success', msg: 'Stok kaydı yapıldı.', errorTarget: '' });
  };

  // DİNAMİK STİLLER (Şaltere Bağlı)
  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f9f9f9',
    minInputBg: isDarkMode ? '#333' : '#f2f2f2',
    borderColor: isDarkMode ? '#444' : '#eee',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#555',
    badgeBtnBg: isDarkMode ? '#333' : '#1A1A1A'
  };

  return (
    // MÜDÜR: MODALI ŞEFFAF YAPTIK, ARKADAN BEYAZ PLAKA SIZMASIN DİYE
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      
      {/* DIŞ KAPLAMA: TÜM BOŞLUKLARI GECE MODU RENGİYLE DOLDURUR, BEYAZ ÇİZGİYİ SİLER */}
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        
        {/* ANDROID'DE BOŞLUK YARATAN OFFSET DEĞERİNİ (40) GERİ GETİRDİM, EKRAN FERAH OLSUN */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          keyboardVerticalOffset={40} 
          style={{flex: 1}}
        >
          <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
            
            <View style={styles.header}>
              <View style={[styles.badge, { backgroundColor: theme.badgeBtnBg }]}><Text style={styles.bt}>STOK GİRİŞİ</Text></View>
              <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{paddingBottom: 150}}>
              
              <Text style={[styles.label, { color: theme.labelColor }]}>İŞLEM TÜRÜ (*)</Text>
              <TouchableOpacity 
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focus === 'tur' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                onPress={() => { setShowTurModal(true); setFocus('tur'); Keyboard.dismiss(); }}
              >
                <Text style={{color: f.tur ? theme.textColor : '#aaa', fontWeight: '500'}}>{f.tur || 'Seçiniz...'}</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: theme.labelColor }]}>MARKA</Text>
              <TextInput ref={rMarka} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'marka' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('marka')} value={f.marka} onChangeText={(v)=>setF({...f, marka:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rIsim.current?.focus()} />

              <Text style={[styles.label, { color: theme.labelColor }]}>PARÇA İSMİ (*)</Text>
              <TextInput ref={rIsim} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'isim' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('isim')} value={f.isim} onChangeText={(v)=>setF({...f, isim:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rNo.current?.focus()} />

              <Text style={[styles.label, { color: theme.labelColor }]}>PARÇA NO (*)</Text>
              <TextInput ref={rNo} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor, marginBottom: 30 }, focus === 'no' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('no')} value={f.no} onChangeText={(v)=>setF({...f, no:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rAlis.current?.focus()} />

              <Text style={[styles.label, { color: theme.labelColor }]}>ALIŞ FİYATI (₺) (*)</Text>
              <TextInput ref={rAlis} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'alis' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('alis')} keyboardType="numeric" value={f.alis} onChangeText={(v)=>setF({...f, alis:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rKar.current?.focus()} />

              <View style={styles.ratioRow}>
                <View style={styles.ratioCol}><Text style={[styles.minLabel, { color: theme.labelColor }]}>KÂR %</Text>
                  <TextInput ref={rKar} style={[styles.minInput, { backgroundColor: theme.minInputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'kar' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('kar')} keyboardType="numeric" value={f.kar} onChangeText={(v)=>setF({...f, kar:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rKdv.current?.focus()} />
                </View>
                <View style={styles.ratioCol}><Text style={[styles.minLabel, { color: theme.labelColor }]}>KDV %</Text>
                  <TextInput ref={rKdv} style={[styles.minInput, { backgroundColor: theme.minInputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'kdv' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('kdv')} keyboardType="numeric" value={f.kdv} onChangeText={(v)=>setF({...f, kdv:v})} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={()=>rIsk.current?.focus()} />
                </View>
                <View style={styles.ratioCol}><Text style={[styles.minLabel, { color: theme.labelColor }]}>İSK %</Text>
                  {/* MÜDÜR: İSK % KUTUSUNA TAM 30px MARJİN (BOŞLUK) MÜHÜRLEDİM, KLAVYEYLE ÖPÜŞMEZ ARTIK */}
                  <TextInput ref={rIsk} style={[styles.minInput, { backgroundColor: theme.minInputBg, borderColor: theme.borderColor, color: theme.textColor, marginBottom: 30 }, focus === 'iskonto' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('iskonto')} keyboardType="numeric" value={f.iskonto} onChangeText={(v)=>setF({...f, iskonto:v})} returnKeyType="done" onSubmitEditing={() => { Keyboard.dismiss(); setFocus('kayit'); }} />
                </View>
              </View>

              <Text style={[styles.label, { color: theme.labelColor }]}>HESAPLANAN SATIŞ FİYATI</Text>
              <View style={[styles.resultBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }, (parseFloat(f.satis) < parseFloat(f.alis)) && styles.errorResultBox]}>
                <Text style={[styles.resultValue, { color: theme.textColor }, (parseFloat(f.satis) < parseFloat(f.alis)) && {color: '#FF3B30'}]}>
                  {f.satis} ₺
                </Text>
              </View>

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.badgeBtnBg }]} onPress={handleSaveAttempt}>
                <Text style={styles.saveBtnText}>KAYDI TAMAMLA</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* İŞLEM TÜRÜ MODALI (GECE MODU) */}
            <Modal visible={showTurModal} transparent animationType="fade">
              <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={()=>setShowTurModal(false)}>
                <View style={[styles.miniMenu, { backgroundColor: theme.cardBg }]}>
                  {['Stok Tamamlama', 'Bekleyen Parça'].map(t => (
                    <TouchableOpacity key={t} style={[styles.menuItem, { borderBottomColor: theme.borderColor }]} onPress={()=>{setF({...f, tur:t}); setShowTurModal(false); setFocus('marka'); setTimeout(()=>rMarka.current?.focus(), 400);}}>
                      <Text style={[styles.menuText, { color: theme.textColor }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>

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
  ratioRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  ratioCol: { width: '30%' },
  minLabel: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  minInput: { borderRadius: 10, padding: 12, textAlign: 'center', fontWeight: '500', fontSize: 16, borderWidth: 1.5 },
  resultBox: { padding: 15, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', marginTop: 5 },
  errorResultBox: { borderColor: '#FF3B30', backgroundColor: '#331a1a' },
  resultValue: { fontSize: 24, fontWeight: '900' },
  saveBtn: { height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  miniMenu: { width: '85%', borderRadius: 30, padding: 15 },
  menuItem: { padding: 22, borderBottomWidth: 1, alignItems: 'center' },
  menuText: { fontSize: 17, fontWeight: '500', letterSpacing: 0.3 },
  miniStatusContent: { width: '90%', borderRadius: 15, padding: 20, elevation: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900' },
  statusSubText: { fontSize: 14, marginTop: 5, fontWeight: '500' },
  miniConfirmBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});