import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, StatusBar, Alert 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter(); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stokSayisi, setStokSayisi] = useState(0); 

  // ANDROID CANLI BAĞLANTI HATTI
  useEffect(() => {
    const fetchStok = async () => {
      try {
        const response = await fetch('http://192.168.1.43:5000/api/stok-ikaz');
        const data = await response.json();
        setStokSayisi(data.length); 
      } catch (e) { 
        console.log("Bağlantı bekleniyor..."); 
      }
    };
    fetchStok();
    const interval = setInterval(fetchStok, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (router.canGoBack()) { router.back(); } 
    else { router.replace('/'); }
  };

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        
        {/* --- ÜST BAR (ana1 Standartı) --- */}
        <View style={[styles.topBar, isDarkMode && styles.darkBorder]}>
          <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
            <Ionicons name="menu" size={30} color={isDarkMode ? "#fff" : "#333"} />
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={{marginRight: 15}}>
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color={isDarkMode ? "#FFD700" : "#333"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={28} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          <View style={styles.headerSection}>
            <Text style={[styles.welcomeText, isDarkMode && styles.darkText]}>Kullanıcı Paneli</Text>
            <Text style={styles.subText}>Teknik Servis Canlı Takip</Text>
          </View>

          <View style={[styles.chartCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>İş Durum Dağılımı</Text>
            <Ionicons name="pie-chart" size={160} color={isDarkMode ? "#555" : "#333"} style={{alignSelf: 'center'}} />
          </View>

          <TouchableOpacity style={styles.sahaBox} activeOpacity={0.8}>
            <Ionicons name="calendar-outline" size={26} color="#fff" />
            <Text style={styles.actionText}>Servis Randevusu Oluştur</Text>
          </TouchableOpacity>

          {/* STOK İKAZI (2 CM + 3 MM KURALI) */}
          <View style={styles.alertBanner}>
            <Ionicons name="warning" size={22} color="#fff" />
            <View style={{marginLeft: 10}}>
              <Text style={styles.alertTitle}>STOK TAKİP SİSTEMİ</Text>
              <Text style={styles.alertText}>
                {stokSayisi > 0 ? `${stokSayisi} Ürün Kritik Seviyede!` : "Stok Seviyesi Normal"}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* --- SANDÖVÇ MENÜ (ana1 STANDARTINA DÖNÜLDÜ) --- */}
        {isMenuOpen && (
          <View style={styles.overlay}>
            <TouchableOpacity style={{flex: 1}} onPress={() => setIsMenuOpen(false)} activeOpacity={1} />
            <View style={[styles.menuContainer, isDarkMode && styles.darkCard]}>
               <Text style={[styles.menuTitle, isDarkMode && styles.darkText]}>İŞLEMLER</Text>
               
               <TouchableOpacity style={styles.menuItem}>
                 <Ionicons name="person-add-outline" size={24} color={isDarkMode ? "#fff" : "#333"} />
                 <Text style={[styles.menuItemText, isDarkMode && styles.darkText]}>Yeni Müşteri Kaydı</Text>
               </TouchableOpacity>

               <TouchableOpacity style={styles.menuItem}>
                 <Ionicons name="business-outline" size={24} color={isDarkMode ? "#fff" : "#333"} />
                 <Text style={[styles.menuItemText, isDarkMode && styles.darkText]}>Yeni Firma Kaydı</Text>
               </TouchableOpacity>

               <TouchableOpacity style={styles.menuItem}>
                 <Ionicons name="cube-outline" size={24} color={isDarkMode ? "#fff" : "#333"} />
                 <Text style={[styles.menuItemText, isDarkMode && styles.darkText]}>Stok Yönetimi</Text>
               </TouchableOpacity>

               <TouchableOpacity style={styles.menuItem}>
                 <Ionicons name="calculator-outline" size={24} color={isDarkMode ? "#fff" : "#333"} />
                 <Text style={[styles.menuItemText, isDarkMode && styles.darkText]}>Cari Hesaplar</Text>
               </TouchableOpacity>

               {/* SABİT MALİ VE STOK BİLGİSİ (EN ALTA ÇİVİLENDİ) */}
               <View style={styles.fixedInfoArea}>
                 <View style={[styles.infoDivider, isDarkMode && styles.darkBorder]} />
                 <Text style={[styles.fixedInfoTitle, isDarkMode && styles.darkText]}>Sistem Özetleri</Text>
                 <View style={styles.fixedInfoRow}>
                   <Ionicons name="cube" size={18} color="#FF3B30" />
                   <Text style={[styles.fixedInfoText, isDarkMode && styles.darkText]}>Kritik Stok: {stokSayisi}</Text>
                 </View>
                 <View style={styles.fixedInfoRow}>
                   <Ionicons name="stats-chart" size={18} color="#28a745" />
                   <Text style={[styles.fixedInfoText, isDarkMode && styles.darkText]}>Mali Durum: Aktif</Text>
                 </View>
               </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  darkContainer: { backgroundColor: '#121212' },
  darkBorder: { borderColor: '#333' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, borderBottomWidth: 1, borderColor: '#eee' },
  topActions: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { padding: 25 },
  headerSection: { marginBottom: 15 },
  welcomeText: { fontSize: 26, fontWeight: '900', color: '#333' },
  subText: { fontSize: 14, color: '#888' },
  chartCard: { backgroundColor: '#fff', borderRadius: 25, padding: 30, elevation: 6 },
  darkCard: { backgroundColor: '#1e1e1e' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sahaBox: { width: '100%', height: 75, backgroundColor: '#333', borderRadius: 20, marginTop: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 12 },
  alertBanner: { backgroundColor: '#FF3B30', borderRadius: 20, flexDirection: 'row', padding: 20, alignItems: 'center', marginTop: 30 },
  alertTitle: { color: '#fff', fontWeight: '900', fontSize: 14 },
  alertText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, flexDirection: 'row' },
  menuContainer: { width: '75%', height: '100%', backgroundColor: '#fff', padding: 30, paddingTop: 60, position: 'relative' },
  menuTitle: { fontSize: 20, fontWeight: '900', marginBottom: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuItemText: { marginLeft: 15, fontSize: 16, fontWeight: 'bold', color: '#333' },
  fixedInfoArea: { position: 'absolute', bottom: 30, left: 30, right: 30 },
  infoDivider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
  fixedInfoTitle: { fontSize: 16, fontWeight: '900', marginBottom: 12, color: '#333' },
  fixedInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  fixedInfoText: { marginLeft: 10, fontSize: 14, color: '#666', fontWeight: 'bold' },
  darkText: { color: '#fff' }
});