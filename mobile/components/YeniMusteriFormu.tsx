import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniMusteriFormu({ visible, onClose }: Props) {
  const [customer, setCustomer] = useState({
    adSoyad: '', tel: '', email: '', adres: ''
  });

  const handleSave = async () => {
    if (!customer.adSoyad || !customer.tel) {
      Alert.alert("Eksik Bilgi", "Ad Soyad ve Telefon mecburidir!");
      return;
    }
    try {
      const response = await fetch('http://192.168.1.39:5000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Başarılı", "Müşteri mühürlendi!");
        onClose();
      }
    } catch (err) { Alert.alert("Hata", "Sunucuya ulaşılamadı."); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>👤 YENİ MÜŞTERİ KAYDI</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={35} color="#FF3B30" /></TouchableOpacity>
          </View>
          
          <Text style={styles.label}>AD SOYAD *</Text>
          <TextInput style={styles.input} value={customer.adSoyad} onChangeText={(v)=>setCustomer({...customer, adSoyad: v})} />
          
          <Text style={styles.label}>TELEFON *</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={customer.tel} onChangeText={(v)=>setCustomer({...customer, tel: v})} />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>MÜŞTERİYİ KAYDET</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '70%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginTop: 15 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 12, padding: 12, marginTop: 5 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 25 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});