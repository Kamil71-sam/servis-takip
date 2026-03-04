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

export default function YeniMusteriFormu({ visible, onClose }: Props) {
  const [customer, setCustomer] = useState({ 
    adSoyad: '', tel: '', faks: '', email: '', adres: '' 
  });
  
  // P2: KLAVYE NEXT ZİNCİRİ
  const r1=useRef<TextInput>(null); const r2=useRef<TextInput>(null); 
  const r3=useRef<TextInput>(null); const r4=useRef<TextInput>(null); 
  const r5=useRef<TextInput>(null);

  const handleSave = async () => {
    // P2: Ad Soyad, Tel ve Email artık mecburi
    if (!customer.adSoyad || !customer.tel || !customer.email) { 
      Alert.alert("DİKKAT", "Ad Soyad, Telefon ve E-Posta alanları mecburi mühürlenmelidir!"); 
      return; 
    }
    try {
      const response = await fetch('http://192.168.1.43:5000/api/customers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(customer)
      });
      if ((await response.json()).success) {
        Keyboard.dismiss();
        Alert.alert("BAŞARILI", "Kayıt başarıyla tamamlandı.", [{ text: "Tamam", onPress: () => onClose() }]);
      }
    } catch (err) { Alert.alert("HATA", "Sunucu bağlantısı koptu!"); }
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
              <Text style={styles.title}>YENİ MÜŞTERİ KARTI</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={40} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionText}>KİMLİK VE İLETİŞİM</Text>
            </View>

            <Text style={styles.label}>AD SOYAD / ÜNVAN *</Text>
            <TextInput ref={r1} style={styles.input} returnKeyType="next" onSubmitEditing={()=>r2.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setCustomer({...customer, adSoyad: v})} />

            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>TELEFON *</Text>
                <TextInput ref={r2} style={styles.input} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={()=>r3.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setCustomer({...customer, tel: v})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>FAKS</Text>
                <TextInput ref={r3} style={styles.input} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={()=>r4.current?.focus()} blurOnSubmit={false} onChangeText={(v)=>setCustomer({...customer, faks: v})} />
              </View>
            </View>

            {/* P2: MECBURİ E-POSTA ALANI */}
            <Text style={styles.label}>E-POSTA ADRESİ *</Text>
            <TextInput 
              ref={r4} 
              style={styles.input} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              returnKeyType="next" 
              onSubmitEditing={()=>r5.current?.focus()} 
              blurOnSubmit={false} 
              onChangeText={(v)=>setCustomer({...customer, email: v})} 
            />

            <Text style={styles.label}>TAM ADRES</Text>
            <TextInput ref={r5} style={[styles.input, {height: 80}]} returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} onChangeText={(v)=>setCustomer({...customer, adres: v})} />

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
  title: { fontSize: 17, fontWeight: '900', color: '#fff' },
  sectionDivider: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 10, marginVertical: 15 },
  sectionText: { fontSize: 12, fontWeight: 'bold', color: '#444', textAlign: 'center' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, fontSize: 16, color: '#000' },
  row: { flexDirection: 'row' },
  saveButton: { backgroundColor: '#1A1A1A', height: 65, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 40, elevation: 4 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' }
});