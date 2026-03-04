import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniServisKaydi({ visible, onClose }: Props) {
  const [servis, setServis] = useState({
    cihaz_sahibi: '', cihaz_turu: 'Cep Telefonu', marka: '', model: '',
    seri_no: '', garanti: 'Yok', muster_notu: '', aksesuar: '', ariza_notu: '', usta: 'Usta 1'
  });

  // P2 NEXT ZİNCİRİ REFERANSLARI
  const r1=useRef<TextInput>(null); const r2=useRef<TextInput>(null);
  const r3=useRef<TextInput>(null); const r4=useRef<TextInput>(null);
  const r5=useRef<TextInput>(null); const r6=useRef<TextInput>(null);
  const r7=useRef<TextInput>(null); const r8=useRef<TextInput>(null);

  const handleSave = async () => {
    if (!servis.cihaz_sahibi || !servis.marka || !servis.ariza_notu) {
      Alert.alert("DİKKAT", "Zorunlu alanları doldurmadan kayıt yapılamaz!");
      return;
    }
    Keyboard.dismiss();
    Alert.alert("BAŞARILI", "Servis kaydı başarıyla tamamlandı.", [{ text: "Tamam", onPress: () => onClose() }]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.fullContainer}>
        <SafeAreaView style={styles.safeArea}>
          
          <View style={styles.header}>
            <View style={styles.titleBadge}><Text style={styles.title}>CİHAZ BİLGİLERİ</Text></View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={40} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="always">
            
            {/* 1. MÜŞTERİ ARA */}
            <Text style={styles.label}>MÜŞTERİ ARA *</Text>
            <View style={styles.row}>
              <TextInput ref={r1} style={[styles.input, {flex: 1}]} placeholder="İsim veya Tel..." onChangeText={(v)=>setServis({...servis, cihaz_sahibi: v})} returnKeyType="next" onSubmitEditing={() => { r2.current?.focus(); }} />
              <TouchableOpacity style={styles.searchBtn}><Ionicons name="search" size={24} color="#fff" /></TouchableOpacity>
            </View>

            {/* 2. CİHAZ TÜRÜ */}
            <Text style={styles.label}>CİHAZ TÜRÜ</Text>
            <View style={styles.p2PickerContainer}>
              <Picker selectedValue={servis.cihaz_turu} onValueChange={(v: string) => { setServis({...servis, cihaz_turu: v}); r2.current?.focus(); }}>
                <Picker.Item label="Cep Telefonu" value="Cep Telefonu" />
                <Picker.Item label="Bilgisayar / Notebook" value="Notebook" />
                <Picker.Item label="Yazıcı" value="Yazıcı" />
                <Picker.Item label="Kamera" value="Kamera" />
                <Picker.Item label="TV" value="TV" />
              </Picker>
            </View>

            {/* 3. MARKA / MODEL */}
            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>MARKA *</Text>
                <TextInput ref={r2} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, marka: v})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>MODEL</Text>
                <TextInput ref={r3} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, model: v})} />
              </View>
            </View>

            {/* 4. SERİ NO / GARANTİ */}
            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>SERİ NUMARASI</Text>
                <TextInput ref={r4} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r5.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, seri_no: v})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>GARANTİ</Text>
                <View style={styles.p2PickerContainer}>
                  <Picker selectedValue={servis.garanti} onValueChange={(v: string) => { setServis({...servis, garanti: v}); r5.current?.focus(); }}>
                    <Picker.Item label="Yok" value="Yok" /><Picker.Item label="Var" value="Var" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* 5. MÜŞTERİ NOTU (YENİ EKLENDİ) */}
            <Text style={styles.label}>MÜŞTERİ NOTU</Text>
            <TextInput ref={r5} style={styles.input} placeholder="Müşterinin özel isteği..." returnKeyType="next" onSubmitEditing={()=>r6.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, muster_notu: v})} />

            {/* 6. AKSESUAR DURUMU */}
            <Text style={styles.label}>CİHAZ / AKSESUAR DURUMU</Text>
            <TextInput ref={r6} style={styles.input} placeholder="Çizik, şarj aleti, kılıf..." returnKeyType="next" onSubmitEditing={()=>r7.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, aksesuar: v})} />

            {/* 7. ARIZA VEYA ŞİKAYET BİLGİSİ */}
            <Text style={styles.label}>ARIZA VEYA ŞİKAYET BİLGİSİ *</Text>
            <TextInput ref={r7} style={[styles.input, {height: 60}]} placeholder="Cihazdaki sorun nedir?" returnKeyType="next" onSubmitEditing={() => { Keyboard.dismiss(); }} blurOnSubmit={false} onChangeText={(v)=>setServis({...servis, ariza_notu: v})} />

            {/* 8. USTA SEÇİMİ */}
            <Text style={styles.label}>ATANAN USTA</Text>
            <View style={[styles.p2PickerContainer, {borderColor: '#1A1A1A', borderWidth: 1.5}]}>
              <Picker selectedValue={servis.usta} onValueChange={(v: string) => setServis({...servis, usta: v})}>
                <Picker.Item label="Usta 1" value="Usta 1" />
                <Picker.Item label="Usta 2" value="Usta 2" />
                <Picker.Item label="Usta 3" value="Usta 3" />
                <Picker.Item label="Usta 4" value="Usta 4" />
                <Picker.Item label="Usta 5" value="Usta 5" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>KAYDI TAMAMLA</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: Platform.OS === 'android' ? 10 : 0 },
  titleBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 5 },
  input: { backgroundColor: '#f2f2f2', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, fontSize: 15, color: '#000' },
  p2PickerContainer: { backgroundColor: '#f2f2f2', borderRadius: 12, borderWidth: 1, borderColor: '#eee', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  searchBtn: { backgroundColor: '#1A1A1A', width: 48, height: 48, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  saveButton: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 35, marginBottom: 30 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' }
});