import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity,
  Alert, ActivityIndicator, Linking, RefreshControl, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 
import { getAppointments, cancelAppointment } from '../services/api'; 

export default function RandevuTakip({ isDarkMode }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  // MÜDÜR: Dashboard temasına tam uyum
  const theme = {
    bg: isDarkMode ? '#121212' : '#f8f9fa',
    card: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1a1a1a',
    subText: isDarkMode ? '#aaaaaa' : '#666666',
    border: isDarkMode ? '#333333' : '#eeeeee'
  };

  const loadData = async () => {
    try {
      setLoading(refreshing ? false : true); // Sadece ilk yüklemede çark göster
      const data = await getAppointments();
      
      // MÜDÜR: Kayıt numarasına göre (Büyükten küçüğe) sıralama
      const sortedData = data.sort((a: any, b: any) => {
          return (b.servis_no || "").localeCompare(a.servis_no || "");
      });
      setAppointments(sortedData);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // --- MÜDÜR: KESİN ÇÖZÜM İPTAL MOTORU ---
  const handleCancelAction = (id: number, servisNo: string) => {
    // Müdür, terminaldeki "id: 0" hatasını burada yakalıyoruz
    if (!id || id === 0) {
      Alert.alert("Hata", "ID bilgisi eksik! Lütfen listeyi yenileyin.");
      return;
    }

    Alert.alert("İptal Onayı", `${servisNo} nolu randevu iptal edilsin mi?`, [
      { text: "Vazgeç", style: "cancel" },
      { 
        text: "Evet, İptal Et", 
        style: "destructive", 
        onPress: async () => {
          try {
            const result = await cancelAppointment(id);
            if(result) {
              Alert.alert("Başarılı", "Randevu iptal edildi.");
              loadData(); // Başarılıysa listeyi tazele
            }
          } catch (error: any) {
            // Backend'den dönen hata mesajını gösterir
            Alert.alert("İşlem Başarısız", error.message || "İptal sırasında sorun oluştu.");
          }
        } 
      }
    ]);
  };

  const renderRandevu = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 0 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}><Text style={styles.badgeText}>{item.servis_no}</Text></View>
        <Text style={{color: theme.subText, fontSize: 12}}>{item.appointment_date}</Text>
      </View>
      
      <Text style={[styles.customerName, {color: theme.text}]}>{item.customer_name || 'İsimsiz Müşteri'}</Text>
      <Text style={[styles.detailText, {color: theme.subText}]} numberOfLines={2}>
        {item.issue_text || 'Detay belirtilmemiş.'}
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.btn, styles.callBtn]} 
          onPress={() => item.customer_phone ? Linking.openURL(`tel:${item.customer_phone}`) : Alert.alert("Hata", "Telefon yok")}
        >
           <Ionicons name="call" size={18} color="#fff" />
           <Text style={styles.btnText}>Ara</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.cancelBtn]} 
          onPress={() => handleCancelAction(item.id, item.servis_no)}
        >
           <Ionicons name="close-circle" size={18} color="#fff" />
           <Text style={styles.btnText}>İptal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <View>
            <Text style={[styles.title, { color: theme.text }]}>RANDEVU</Text>
            <Text style={[styles.subTitle, { color: '#FF3B30' }]}>TAKİP VE TEYİT</Text>
        </View>
        
        <TouchableOpacity style={styles.exitBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF3B30" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRandevu}
          contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF3B30" colors={["#FF3B30"]} />
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.subText }]}>Aktif randevu bulunamadı.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginTop: 55, // Kamera payı
    marginBottom: 15
  },
  title: { fontSize: 26, fontWeight: '900', lineHeight: 26 },
  subTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  exitBtn: { 
    backgroundColor: '#FF3B30', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 5
  },
  card: { padding: 18, borderRadius: 20, marginBottom: 15, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  badge: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  customerName: { fontSize: 19, fontWeight: '800', marginBottom: 5 },
  detailText: { fontSize: 14, marginBottom: 15, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  callBtn: { backgroundColor: '#34C759' },
  cancelBtn: { backgroundColor: '#8E8E93' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyText: { textAlign: 'center', marginTop: 100, fontSize: 16 }
});