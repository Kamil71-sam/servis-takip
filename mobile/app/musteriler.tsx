import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Tek bir yerden import ettik
import { getCustomers } from '../services/api';

export default function MusterilerScreen() {
  const router = useRouter();
  
  // MÜDÜR: Dashboard'dan gelen 'theme' mirasını okuyan kablo burası.
  const params = useLocalSearchParams();
  const isDarkMode = params.theme === 'dark'; 

  const [customers, setCustomers] = useState<any[]>([]);

  // Renk Paleti (Gelen mirasa göre kendini ayarlar)
  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f8f8f8',
    borderColor: isDarkMode ? '#333' : '#eee',
    textColor: isDarkMode ? '#fff' : '#111',
    subText: isDarkMode ? '#aaa' : '#444',
    primary: '#FF3B30',
  };

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.log('Müşteriler alınamadı');
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Gece moduna göre üst barın rengini ayarlar */}
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>MÜŞTERİ LİSTESİ</Text>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close-circle" size={42} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <Text style={[styles.name, { color: theme.textColor }]}>{item.name}</Text>
            
            <View style={styles.infoRow}>
                <Ionicons name="call" size={14} color={theme.subText} style={styles.icon} />
                <Text style={[styles.text, { color: theme.subText }]}>{item.phone}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Ionicons name="print" size={14} color={theme.subText} style={styles.icon} />
                <Text style={[styles.text, { color: theme.subText }]}>{item.fax || '-'}</Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="mail" size={14} color={theme.subText} style={styles.icon} />
                <Text style={[styles.text, { color: theme.subText }]}>{item.email || '-'}</Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="location" size={14} color={theme.subText} style={styles.icon} />
                <Text style={[styles.text, { color: theme.subText }]}>{item.address || '-'}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeButton: {
    marginLeft: 12,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
    width: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});