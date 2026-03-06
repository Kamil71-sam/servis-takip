import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

const formatDate = (val: string) => {
  if (!val) return '';
  let clean = val.replace(/\D/g, ''); 
  if (clean.length > 8) clean = clean.slice(0, 8);
  let match = clean.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
  if (match) {
    return !match[2] ? match[1] : `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`;
  }
  return val;
};

const getTodayString = () => {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
};

export default function ParaCikisiFormu({ visible, onClose, isDarkMode }: any) {
  const initialState = { 
    tur: 'Seçiniz...', tutar: '', aciklama: '',
    malzemeIsmi: '', marka: '', model: '', parcaNo: '', siparisNo: '',
    siparisTarihi: '', gelisTarihi: '', 
    talepTuru: 'Seçiniz...', usta: 'Seçiniz...'
  };
  
  const [f, setF] = useState(initialState);
  const [focus, setFocus] = useState('');
  const [modalState, setModalState] = useState<'tur' | 'talepTuru' | 'usta' | null>(null);
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '', errorTarget: '' });

  const rTutar = useRef<TextInput>(null);
  const rAciklama = useRef<TextInput>(null);
  const rMalzeme = useRef<TextInput>(null);
  const rMarka = useRef<TextInput>(null);
  const rModel = useRef<TextInput>(null);
  const rParcaNo = useRef<TextInput>(null);
  const rSiparisNo = useRef<TextInput>(null);
  const rSiparisTarihi = useRef<TextInput>(null);
  const rGelisTarihi = useRef<TextInput>(null);

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
        if (target === 'tur') setModalState('tur');
        else if (target === 'talepTuru') setModalState('talepTuru');
        else if (target === 'usta') setModalState('usta');
        else if (target === 'tutar') rTutar.current?.focus();
        else if (target === 'malzeme') rMalzeme.current?.focus();
        else if (target === 'aciklama') rAciklama.current?.focus();
      }, 300);
    }
  };

  const handleSaveAttempt = () => {
    if (f.tur === 'Seçiniz...') { setStatus({ visible: true, type: 'error', msg: 'Lütfen işlem türünü seçiniz! (*)', errorTarget: 'tur' }); return; }
    
    if (f.tur === 'Stok Alımı') {
      if (!f.malzemeIsmi || f.malzemeIsmi.length < 2) {
        setStatus({ visible: true, type: 'error', msg: 'Malzeme ismini giriniz! (*)', errorTarget: 'malzeme' }); return;
      }
      if (f.talepTuru === 'Seçiniz...') {
        setStatus({ visible: true, type: 'error', msg: 'Alım amacını (Uzman/Stok) seçiniz! (*)', errorTarget: 'talepTuru' }); return;
      }
      if (f.talepTuru === 'Uzman Talebi' && f.usta === 'Seçiniz...') {
        setStatus({ visible: true, type: 'error', msg: 'Lütfen talep eden uzmanı seçiniz! (*)', errorTarget: 'usta' }); return;
      }
    }

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
    badgeBtnBg: isDarkMode ? '#333' : '#1A1A1A', 
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined} 
          style={{ flex: 1 }}
        >
          <View style={[styles.header, { paddingHorizontal: 20 }]}>
            <View style={[styles.badge, { backgroundColor: '#FF3B30' }]}>
              <Text style={styles.bt}>PARA ÇIKIŞI</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={42} color={theme.textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flex: 1, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled" 
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 400 }} 
          >
            
            <Text style={[styles.label, { color: theme.labelColor }]}>ÇIKIŞ TÜRÜ (*)</Text>
            <TouchableOpacity 
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focus === 'tur' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
              onPress={() => { setModalState('tur'); setFocus('tur'); Keyboard.dismiss(); }}
            >
              <Text style={{color: f.tur !== 'Seçiniz...' ? theme.textColor : '#aaa', fontWeight: '500'}}>{f.tur}</Text>
            </TouchableOpacity>

            {f.tur === 'Stok Alımı' && (
              <>
                <Text style={[styles.label, { color: theme.labelColor }]}>MALZEME İSMİ (*)</Text>
                <TextInput ref={rMalzeme} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'malzeme' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('malzeme')} value={f.malzemeIsmi} onChangeText={(v)=>setF({...f, malzemeIsmi:v})} returnKeyType="next" onSubmitEditing={()=>rMarka.current?.focus()} blurOnSubmit={false} />

                <View style={styles.rowLayout}>
                  <View style={{flex: 1, marginRight: 10}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>MARKASI</Text>
                    <TextInput ref={rMarka} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'marka' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('marka')} value={f.marka} onChangeText={(v)=>setF({...f, marka:v})} returnKeyType="next" onSubmitEditing={()=>rModel.current?.focus()} blurOnSubmit={false} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>MODEL</Text>
                    <TextInput ref={rModel} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'model' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('model')} value={f.model} onChangeText={(v)=>setF({...f, model:v})} returnKeyType="next" onSubmitEditing={()=>rParcaNo.current?.focus()} blurOnSubmit={false} />
                  </View>
                </View>

                <View style={styles.rowLayout}>
                  <View style={{flex: 1, marginRight: 10}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>PARÇA NO</Text>
                    <TextInput ref={rParcaNo} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'parcaNo' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('parcaNo')} value={f.parcaNo} onChangeText={(v)=>setF({...f, parcaNo:v})} returnKeyType="next" onSubmitEditing={()=>rSiparisNo.current?.focus()} blurOnSubmit={false} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>SİPARİŞ NO</Text>
                    <TextInput 
                      ref={rSiparisNo} 
                      style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'siparisNo' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                      onFocus={()=>setFocus('siparisNo')} 
                      value={f.siparisNo} 
                      onChangeText={(v)=>setF({...f, siparisNo:v})} 
                      returnKeyType="next" 
                      blurOnSubmit={false} 
                      onSubmitEditing={() => { 
                        setFocus('siparisTarihi'); 
                        setTimeout(() => rSiparisTarihi.current?.focus(), 150); 
                      }} 
                    />
                  </View>
                </View>

                <View style={styles.rowLayout}>
                  <View style={{flex: 1, marginRight: 10}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>SİPARİŞ TARİHİ</Text>
                    <View style={[styles.inputWithIcon, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focus === 'siparisTarihi' && [styles.redBorder, { backgroundColor: theme.cardBg }]]}>
                      <TextInput 
                        ref={rSiparisTarihi} 
                        style={[styles.flexInput, { color: theme.textColor }]} 
                        onFocus={()=>setFocus('siparisTarihi')} 
                        keyboardType="numeric" 
                        maxLength={10} 
                        placeholder="GG.AA.YYYY" 
                        placeholderTextColor={isDarkMode ? '#666' : '#aaa'} 
                        value={f.siparisTarihi} 
                        onChangeText={(v)=>setF({...f, siparisTarihi: formatDate(v)})} 
                        returnKeyType="next" 
                        blurOnSubmit={false}
                        onSubmitEditing={() => { 
                          setFocus('gelisTarihi'); 
                          setTimeout(() => rGelisTarihi.current?.focus(), 150); 
                        }} 
                      />
                      <TouchableOpacity onPress={() => setF({...f, siparisTarihi: getTodayString()})}>
                        <Ionicons name="calendar" size={24} color={theme.labelColor} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>GELİŞ TARİHİ</Text>
                    <View style={[styles.inputWithIcon, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focus === 'gelisTarihi' && [styles.redBorder, { backgroundColor: theme.cardBg }]]}>
                      <TextInput 
                        ref={rGelisTarihi} 
                        style={[styles.flexInput, { color: theme.textColor }]} 
                        onFocus={()=>setFocus('gelisTarihi')} 
                        keyboardType="numeric" 
                        maxLength={10} 
                        placeholder="GG.AA.YYYY" 
                        placeholderTextColor={isDarkMode ? '#666' : '#aaa'} 
                        value={f.gelisTarihi} 
                        onChangeText={(v)=>setF({...f, gelisTarihi: formatDate(v)})} 
                        returnKeyType="done" 
                        blurOnSubmit={true}
                        onSubmitEditing={() => { 
                          Keyboard.dismiss(); 
                          setFocus('talepTuru'); 
                          setTimeout(() => setModalState('talepTuru'), 150); 
                        }} 
                      />
                      <TouchableOpacity onPress={() => setF({...f, gelisTarihi: getTodayString()})}>
                        <Ionicons name="calendar" size={24} color={theme.labelColor} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <Text style={[styles.label, { color: theme.labelColor }]}>ALIM AMACI (*)</Text>
                <TouchableOpacity 
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focus === 'talepTuru' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                  onPress={() => { setModalState('talepTuru'); setFocus('talepTuru'); Keyboard.dismiss(); }}
                >
                  <Text style={{color: f.talepTuru !== 'Seçiniz...' ? theme.textColor : '#aaa', fontWeight: '500'}}>{f.talepTuru}</Text>
                </TouchableOpacity>

                {f.talepTuru === 'Uzman Talebi' && (
                  <>
                    <Text style={[styles.label, { color: theme.labelColor }]}>HANGİ UZMAN / USTA (*)</Text>
                    <TouchableOpacity 
                      style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focus === 'usta' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                      onPress={() => { setModalState('usta'); setFocus('usta'); Keyboard.dismiss(); }}
                    >
                      <Text style={{color: f.usta !== 'Seçiniz...' ? theme.textColor : '#aaa', fontWeight: '500'}}>{f.usta}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

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

                <Text style={[styles.label, { color: theme.labelColor }]}>AÇIKLAMA / NOT</Text>
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
            visible={modalState === 'tur'} title="ÇIKIŞ TÜRÜ" data={['Genel Gider', 'Stok Alımı', 'Diğer Giderler']} isDarkMode={isDarkMode} 
            onSelect={(v: string) => { 
              setF({...f, tur: v}); setModalState(null); 
              if(v === 'Stok Alımı') { setFocus('malzeme'); setTimeout(() => rMalzeme.current?.focus(), 450); }
              else { setFocus('tutar'); setTimeout(() => rTutar.current?.focus(), 450); }
            }} 
            onClose={() => setModalState(null)} 
          />

          <CustomSelect 
            visible={modalState === 'talepTuru'} title="ALIM AMACI" data={['Uzman Talebi', 'Stok Tamamlama']} isDarkMode={isDarkMode} 
            onSelect={(v: string) => { 
              setF({...f, talepTuru: v}); setModalState(null); 
              if(v === 'Uzman Talebi') { setFocus('usta'); setTimeout(() => setModalState('usta'), 450); }
              else { setFocus('tutar'); setTimeout(() => rTutar.current?.focus(), 450); }
            }} 
            onClose={() => setModalState(null)} 
          />

          <CustomSelect 
            visible={modalState === 'usta'} title="UZMAN / USTA SEÇİMİ" data={['Usta 1', 'Usta 2', 'Usta 3']} isDarkMode={isDarkMode} 
            onSelect={(v: string) => { setF({...f, usta: v}); setModalState(null); setFocus('tutar'); setTimeout(() => rTutar.current?.focus(), 450); }} 
            onClose={() => setModalState(null)} 
          />

          <StatusModal visible={status.visible} type={status.type} message={status.msg} onConfirm={handleConfirmAction} isDarkMode={isDarkMode} />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 15 },
  badge: { padding: 12, borderRadius: 12 },
  bt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  label: { fontSize: 11, fontWeight: '900', marginTop: 15, marginBottom: 5 },
  input: { borderRadius: 12, padding: 15, borderWidth: 1.5, fontSize: 16, fontWeight: '500' },
  inputWithIcon: { borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flexInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  redBorder: { borderColor: '#FF3B30' },
  rowLayout: { flexDirection: 'row', justifyContent: 'space-between' },
  dbPriceBox: { padding: 20, borderRadius: 15, marginTop: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5 },
  dbPriceLabel: { fontSize: 10, fontWeight: '900', textAlign: 'center' },
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