import React, { useState } from 'react'; // React ve useState mühürü
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

// onClose fonksiyonunun tipini burada mühürlüyoruz
interface Props {
  onClose: () => void;
}

export default function YeniMusteriFormu({ onClose }: Props) {
  const [customer, setCustomer] = useState({
    adSoyad: '', // SQL: full_name
    tel: '',     // SQL: phone_number
    email: '', 
    adres: ''
  });

  const handleSave = async () => {
    if (!customer.adSoyad || !customer.tel) {
      Alert.alert("Eksik Bilgi", "Ad Soyad ve Telefon girmeden müşteri mühürlenemez!");
      return;
    }

    try {
      // Sunucu motoruna veri gönderiyoruz
      const response = await fetch('http://192.168.1.39:5000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert("Başarılı", "Müşteri sisteme mühürlendi!");
        onClose(); // Formu kapatıyoruz
      }
    } catch (error) {
      Alert.alert("Hata", "Server motoruna ulaşılamıyor. Terminali kontrol edin!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>MÜŞTERİ ADI SOYADI / FİRMA *</Text>
      <TextInput 
        style={styles.input} 
        value={customer.adSoyad} 
        onChangeText={(v) => setCustomer({...customer, adSoyad: v})} 
        placeholder="Müşteri İsmi"
      />
      
      <Text style={styles.label}>TELEFON NUMARASI *</Text>
      <TextInput 
        style={styles.input} 
        keyboardType="numeric"
        value={customer.tel} 
        onChangeText={(v) => setCustomer({...customer, tel: v})} 
        placeholder="05xx..."
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.buttonText}>MÜŞTERİYİ KAYDET</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});