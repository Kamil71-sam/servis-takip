import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniServisKaydi({ visible, onClose }: Props) {
  const [servis, setServis] = useState({
    musteri_adi: '',   // Cihaz Sahibi
    marka_model: '',   // Marka ve Model
    seri_no: '',       // Cihaz Seri No
    ariza_notu: '',    // Şikayet / Arıza Detayı
    usta_adi: ''       // Atanan Teknisyen
  });

  // P2 PROTOKOLÜ: KLAVYE NEXT ZİNCİRİ REFERANSLARI
  const r1 = useRef<TextInput>(null);
  const r2 = useRef<TextInput>(null);
  const r3 = useRef<TextInput>(null);
  const r4 = useRef<TextInput>(null);
  const r5 = useRef<TextInput>(null);

  const handleSave = async () => {
    // P2: Zorunlu Alan Kontrolü (Müşteri, Cihaz, Arıza ve Usta mecburi)
    if (!servis.musteri_adi || !servis.marka_model || !servis.ariza_notu || !servis.usta_adi) {
      Alert.alert("DİKKAT", "Müşteri, Cihaz, Arıza ve Usta alanları mecburi mühürlenmelidir!");
      return;
    }

    try {
      const response = await fetch('http://192.168.1.43:5000/api/yeni-servis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servis)
      });
      const data = await response.json();
      
      if (data.success) {
        Keyboard.dismiss();
        Alert.alert("BAŞARILI", "Servis kaydı başarıyla tamamlandı.", [
          { text: "Tamam", onPress: () => onClose() }
        ]);
      }
    } catch (err) {
      Alert.alert("HATA", "Sunucu motoruna ulaşılamadı!");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.fullContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          
          {/* P2: ANTRASİT BAŞLIK BANDI */}
          <View style={styles.header}>
            <View style={styles.titleBadge}>
              <Text style={styles.title}>YENİ TEKNİK SERVİS KAYDI</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={40} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
            
            {/* BÖLÜM 1: MÜŞTERİ VE CİHAZ */}
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionText}>MÜŞTERİ VE CİHAZ BİLGİLERİ</Text>
            </View>

            <Text style={styles.label}>MÜŞTERİ / CİHAZ SAHİBİ *</Text>
            <TextInput 
              ref={r1} style={styles.input} returnKeyType="next"
              onSubmitEditing={() => r2.current?.focus()} blurOnSubmit={false}
              onChangeText={(v) => setServis({...servis, musteri_adi: v})} 
              placeholder="Müşteri ismini girin"
            />

            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>MARKA / MODEL *</Text>
                <TextInput 
                  ref={r2} style={styles.input} returnKeyType="next"
                  onSubmitEditing={() => r3.current?.focus()} blurOnSubmit={false}
                  onChangeText={(v) => setServis({...servis, marka_model: v})} 
                  placeholder="Örn: iPhone 14"
                />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>SERİ NUMARASI</Text>
                <TextInput 
                  ref={r3} style={styles.input} returnKeyType="next"
                  onSubmitEditing={() => r4.current?.focus()} blurOnSubmit={false}
                  onChangeText={(v) => setServis({...servis, seri_no: v})} 
                />
              </View>
            </View>

            {/* BÖLÜM 2: ARIZA VE USTA */}
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionText}>ARIZA VE PERSONEL ATAMA</Text>
            </View>

            <Text style={styles.label}>ARIZA / ŞİKAYET NOTU *</Text>
            <TextInput 
              ref={r4} style={[styles.input, {height: 80}]} 
              multiline={false} // Next zinciri için false
              returnKeyType="next"
              onSubmitEditing={() => r5.current?.focus()}
              blurOnSubmit={false}
              onChangeText={(v) => setServis({...servis, ariza_notu: v})} 
              placeholder="Cihazdaki sorun nedir?"
            />

            <Text style={styles.label}>ATANAN USTA / TEKNİSYEN *</Text>
            <TextInput 
              ref={r5} style={styles.input} 
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              onChangeText={(v) => setServis({...servis, usta_adi: v})} 
              placeholder="İşi yapacak personel"
            />

            {/* P2: ANTRASİT KAYDI TAMAMLA BUTONU */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
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
  safeArea: { flex: 1, padding: 25 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: Platform.OS === 'android' ? 10 : 0 },
  titleBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  sectionDivider: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 10, marginVertical: 15 },
  sectionText: { fontSize: 12, fontWeight: 'bold', color: '#444', textAlign: 'center' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, fontSize: 16, color: '#000' },
  row: { flexDirection: 'row' },
  saveButton: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 40, elevation: 4 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' }
});