import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCustomers } from '../services/api';

export default function MusterilerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDarkMode = params.theme === 'dark'; 

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const theme = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    cardBg: isDarkMode ? '#1e1e1e' : '#FDFDFD',
    borderColor: isDarkMode ? '#333' : '#E0E0E0',
    textColor: isDarkMode ? '#fff' : '#333',
    subText: isDarkMode ? '#aaa' : '#666',
    iconColor: isDarkMode ? '#ffffff' : '#444', 
    primary: '#FF3B30',
  };

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.log('Müşteriler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter((item: any) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    const name = (item.name || "").toLowerCase();
    const ad = (item.ad || "").toLowerCase();
    const soyad = (item.soyad || "").toLowerCase();
    const phone = (item.phone || item.telefon || "").replace(/\s/g, "");
    const searchWords = s.split(" ");
    return searchWords.every(word => 
      name.includes(word) || ad.includes(word) || soyad.includes(word) || phone.includes(word)
    );
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>Müşteri Listesi</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={38} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#2c2c2c' : '#F0F0F0', borderColor: theme.borderColor }]}>
        <Ionicons name="search-outline" size={20} color={theme.subText} />
        <TextInput 
          style={[styles.input, { color: theme.textColor }]} 
          placeholder="İsim veya telefon ara..." 
          placeholderTextColor={theme.subText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: theme.textColor }]}>
                  {item.ad ? `${item.ad} ${item.soyad}` : item.name}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.infoRow} 
                onPress={() => item.phone && Linking.openURL(`tel:${item.phone}`)}
              >
                <Ionicons name="call-outline" size={16} color={theme.primary} style={styles.icon} />
                <Text style={[styles.text, { color: theme.textColor }]}>{item.phone || item.telefon || '-'}</Text>
              </TouchableOpacity>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={theme.subText} style={styles.icon} />
                <Text style={[styles.text, { color: theme.subText }]}>{item.address || item.adres || '-'}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  title: { fontSize: 20, fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 45, borderRadius: 10, marginBottom: 15, borderWidth: 1 },
  input: { flex: 1, marginLeft: 8, fontSize: 15 },
  card: { borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1 },
  nameRow: { marginBottom: 8 },
  name: { fontSize: 17, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 10, width: 18 },
  text: { fontSize: 14, fontWeight: '400' },
});