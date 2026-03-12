import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert // Müdürüm, 'Alert' importunu buraya ekledik (Hata-1 Gitti)
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
//import { getUzmanDashboardData } from '../services/api_uzman';
// Eskiden getUzmanDashboardData vardı, onu bununla değiştir:
import { getUzmanTumIsler } from '../services/api_uzman';


// TypeScript tipi
interface Task {
  id: string;
  status: string;
  issue: string;
  customer?: string;
}

export default function IslerUzman() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const ustaAdi = 'Usta_1'; 

  
    
      
    const loadTasks = async () => {
  try {
    setLoading(true);
    // Dashboard datasını değil, TÜM İŞLERİ çağırdık
    const res = await getUzmanTumIsler(ustaAdi); 
    
    if (res && res.success) {
      // DİKKAT: Dashboard'daki gibi res.data.sonIsler demiyoruz!
      // Çünkü /tum-isler rotası veriyi direkt res.data içinde dizi (array) olarak yolluyor.
      setTasks(res.data || []); 
    }
  } catch (err) {
    console.error("Liste yükleme hatası:", err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


      /*
      const res = await getUzmanDashboardData(ustaAdi);
      if (res && res.success) {
        setTasks(res.data.sonIsler || []);
      }
    } catch (err) {
      console.error("İş listesi çekme hatası:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);

*/

  useEffect(() => {
    loadTasks();
  }, []);

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
        <Text style={styles.title}>Bana Atanan İşler</Text>
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.taskCard}
              onPress={() => Alert.alert("Bilgi", "İş detay sayfası yakında eklenecek.")}
            >
              <View style={styles.cardTop}>
                <View style={styles.idBadge}>
                  <Text style={styles.idText}>#{item.id}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status || 'Beklemede'}</Text>
                </View>
              </View>
              
              <Text style={styles.issueText} numberOfLines={2}>
                {item.issue}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={14} color="#888" />
                  <Text style={styles.infoText}>{item.customer || 'Müşteri Bilgisi Yok'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CCC" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Henüz iş bulunamadı.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 15, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE' 
  },
  backBtn: { padding: 5 },
  refreshBtn: { padding: 5 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  listPadding: { padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { marginTop: 10, color: '#666' },
  taskCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 12, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  idBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  idText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },
  statusBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, color: '#475569', fontWeight: 'bold' },
  issueText: { fontSize: 15, color: '#1A1A1A', marginBottom: 12 },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#F1F1F1' 
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 12, color: '#888', marginLeft: 5 },
  emptyText: { color: '#999', fontSize: 15 }
});