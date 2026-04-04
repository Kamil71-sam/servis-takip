import React, { useState, useEffect, useCallback } from 'react';


import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, StatusBar, Alert, Platform, Modal 
} from 'react-native';







import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { pdfCiktiAl } from '../components/CiktiMotoru';



// --- BÖLÜMLERİN İTHALAT MÜHÜRLERİ ---
import YeniMusteriFormu from '../components/YeniMusteriFormu'; 
import YeniFirmaFormu from '../components/YeniFirmaFormu'; 
import YeniServisKaydi from '../components/YeniServisKaydi'; 
import StokTakibiAnaEkran from '../components/StokTakibiAnaEkran';
import MaliIslemlerAnaEkran from '../components/MaliIslemlerAnaEkran';

import { getServices } from '../services/api';
import { getAllMaterialRequests } from '../services/api_material';

export default function DashboardScreen() {
  const router = useRouter(); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [onayBekleyenSayisi, setOnayBekleyenSayisi] = useState(0); 
  const [parcaBekleyenSayisi, setParcaBekleyenSayisi] = useState(0); 
  const [teyitBekleyenSayisi, setTeyitBekleyenSayisi] = useState(0); 

  // --- ASANSÖR KİLİTLERİ (MODALLAR) ---
  const [musteriVisible, setMusteriVisible] = useState(false);
  const [firmaVisible, setFirmaVisible] = useState(false);
  const [servisVisible, setServisVisible] = useState(false);
  const [stokVisible, setStokVisible] = useState(false); 
  const [maliVisible, setMaliVisible] = useState(false);
  const [pdfOnizlemeVisible, setPdfOnizlemeVisible] = useState(false);

  // --- MÜDÜR: ALT MENÜ GRUP KİLİTLERİ ---
  const [isServisSubMenuOpen, setIsServisSubMenuOpen] = useState(false);
  const [isMusteriSubMenuOpen, setIsMusteriSubMenuOpen] = useState(false);
  const [isListeSubMenuOpen, setIsListeSubMenuOpen] = useState(false); 
  const [isRandevuSubMenuOpen, setIsRandevuSubMenuOpen] = useState(false); 
  const [isEnvanterSubMenuOpen, setIsEnvanterSubMenuOpen] = useState(false); 
  const [isCiktiSubMenuOpen, setIsCiktiSubMenuOpen] = useState(false);

  const D_COLOR = isDarkMode ? "#ffffff" : "#000000"; 

  const toggleMusteriMenu = () => {
    const nextState = !isMusteriSubMenuOpen;
    setIsMusteriSubMenuOpen(nextState);
    if (nextState) {
        setIsServisSubMenuOpen(false);
        setIsRandevuSubMenuOpen(false);
        setIsEnvanterSubMenuOpen(false);
        setIsCiktiSubMenuOpen(false);
    }
  };

  const toggleServisMenu = () => {
    const nextState = !isServisSubMenuOpen;
    setIsServisSubMenuOpen(nextState);
    if (nextState) {
        setIsMusteriSubMenuOpen(false);
        setIsRandevuSubMenuOpen(false);
        setIsEnvanterSubMenuOpen(false);
    }
  };

  const toggleRandevuMenu = () => {
    const nextState = !isRandevuSubMenuOpen;
    setIsRandevuSubMenuOpen(nextState);
    if (nextState) {
        setIsMusteriSubMenuOpen(false);
        setIsServisSubMenuOpen(false);
        setIsEnvanterSubMenuOpen(false);
    }
  };

  const toggleEnvanterMenu = () => {
    const nextState = !isEnvanterSubMenuOpen;
    setIsEnvanterSubMenuOpen(nextState);
    if (nextState) {
        setIsMusteriSubMenuOpen(false);
        setIsServisSubMenuOpen(false);
        setIsRandevuSubMenuOpen(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const srvData = await getServices();
      const bekleyenler = (srvData || []).filter((s: any) => s.durum === 'Onay Bekliyor' || s.status === 'Onay Bekliyor');
      setOnayBekleyenSayisi(bekleyenler.length);

      const matRes = await getAllMaterialRequests();
      if (matRes && matRes.success) {
        const talepler = (matRes.data || []).filter((m: any) => m.status === 'Beklemede');
        setParcaBekleyenSayisi(talepler.length);
      }

      const response = await fetch('http://192.168.1.41:3000/api/operation/pending-confirmations');
      const teyitData = await response.json();
      if (teyitData.success) {
        setTeyitBekleyenSayisi(teyitData.data.length);
      }
    } catch (e) { 
      console.log("Dashboard motoru iletişim bekliyor..."); 
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardStats();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(fetchDashboardStats, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
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
            {/* HAVA DURUMU KÖKÜNDEN SÖKÜLDÜ */}
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
            <Ionicons name="pie-chart" size={140} color={isDarkMode ? "#555" : "#333"} style={{ alignSelf: 'center' }} />
          </View>
          
          <TouchableOpacity 
            style={styles.sahaBox} 
            activeOpacity={0.8} 
            onPress={() => router.push({ pathname: '/yeni_randevu', params: { theme: isDarkMode ? 'dark' : 'light' } })}
          >
            <Ionicons name="calendar-outline" size={22} color="#fff" />
            <Text style={styles.actionText}>Servis Randevusu Oluştur</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.alertBanner, { backgroundColor: onayBekleyenSayisi > 0 ? '#FF3B30' : '#34C759' }]} 
            activeOpacity={0.9} 
            onPress={() => router.push({ 
              pathname: '/servisler', 
              params: { theme: isDarkMode ? 'dark' : 'light', filterMode: 'onlyOnay' } 
            })}
          >
            <Ionicons name={onayBekleyenSayisi > 0 ? "warning" : "checkmark-circle"} size={22} color="#fff" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.alertTitle}>
                {onayBekleyenSayisi > 0 ? `${onayBekleyenSayisi} Cihaz Müşteri Onayı Bekliyor` : "SİSTEM TEMİZ"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FFF" style={{ opacity: 0.7 }} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.alertBanner, { backgroundColor: parcaBekleyenSayisi > 0 ? '#FF9500' : '#8E8E93', marginTop: 12 }]} 
            activeOpacity={0.9} 
            onPress={() => router.push({ 
              pathname: '/banko_stok_onay', 
              params: { theme: isDarkMode ? 'dark' : 'light', filterMode: 'onlyStok' } 
            })}
          >
            <Ionicons name="cube-outline" size={22} color="#fff" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.alertTitle}>
                {parcaBekleyenSayisi > 0 ? `${parcaBekleyenSayisi} Adet Parça Siparişi Bekliyor` : "BEKLEYEN PARÇA SİPARİŞİ YOK"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FFF" style={{ opacity: 0.7 }} />
          </TouchableOpacity>

          {teyitBekleyenSayisi >= 0 && (
            <TouchableOpacity 
              style={[styles.alertBanner, { backgroundColor: '#6558dd', marginTop: 12, height: 56 }]} 
              activeOpacity={0.9} 
              onPress={() => router.push({ 
                pathname: '/randevu_takip', 
                params: { theme: isDarkMode ? 'dark' : 'light', filter: 'tomorrow' } 
              })}
            >
              <Ionicons name="call" size={24} color="#fff" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.alertTitle}> {teyitBekleyenSayisi} Randevu Teyit Bekliyor</Text>
                <Text style={{color: '#fff', fontSize: 11, fontWeight: '600'}}> Müşteri Aranacak.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FFF" style={{ opacity: 0.7 }} />
            </TouchableOpacity>
          )}
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
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { setIsMenuOpen(false); router.push({ pathname: '/servisler', params: { theme: isDarkMode ? 'dark' : 'light' } }); }}>
                      <Ionicons name="list-circle" size={20} color={D_COLOR} style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Kayıt Listeleme</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={styles.menuItem} onPress={toggleRandevuMenu}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="calendar-outline" size={24} color={D_COLOR} />
                    <Text style={[styles.menuItemText, { color: D_COLOR }]}>Randevu İşlemleri</Text>
                  </View>
                  <Ionicons name={isRandevuSubMenuOpen ? "chevron-up" : "chevron-down"} size={18} color={D_COLOR} />
                </TouchableOpacity>

                {isRandevuSubMenuOpen && (
                  <View style={[styles.subMenuBlock, isDarkMode && styles.darkSubMenuBlock]}>
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { setIsMenuOpen(false); router.push({ pathname: '/yeni_randevu', params: { theme: isDarkMode ? 'dark' : 'light' } }); }}>
                      <Ionicons name="add-circle" size={20} color={D_COLOR} style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Yeni Randevu Kaydı</Text>
                    </TouchableOpacity>
                    <View style={[styles.subMenuDivider, isDarkMode && styles.darkBorder]} />
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { router.push({ pathname: '/randevu_takip', params: { theme: isDarkMode ? 'dark' : 'light' } }); setIsMenuOpen(false); }}>
                      <Ionicons name="time" size={20} color={D_COLOR} style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Randevu Takip & Teyit</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={styles.menuItem} onPress={toggleEnvanterMenu}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="file-tray-full-outline" size={24} color={D_COLOR} />
                    <Text style={[styles.menuItemText, { color: D_COLOR }]}>Envanter İşlemleri</Text>
                  </View>
                  <Ionicons name={isEnvanterSubMenuOpen ? "chevron-up" : "chevron-down"} size={18} color={D_COLOR} />
                </TouchableOpacity>

                {isEnvanterSubMenuOpen && (
                  <View style={[styles.subMenuBlock, isDarkMode && styles.darkSubMenuBlock]}>
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { setIsMenuOpen(false); router.push('/banko_stok_onay'); }}>
                      <Ionicons name="cube-outline" size={20} color={parcaBekleyenSayisi > 0 ? "#FF3B30" : D_COLOR} style={{ marginRight: 15 }} />
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[styles.subMenuItemText, { color: parcaBekleyenSayisi > 0 ? "#FF3B30" : D_COLOR }]}>Parça Takibi</Text>
                        {parcaBekleyenSayisi > 0 && (
                          <View style={{backgroundColor: '#FF3B30', borderRadius: 10, paddingHorizontal: 6, marginLeft: 10}}>
                             <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>{parcaBekleyenSayisi}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                    <View style={[styles.subMenuDivider, isDarkMode && styles.darkBorder]} />
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { setStokVisible(true); setIsMenuOpen(false); }}>
                      <Ionicons name="layers-outline" size={20} color={D_COLOR} style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Stok İşlemleri</Text>
                    </TouchableOpacity>
                  </View>
                )}



                <TouchableOpacity style={styles.menuItem} onPress={() => { setMaliVisible(true); setIsMenuOpen(false); }}>
                  <Ionicons name="wallet-outline" size={24} color={D_COLOR} />
                  <Text style={[styles.menuItemText, { color: D_COLOR }]}>Mali İşlemler</Text>
                </TouchableOpacity>

                {/* --- YENİ EKLENEN ÇIKTI İŞLEMLERİ MENÜSÜ --- */}
                <TouchableOpacity style={styles.menuItem} onPress={() => setIsCiktiSubMenuOpen(!isCiktiSubMenuOpen)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="print-outline" size={24} color={D_COLOR} />
                    <Text style={[styles.menuItemText, { color: D_COLOR }]}>Çıktı İşlemleri</Text>
                  </View>
                  <Ionicons name={isCiktiSubMenuOpen ? "chevron-up" : "chevron-down"} size={18} color={D_COLOR} />
                </TouchableOpacity>

                {isCiktiSubMenuOpen && (
                  <View style={[styles.subMenuBlock, isDarkMode && styles.darkSubMenuBlock]}>



                   <TouchableOpacity style={styles.subMenuItem} onPress={() => { 
                        setIsMenuOpen(false); 
                        // 🚨 KEMAL MÜDÜR MODALINI İPTAL ETTİK, LİSTEYE YÖNLENDİRDİK!
                        router.push({ pathname: '/FaturaListesi', params: { theme: isDarkMode ? 'dark' : 'light' } }); 
                    }}>
                        <Ionicons name="document-text" size={20} color="#FF3B30" style={{ marginRight: 15 }} />
                        <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>PDF Çıktı Al</Text>
                    </TouchableOpacity>


           


               
                    
                    



                    <View style={[styles.subMenuDivider, isDarkMode && styles.darkBorder]} />
                    
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { Alert.alert("Bilgi", "Word Çıktı Motoru Yakında!"); setIsMenuOpen(false); }}>
                      <Ionicons name="document" size={20} color="#007AFF" style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Word Çıktı Al</Text>
                    </TouchableOpacity>
                    <View style={[styles.subMenuDivider, isDarkMode && styles.darkBorder]} />
                    
                    <TouchableOpacity style={styles.subMenuItem} onPress={() => { Alert.alert("Bilgi", "Mail Motoru Yakında!"); setIsMenuOpen(false); }}>
                      <Ionicons name="mail" size={20} color="#34C759" style={{ marginRight: 15 }} />
                      <Text style={[styles.subMenuItemText, { color: D_COLOR }]}>Mail Olarak Gönder</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </ScrollView>

        

            </View>
          </View>
        )}

        <YeniMusteriFormu visible={musteriVisible} onClose={() => setMusteriVisible(false)} isDarkMode={isDarkMode} />
        <YeniFirmaFormu visible={firmaVisible} onClose={() => setFirmaVisible(false)} isDarkMode={isDarkMode} />
        <YeniServisKaydi visible={servisVisible} onClose={() => setServisVisible(false)} isDarkMode={isDarkMode} />
        <StokTakibiAnaEkran visible={stokVisible} onClose={() => setStokVisible(false)} isDarkMode={isDarkMode} />
        <MaliIslemlerAnaEkran visible={maliVisible} onClose={() => setMaliVisible(false)} isDarkMode={isDarkMode} />

        {/* --- PDF ÖNİZLEME VE ONAY MODALI --- */}
        <Modal visible={pdfOnizlemeVisible} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={[styles.menuContainer, isDarkMode && styles.darkCard, { width: '85%', height: 'auto', borderRadius: 20, padding: 25 }]}>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Ionicons name="document-text" size={28} color="#FF3B30" />
                <Text style={[styles.menuTitle, isDarkMode && styles.darkText, { marginBottom: 0, paddingHorizontal: 10, fontSize: 18 }]}>BELGE ÖNİZLEME</Text>
              </View>


             {/* --- 1. ÖZET KUTUSU (Daraltıldı, Fontlar Küçüldü) --- */}
              <View style={{ width: '90%', alignSelf: 'center', backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDarkMode ? '#333' : '#eee', marginBottom: 20 }}>
                <Text style={{ color: '#888', fontSize: 11, fontWeight: 'bold', marginBottom: 5 }}>GÖNDERİLECEK BİLGİLER</Text>
                <Text style={{ color: D_COLOR, fontSize: 13, fontWeight: '600', marginTop: 3 }}>👤 Müşteri: <Text style={{fontWeight: 'normal'}}>Kemal Müdür</Text></Text>
                <Text style={{ color: D_COLOR, fontSize: 13, fontWeight: '600', marginTop: 3 }}>🛠 İşlem: <Text style={{fontWeight: 'normal'}}>Anakart Entegre Değişimi vb.</Text></Text>
                <Text style={{ color: D_COLOR, fontSize: 13, fontWeight: '600', marginTop: 3 }}>💰 Tutar: <Text style={{fontWeight: 'bold', color: '#34C759'}}>19.440,00 ₺</Text></Text>
              </View>

              {/* --- 2. MAVİ BUTON (Boyu Kısaldı, Daraltıldı) --- */}
              <TouchableOpacity 
                style={[styles.sahaBox, { width: '90%', alignSelf: 'center', height: 45, backgroundColor: '#007AFF', marginTop: 0, justifyContent: 'center', marginBottom: 12 }]} 
                onPress={() => {
                  setPdfOnizlemeVisible(false);
                  pdfCiktiAl({ islem: "goster" }); 
                }}
              >
                <Ionicons name="eye" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>ÖNCE A4 EKRANDA GÖR</Text>
              </TouchableOpacity>

              {/* --- 3. KIRMIZI BUTON (Boyu Kısaldı, Daraltıldı) --- */}
              <TouchableOpacity 
                style={[styles.sahaBox, { width: '90%', alignSelf: 'center', height: 45, backgroundColor: '#FF3B30', marginTop: 0, justifyContent: 'center' }]} 
                onPress={() => {
                  setPdfOnizlemeVisible(false);
                  pdfCiktiAl({ islem: "paylas" }); 
                }}
              >
                <Ionicons name="share-social" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>WHATSAPP İLE PAYLAŞ</Text>
              </TouchableOpacity>
              

              







              





              <TouchableOpacity style={{ marginTop: 15, padding: 10, alignItems: 'center' }} onPress={() => setPdfOnizlemeVisible(false)}>
                <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 14 }}>VAZGEÇ</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>








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
  headerSection: { marginBottom: 20, alignItems: 'center' },
  bigTitleText: { fontSize: 19, fontWeight: '900', color: '#333', textAlign: 'center' },
  welcomeText: { fontSize: 18, color: '#888', fontWeight: 'bold', textAlign: 'center' },
  chartCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, elevation: 6 },
  darkCard: { backgroundColor: '#1e1e1e' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  sahaBox: { width: '100%', height: 55, backgroundColor: '#333', borderRadius: 15, marginTop: 15, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 20 },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 10 },
  alertBanner: { height: 55, borderRadius: 15, flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center', marginTop: 12, elevation: 4 },
  alertTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
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
  darkText: { color: '#fff' }
});