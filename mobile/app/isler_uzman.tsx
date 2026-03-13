import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUzmanTumIsler, updateServiceProcess } from '../services/api_uzman';

interface Task {
  id: string;
  servis_no?: string;
  status: string;
  issue: string;
  cihaz_turu?: string; // MÜDÜR: Yeni eklendi (Tablet, Laptop vb.)
  marka_model?: string; // MÜDÜR: SQL'den birleşik geliyor
  seri_no?: string; // MÜDÜR: SQL'den geliyor
  musteri_notu?: string;
  created_at?: string;
}

export default function IslerUzman() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prices, setPrices] = useState<{[key: string]: string}>({}); 
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const ustaAdi = 'Usta_1'; 

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await getUzmanTumIsler(ustaAdi); 
      if (res && res.success) {
        setTasks(res.data || []); 
      }
    } catch (err) {
      console.error("Liste yükleme hatası:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (item: Task, nextStatus: string) => {
    const price = prices[item.id];
    
    if (nextStatus === 'onay_bekliyor' && !price) {
      Alert.alert("Hata", "Lütfen önce bir fiyat girin.");
      return;
    }

    try {
      const res = await updateServiceProcess({
        id: parseInt(item.id),
        status: nextStatus,
        old_status: item.status,
        changed_by: ustaAdi,
        offer_price: price ? parseFloat(price) : undefined,
        expert_note: nextStatus === 'onay_bekliyor' ? "Usta fiyat verdi" : "Durum güncellendi"
      });

      if (res.success) {
        Alert.alert("Başarılı", "İşlem kaydedildi.");
        loadTasks(); 
      }
    } catch (err) {
      Alert.alert("Hata", "Güncelleme yapılamadı.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Onarım Listesi</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listPadding}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <View style={styles.cardTop}>
                <View style={styles.idBadge}>
                  <Text style={styles.idText}>#{item.servis_no || item.id}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status || 'yeni_is'}</Text>
                </View>
              </View>
              
              {/* MÜDÜR: En üstte Tablet/Laptop vb. Cihaz Türü yazar */}
              <Text style={styles.deviceHeaderText}>
                {item.cihaz_turu || 'Cihaz Bilgisi Yok'}
              </Text>

              <Text style={styles.issueText} numberOfLines={2}>
                {item.issue}
              </Text>

              {/* Aksiyonlar - Fiyat girişi sadece 'yeni_is' durumunda görünür */}
              <View style={styles.actionContainer}>
                {item.status === 'yeni_is' && (
                  <View style={styles.priceRow}>
                    <TextInput 
                      style={styles.priceInput}
                      placeholder="Fiyat (TL)"
                      keyboardType="numeric"
                      value={prices[item.id] || ''}
                      onChangeText={(val) => setPrices({...prices, [item.id]: val})}
                    />
                    <TouchableOpacity 
                      style={styles.btnFiyat} 
                      onPress={() => handleUpdateStatus(item, 'onay_bekliyor')}
                    >
                      <Text style={styles.btnText}>Fiyat Ver</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'tamir_onaylandi' && (
                  <TouchableOpacity 
                    style={styles.btnBasla} 
                    onPress={() => handleUpdateStatus(item, 'tamirde')}
                  >
                    <Text style={styles.btnText}>Tamiri Başlat</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'tamirde' && (
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity 
                      style={[styles.btnBasla, {backgroundColor: '#FF9500', flex: 1}]} 
                      onPress={() => handleUpdateStatus(item, 'parca_bekliyor')}
                    >
                      <Text style={styles.btnText}>Parça Bekliyor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.btnBasla, {backgroundColor: '#34C759', flex: 1}]} 
                      onPress={() => handleUpdateStatus(item, 'tamamlandi')}
                    >
                      <Text style={styles.btnText}>Tamir Bitti</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* MÜDÜR: İŞ DETAYI yazısı ve kırmızı AÇ kutusu */}
              <View style={styles.cardFooterRevize}>
                <View style={styles.detailInfoRow}>
                  <Ionicons name="clipboard-outline" size={16} color="#444" />
                  <Text style={styles.detailInfoText}>İş Detayı</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.btnAcBox}
                  onPress={() => { setSelectedTask(item); setModalVisible(true); }}
                >
                  <Text style={styles.btnAcText}>AÇ</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Henüz iş bulunamadı.</Text>
            </View>
          }
        />
      )}

      {/* --- MÜDÜR: CİHAZ BİLGİLERİ MODALI --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cihaz Bilgileri</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#999" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
               <DetailItem label="Marka / Model" value={selectedTask?.marka_model} />
               <DetailItem label="Seri No" value={selectedTask?.seri_no} />
               <DetailItem label="Arızası" value={selectedTask?.issue} />
               <DetailItem label="Müşteri Notu" value={selectedTask?.musteri_notu} />
               <DetailItem label="Geliş Tarihi" value={selectedTask?.created_at ? new Date(selectedTask.created_at).toLocaleDateString('tr-TR') : '-'} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const DetailItem = ({label, value}: any) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backBtn: { padding: 5 },
  refreshBtn: { padding: 5 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  listPadding: { padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { marginTop: 10, color: '#666' },
  taskCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  idBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  idText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },
  statusBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, color: '#475569', fontWeight: 'bold' },
  deviceHeaderText: { fontSize: 16, fontWeight: '900', color: '#1A1A1A', marginBottom: 4 },
  issueText: { fontSize: 15, color: '#1A1A1A', marginBottom: 12 },
  actionContainer: { marginBottom: 10, borderTopWidth: 1, borderTopColor: '#f5f5f5', paddingTop: 10 },
  priceRow: { flexDirection: 'row', gap: 10, marginBottom: 5 },
  priceInput: { flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 10, height: 40, backgroundColor: '#fff' },
  btnFiyat: { backgroundColor: '#1A1A1A', paddingHorizontal: 15, borderRadius: 8, justifyContent: 'center' },
  btnBasla: { backgroundColor: '#5856D6', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  cardFooterRevize: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F1F1' },
  detailInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailInfoText: { fontSize: 14, fontWeight: '700', color: '#444' },
  btnAcBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B30', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6 },
  btnAcText: { color: '#FFF', fontWeight: '900', fontSize: 12, marginRight: 4 },
  emptyText: { color: '#999', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  detailItem: { marginBottom: 15 },
  detailLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  detailValue: { fontSize: 16, color: '#1A1A1A', fontWeight: '500', marginTop: 2 },
});