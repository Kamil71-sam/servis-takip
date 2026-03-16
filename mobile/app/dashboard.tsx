import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, StatusBar, Alert 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

// --- BÖLÜMLERİN İTHALAT MÜHÜRLERİ ---
import YeniMusteriFormu from '../components/YeniMusteriFormu'; 
import YeniFirmaFormu from '../components/YeniFirmaFormu'; 
import YeniServisKaydi from '../components/YeniServisKaydi'; 
import StokTakibiAnaEkran from '../components/StokTakibiAnaEkran';
import MaliIslemlerAnaEkran from '../components/MaliIslemlerAnaEkran';

// MÜDÜR: Servisleri ve Parça Taleplerini çekmek için API'leri çağırdık
import { getServices } from '../services/api';
import { getAllMaterialRequests } from '../services/api_material';

export default function DashboardScreen() {
  const router = useRouter(); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [onayBekleyenSayisi, setOnayBekleyenSayisi] = useState(0); 
  const [parcaBekleyenSayisi, setParcaBekleyenSayisi] = useState(0); // MÜDÜR: Parça bekleyen sayaç

  // --- ASANSÖR KİLİTLERİ (MODALLAR) ---
  const [musteriVisible, setMusteriVisible] = useState(false);
  const [firmaVisible, setFirmaVisible] = useState(false);
  const [servisVisible, setServisVisible] = useState(false);
  const [stokVisible, setStokVisible] = useState(false); 
  const [maliVisible, setMaliVisible] = useState(false);

  // --- MÜDÜR: ALT MENÜ GRUP KİLİTLERİ ---
  const [isServisSubMenuOpen, setIsServisSubMenuOpen] = useState(false);
  const [isMusteriSubMenuOpen, setIsMusteriSubMenuOpen] = useState(false);
  const [isListeSubMenuOpen, setIsListeSubMenuOpen] = useState(false); 

  const D_COLOR = isDarkMode ? "#ffffff" : "#000000"; 

  const toggleMusteriMenu = () => {
    const nextState = !isMusteriSubMenuOpen;
    setIsMusteriSubMenuOpen(nextState);
    if (nextState) setIsServisSubMenuOpen(false);
  };

  const toggleServisMenu = () => {
    const nextState = !isServisSubMenuOpen;
    setIsServisSubMenuOpen(nextState);
    if (nextState) setIsMusteriSubMenuOpen(false);
  };

  // MÜDÜR: ONAY VE PARÇA BEKLEYEN İKAZ SİSTEMİ MOTORU
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // 1. Onay Bekleyenleri Say
        const srvData = await getServices();
        const bekleyenler = (srvData || []).filter((s: any) => s.durum === 'Onay Bekliyor' || s.status === 'Onay Bekliyor');
        setOnayBekleyenSayisi(bekleyenler.length);

        // 2. Parça Taleplerini Say (MÜDÜR: Burası yeni tesisat)
        const matRes = await getAllMaterialRequests();
        if (matRes && matRes.success) {
          const talepler = (matRes.data || []).filter((m: any) => m.status === 'Beklemede');
          setParcaBekleyenSayisi(talepler.length);
        }
      } catch (e) { 
        console.log("Dashboard motoru iletişim bekliyor..."); 
      }
    };

    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        
        <View style={[styles.topBar, isDarkMode && styles.darkBorder]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
              <Ionicons name="menu" size={30} color={isDarkMode ? "#fff" : "#333"} />
            </TouchableOpacity>
            <View style={styles.topWeather}>
              <Ionicons name={isDarkMode ? "cloudy" : "sunny"} size={18} color={isDarkMode ? "#aaa" : "#FFA500"} />
              <Text style={[styles.topWeatherText, isDarkMode && styles.darkText]}> 18°C</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={{ marginRight: 25 }}>
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color={isDarkMode ? "#FFD700" : "#555"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={28} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          <View style={styles.headerSection}>
            <Text style={[styles.bigTitleText, isDarkMode && styles.darkText]}>TEKNİK SERVİS TAKİP PROGRAMI</Text>
            <Text style={[styles.welcomeText, isDarkMode && styles.darkText]}>Kullanıcı Paneli</Text>
          </View>
          
          <View style={[styles.chartCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>İş Durum Dağılımı</Text>
            <Ionicons name="pie-chart" size={160} color={isDarkMode ? "#555" : "#333"} style={{ alignSelf: 'center' }} />
          </View>
          
          <TouchableOpacity style={styles.sahaBox} activeOpacity={0.8} onPress={() => setServisVisible(true)}>
            <Ionicons name="calendar-outline" size={26} color="#fff" />
            <Text style={styles.actionText}>Servis Randevusu Oluştur</Text>
          </TouchableOpacity>
          
          {/* MÜDÜR: ONAY BEKLEYEN İKAZ PLAKASI */}
          <TouchableOpacity 
            style={[styles.alertBanner, { backgroundColor: onayBekleyenSayisi > 0 ? '#FF3B30' : '#34C759' }]} 
            activeOpacity={0.9} 
            onPress={() => router.push({ pathname: '/servisler', params: { theme: isDarkMode ? 'dark' : 'light' } })}
          >
            <Ionicons name={onayBekleyenSayisi > 0 ? "warning" : "checkmark-circle"} size={24} color="#fff" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.alertTitle}>
                {onayBekleyenSayisi > 0 ? "MÜŞTERİ ONAYI BEKLENİYOR" : "SİSTEM TEMİZ"}
              </Text>
              <Text style={styles.alertText}>
                {onayBekleyenSayisi > 0 
                  ? `Usta fiyat verdi! ${onayBekleyenSayisi} cihaza müşteri onayı gerekiyor.` 
                  : "Onay bekleyen cihaz bulunmuyor."}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" style={{ opacity: 0.7 }} />
          </TouchableOpacity>
        </ScrollView>

        {isMenuOpen && (
          <View style={styles.overlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsMenuOpen(false)} />
            <View style={[styles.menuContainer, isDarkMode && styles.darkCard]}>
              <Text style={[styles.menuTitle, isDarkMode && styles.darkText]}>İŞLEMLER</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                
                <TouchableOpacity style={styles.menuItem} onPress={toggleMusteriMenu}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="people-outline" size={24} color={D_COLOR} />
                    <Text style={[styles.menuItemText, { color: D_COLOR }]}>Müşteri İşlemleri</Text>
                  </View>
                  <Ionicons name={isMusteriSubMenuOpen ? "chevron-up" : "chevron-down"} size={18} color={D_COLOR} />
                </TouchableOpacity>

                {isMusteriSubMenuOpen && (
                  <View style={[styles.subMenuBlock, isDarkMode && styles.darkSubMenuBlock]}>
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { setMusteriVisible(true); setIsMenuOpen(false); }}>
                      <Ionicons name="person-add" size={20} color={D_COLOR} style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Bireysel Müşteri Kaydı</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { setFirmaVisible(true); setIsMenuOpen(false); }}>
                      <Ionicons name="business" size={20} color={D_COLOR} style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Firma Kaydı</Text>
                    </TouchableOpacity>
                    <View style={[styles.subMenuDivider, {backgroundColor: isDarkMode ? 'transparent' : '#eee'}]} />
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => setIsListeSubMenuOpen(!isListeSubMenuOpen)}>
                      <Ionicons name="people-circle" size={22} color={D_COLOR} style={{ marginRight: 15 }} />
                      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20 }}>
                        <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Müşteri Listesi</Text>
                        <Ionicons name={isListeSubMenuOpen ? "chevron-up" : "chevron-down"} size={16} color={D_COLOR} />
                      </View>
                    </TouchableOpacity>

                    {isListeSubMenuOpen && (
                      <View style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#efefef', marginLeft: 20, borderRadius: 10, marginBottom: 10 }}>
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setIsMenuOpen(false); router.push({ pathname: '/musteriler', params: { theme: isDarkMode ? 'dark' : 'light' } }); }}>
                          <Ionicons name="person" size={18} color={D_COLOR} style={{ marginRight: 15 }} />
                          <Text style={[styles.subMenuItemText, {fontSize: 13, color: D_COLOR}]}>Bireysel Listesi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setIsMenuOpen(false); router.push({ pathname: '/firmalar', params: { theme: isDarkMode ? 'dark' : 'light' } }); }}>
                          <Ionicons name="copy" size={18} color={D_COLOR} style={{ marginRight: 15 }} />
                          <Text style={[styles.subMenuItemText, {fontSize: 13, color: D_COLOR}]}>Firma Listesi</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity style={styles.menuItem} onPress={toggleServisMenu}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="construct-outline" size={24} color={D_COLOR} />
                    <Text style={[styles.menuItemText, { color: D_COLOR }]}>Servis İşlemleri</Text>
                  </View>
                  <Ionicons name={isServisSubMenuOpen ? "chevron-up" : "chevron-down"} size={18} color={D_COLOR} />
                </TouchableOpacity>

                {isServisSubMenuOpen && (
                  <View style={[styles.subMenuBlock, isDarkMode && styles.darkSubMenuBlock]}>
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { setServisVisible(true); setIsMenuOpen(false); }}>
                      <Ionicons name="add-circle" size={20} color={D_COLOR} style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Kayıt Oluşturma</Text>
                    </TouchableOpacity>
                    <View style={[styles.subMenuDivider, isDarkMode && styles.darkBorder]} />
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { 
                        setIsMenuOpen(false); 
                        router.push({ pathname: '/servisler', params: { theme: isDarkMode ? 'dark' : 'light' } }); 
                    }}>
                      <Ionicons name="list-circle" size={20} color={D_COLOR} style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Kayıt Listeleme</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* MÜDÜR: PARÇA SİPARİŞ TAKİBİ BUTONU BURAYA MONTE EDİLDİ */}
                <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); router.push('/banko_stok_onay'); }}>
                  <Ionicons name="cube-outline" size={24} color={parcaBekleyenSayisi > 0 ? "#FF3B30" : D_COLOR} />
                  <Text style={[styles.menuItemText, { color: parcaBekleyenSayisi > 0 ? "#FF3B30" : D_COLOR }]}>Parça Takibi</Text>
                  {parcaBekleyenSayisi > 0 && (
                    <View style={{backgroundColor: '#FF3B30', borderRadius: 10, paddingHorizontal: 6, marginLeft: 10}}>
                       <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>{parcaBekleyenSayisi}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setStokVisible(true); setIsMenuOpen(false); }}>
                  <Ionicons name="file-tray-full-outline" size={24} color={D_COLOR} />
                  <Text style={[styles.menuItemText, { color: D_COLOR }]}>Stok Takibi</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMaliVisible(true); setIsMenuOpen(false); }}>
                  <Ionicons name="wallet-outline" size={24} color={D_COLOR} />
                  <Text style={[styles.menuItemText, { color: D_COLOR }]}>Mali İşlemler</Text>
                </TouchableOpacity>
              </ScrollView>
              
              <View style={styles.fixedInfoArea}>
                <View style={[styles.infoDivider, isDarkMode && styles.darkBorder]} />
                <View style={styles.fixedInfoRow}>
                  <Ionicons name="alert-circle" size={18} color={onayBekleyenSayisi > 0 ? "#FF3B30" : "#34C759"} />
                  <Text style={[styles.fixedInfoText, isDarkMode && styles.darkText]}>
                    Onay Bekleyen İş: {onayBekleyenSayisi}
                  </Text>
                </View>
                <View style={styles.fixedInfoRow}>
                  <Ionicons name="cart-outline" size={18} color={parcaBekleyenSayisi > 0 ? "#FF9500" : "#34C759"} />
                  <Text style={[styles.fixedInfoText, isDarkMode && styles.darkText]}>
                    Parça Bekleyen: {parcaBekleyenSayisi}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <YeniMusteriFormu visible={musteriVisible} onClose={() => setMusteriVisible(false)} isDarkMode={isDarkMode} />
        <YeniFirmaFormu visible={firmaVisible} onClose={() => setFirmaVisible(false)} isDarkMode={isDarkMode} />
        <YeniServisKaydi visible={servisVisible} onClose={() => setServisVisible(false)} isDarkMode={isDarkMode} />
        <StokTakibiAnaEkran visible={stokVisible} onClose={() => setStokVisible(false)} isDarkMode={isDarkMode} />
        <MaliIslemlerAnaEkran visible={maliVisible} onClose={() => setMaliVisible(false)} isDarkMode={isDarkMode} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  darkContainer: { backgroundColor: '#121212' },
  darkBorder: { borderColor: '#333' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, borderBottomWidth: 1, borderColor: '#eee' },
  topWeather: { marginLeft: 15, flexDirection: 'row', alignItems: 'center' },
  topWeatherText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  topActions: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { padding: 25 },
  headerSection: { marginBottom: 20, alignItems: 'center' },
  bigTitleText: { fontSize: 19, fontWeight: '900', color: '#333', textAlign: 'center' },
  welcomeText: { fontSize: 18, color: '#888', fontWeight: 'bold', textAlign: 'center' },
  chartCard: { backgroundColor: '#fff', borderRadius: 25, padding: 30, elevation: 6 },
  darkCard: { backgroundColor: '#1e1e1e' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sahaBox: { width: '100%', height: 75, backgroundColor: '#333', borderRadius: 20, marginTop: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 12 },
  alertBanner: { borderRadius: 20, flexDirection: 'row', padding: 20, alignItems: 'center', marginTop: 20, elevation: 4 },
  alertTitle: { color: '#fff', fontWeight: '900', fontSize: 14, marginBottom: 2 },
  alertText: { color: '#fff', fontWeight: '600', fontSize: 12, opacity: 0.9 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, flexDirection: 'row' },
  menuContainer: { width: '75%', height: '100%', backgroundColor: '#fff', paddingVertical: 60, paddingHorizontal: 0 },
  menuTitle: { fontSize: 20, fontWeight: '900', marginBottom: 30, paddingHorizontal: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingHorizontal: 30 },
  menuItemText: { marginLeft: 15, fontSize: 16, fontWeight: 'bold' },
  subMenuBlock: { backgroundColor: '#f6f6f6', width: '100%', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#eee' },
  darkSubMenuBlock: { backgroundColor: '#1a1a1a', borderBottomColor: '#2a2a2a' },
  subMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingLeft: 45 },
  subMenuItemText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  subMenuDivider: { height: 1, backgroundColor: '#eee', marginLeft: 45 },
  fixedInfoArea: { position: 'absolute', bottom: 30, left: 30, right: 30 },
  infoDivider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
  fixedInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  fixedInfoText: { marginLeft: 10, fontSize: 14, color: '#666', fontWeight: 'bold' },
  darkText: { color: '#fff' }
});