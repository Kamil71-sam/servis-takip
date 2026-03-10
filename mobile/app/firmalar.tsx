import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, Linking 
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FirmalarSayfasi() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDarkMode = params.theme === 'dark';

  const [firmalar, setFirmalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // MÜDÜR: Rengi sistemin ezemeyeceği en sert tonlara çektim
  const ICON_COLOR = isDarkMode ? '#FFFFFF' : '#000000'; // Gündüz Zift Siyahı
  const TEXT_COLOR = isDarkMode ? '#FFFFFF' : '#000000';
  const BG_COLOR = isDarkMode ? '#121212' : '#FFFFFF';
  const CARD_COLOR = isDarkMode ? '#1E1E1E' : '#F9F9F9';

  const fetchFirmalar = async () => {
    try {
      const response = await fetch('http://192.168.1.44:3000/api/firm/all');
      const data = await response.json();
      setFirmalar(data);
    } catch (e) { console.log("Hata:", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchFirmalar(); }, [isDarkMode]);

  const filtered = firmalar.filter((f: any) => 
    f.firma_adi?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: CARD_COLOR, borderColor: isDarkMode ? '#333' : '#000' }]}>
      
      {/* BAŞLIK - İkon rengini hem color hem style ile 'force' ediyoruz */}
      <View style={styles.cardHeader}>
        <Ionicons 
          name="business-sharp" 
          size={30} 
          color={ICON_COLOR} 
          style={{ color: ICON_COLOR, opacity: 1 }} 
        />
        <Text style={[styles.title, { color: TEXT_COLOR }]}>{item.firma_adi?.toUpperCase()}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons 
          name="person-circle-sharp" 
          size={24} 
          color={ICON_COLOR} 
          style={{ color: ICON_COLOR, opacity: 1 }} 
        />
        <Text style={[styles.infoTxt, { color: TEXT_COLOR }]}>Yetkili: {item.yetkili_ad_soyad || '---'}</Text>
      </View>

      {/* İLETİŞİM BLOĞU */}
      <View style={[styles.contactRow, { backgroundColor: isDarkMode ? '#333' : '#E0E0E0' }]}>
        <TouchableOpacity style={styles.contactBtn} onPress={() => item.telefon && Linking.openURL(`tel:${item.telefon}`)}>
          <Ionicons name="call-sharp" size={24} color={ICON_COLOR} style={{ color: ICON_COLOR }} />
          <Text style={[styles.contactTxt, { color: TEXT_COLOR }]}>{item.telefon || 'Yok'}</Text>
        </TouchableOpacity>
        
        <View style={styles.contactBtn}>
          <Ionicons name="print-sharp" size={24} color={ICON_COLOR} style={{ color: ICON_COLOR }} />
          <Text style={[styles.contactTxt, { color: TEXT_COLOR }]}>{item.faks || 'Faks Yok'}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: isDarkMode ? '#444' : '#000' }]} />
      
      <View style={styles.infoRow}>
        <Ionicons name="location-sharp" size={24} color={ICON_COLOR} style={{ color: ICON_COLOR }} />
        <Text style={[styles.adresTxt, { color: TEXT_COLOR }]}>{item.adres || 'Adres bilgisi yok.'}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG_COLOR }}>
      <Stack.Screen options={{ 
        headerTitle: "FİRMA LİSTESİ",
        headerStyle: { backgroundColor: CARD_COLOR },
        headerTintColor: TEXT_COLOR,
      }} />

      <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#2c2c2c' : '#E0E0E0' }]}>
        <Ionicons name="search-sharp" size={24} color={ICON_COLOR} />
        <TextInput 
          style={[styles.input, { color: TEXT_COLOR }]} 
          placeholder="Ara..." 
          placeholderTextColor={isDarkMode ? "#888" : "#555"}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={ICON_COLOR} />
      ) : (
        <FlatList 
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id?.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 20, paddingHorizontal: 15, height: 55, borderRadius: 10 },
  input: { flex: 1, marginLeft: 10, fontSize: 18, fontWeight: '900' },
  card: { padding: 20, borderRadius: 15, borderWidth: 3, marginBottom: 20, elevation: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  title: { marginLeft: 15, fontSize: 22, fontWeight: '900' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoTxt: { marginLeft: 15, fontSize: 18, fontWeight: '800' },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, padding: 15, borderRadius: 10 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  contactTxt: { marginLeft: 10, fontSize: 17, fontWeight: '900' },
  divider: { height: 3, marginVertical: 15 },
  adresTxt: { marginLeft: 15, fontSize: 16, lineHeight: 24, flex: 1, fontWeight: '800' }
});