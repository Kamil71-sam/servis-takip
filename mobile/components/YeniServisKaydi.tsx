import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniServisKaydi({ visible, onClose }: Props) {
  // SQL sütunlarıyla tam uyumlu başlangıç
  const [servis, setServis] = useState({
    musteriId: '',    // SQL: customer_id
    markaModel: '',   // SQL: device_info
    seriNo: '',       // SQL: serial_no
    arizaNotu: '',    // SQL: complaint
    usta: ''          // SQL: assigned_staff (Usta artık ayrı!)
  });

  const handleSave = async () => {
    if (!servis.markaModel || !servis.arizaNotu) {
      Alert.alert("Eksik Bilgi", "Cihaz ve Arıza bilgisi olmadan servis mühürlenemez!");
      return;
    }

    try {
      // 192.168.1.43 adresindeki yeni sunucu motoruna bağlanıyoruz
      const response = await fetch('http://192.168.1.43:5000/api/yeni-servis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servis)
      });
      
      const data = await response.json();
      if (data.success) {
        Alert.alert("KAYIT MÜHÜRLENDİ!", `Sistem Takip No: ${data.id}`);
        onClose();
      }
    } catch (error) {
      Alert.alert("Bağlantı Hatası", "Server motoruna ulaşılamıyor!");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>🔧 TEKNİK SERVİS KAYDI</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={35} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* CİHAZ BİLGİLERİ */}
            <View style={styles.section}><Text style={styles.st}>CİHAZ VE ARIZA DETAYLARI</Text></View>
            
            <Text style={styles.label}>MARKA / MODEL *</Text>
            <TextInput 
              style={styles.input} 
              value={servis.markaModel} 
              onChangeText={(v) => setServis({...servis, markaModel: v})} 
              placeholder="Örn: Samsung A54"
            />

            <Text style={styles.label}>SERİ NUMARASI</Text>
            <TextInput 
              style={styles.input} 
              value={servis.seriNo} 
              onChangeText={(v) => setServis({...servis, seriNo: v})} 
            />

            <Text style={styles.label}>ARIZA NOTU *</Text>
            <TextInput 
              style={[styles.input, {height: 80}]} 
              multiline 
              value={servis.arizaNotu} 
              onChangeText={(v) => setServis({...servis, arizaNotu: v})} 
              placeholder="Cihazdaki sorun nedir?"
            />

            {/* PERSONEL ATAMA */}
            <View style={styles.section}><Text style={styles.st}>ATANAN TEKNİSYEN</Text></View>
            <Text style={styles.label}>USTA / PERSONEL ADI</Text>
            <TextInput 
              style={styles.input} 
              value={servis.usta} 
              onChangeText={(v) => setServis({...servis, usta: v})} 
              placeholder="İşi yapacak usta"
            />

            <TouchableOpacity style={styles.btn} onPress={handleSave}>
              <Text style={styles.btntxt}>SERVİS KAYDINI MÜHÜRLE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 20, fontWeight: '900' },
  section: { padding: 8, backgroundColor: '#444', borderRadius: 10, marginTop: 15, marginBottom: 10 },
  st: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  label: { fontSize: 11, fontWeight: 'bold', color: '#666', marginTop: 10 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 12, padding: 12, marginTop: 5, fontSize: 15 },
  btn: { backgroundColor: '#333', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 20 },
  btntxt: { color: '#fff', fontSize: 18, fontWeight: '900' }
});