import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, Linking, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// MÜDÜR: Tek satırda tüm ihtiyacımızı çağırdık, hata bitti!
import { getFirms } from '../services/api';

export default function FirmalarSayfasi() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDarkMode = params.theme === 'dark';

  const [firmalar, setFirmalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const theme = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    card: isDarkMode ? '#1e1e1e' : '#FDFDFD',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    sub: isDarkMode ? '#AAAAAA' : '#666666',
    input: isDarkMode ? '#2c2c2c' : '#F0F0F0',
    border: isDarkMode ? '#333333' : '#E0E0E0',
    icon: isDarkMode ? '#ffffff' : '#444444', 
    primary: '#FF3B30'
  };

  const fetchFirmalar = async () => {
    try {
      setLoading(true);
      // MÜDÜR: Artık IP adresiyle uğraşmıyoruz, api.ts vanayı açıyor!
      const data = await getFirms(); 
      
      const siraliData = data.sort((a: any, b: any) => {
        const nameA = (a.firma_adi || "").toLocaleLowerCase('tr');
        const nameB = (b.firma_adi || "").toLocaleLowerCase('tr');
        return nameA.localeCompare(nameB, 'tr');
      });
      
      setFirmalar(siraliData);
    } catch (e) { 
      console.log("Bağlantı hatası:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchFirmalar(); 
  }, []);

  const filtered = firmalar.filter((f: any) => {
    const s = search.toLowerCase().trim();
    return (
      (f.firma_adi || "").toLowerCase().includes(s) || 
      (f.yetkili_ad_soyad || "").toLowerCase().includes(s) ||
      (f.telefon || "").includes(s)
    );
  });

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.nameRow}>
        <Text style={[styles.name, { color: theme.text }]}>
          {(item.firma_adi || "İsimsiz Firma").toUpperCase()}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.infoRow} 
        onPress={() => item.telefon && Linking.openURL(`tel:${item.telefon}`)}
      >
        <Ionicons name="call-outline" size={16} color={theme.primary} style={styles.icon} />
        <Text style={[styles.text, { color: theme.text }]}>{item.telefon || '-'}</Text>
      </TouchableOpacity>

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={16} color={theme.sub} style={styles.icon} />
        <Text style={[styles.text, { color: theme.sub }]}>Yetkili: {item.yetkili_ad_soyad || '-'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color={theme.sub} style={styles.icon} />
        <Text style={[styles.text, { color: theme.sub }]}>{item.adres || '-'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Firma Listesi</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={38} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.input, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={20} color={theme.sub} />
        <TextInput 
          style={[styles.input, { color: theme.text }]} 
          placeholder="Firma veya yetkili ara..." 
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
  card: { borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1 },
  nameRow: { marginBottom: 8 },
  name: { fontSize: 17, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 10, width: 18 },
  text: { fontSize: 14, fontWeight: '400' },
});