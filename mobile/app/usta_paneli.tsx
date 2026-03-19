import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function UstaPaneli() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [price, setPrice] = useState('');

  const API_URL = 'http://192.168.1.41:3000';

  const fetchJobs = async () => {
    try {
      // MÜDÜR: Usta 1 ismini URL'e güvenli gömüyoruz
      const res = await fetch(`${API_URL}/api/operation/usta-jobs/${encodeURIComponent("Usta 1")}`);
      const data = await res.json();
      
      if (data.success) {
        setJobs(data.data); 
      }
    } catch (e) {
      console.log("Bağlantı koptu müdürüm!");
    }
  };

  useEffect(() => { 
    fetchJobs(); 
    const t = setInterval(fetchJobs, 5000); 
    return () => clearInterval(t);
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f8f9fa'}}>
      <StatusBar barStyle="dark-content" />
      
      <View style={{padding: 25, marginTop: 20}}>
        <Text style={{fontSize: 24, fontWeight: '900'}}>RANDEVU LİSTESİ</Text>
        <Text style={{color: '#888'}}>Usta 1 - Aktif İşler</Text>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* MÜDÜR: Senin SQL'de musteri_adi, tarih ve saat olarak geliyor. Burası ÇOK KRİTİK */}
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>{item.musteri_adi || "İsimsiz Müşteri"}</Text>
            <Text style={{color: '#666', marginTop: 5}}>
              {item.tarih} - {item.saat}
            </Text>
            
            <TouchableOpacity 
              style={styles.finishBtn} 
              onPress={() => { setSelectedJob(item); setModalVisible(true); }}
            >
              <Text style={{color: '#fff', fontWeight: 'bold'}}>İŞİ BİTİR</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 100, color: '#999'}}>Usta 1 için bugün randevu bulunamadı.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
          <View style={styles.modalHeader}>
            <Text style={{fontSize: 18, fontWeight: '900'}}>İŞLEMİ SONUÇLANDIR</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeCircle}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{padding: 25}}>
            <TextInput 
              style={styles.input} 
              placeholder="Ücret Girin (TL)" 
              keyboardType="numeric" 
              value={price} 
              onChangeText={setPrice} 
              autoFocus 
            />
            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={() => { Alert.alert("Başarılı", "Kayıt Yapıldı"); setModalVisible(false); }}
            >
              <Text style={{color: '#fff', fontWeight: 'bold'}}>KAYDET VE GÖNDER</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, margin: 15, backgroundColor: '#fff', borderRadius: 15, elevation: 3, borderWidth: 1, borderColor: '#eee' },
  finishBtn: { backgroundColor: '#34C759', padding: 15, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  closeCircle: { backgroundColor: '#ff4d4d', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  input: { backgroundColor: '#f0f0f0', padding: 18, borderRadius: 12, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  saveBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center' }
});