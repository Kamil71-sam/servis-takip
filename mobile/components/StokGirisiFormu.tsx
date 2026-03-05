import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StokGirisiFormu({ visible, onClose }: any) {
  const initialState = {
    tur: '', marka: '', isim: '', no: '', aciklama: '', firma: '',
    alis: '', kar: '30', kdv: '20', iskonto: '0', satis: '0.00'
  };
  
  const [f, setF] = useState(initialState);
  const [focus, setFocus] = useState('tur'); 
  const [showTurModal, setShowTurModal] = useState(false);

  // REF MÜHÜRLERİ
  const rMarka = useRef<TextInput>(null);
  const rIsim = useRef<TextInput>(null);
  const rNo = useRef<TextInput>(null);
  const rAciklama = useRef<TextInput>(null);
  const rFirma = useRef<TextInput>(null);
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

  // KAYIT KONTROL MOTORU
  const handleSave = () => {
    if (!f.tur) { 
      Alert.alert("EKSİK BİLGİ", "Lütfen İşlem Türü seçiniz! (*)");
      setFocus('tur'); 
      return; 
    }
    if (!f.isim) { 
      Alert.alert("EKSİK BİLGİ", "Lütfen Parça İsmi giriniz! (*)");
      setFocus('isim'); 
      rIsim.current?.focus(); 
      return; 
    }
    if (!f.no) { 
      Alert.alert("EKSİK BİLGİ", "Lütfen Parça No giriniz! (*)");
      setFocus('no'); 
      rNo.current?.focus(); 
      return; 
    }
    if (!f.alis) { 
      Alert.alert("EKSİK BİLGİ", "Lütfen Alış Fiyatı giriniz! (*)");
      setFocus('alis'); 
      rAlis.current?.focus(); 
      return; 
    }

    Keyboard.dismiss();
    Alert.alert("BAŞARILI", "Stok Kaydı Başarıyla Yapıldı! ✅");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1, backgroundColor: '#fff'}}>
        <SafeAreaView style={styles.safe}>
          
          <View style={styles.header}>
            <View style={styles.badge}><Text style={styles.bt}>STOK GİRİŞİ</Text></View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{paddingBottom: 150}}>
            
            <Text style={styles.label}>İŞLEM TÜRÜ (*)</Text>
            <TouchableOpacity 
              style={[styles.input, focus === 'tur' && styles.redBorder]} 
              onPress={() => { setShowTurModal(true); setFocus('tur'); Keyboard.dismiss(); }}
            >
              <Text style={{color: f.tur ? '#000' : '#aaa', fontWeight: 'bold'}}>{f.tur || 'Seçiniz...'}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>MARKA</Text>
            <TextInput ref={rMarka} style={[styles.input, focus === 'marka' && styles.redBorder]} onFocus={()=>setFocus('marka')} value={f.marka} onChangeText={(v)=>setF({...f, marka:v})} returnKeyType="next" onSubmitEditing={()=>rIsim.current?.focus()} />

            <Text style={styles.label}>PARÇA İSMİ (*)</Text>
            <TextInput ref={rIsim} style={[styles.input, focus === 'isim' && styles.redBorder]} onFocus={()=>setFocus('isim')} value={f.isim} onChangeText={(v)=>setF({...f, isim:v})} returnKeyType="next" onSubmitEditing={()=>rNo.current?.focus()} />

            {/* PARÇA NO: ÖPÜŞME SORUNU ÇÖZÜLDÜ (MARGIN BOTTOM EKLENDİ) */}
            <Text style={styles.label}>PARÇA NO (*)</Text>
            <TextInput ref={rNo} style={[styles.input, focus === 'no' && styles.redBorder, {marginBottom: 25}]} onFocus={()=>setFocus('no')} value={f.no} onChangeText={(v)=>setF({...f, no:v})} returnKeyType="next" onSubmitEditing={()=>rAciklama.current?.focus()} />

            <Text style={styles.label}>AÇIKLAMA</Text>
            <TextInput ref={rAciklama} style={[styles.input, focus === 'aciklama' && styles.redBorder]} onFocus={()=>setFocus('aciklama')} value={f.aciklama} onChangeText={(v)=>setF({...f, aciklama:v})} returnKeyType="next" onSubmitEditing={()=>rFirma.current?.focus()} />

            <Text style={styles.label}>ÜRETİCİ FİRMA VEYA DİSTRİBÜTÖR</Text>
            <TextInput ref={rFirma} style={[styles.input, focus === 'firma' && styles.redBorder]} onFocus={()=>setFocus('firma')} value={f.firma} onChangeText={(v)=>setF({...f, firma:v})} returnKeyType="next" onSubmitEditing={()=>rAlis.current?.focus()} />

            <Text style={styles.label}>ALIŞ FİYATI (₺) (*)</Text>
            <TextInput ref={rAlis} style={[styles.input, focus === 'alis' && styles.redBorder]} onFocus={()=>setFocus('alis')} keyboardType="numeric" value={f.alis} onChangeText={(v)=>setF({...f, alis:v})} returnKeyType="next" onSubmitEditing={()=>rKar.current?.focus()} />

            <View style={styles.ratioRow}>
              <View style={styles.ratioCol}><Text style={styles.minLabel}>KÂR %</Text>
                <TextInput ref={rKar} style={[styles.minInput, focus === 'kar' && styles.redBorder]} onFocus={()=>setFocus('kar')} keyboardType="numeric" value={f.kar} onChangeText={(v)=>setF({...f, kar:v})} returnKeyType="next" onSubmitEditing={()=>rKdv.current?.focus()} />
              </View>
              <View style={styles.ratioCol}><Text style={styles.minLabel}>KDV %</Text>
                <TextInput ref={rKdv} style={[styles.minInput, focus === 'kdv' && styles.redBorder]} onFocus={()=>setFocus('kdv')} keyboardType="numeric" value={f.kdv} onChangeText={(v)=>setF({...f, kdv:v})} returnKeyType="next" onSubmitEditing={()=>rIsk.current?.focus()} />
              </View>
              <View style={styles.ratioCol}><Text style={styles.minLabel}>İSK %</Text>
                <TextInput ref={rIsk} style={[styles.minInput, focus === 'iskonto' && styles.redBorder]} onFocus={()=>setFocus('iskonto')} keyboardType="numeric" value={f.iskonto} onChangeText={(v)=>setF({...f, iskonto:v})} returnKeyType="done" onSubmitEditing={() => { Keyboard.dismiss(); setFocus('kayit'); }} />
              </View>
            </View>

            {/* SATIŞ FİYATI: SADELEŞTİRİLDİ */}
            <Text style={styles.label}>HESAPLANAN SATIŞ FİYATI</Text>
            <View style={[styles.resultBox, focus === 'kayit' && styles.redBorder]}>
              <Text style={styles.resultValue}>{f.satis} ₺</Text>
            </View>

            <TouchableOpacity style={[styles.saveBtn, focus === 'kayit' && {backgroundColor: '#FF3B30'}]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>KAYDI TAMAMLA</Text>
            </TouchableOpacity>
          </ScrollView>

          <Modal visible={showTurModal} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={()=>setShowTurModal(false)}>
              <View style={styles.miniMenu}>
                {['Stok Tamamlama', 'Bekleyen Parça'].map(t => (
                  <TouchableOpacity key={t} style={styles.menuItem} onPress={()=>{setF({...f, tur:t}); setShowTurModal(false); setFocus('marka'); setTimeout(()=>rMarka.current?.focus(), 300);}}>
                    <Text style={styles.menuText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 15 },
  badge: { backgroundColor: '#1A1A1A', padding: 12, borderRadius: 12 },
  bt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  label: { fontSize: 11, fontWeight: '900', color: '#555', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 15, borderWidth: 1.5, borderColor: '#eee', fontSize: 16 },
  redBorder: { borderColor: '#FF3B30', backgroundColor: '#fff' },
  ratioRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  ratioCol: { width: '30%' },
  minLabel: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#333' },
  minInput: { backgroundColor: '#f2f2f2', borderRadius: 10, padding: 12, textAlign: 'center', fontWeight: 'bold', fontSize: 16, borderWidth: 1.5, borderColor: '#eee' },
  // SATIŞ FİYATI KUTUSU DİĞERLERİYLE UYUMLU HALE GETİRİLDİ
  resultBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, borderWidth: 1.5, borderColor: '#eee', alignItems: 'center', marginTop: 5 },
  resultValue: { color: '#1A1A1A', fontSize: 24, fontWeight: '900' },
  saveBtn: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  miniMenu: { backgroundColor: '#fff', width: '85%', borderRadius: 30, padding: 15 },
  menuItem: { padding: 22, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  menuText: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' }
});