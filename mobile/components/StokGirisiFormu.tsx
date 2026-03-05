import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StokGirisiFormu({ visible, onClose }: any) {
  const initialState = {
    tur: 'Seçiniz...', isim: '', no: '', alis: '', 
    kar: '30', kdv: '20', iskonto: '0', satis: '0', firma: ''
  };
  
  const [f, setF] = useState(initialState);
  const [focus, setFocus] = useState('isim');
  const [showTurModal, setShowTurModal] = useState(false);

  const r1 = useRef<TextInput>(null);
  const r2 = useRef<TextInput>(null);
  const r3 = useRef<TextInput>(null);

  // Form açıldığında her şeyi sıfırla ve isme odaklan
  useEffect(() => {
    if (visible) {
      setF(initialState);
      setFocus('isim');
      setTimeout(() => r1.current?.focus(), 500);
    }
  }, [visible]);

  // HESAPLAMA MOTORU: ALlŞ + KAR + KDV - İSKONTO
  useEffect(() => {
    const alis = parseFloat(f.alis) || 0;
    const karOran = parseFloat(f.kar) || 0;
    const kdvOran = parseFloat(f.kdv) || 0;
    const iskOran = parseFloat(f.iskonto) || 0;

    if (alis > 0) {
      // Önce kâr ekle
      let araToplam = alis + (alis * karOran / 100);
      // Sonra KDV ekle
      let kdvDahil = araToplam + (araToplam * kdvOran / 100);
      // En son iskontoyu düş
      let sonFiyat = kdvDahil - (kdvDahil * iskOran / 100);
      
      setF(prev => ({ ...prev, satis: sonFiyat.toFixed(2) }));
    } else {
      setF(prev => ({ ...prev, satis: '0.00' }));
    }
  }, [f.alis, f.kar, f.kdv, f.iskonto]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{flex: 1, backgroundColor: '#fff'}}
      >
        <SafeAreaView style={styles.safe}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.badge}><Text style={styles.bt}>YENİ STOK GİRİŞİ</Text></View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={42} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="always" 
            contentContainerStyle={{paddingBottom: 100}}
          >
            {/* İŞLEM TÜRÜ */}
            <Text style={styles.label}>İŞLEM TÜRÜ (*)</Text>
            <TouchableOpacity 
              style={[styles.input, focus === 'tur' && styles.redBorder]} 
              onPress={() => { setShowTurModal(true); setFocus('tur'); Keyboard.dismiss(); }}
            >
              <Text style={{color: f.tur === 'Seçiniz...' ? '#aaa' : '#000', fontWeight: 'bold'}}>{f.tur}</Text>
            </TouchableOpacity>

            {/* İSİM VE NO */}
            <Text style={styles.label}>PARÇA İSMİ VE NO (*)</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TextInput 
                ref={r1}
                style={[styles.input, {width: '65%'}, focus === 'isim' && styles.redBorder]} 
                onFocus={() => setFocus('isim')}
                placeholder="Örn: Anakart"
                value={f.isim}
                onChangeText={(v) => setF({...f, isim:v})}
                returnKeyType="next"
              />
              <TextInput 
                ref={r2}
                style={[styles.input, {width: '30%'}, focus === 'no' && styles.redBorder]} 
                onFocus={() => setFocus('no')}
                placeholder="No"
                value={f.no}
                onChangeText={(v) => setF({...f, no:v})}
              />
            </View>

            {/* ALIŞ FİYATI */}
            <Text style={styles.label}>ALIŞ FİYATI (₺) (*)</Text>
            <TextInput 
              ref={r3}
              style={[styles.input, focus === 'alis' && styles.redBorder]} 
              onFocus={() => setFocus('alis')}
              keyboardType="numeric"
              placeholder="0.00"
              value={f.alis}
              onChangeText={(v) => setF({...f, alis:v})}
            />

            {/* ORANLAR (KAR - KDV - İSKONTO) */}
            <View style={styles.ratioRow}>
              <View style={styles.ratioCol}>
                <Text style={styles.minLabel}>KÂR %</Text>
                <TextInput style={styles.minInput} keyboardType="numeric" value={f.kar} onChangeText={(v)=>setF({...f, kar:v})} />
              </View>
              <View style={styles.ratioCol}>
                <Text style={styles.minLabel}>KDV %</Text>
                <TextInput style={styles.minInput} keyboardType="numeric" value={f.kdv} onChangeText={(v)=>setF({...f, kdv:v})} />
              </View>
              <View style={styles.ratioCol}>
                <Text style={styles.minLabel}>İSK %</Text>
                <TextInput style={styles.minInput} keyboardType="numeric" value={f.iskonto} onChangeText={(v)=>setF({...f, iskonto:v})} />
              </View>
            </View>

            {/* SONUÇ EKRANI */}
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>HESAPLANAN SATIŞ FİYATI</Text>
              <Text style={styles.resultValue}>{f.satis} ₺</Text>
            </View>

            <Text style={styles.label}>ÜRETİCİ FİRMA</Text>
            <TextInput 
              style={[styles.input, focus === 'firma' && styles.redBorder]} 
              onFocus={() => setFocus('firma')}
              placeholder="Firma ismi"
              value={f.firma}
              onChangeText={(v) => setF({...f, firma:v})}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={onClose}>
              <Text style={styles.saveBtnText}>STOK KAYDINI MÜHÜRLE</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* TÜR SEÇİM MODALI */}
          <Modal visible={showTurModal} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={()=>setShowTurModal(false)}>
              <View style={styles.miniMenu}>
                {['Stok Tamamlama', 'Bekleyen Parça'].map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={styles.menuItem} 
                    onPress={() => { setF({...f, tur:t}); setShowTurModal(false); setFocus('isim'); r1.current?.focus(); }}
                  >
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 20 },
  badge: { backgroundColor: '#1A1A1A', padding: 12, borderRadius: 12 },
  bt: { color: '#fff', fontWeight: '900', fontSize: 14 },
  closeBtn: { padding: 5 },
  label: { fontSize: 12, fontWeight: '900', color: '#333', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 15, borderWidth: 1.5, borderColor: '#eee', fontSize: 16 },
  redBorder: { borderColor: '#FF3B30', backgroundColor: '#fff' },
  ratioRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  ratioCol: { width: '30%' },
  minLabel: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#666' },
  minInput: { backgroundColor: '#f2f2f2', borderRadius: 10, padding: 12, textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  resultBox: { backgroundColor: '#1A1A1A', padding: 25, borderRadius: 20, marginTop: 30, alignItems: 'center' },
  resultLabel: { color: '#888', fontSize: 12, fontWeight: 'bold' },
  resultValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 5 },
  saveBtn: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  miniMenu: { backgroundColor: '#fff', width: '80%', borderRadius: 25, padding: 10, elevation: 10 },
  menuItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  menuText: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' }
});