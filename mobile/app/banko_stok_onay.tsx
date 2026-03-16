import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAllMaterialRequests, updateMaterialStatus } from '../services/api_material';

export default function BankoStokOnay() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAllMaterialRequests();
      if (res.success) setRequests(res.data);
    } catch (err) {
      Alert.alert("Hata", "Talepler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // MÜDÜR: Burası artık daha akıllı! Sadece durum değil, log için isim de gönderiyor.
  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      // MÜDÜR: 'Kemal Müdür' ismini log sistemine gönderiyoruz
      await updateMaterialStatus(id, status, "Kemal Müdür"); 
      
      Alert.alert(
        "İşlem Başarılı", 
        `Parça onaylandı, cihaz durumu otomatik olarak 'Tamirde' konumuna alındı ve kayıt günlüğüne işlendi.`
      );
      
      fetchRequests(); // Listeyi tazele
    } catch (err) {
      Alert.alert("Hata", "Güncelleme ve loglama sırasında bir sorun oluştu.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>Parça Sipariş Takibi</Text>
        <TouchableOpacity onPress={fetchRequests}><Ionicons name="refresh" size={24} color="#FF3B30" /></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#FF3B30" style={{marginTop:50}} /> : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, item.status === 'Geldi' && { opacity: 0.6 }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.servisNo}>Kayıt No: #{item.servis_no}</Text>
                <Text style={[styles.statusText, { color: item.status === 'Beklemede' ? '#FF9500' : '#34C759' }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.markaModel}>{item.marka_model}</Text>
              <Text style={styles.partName}>{item.part_name} ({item.quantity} Adet)</Text>
              <Text style={styles.desc}>{item.description}</Text>

              {item.status === 'Beklemede' && (
                <View style={styles.btnRow}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#34C759' }]}
                    onPress={() => handleStatusUpdate(item.id, 'Geldi')}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                    <Text style={styles.btnText}>PARÇA GELDİ</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF', alignItems: 'center', elevation: 2 },
  title: { fontSize: 18, fontWeight: '900' },
  card: { backgroundColor: '#FFF', margin: 10, padding: 15, borderRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  servisNo: { fontWeight: 'bold', color: '#FF3B30' },
  statusText: { fontSize: 12, fontWeight: '900' },
  markaModel: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  partName: { fontSize: 16, fontWeight: '600', color: '#333' },
  desc: { fontSize: 13, color: '#666', marginTop: 5, fontStyle: 'italic' },
  btnRow: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  actionBtn: { flexDirection: 'row', padding: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 }
});