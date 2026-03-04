import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniFirmaFormu({ visible, onClose }: Props) {
  const [firma, setFirma] = useState({
    firma_adi: '', // SQL: company_name
    vergi_no: '',  // SQL: tax_number
    yetkili: '',   // SQL: authorized_person
    tel: ''        // SQL: phone_number
  });

  const handleSave = async () => {
    if (!firma.firma_adi || !firma.tel) {
      Alert.alert("Eksik Bilgi", "Firma Adı ve Telefon mühürlenmeden kayıt olmaz!");
      return;
    }
    try {
      const response = await fetch('http://192.168.1.39:5000/api/save-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firma)
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Başarılı", "Firma sisteme mühürlendi!");
        onClose();
      }
    } catch (error) {
      Alert.alert("Hata", "Sunucu motoru çalışmıyor!");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>🏢 YENİ FİRMA KAYDI</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={35} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>FİRMA ADI / ÜNVANI *</Text>
            <TextInput style={styles.input} value={firma.firma_adi} onChangeText={(v)=>setFirma({...firma, firma_adi: v})} placeholder="Şirket İsmi" />

            <Text style={styles.label}>VERGİ NUMARASI</Text>
            <TextInput style={styles.input} value={firma.vergi_no} onChangeText={(v)=>setFirma({...firma, vergi_no: v})} keyboardType="numeric" />

            <Text style={styles.label}>YETKİLİ KİŞİ</Text>
            <TextInput style={styles.input} value={firma.yetkili} onChangeText={(v)=>setFirma({...firma, yetkili: v})} />

            <Text style={styles.label}>İLETİŞİM TELEFONU *</Text>
            <TextInput style={styles.input} value={firma.tel} onChangeText={(v)=>setFirma({...firma, tel: v})} keyboardType="numeric" />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>FİRMAYI MÜHÜRLE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginTop: 15 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 12, padding: 12, marginTop: 5, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 25 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});