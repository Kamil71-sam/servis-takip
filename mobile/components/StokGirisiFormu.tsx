import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StokGirisiFormu({ visible, onClose }: any) {
  const initialState = {
    islem: 'Stok Tamamlama', isim: '', no: '', alis: '', kar: '30', kdv: '20', satis: '0'
  };
  const [stok, setStok] = useState(initialState);
  const r1=useRef<TextInput>(null);

  // OTOMATİK HESAPLAMA MOTORU
  useEffect(() => {
    const a = parseFloat(stok.alis) || 0;
    const k = parseFloat(stok.kar) || 0;
    const kv = parseFloat(stok.kdv) || 0;
    if (a > 0) {
      const sonuc = a + (a * k / 100) + (a * kv / 100);
      setStok(prev => ({ ...prev, satis: sonuc.toFixed(2) }));
    }
  }, [stok.alis, stok.kar, stok.kdv]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <View style={styles.badge}><Text style={styles.bt}>STOK GİRİŞİ</Text></View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{paddingBottom: 100}}>
             <Text style={styles.label}>PARÇA İSMİ (*) </Text>
             <TextInput ref={r1} style={styles.input} value={stok.isim} onChangeText={(v)=>setStok({...stok, isim: v})} />
             
             <Text style={styles.label}>ALIŞ FİYATI (*) </Text>
             <TextInput style={styles.input} keyboardType="numeric" value={stok.alis} onChangeText={(v)=>setStok({...stok, alis: v})} />
             
             <View style={styles.res}><Text style={styles.rl}>SATIŞ FİYATI: {stok.satis} ₺</Text></View>
             
             <TouchableOpacity style={styles.btn} onPress={onClose}><Text style={styles.btxt}>KAYDET</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 52, marginBottom: 20 },
  badge: { backgroundColor: '#1A1A1A', padding: 12, borderRadius: 12 },
  bt: { color: '#fff', fontWeight: '900' },
  label: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#f2f2f2', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: '#eee' },
  res: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 15, marginTop: 20, alignItems: 'center' },
  rl: { color: '#fff', fontSize: 20, fontWeight: '900' },
  btn: { backgroundColor: '#1A1A1A', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  btxt: { color: '#fff', fontWeight: '900', fontSize: 18 }
});