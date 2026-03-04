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

export default function YeniFirmaFormu({ visible, onClose }: Props) {
  const [firma, setFirma] = useState({
    firma_adi: '', yetkili_kisi: '', tel: '', email: '', adres: '', vergi_no: ''
  });

  const r1=useRef<TextInput>(null); const r2=useRef<TextInput>(null); 
  const r3=useRef<TextInput>(null); const r4=useRef<TextInput>(null); 
  const r5=useRef<TextInput>(null); const r6=useRef<TextInput>(null);

  const handleSave = async () => {
    // P2: Email artık mecburi
    if (!firma.firma_adi || !firma.tel || !firma.email) {
      Alert.alert("DİKKAT", "Firma Adı, Telefon ve E-Posta alanları mecburi mühürlenmelidir!");
      return;
    }

    try {
      const response = await fetch('http://192.168.1.43:5000/api/save-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firma)
      });
      const data = await response.json();
      
      if (data.success) {
        Keyboard.dismiss();
        Alert.alert("BAŞARILI", "Kayıt başarıyla tamamlandı.", [
          { text: "Tamam", onPress: () => onClose() }
        ]);
      }
    } catch (err) {
      Alert.alert("HATA", "Sunucu motoruna ulaşılamadı!");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.fullContainer}>
        <SafeAreaView style={styles.safeArea}>
          
          <View style={styles.header}>
            <View style={styles.titleBadge}><Text style={styles.title}>YENİ FİRMA KAYDI</Text></View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={40} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
            <View style={styles.sectionDivider}><Text style={styles.sectionText}>FİRMA VE İLETİŞİM BİLGİLERİ</Text></View>

            <Text style={styles.label}>FİRMA ADI / ÜNVANI *</Text>
            <TextInput ref={r1} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r2.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setFirma({...firma, firma_adi: v})} />

            <Text style={styles.label}>YETKİLİ KİŞİ</Text>
            <TextInput ref={r2} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setFirma({...firma, yetkili_kisi: v})} />

            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>TELEFON *</Text>
                <TextInput ref={r3} style={styles.input} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setFirma({...firma, tel: v})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>VERGİ NO</Text>
                <TextInput ref={r4} style={styles.input} keyboardType="numeric" returnKeyType="next" onSubmitEditing={()=>r5.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setFirma({...firma, vergi_no: v})} />
              </View>
            </View>

            <Text style={styles.label}>E-POSTA ADRESİ *</Text>
            <TextInput 
              ref={r5} 
              style={styles.input} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              returnKeyType="next" 
              onSubmitEditing={()=>r6.current?.focus()} 
              blurOnSubmit={false} 
              onChangeText={(v)=>setFirma({...firma, email: v})} 
            />

            <Text style={styles.label}>TAM ADRES</Text>
            <TextInput ref={r6} style={[styles.input, {height: 80}]} returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} onChangeText={(v)=>setFirma({...firma, adres: v})} />

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
  title: { fontSize: 17, fontWeight: '900', color: '#fff' },
  sectionDivider: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 10, marginVertical: 15 },
  sectionText: { fontSize: 12, fontWeight: 'bold', color: '#444', textAlign: 'center' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, fontSize: 16, color: '#000' },
  row: { flexDirection: 'row' },
  saveButton: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 40, elevation: 4 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' }
});