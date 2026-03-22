import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity,
  Alert, ActivityIndicator, Linking, RefreshControl, StatusBar, useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { getAppointments, cancelAppointment } from '../services/api'; 

export default function RandevuTakip() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const isDarkMode = params.theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  const API_URL = process.env.EXPO_PUBLIC_API_URL; 

  const loadData = async () => {
    try {
      setLoading(refreshing ? false : true);
      const data = await getAppointments();
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
  }, [isDarkMode]); 

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCancelAction = (id: number, servisNo: string) => {
    if (!id || id === 0) {
      Alert.alert("Hata", "ID bilgisi eksik!");
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
              loadData();
            }
          } catch (error: any) {
            Alert.alert("Hata", error.message || "İptal edilemedi.");
          }
        } 
      }
    ]);
  };

  const handleFinanceAction = (id: number, action: 'yes' | 'no') => {
    Alert.alert(
      "İşlem Onayı",
      action === 'yes' 
        ? "Bu randevu ücreti kasaya 'Gelir' olarak eklenecek ve iş kapatılacak. Onaylıyor musunuz?" 
        : "Bu randevu 'İşlem Yapılmayı Bekliyor' statüsüne alınacak. Onaylıyor musunuz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Onayla", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/operation/finance-approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
              });
              const result = await res.json();
              if(result.success) {
                Alert.alert("Başarılı", action === 'yes' ? "İş kapatıldı (Gelir eklendi)." : "İşlem beklemeye alındı.");
                loadData(); 
              } else {
                Alert.alert("Hata", "İşlem kaydedilemedi.");
              }
            } catch (error) {
              Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamadı.");
            }
          } 
        }
      ]
    );
  };

const renderRandevu = ({ item }: any) => {
    // --- MÜDÜR: İŞTE O KRİTİK TEMİZLİK VANASI! ---
    // Eğer iş 'Teslim Edildi' ise bu ekranın listesine hiç sokmuyoruz, yığılmayı önlüyoruz.
    if (item.status === 'Teslim Edildi' || item.status === 'teslim edildi') {
        return null;
    }

    const clean = (str: string) => {
        if (!str) return "";
        return str.replace(/[📍🔧📝]/g, '').replace(/ADRES:|CİHAZ:|NOT:/gi, '').trim();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const dAdres = clean(item.parca_adres);
    const dCihaz = clean(item.parca_cihaz);
    const dNot = clean(item.parca_not);

    const isParsed = !!dAdres || !!dCihaz;

    const isCompleted = item.status === 'Tamamlandı' || item.status === 'tamamlandı';
    const isPending = item.status === 'İşlem Bekliyor';

    return (
    <View style={[styles.card, isDarkMode && darkStyles.card]}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.servis_no}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.dateText, isDarkMode && darkStyles.textSub]}>
              {item.appointment_date ? formatDate(item.appointment_date) : ''} 
              {item.appointment_time ? ` | ${item.appointment_time}` : ''}
            </Text>
            {item.assigned_usta && (
                <Text style={{ color: '#FF3B30', fontSize: 11, fontWeight: '800', marginTop: 2 }}>
                   {item.assigned_usta.toUpperCase()}
                </Text>
            )}
        </View>
      </View>
      
      <Text style={[styles.customerName, isDarkMode && darkStyles.textMain]}>
        {item.customer_name || 'İsimsiz Müşteri'}
      </Text>
      
      <View style={{ marginBottom: 20, gap: 10 }}> 
          {isParsed ? (
              <>
                  {dAdres ? (
                      <Text style={[styles.detailText, isDarkMode && darkStyles.textSub]}>
                          📍 ADRES: {dAdres}
                      </Text>
                  ) : null}

                  {dCihaz ? (
                      <Text style={[styles.detailText, isDarkMode && darkStyles.textMain, { fontWeight: '700' }]}>
                          🔧 CİHAZ: {dCihaz}
                      </Text>
                  ) : null}

                  {dNot ? (
                      <Text style={[styles.detailText, isDarkMode && darkStyles.textSub]}>
                          📝 NOT: {dNot}
                      </Text>
                  ) : null}
              </>
          ) : (
              <Text style={[styles.detailText, isDarkMode && darkStyles.textSub]}>
                  {item.issue_text || 'Detay belirtilmemiş.'}
              </Text>
          )}
      </View>

      {isCompleted && (
        <View style={styles.financeBox}>
          <Text style={styles.financeText}>💰 Randevu ücreti mali işlemlere gelir olarak kayıt edilsin mi?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#34C759' }]} onPress={() => handleFinanceAction(item.id, 'yes')}>
              <Text style={styles.btnText}>EVET (Gelir Ekle)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF3B30' }]} onPress={() => handleFinanceAction(item.id, 'no')}>
              <Text style={styles.btnText}>HAYIR (Beklet)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isPending && (
        <View style={styles.pendingBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="time" size={20} color="#FF9500" />
            <Text style={styles.pendingText}>İşlem Yapılmayı Bekliyor</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#34C759', height: 44 }]} onPress={() => handleFinanceAction(item.id, 'yes')}>
            <Text style={styles.btnText}>Gelir Olarak Kaydet ve Kapat</Text>
          </TouchableOpacity>
        </View>
      )}

      {(!isCompleted && !isPending) && (
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
      )}

    </View>
    );
};

  return (
    <SafeAreaView style={[styles.container, isDarkMode && darkStyles.container]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, isDarkMode && darkStyles.header]}>
        <View>
            <Text style={[styles.title, isDarkMode && darkStyles.textMain]}>RANDEVU</Text>
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF3B30" />
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, isDarkMode && darkStyles.textSub]}>Aktif randevu bulunamadı.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 55, marginBottom: 15 },
  title: { fontSize: 26, fontWeight: '900', lineHeight: 26, color: '#1a1a1a' },
  subTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  exitBtn: { backgroundColor: '#FF3B30', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  card: { padding: 24, borderRadius: 20, marginBottom: 15, elevation: 4, minHeight: 180, backgroundColor: '#ffffff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  badge: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  customerName: { fontSize: 19, fontWeight: '800', marginBottom: 10, color: '#1a1a1a' },
  dateText: { color: '#666666', fontSize: 13, fontWeight: 'bold' },
  detailText: { fontSize: 14, lineHeight: 22, color: '#666666' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  callBtn: { backgroundColor: '#34C759' },
  cancelBtn: { backgroundColor: '#8E8E93' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyText: { textAlign: 'center', marginTop: 100, fontSize: 16, color: '#666666' },
  financeBox: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 12, marginTop: 10 },
  financeText: { color: '#2E7D32', fontSize: 13, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  pendingBox: { backgroundColor: '#FFF8E1', padding: 15, borderRadius: 12, marginTop: 10 },
  pendingText: { color: '#FF9500', fontSize: 14, fontWeight: 'bold', marginLeft: 8 }
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#121212' },
  header: { backgroundColor: '#121212', borderBottomColor: '#2C2C2C' },
  card: { backgroundColor: '#1e1e1e' },
  textMain: { color: '#ffffff' },
  textSub: { color: '#aaaaaa' }
});