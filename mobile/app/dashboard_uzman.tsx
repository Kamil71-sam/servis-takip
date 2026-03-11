import React, { useState, useEffect } from 'react';


import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert // <-- MÜDÜR: İşte eksik olan parça bu!
} from 'react-native';






import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// MÜDÜR: Şimdilik test datası koyuyoruz, backend'i bir sonraki adımda bağlayacağız
const MOCK_DATA = [
  { id: '1', customer: 'Ahmet Yılmaz', device: 'iPhone 13 Pro', status: 'Beklemede', issue: 'Ekran Değişimi' },
  { id: '2', customer: 'Mehmet Öz', device: 'Samsung S22', status: 'Parça Bekliyor', issue: 'Batarya Şişmesi' },
];

export default function DashboardUzman() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Burada ileride veritabanından güncel işleri çekeceğiz
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => Alert.alert("Detay", "İş detayına gidilecek")}>
      <View style={styles.cardHeader}>
        <Text style={styles.deviceText}>{item.device}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.customerText}>{item.customer}</Text>
      <View style={styles.issueRow}>
        <Ionicons name="alert-circle-outline" size={16} color="#666" />
        <Text style={styles.issueText}>{item.issue}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrow} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hoş Geldin,</Text>
          <Text style={styles.uzmanName}>Uzman Tekniker 🛠️</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* İSTATİSTİK BANTLARI */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: '#F0F9FF' }]}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Bekleyen</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#FDF2F2' }]}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Acil</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Üzerimdeki İşler</Text>

      {/* İŞ LİSTESİ */}
      <FlatList
        data={MOCK_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  welcomeText: { fontSize: 14, color: '#666' },
  uzmanName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  logoutBtn: { padding: 10, borderRadius: 10, backgroundColor: '#FFF5F5' },
  statsContainer: { flexDirection: 'row', padding: 20, gap: 15 },
  statBox: { flex: 1, padding: 15, borderRadius: 15, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10, color: '#333' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    position: 'relative'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  deviceText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { backgroundColor: '#E0E0E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#666' },
  customerText: { fontSize: 14, color: '#666', marginBottom: 8 },
  issueRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  issueText: { fontSize: 13, color: '#888' },
  arrow: { position: 'absolute', right: 15, bottom: 40 }
});