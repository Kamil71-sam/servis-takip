import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Modal, ScrollView, SafeAreaView, Platform, TextInput, Alert, ActivityIndicator,
  DeviceEventEmitter,
  RefreshControl,
  FlatList
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 
//import ParaCikisiFormu from './ParaCikisiFormu';
import { useFocusEffect } from 'expo-router'; 
import { useCallback } from 'react';


const API_URL = process.env.EXPO_PUBLIC_API_URL;

const formatDate = (val: string) => {
  if (!val) return '';
  let clean = val.replace(/\D/g, ''); 
  if (clean.length > 8) clean = clean.slice(0, 8);
  let match = clean.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
  if (match) {
    return !match[2] ? match[1] : `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`;
  }
  return val;
};

const formatMoney = (amount: number) => {
  return amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};



// --- FİLTRE ASANSÖRÜ ---
const GelismisFiltreModal = ({ visible, onClose, onApply, isDarkMode }: any) => {
  const [aktifSekme, setAktifSekme] = useState('zaman'); 
  const [seciliAyar, setSeciliAyar] = useState('Bu Ay'); 
  const [baslangic, setBaslangic] = useState('');
  const [bitis, setBitis] = useState('');
  const [gelirTipi, setGelirTipi] = useState('Tümü');
  const [seciliUsta, setSeciliUsta] = useState('Tümü');

  const theme = {
    bg: isDarkMode ? '#1e1e1e' : '#fff',
    text: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    border: isDarkMode ? '#333' : '#eee',
    activeBg: isDarkMode ? '#333' : '#1A1A1A',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
  };

  const handleUygula = () => {
    let filtreOzeti = '';
    if (aktifSekme === 'zaman') {
      filtreOzeti = seciliAyar === 'Tarih Aralığı' ? `${baslangic} - ${bitis}` : `${seciliAyar} Nakit Hareketleri`;
    } else if (aktifSekme === 'gelir') {
      if (gelirTipi === 'Tamir') {
        filtreOzeti = seciliUsta === 'Tümü' ? 'Tüm Tamir Gelirleri' : `Tamir Geliri (${seciliUsta})`;
      } else if (gelirTipi === 'Tümü') {
        filtreOzeti = 'Tüm Gelir Kalemleri';
      } else {
        filtreOzeti = `${gelirTipi} Gelirleri`;
      }
    } else {
      filtreOzeti = seciliAyar === 'Tümü' ? 'Tüm Gider Kalemleri' : `${seciliAyar} Çıkışları`;
    }
    onApply(filtreOzeti);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.filterPanelContent, { backgroundColor: theme.bg }]}>
          <View style={[styles.filterTabsRow, { borderBottomColor: theme.border }]}>
            <TouchableOpacity style={[styles.filterTab, aktifSekme === 'zaman' && { borderBottomColor: '#FF3B30' }]} onPress={() => setAktifSekme('zaman')}>
              <Text style={[styles.filterTabText, { color: aktifSekme === 'zaman' ? theme.text : theme.subText }]}>ZAMAN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterTab, aktifSekme === 'gelir' && { borderBottomColor: '#FF3B30' }]} onPress={() => setAktifSekme('gelir')}>
              <Text style={[styles.filterTabText, { color: aktifSekme === 'gelir' ? theme.text : theme.subText }]}>GELİR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterTab, aktifSekme === 'gider' && { borderBottomColor: '#FF3B30' }]} onPress={() => setAktifSekme('gider')}>
              <Text style={[styles.filterTabText, { color: aktifSekme === 'gider' ? theme.text : theme.subText }]}>GİDER</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 300, paddingVertical: 15 }} showsVerticalScrollIndicator={false}>
            {aktifSekme === 'zaman' && (
              <View style={styles.filterOptionsGrid}>
                {['Bugün', 'Bu Hafta', 'Bu Ay', 'Tarih Aralığı'].map(opt => (
                  <TouchableOpacity key={opt} style={[styles.filterOptBtn, { borderColor: theme.border }, seciliAyar === opt && { backgroundColor: theme.activeBg, borderColor: theme.activeBg }]} onPress={() => setSeciliAyar(opt)}>
                    <Text style={[styles.filterOptText, { color: seciliAyar === opt ? '#fff' : theme.text }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {aktifSekme === 'gelir' && (
              <View style={styles.filterOptionsGrid}>
                {['Tümü', 'Satış', 'Tamir', 'Nakit'].map(opt => (
                  <TouchableOpacity key={opt} style={[styles.filterOptBtn, { borderColor: theme.border }, gelirTipi === opt && { backgroundColor: theme.activeBg, borderColor: theme.activeBg }]} onPress={() => setGelirTipi(opt)}>
                    <Text style={[styles.filterOptText, { color: gelirTipi === opt ? '#fff' : theme.text }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {aktifSekme === 'gider' && (
              <View style={styles.filterOptionsGrid}>
                {['Tümü', 'Stok Alımı', 'Genel Gider', 'Diğer Giderler'].map(opt => (
                  <TouchableOpacity key={opt} style={[styles.filterOptBtn, { borderColor: theme.border }, seciliAyar === opt && { backgroundColor: theme.activeBg, borderColor: theme.activeBg }]} onPress={() => setSeciliAyar(opt)}>
                    <Text style={[styles.filterOptText, { color: seciliAyar === opt ? '#fff' : theme.text }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: '#FF3B30' }]} onPress={handleUygula}>
            <Text style={styles.applyBtnText}>FİLTREYİ UYGULA</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};









const IslemDetayModal = ({ visible, islem, onClose, isDarkMode }: any) => {
  if (!visible || !islem) return null;
  const theme = { bg: isDarkMode ? '#1e1e1e' : '#fff', text: isDarkMode ? '#fff' : '#1A1A1A', subText: isDarkMode ? '#aaa' : '#666', border: isDarkMode ? '#333' : '#eee' };
  const isGiris = islem.islem_yonu === 'GİRİŞ';

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.detayModalContent, { backgroundColor: theme.bg }]}>
          <View style={styles.detayHeader}>
            <View style={[styles.detayIconBox, { backgroundColor: isGiris ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)' }]}>
              <Ionicons name={isGiris ? "arrow-down" : "arrow-up"} size={32} color={isGiris ? "#34C759" : "#FF3B30"} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.detayCloseBtn}>
              <Ionicons name="close-circle" size={36} color={theme.subText} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.detayTutar, { color: isGiris ? '#34C759' : '#FF3B30' }]}>{isGiris ? '+' : '-'} {formatMoney(parseFloat(islem.tutar))} ₺</Text>
          <Text style={[styles.detayKategori, { color: theme.text }]}>{islem.kategori}</Text>
          <Text style={[styles.detayTarih, { color: theme.subText }]}>{new Date(islem.islem_tarihi).toLocaleString('tr-TR')}</Text>

          <View style={[styles.detayInfoContainer, { borderColor: theme.border }]}>
            
            {/* 🚨 SİNSİ HATANIN İKİZ KARDEŞİNİ BURADA YOK ETTİK */}
            {islem.servis_no ? <View style={[styles.detayRow, { borderBottomColor: theme.border }]}><Text style={styles.detayLabel}>Servis No:</Text><Text style={[styles.detayValue, { color: theme.text, fontWeight: 'bold' }]}>{islem.servis_no}</Text></View> : null}
            
            {islem.musteri_adi ? <View style={[styles.detayRow, { borderBottomColor: theme.border }]}><Text style={styles.detayLabel}>Müşteri:</Text><Text style={[styles.detayValue, { color: theme.text }]}>{islem.musteri_adi}</Text></View> : null}
            
            {(islem.cihaz_turu || islem.marka || islem.model) ? <View style={[styles.detayRow, { borderBottomColor: theme.border }]}><Text style={styles.detayLabel}>Cihaz:</Text><Text style={[styles.detayValue, { color: theme.text }]}>{islem.cihaz_turu ? `${islem.cihaz_turu} ` : ''}{islem.marka ? `${islem.marka} ` : ''}{islem.model || ''}</Text></View> : null}
            
            <View style={[styles.detayRow, { borderBottomColor: theme.border }]}><Text style={styles.detayLabel}>İşlemi Yapan:</Text><Text style={[styles.detayValue, { color: theme.text }]}>{islem.islem_yapan || 'Sistem'}</Text></View>
            <View style={[styles.detayRow, { borderBottomWidth: 0, flexDirection: 'column', alignItems: 'flex-start', paddingTop: 15 }]}>
              <Text style={[styles.detayLabel, { marginBottom: 8 }]}>Not:</Text>
              <View style={[styles.detayAciklamaKutu, { backgroundColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]}><Text style={[styles.detayValue, { color: theme.text, textAlign: 'left' }]}>{islem.aciklama || 'Yok'}</Text></View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};












// --- TÜM NAKİT HAREKETLERİ LİSTESİ ---
// MÜDÜRÜN RADARI: Buraya "onIslemSec" diye yeni bir kablo çektik!


// --- TÜM NAKİT HAREKETLERİ LİSTESİ (ARAMA MOTORLU VERSİYON) ---
const DetayliListeModal = ({ visible, islemler, onClose, onIslemSec, isDarkMode }: any) => {
  const theme = { bg: isDarkMode ? '#121212' : '#f4f6f8', cardBg: isDarkMode ? '#1e1e1e' : '#fff', border: isDarkMode ? '#333' : '#eee', text: isDarkMode ? '#fff' : '#1A1A1A', subText: isDarkMode ? '#aaa' : '#666' };

  // 🚨 1. ARAMA HAFIZASI: Klavyeden girilen metni burada tutacağız
  const [aramaMetni, setAramaMetni] = useState('');

  // 🚨 2. FİLTRE MOTORU: Sen yazdıkça anında listeyi daraltır
  const filtrelenmisIslemler = islemler.filter((islem: any) => {
    if (!aramaMetni) return true; // Arama kutusu boşsa hepsini göster
    
    // Büyük/küçük harf duyarlılığını kaldırmak için hepsini küçültüyoruz
    const aranan = aramaMetni.toLowerCase();
    
    return (
      (islem.kategori && islem.kategori.toLowerCase().includes(aranan)) ||
      (islem.musteri_adi && islem.musteri_adi.toLowerCase().includes(aranan)) ||
      (islem.servis_no && islem.servis_no.toLowerCase().includes(aranan)) ||
      (islem.cihaz_turu && islem.cihaz_turu.toLowerCase().includes(aranan)) ||
      (islem.marka && islem.marka.toLowerCase().includes(aranan)) ||
      (islem.aciklama && islem.aciklama.toLowerCase().includes(aranan))
    );
  });







const renderIslem = ({ item: islem }: any) => {
    const isGiris = islem.islem_yonu === 'GİRİŞ';
    return (
      <TouchableOpacity 
        style={[styles.tamListeKart, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
        activeOpacity={0.7}
        onPress={() => onIslemSec(islem)}
      >
        <View style={styles.tamListeKartUst}>
          <Text style={[styles.tamListeKategori, { color: theme.text }]} numberOfLines={1}>{islem.kategori}</Text>
          <Text style={[styles.tamListeTutar, { color: isGiris ? '#34C759' : '#FF3B30' }]}>{isGiris ? '+' : '-'} {formatMoney(parseFloat(islem.tutar))} ₺</Text>
        </View>
        
        <View style={styles.tamListeKartOrta}>
          <Text style={[styles.tamListeTarih, { color: theme.subText }]}>{new Date(islem.islem_tarihi).toLocaleDateString('tr-TR')} {new Date(islem.islem_tarihi).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</Text>
          
          {/* 🚨 SİNSİ HATA 1 BURADA ÇÖZÜLDÜ: && yerine ? ... : null kullanıldı */}
          {islem.servis_no ? <Text style={[styles.tamListeServisNo, { color: '#007AFF' }]}>{islem.servis_no}</Text> : null}
        </View>

        {/* 🚨 SİNSİ HATA 2 BURADA ÇÖZÜLDÜ */}
        {(islem.musteri_adi || islem.cihaz_turu || islem.aciklama) ? (
          <View style={[styles.tamListeKartAlt, { borderTopColor: theme.border }]}>
            {(islem.musteri_adi || islem.cihaz_turu) ? (
              <Text style={[styles.tamListeDetayMetin, { color: theme.subText }]} numberOfLines={1}>
                {islem.musteri_adi ? `${islem.musteri_adi} ` : ''} 
                {islem.cihaz_turu ? `• ${islem.cihaz_turu} ${islem.marka || ''}` : ''}
              </Text>
            ) : null}
            
            {/* 🚨 SİNSİ HATA 3 BURADA ÇÖZÜLDÜ */}
            {islem.aciklama ? (
              <Text style={[styles.tamListeNotMetin, { color: theme.subText }]} numberOfLines={1}>Not: {islem.aciklama}</Text>
            ) : null}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };




  







  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        
        <View style={[styles.header, { paddingHorizontal: 20, marginBottom: 10 }]}>
          <View style={[styles.titleBadge, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }]}><Text style={styles.title}>TÜM NAKİT HAREKETLERİ</Text></View>
          <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
        </View>

        {/* 🚨 3. ARAMA ÇUBUĞU VİTRİNİ */}
        <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#2c2c2c' : '#e5e5ea', borderRadius: 12, paddingHorizontal: 15, height: 45 }}>
            <Ionicons name="search" size={20} color={theme.subText} />
            <TextInput 
              style={{ flex: 1, marginLeft: 10, color: theme.text, fontSize: 15 }}
              placeholder="Müşteri, servis no, cihaz veya not ara..."
              placeholderTextColor={theme.subText}
              value={aramaMetni}
              onChangeText={setAramaMetni}
            />
            {/* Yazı yazılınca beliren çarpı butonu (temizlemek için) */}
            {aramaMetni.length > 0 && (
              <TouchableOpacity onPress={() => setAramaMetni('')}>
                <Ionicons name="close-circle" size={20} color={theme.subText} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* 🚨 YENİ MOTOR: Artık ham listeyi değil, filtrelenmiş olanı çiziyor! */}
        <FlatList
          data={filtrelenmisIslemler} 
          renderItem={renderIslem} 
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
          initialNumToRender={10} 
          maxToRenderPerBatch={10} 
          windowSize={5} 
          removeClippedSubviews={true}
          // Eğer aranan şey bulunamazsa ekranda çıkacak boşluk uyarısı
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 30, color: theme.subText, fontWeight: 'bold' }}>
              Arama kriterine uygun sonuç bulunamadı.
            </Text>
          }
        />

      </SafeAreaView>
    </Modal>
  );
};




export default function MaliIslemlerAnaEkran({ visible, onClose, isDarkMode }: any) {
  
  const router = useRouter(); 
  const [exitVisible, setExitVisible] = useState(false); 
  const [detayliListeVisible, setDetayliListeVisible] = useState(false); 
  const [detayModalVisible, setDetayModalVisible] = useState(false);
  const [seciliIslem, setSeciliIslem] = useState<any>(null);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  //const [ciktiModalVisible, setCiktiModalVisible] = useState(false);
  const [aktifFiltreMetni, setAktifFiltreMetni] = useState('Tüm Nakit Hareketleri');

  const [islemler, setIslemler] = useState<any[]>([]);
  
  // 🚨 MÜDÜR: Arka plandan gelen ÇİFT KATLI veriyi karşılayacak yeni hafıza
  const [ozet, setOzet] = useState({ 
    genel: { giris: 0, cikis: 0, net: 0 },
    gunluk: { giris: 0, cikis: 0, net: 0 }
  });

  const [loading, setLoading] = useState(false);

  // --- MÜDÜRÜN RADARI: SAYFAYA GERİ DÖNÜNCE LİSTEYİ TAZELE ---
  useFocusEffect(
    useCallback(() => {
      fetchKasaHareketleri();
    }, [])
  );

  // --- BAŞKA EKRANDAN GELEN "YENİLE" SİNYALİNİ DİNLE ---
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('kasaYenile', () => {
      fetchKasaHareketleri();
    });
    return () => listener.remove();
  }, []);

  const fetchKasaHareketleri = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/kasa/all`);
      const data = await response.json();
      if (data.success) {
        setIslemler(data.data);
        // Yeni sisteme göre state güncelleniyor
        setOzet(data.ozet);
      }
    } catch (error) {
      console.error("Kasa verileri çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltreUygula = (ozetMetni: string) => {
    setAktifFiltreMetni(ozetMetni);
    setFilterModalVisible(false);
  };

 

  const theme = {
    bg: isDarkMode ? '#121212' : '#fdfdfd',
    cardBg: isDarkMode ? '#1e1e1e' : '#fff',
    borderColor: isDarkMode ? '#333' : '#eee',
    textColor: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    btnBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    girisBtnBg: isDarkMode ? '#333' : '#1A1A1A',
    cikisBtnBg: '#FF3B30'
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
          
          <View style={styles.header}>
            <View style={[styles.titleBadge, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }]}><Text style={styles.title}>MALİ İŞLEMLER</Text></View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 30 }}
            refreshControl={
              <RefreshControl 
                refreshing={loading} 
                onRefresh={fetchKasaHareketleri} 
                colors={['#FF3B30']} 
              />
            }
          >
            {/* 🚨 DUBLEKS KASA KUTUSU */}
            <View style={[styles.summaryCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              
              {/* --- ÜST KAT: TÜM ZAMANLAR (GENEL KASA) --- */}
              <Text style={[styles.summaryLabel, { color: theme.subText }]}>GENEL KASA DURUMU</Text>
              <Text style={[styles.netKasaText, { color: theme.textColor }]}>{formatMoney(ozet?.genel?.net || 0)} ₺</Text>
              <View style={styles.teraziRow}>
                <View style={styles.teraziCol}>
                    <Text style={[styles.teraziLabel, { color: theme.subText }]}>TOPLAM GİREN</Text>
                    <Text style={[styles.teraziValue, { color: theme.textColor, fontSize: 14 }]}>+ {formatMoney(ozet?.genel?.giris || 0)} ₺</Text>
                </View>
                <View style={styles.teraziColRight}>
                    <Text style={[styles.teraziLabel, { color: theme.subText }]}>TOPLAM ÇIKAN</Text>
                    <Text style={[styles.teraziValue, { color: '#FF3B30', fontSize: 14 }]}>- {formatMoney(ozet?.genel?.cikis || 0)} ₺</Text>
                </View>
              </View>

              {/* --- ➖ ORTA ÇİZGİ (Ayırıcı) ➖ --- */}
              <View style={[styles.divider, { backgroundColor: theme.borderColor, marginVertical: 18, height: 2 }]} />

              {/* --- ALT KAT: SADECE BUGÜN (GÜNLÜK KASA) --- */}
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                  

                <Text style={[styles.summaryLabel, { color: theme.subText }]}>BUGÜNKÜ HAREKETLER</Text>

                  
                  
              </View>
              <Text style={[styles.netKasaText, { color: theme.textColor, fontSize: 22, marginVertical: 4 }]}>{formatMoney(ozet?.gunluk?.net || 0)} ₺</Text>
              <View style={styles.teraziRow}>
                <View style={styles.teraziCol}>
                    <Text style={[styles.teraziLabel, { color: theme.subText }]}>BUGÜN GİREN</Text>
                    <Text style={[styles.teraziValue, { color: theme.textColor, fontSize: 14 }]}>+ {formatMoney(ozet?.gunluk?.giris || 0)} ₺</Text>
                </View>
                <View style={styles.teraziColRight}>
                    <Text style={[styles.teraziLabel, { color: theme.subText }]}>BUGÜN ÇIKAN</Text>
                    <Text style={[styles.teraziValue, { color: '#FF3B30', fontSize: 14 }]}>- {formatMoney(ozet?.gunluk?.cikis || 0)} ₺</Text>
                </View>
              </View>

            </View>




{/* AKSİYON BUTONLARI */}
            <View style={styles.actionRow}>
              
              {/* 🚨 DÜZELTİLEN KISIM 1: Para Girişi için de gece modu mirası (params) eklendi! */}
              <TouchableOpacity 
                style={[styles.actionBtnSolid, { backgroundColor: theme.girisBtnBg }]} 
                onPress={() => router.push({ pathname: "/paragirisiformu", params: { isDarkMode: isDarkMode } })} 
              >
                <View style={[styles.iconCircleSolid, { backgroundColor: 'rgba(255,255,255,0.1)' }]}><Ionicons name="arrow-down" size={26} color="#fff" /></View>
                <Text style={styles.actionBtnTextSolid}>PARA GİRİŞİ</Text>
              </TouchableOpacity>
              
              {/* 🚨 DÜZELTİLEN KISIM 2: Para Çıkışı zaten doğruydu, aynen duruyor */}
              <TouchableOpacity 
                style={[styles.actionBtnSolid, { backgroundColor: theme.cikisBtnBg }]} 
                onPress={() => router.push({ pathname: "/paracikisiformu", params: { isDarkMode: isDarkMode } })}
              >
                <View style={[styles.iconCircleSolid, { backgroundColor: 'rgba(255,255,255,0.2)' }]}><Ionicons name="arrow-up" size={26} color="#fff" /></View>
                <Text style={styles.actionBtnTextSolid}>PARA ÇIKIŞI</Text>
              </TouchableOpacity>
            </View>


        

            {/* 🚨 YENİ DEV BUTON (ÜSTTE) */}
            <TouchableOpacity 
              style={[styles.devListeButonu, { backgroundColor: isDarkMode ? '#313131' : '#10adf7' }]} 
              onPress={() => setDetayliListeVisible(true)}
              activeOpacity={0.8}
            >

              <Text style={[styles.devListeButonuText, { color: isDarkMode ? '#ffffff' : '#1A1A1A' }]}>
                MALİ İŞLEMLER DETAY LİSTESİ
              </Text>
              
            </TouchableOpacity>

          



              {/* 🚨 LİSTE BAŞLIĞI (2mm yukarı çekildi ve ismi değişti) */}
            <View style={{ marginBottom: 10, marginTop: 13, paddingHorizontal: 5 }}>
              <Text style={[styles.sectionTitleLeft, { color: theme.textColor }]}>SON HAREKET</Text>
            </View>

            {/* 🚨 İŞLEMLER LİSTESİ (SADECE EN SON İŞLEMİ GÖSTERİR) */}
            <View style={[styles.listContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              {loading ? ( <ActivityIndicator color="#FF3B30" style={{ padding: 30 }} /> ) 
              : islemler.length === 0 ? ( <Text style={{ textAlign: 'center', padding: 20, color: theme.subText, fontWeight: 'bold' }}>Kasa hareketi yok.</Text> ) 
              : (
                // MÜDÜR: slice(0, 1) diyerek koca listeden sadece en baştakini koparıp alıyoruz!
                islemler.slice(0, 1).map((islem) => (
                  <TouchableOpacity 
                    key={islem.id} 
                    style={[styles.miniListItem, { borderBottomWidth: 0 }]} // Tek eleman olduğu için alt çizgiye gerek yok
                    onPress={() => { setSeciliIslem(islem); setDetayModalVisible(true); }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.miniListLeft}>
                      <View style={[styles.listIconBox, { backgroundColor: islem.islem_yonu === 'GİRİŞ' ? theme.btnBg : '#FFEBEE' }]}>
                        <Ionicons name={islem.islem_yonu === 'GİRİŞ' ? "add" : "remove"} size={20} color={islem.islem_yonu === 'GİRİŞ' ? theme.textColor : '#FF3B30'} />
                      </View>
                      <Text style={[styles.miniListTitle, { color: theme.textColor }]} numberOfLines={1}>{islem.kategori}</Text>
                    </View>
                    <Text style={[styles.miniListAmount, { color: islem.islem_yonu === 'GİRİŞ' ? theme.textColor : '#FF3B30' }]}>
                      {islem.islem_yonu === 'GİRİŞ' ? '+' : '-'} {formatMoney(parseFloat(islem.tutar))} ₺
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>


          {/* MODALLAR */}
          <IslemDetayModal visible={detayModalVisible} islem={seciliIslem} onClose={() => setDetayModalVisible(false)} isDarkMode={isDarkMode} />
         
         
         



          {/* 🚨 KABLOYU BAĞLADIK: onIslemSec eklendi! */}
          <DetayliListeModal 
            visible={detayliListeVisible} 
            islemler={islemler} 
            onClose={() => setDetayliListeVisible(false)} 
            isDarkMode={isDarkMode} 
            onIslemSec={(islem:any) => {
              setSeciliIslem(islem);       // Hangi karta tıklandıysa onun verisini hafızaya al
              setDetayModalVisible(true);  // Fatura fişi gibi olan IslemDetayModal'ı ekrana indir!
            }}
          />

          
          <GelismisFiltreModal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} onApply={handleFiltreUygula} isDarkMode={isDarkMode} />

        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 15 },
  titleBadge: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  summaryCard: { borderRadius: 20, padding: 19, borderWidth: 1, elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 15 },
  summaryLabel: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },
  netKasaText: { fontSize: 25, fontWeight: '900', textAlign: 'center', marginVertical: 5 },
  divider: { height: 1, width: '100%', marginVertical: 10 },
  teraziRow: { flexDirection: 'row', justifyContent: 'space-between' },
  teraziCol: { flex: 1 },
  teraziColRight: { flex: 1, alignItems: 'flex-end' },
  teraziLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 3 },
  teraziValue: { fontSize: 16, fontWeight: '900' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  actionBtnSolid: { width: '48%', paddingVertical: 15, borderRadius: 20, alignItems: 'center', elevation: 6 },
  iconCircleSolid: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionBtnTextSolid: { fontSize: 14, fontWeight: '900', color: '#fff' },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 },
  sectionTitleLeft: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  detayliListeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  detayliListeBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  listContainer: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, elevation: 2 },
  miniListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  miniListLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10, paddingLeft: 0 },
  listIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  miniListTitle: { fontSize: 14, fontWeight: '700' },
  miniListAmount: { fontSize: 15, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  detayModalContent: { width: '90%', borderRadius: 25, padding: 25, elevation: 20 },
  detayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  detayIconBox: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  detayCloseBtn: { padding: 5 },
  detayTutar: { fontSize: 32, fontWeight: '900', marginBottom: 5 },
  detayKategori: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  detayTarih: { fontSize: 13, fontWeight: '600', marginBottom: 25 },
  detayInfoContainer: { borderTopWidth: 1, paddingTop: 10 },
  detayRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  detayLabel: { fontSize: 13, fontWeight: 'bold', color: '#888', flex: 1 },
  detayValue: { fontSize: 14, fontWeight: '600', flex: 1.5, textAlign: 'right' },
  detayAciklamaKutu: { width: '100%', padding: 15, borderRadius: 12, minHeight: 80 },
  tamListeKart: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1 },
  tamListeKartUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tamListeKategori: { fontSize: 15, fontWeight: '800', flex: 1 },
  tamListeTutar: { fontSize: 16, fontWeight: '900' },
  tamListeKartOrta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tamListeTarih: { fontSize: 11, fontWeight: '600' },
  tamListeServisNo: { fontSize: 11, fontWeight: '800' },
  tamListeKartAlt: { borderTopWidth: 1, paddingTop: 6, marginTop: 1 },
  tamListeDetayMetin: { fontSize: 12, fontWeight: '600' },
  tamListeNotMetin: { fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  filterPanelContent: { width: '90%', borderRadius: 25, padding: 25, elevation: 20 },
  filterTabsRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, marginBottom: 15 },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  filterTabText: { fontSize: 13, fontWeight: '900' },
  filterOptionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  filterOptBtn: { width: '48%', borderWidth: 1, borderRadius: 15, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  filterOptText: { fontSize: 14, fontWeight: 'bold' },
  rangeLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 5 },
  rangeHalfInput: { width: '48%', borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '500', textAlign: 'center' },
  applyBtn: { width: '100%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 5 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  ciktiModalContent: { width: '85%', borderRadius: 25, padding: 25, alignItems: 'center', elevation: 20 },
  ciktiIconBox: { width: 70, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  ciktiTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  ciktiDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  ciktiBtnRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  ciktiBtn: { width: '48%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  ciktiBtnText: { fontSize: 15, fontWeight: 'bold' },
  

  devListeButonu: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 18, /* 1 cm kalınlık hissi verir */
    borderRadius: 16, /* Köşeleri tatlı yuvarlar */
    width: '100%', 
    marginBottom: 1,
    marginTop: 5,
    elevation: 2, /* Android'de hafif gölge verir, kutu gibi durur */
    shadowColor: '#000', /* iOS gölgesi */
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  devListeButonuText: { 
    fontSize: 15, 
    fontWeight: '900', /* Yazıyı en kalın haline getirir */
    marginRight: 8, 
    letterSpacing: 1 /* Harflerin arasını hafif açar, kurumsal durur */
  },

});