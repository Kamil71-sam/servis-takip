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
      const response = await fetch('http://192.168.1.44:3000/services/all');
      if (!response.ok) throw new Error(`Hata: ${response.status}`);
      const data = await response.json();
      setServisler(data);
    } catch (e: any) { 
      console.log("Bağlantı hatası:", e.message);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchServisler(); }, []);

  const filtered = servisler.filter((s: any) => {
    const val = search.toLowerCase().trim();
    if (!val) return true;
    const musterisi = (s.customer_name || "").toLowerCase();
    const cihazi = `${s.brand || ""} ${s.model || ""}`.toLowerCase();
    return musterisi.includes(val) || cihazi.includes(val);
  });

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <Text style={[styles.name, { color: theme.text }]}>
            {(item.customer_name || "İSİMSİZ").toUpperCase()}
          </Text>
          <Text style={{color: theme.sub, fontSize: 11, marginTop: 2}}>
            Plaka: {item.servis_no || '-'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={{ color: theme.primary, fontSize: 10, fontWeight: '800' }}>
            {(item.status || 'İŞLEMDE').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="hardware-chip-outline" size={16} color={theme.sub} style={styles.icon} />
        <Text style={[styles.text, { color: theme.text }]}>{item.brand} {item.model}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Ionicons name="calendar-outline" size={14} color={theme.sub} />
          <Text style={{color: theme.sub, fontSize: 12, marginLeft: 5}}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString('tr-TR') : '-'}
          </Text>
        </View>
        <TouchableOpacity style={styles.detailBtn}>
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
          keyExtractor={(item: any) => item.id?.toString()}
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
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
  card: { borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '700' },
  statusBadge: { backgroundColor: 'rgba(255,59,48,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 10, width: 18 },
  text: { fontSize: 14, fontWeight: '400' },
  divider: { height: 1, backgroundColor: 'rgba(150,150,150,0.1)', marginVertical: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailBtn: { padding: 5 }
});