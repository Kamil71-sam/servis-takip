import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniMusteriFormu({ visible, onClose }: Props) {
  const [customer, setCustomer] = useState({
    adSoyad: '', tel: '', email: '', adres: '', faks: '', vergiNo: ''
  });

  // KLAVYE "NEXT" ZİNCİRİ İÇİN REFERANSLAR
  const r1 = useRef<TextInput>(null);
  const r2 = useRef<TextInput>(null);
  const r3 = useRef<TextInput>(null);
  const r4 = useRef<TextInput>(null);
  const r5 = useRef<TextInput>(null);
  const r6 = useRef<TextInput>(null);

  const handleSave = async () => {
    if (!customer.adSoyad || !customer.tel) {
      Alert.alert("DİKKAT", "Ad Soyad ve Telefon girmeden mühür basamayız!");
      return;
    }
    // Kayıt mantığı buraya...
    Alert.alert("BAŞARILI", "Müşteri sisteme mühürlendi.");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleBadge}>
              <Ionicons name="person-add" size={20} color="#fff" />
              <Text style={styles.title}>YENİ MÜŞTERİ KARTI</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={38} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
            <View style={styles.sectionDivider}><Text style={styles.sectionText}>KİMLİK VE İLETİŞİM</Text></View>

            <Text style={styles.label}>AD SOYAD / ÜNVAN *</Text>
            <TextInput 
              ref={r1} style={styles.input} returnKeyType="next"
              onSubmitEditing={() => r2.current?.focus()} blurOnSubmit={false}
              onChangeText={(v) => setCustomer({...customer, adSoyad: v})} 
            />

            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>TELEFON *</Text>
                <TextInput 
                  ref={r2} style={styles.input} keyboardType="phone-pad" returnKeyType="next"
                  onSubmitEditing={() => r3.current?.focus()} blurOnSubmit={false}
                  onChangeText={(v) => setCustomer({...customer, tel: v})} 
                />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>FAKS</Text>
                <TextInput 
                  ref={r3} style={styles.input} keyboardType="phone-pad" returnKeyType="next"
                  onSubmitEditing={() => r4.current?.focus()} blurOnSubmit={false}
                  onChangeText={(v) => setCustomer({...customer, faks: v})} 
                />
              </View>
            </View>

            <Text style={styles.label}>E-POSTA ADRESİ</Text>
            <TextInput 
              ref={r4} style={styles.input} keyboardType="email-address" autoCapitalize="none"
              returnKeyType="next" onSubmitEditing={() => r5.current?.focus()} blurOnSubmit={false}
              onChangeText={(v) => setCustomer({...customer, email: v})} 
            />

            <View style={styles.sectionDivider}><Text style={styles.sectionText}>ADRES VE VERGİ</Text></View>

            <Text style={styles.label}>TAM ADRES</Text>
            <TextInput 
              ref={r5} style={[styles.input, {height: 60}]} returnKeyType="next"
              onSubmitEditing={() => r6.current?.focus()} blurOnSubmit={false}
              onChangeText={(v) => setCustomer({...customer, adres: v})} 
            />

            <Text style={styles.label}>VERGİ DAİRESİ / NO</Text>
            <TextInput 
              ref={r6} style={styles.input} returnKeyType="done"
              onChangeText={(v) => setCustomer({...customer, vergiNo: v})} 
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>MÜŞTERİYİ SİSTEME MÜHÜRLE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// --- TÜM HATALARI SİLECEK OLAN KRİTİK STYLES BÖLÜMÜ ---
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, height: '92%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleBadge: { backgroundColor: '#333', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '900', color: '#fff', marginLeft: 8 },
  sectionDivider: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 10, marginTop: 20, marginBottom: 10 },
  sectionText: { fontSize: 11, fontWeight: 'bold', color: '#666', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 5 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e9ecef', borderRadius: 12, padding: 14, fontSize: 16 },
  row: { flexDirection: 'row' },
  saveButton: { backgroundColor: '#1a1a1a', height: 65, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '900' }
});