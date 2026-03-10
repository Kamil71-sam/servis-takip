import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, Linking, StatusBar, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ServisListesi() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDarkMode = params.theme === 'dark';

  const [servisler, setServisler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const theme = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    card: isDarkMode ? '#1e1e1e' : '#FDFDFD',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    sub: isDarkMode ? '#AAAAAA' : '#666666',
    border: isDarkMode ? '#333333' : '#E0E0E0',
    primary: '#FF3B30',
    inputBg: isDarkMode ? '#2c2c2c' : '#F0F0F0'
  };

  const fetchServisler = async () => {
    setLoading(true);
    try {
      // MÜDÜR: Eğer server'da çakışma varsa '/services/all' yerine direkt '/services' deneyebilirsin.
      // Ama şimdilik senin tarayıcıda denediğin yolu mühürledim.
      const response = await fetch('http://192.168.1.44:3000/services/all');
      
      if (!response.ok) throw new Error(`Hata: ${response.status}`);
      
      const data = await response.json();
      setServisler(data);
    } catch (e: any) { 
      console.log("Bağlantı hatası:", e.message);
      // Hata mesajını daha açıklayıcı yaptık ki dükkanda ne oluyor bilelim.
      Alert.alert("Bağlantı Sorunu", "Server'dan veri çekilemedi. SQL Rotalarını kontrol et müdürüm!");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchServisler(); }, []);

  // --- AKILLI SÜZGEÇ (Müşteri, Cihaz veya Durum) ---
  const filtered = servisler.filter((s: any) => {
    const val = search.toLowerCase().trim();
    if (!val) return true;

    const musterisi = (s.musteri_adi || s.name || "").toLowerCase();
    const cihazi = (s.cihaz_model || s.cihaz || "").toLowerCase();
    const durumu = (s.durum || "").toLowerCase();

    return musterisi.includes(val) || cihazi.includes(val) || durumu.includes(val);
  });

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.name, { color: theme.text }]}>
          {(item.musteri_adi || item.name || "İSİMSİZ").toUpperCase()}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '800' }}>
            {item.durum?.toUpperCase() || 'İŞLEMDE'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="hardware-chip-outline" size={16} color={theme.sub} style={styles.icon} />
        <Text style={[styles.text, { color: theme.text }]}>
          {item.cihaz_model || item.cihaz || 'Cihaz bilgisi yok'}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <TouchableOpacity 
          style={{flexDirection: 'row', alignItems: 'center'}}
          onPress={() => (item.telefon || item.phone) && Linking.openURL(`tel:${item.telefon || item.phone}`)}
        >
          <Ionicons name="call-outline" size={16} color={theme.primary} style={{marginRight: 8}} />
          <Text style={[styles.text, { color: theme.text }]}>{item.telefon || item.phone || '-'}</Text>
        </TouchableOpacity>
        <Text style={{color: theme.sub, fontSize: 12}}>{item.kayit_tarihi || ''}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Servis Kayıtları</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={38} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={20} color={theme.sub} />
        <TextInput 
          style={[styles.input, { color: theme.text }]} 
          placeholder="Ara..." 
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
          keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 50}}>
              <Ionicons name="cloud-offline-outline" size={50} color={theme.sub} />
              <Text style={{ marginTop: 10, color: theme.sub }}>SQL'de servis kaydı bulunamadı.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 45, borderRadius: 10, marginBottom: 15, borderWidth: 1 },
  input: { flex: 1, marginLeft: 8, fontSize: 15 },
  card: { borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '600', flex: 1 },
  statusBadge: { backgroundColor: 'rgba(255,59,48,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 10, width: 18 },
  text: { fontSize: 14, fontWeight: '400' },
  divider: { height: 1, backgroundColor: 'rgba(150,150,150,0.1)', marginVertical: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});