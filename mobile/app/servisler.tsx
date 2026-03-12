import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, StatusBar, Modal, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// MÜDÜR: Ana tesisatımızı buraya bağladık!
import { getServices } from '../services/api';

export default function ServisListesi() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDarkMode = params.theme === 'dark';

  const [servisler, setServisler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const theme = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    card: isDarkMode ? '#1e1e1e' : '#FDFDFD',
    text: '#333333', 
    darkText: isDarkMode ? '#FFFFFF' : '#333333',
    sub: isDarkMode ? '#AAAAAA' : '#666666',
    border: isDarkMode ? '#333333' : '#E0E0E0',
    primary: '#FF3B30',
    inputBg: isDarkMode ? '#2c2c2c' : '#F0F0F0',
    modalBg: isDarkMode ? '#1e1e1e' : '#FFFFFF'
  };

  const fetchServisler = async () => {
    try {
      setLoading(true);
      // MÜDÜR: Elle yazılan fetch silindi, merkezi sistemden (api.ts) çekiliyor.
      const data = await getServices();
      setServisler(data || []);
    } catch (e: any) { 
      console.log("Bağlantı hatası:", e.message);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchServisler(); 
  }, []);

  const filtered = (servisler || []).filter((s: any) => {
    const val = search.toLowerCase().trim();
    if (!val) return true;
    const musterisi = (s.musteri_adi || "").toLowerCase();
    const cihazi = `${s.marka || ""} ${s.model || ""}`.toLowerCase();
    const plakasi = (s.plaka || "").toLowerCase();
    return musterisi.includes(val) || cihazi.includes(val) || plakasi.includes(val);
  });

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <Text style={[styles.name, { color: theme.darkText }]}>
            {(item.musteri_adi || "İSİMSİZ").toUpperCase()}
          </Text>
          <Text style={{color: theme.sub, fontSize: 11, marginTop: 2}}>
            Plaka: {item.plaka || '-'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: theme.primary }]}>
            {(item.durum || 'KABUL EDİLDİ').split('').join(' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="hardware-chip-outline" size={16} color={theme.sub} style={styles.icon} />
        <Text style={[styles.text, { color: theme.darkText }]}>{item.marka} {item.model}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Ionicons name="calendar-outline" size={14} color={theme.sub} />
          <Text style={{color: theme.sub, fontSize: 12, marginLeft: 5}}>
            {item.tarih ? new Date(item.tarih).toLocaleDateString('tr-TR') : '-'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.detailBtn}
          onPress={() => {
            setSelectedItem(item);
            setModalVisible(true);
          }}
        >
            <Text style={{color: theme.primary, fontWeight: 'bold', fontSize: 12}}>DETAY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.darkText }]}>Servis Kayıtları</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={38} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={20} color={theme.sub} />
        <TextInput 
          style={[styles.input, { color: theme.darkText }]} 
          placeholder="İsim, cihaz veya plaka ara..." 
          placeholderTextColor={theme.sub}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item: any, index: number) => (item.id || index).toString()}
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.darkText }]}>Servis Detayı</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.darkText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailSection}>
                <DetailRow label="Servis No / Plaka" value={selectedItem?.plaka} theme={theme} />
                <DetailRow label="Müşteri Adı Soyadı" value={selectedItem?.musteri_adi} theme={theme} />
                <DetailRow label="Cihaz Tipi" value={selectedItem?.cihaz_tipi} theme={theme} />
                <DetailRow label="Cihaz" value={`${selectedItem?.marka || ''} ${selectedItem?.model || ''}`} theme={theme} />
                <DetailRow label="Seri No" value={selectedItem?.seri_no} theme={theme} />
                <DetailRow label="Garanti" value={selectedItem?.garanti} theme={theme} />
                <DetailRow label="Arıza Şikayeti" value={selectedItem?.ariza || 'Belirtilmedi'} theme={theme} />
                <DetailRow label="Müşteri Notu" value={selectedItem?.muster_notu || '-'} theme={theme} />
                <DetailRow label="Atanan Usta" value={selectedItem?.usta || 'Henüz Atanmadı'} theme={theme} />
                <DetailRow label="Mevcut Durum" value={selectedItem?.durum} theme={theme} isStatus />
                <DetailRow label="Kayıt Tarihi" value={selectedItem?.tarih ? new Date(selectedItem.tarih).toLocaleString('tr-TR') : '-'} theme={theme} />
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.closeBtn, { backgroundColor: theme.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>KAPAT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, theme, isStatus = false }: any) {
  return (
    <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
      <Text style={[styles.detailLabel, { color: theme.sub }]}>{label}</Text>
      <Text style={[
        styles.detailValue, 
        { color: isStatus ? theme.primary : theme.darkText, fontWeight: isStatus ? 'bold' : '400' }
      ]}>
        {value || '-'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 45, borderRadius: 10, marginBottom: 15, borderWidth: 1 },
  input: { flex: 1, marginLeft: 8, fontSize: 15 },
  card: { borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '700' },
  statusBadge: { backgroundColor: 'rgba(255,59,48,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 10, width: 18 },
  text: { fontSize: 14, fontWeight: '400' },
  divider: { height: 1, backgroundColor: 'rgba(150,150,150,0.1)', marginVertical: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailBtn: { padding: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  detailSection: { marginBottom: 20 },
  detailRow: { paddingVertical: 12, borderBottomWidth: 1 },
  detailLabel: { fontSize: 12, marginBottom: 4 },
  detailValue: { fontSize: 15 },
  closeBtn: { borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 10 },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});