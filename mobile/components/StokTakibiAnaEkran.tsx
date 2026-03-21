import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, SafeAreaView, Modal, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { useFocusEffect } from '@react-navigation/native'; // MÜDÜR: Ekrana her dönüldüğünde DB'yi yenilemek için

import StokGirisiFormu from './StokGirisiFormu'; 
import StokCikisiFormu from './StokCikisiFormu';
import StokYonetimListesi from './StokYonetimListesi'; // MÜDÜR: Bu dosyanın ismine dikkat!

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// --- 1. YAKIŞIKLI ALERT KUTUSU ---
const HandsomeAlert = ({ visible, title, message, onClose, type, isDarkMode }: any) => {
  if (!visible) return null;
  return (
    <Modal visible={true} transparent animationType="fade"> 
      <View style={styles.modalOverlay}>
        <View style={[styles.alertContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <View style={styles.alertIconWrapper}> 
            <Ionicons name={type === 'error' ? "close-circle" : "checkmark-circle"} size={60} color={type === 'error' ? "#FF3B30" : "#34C759"} />
          </View>
          <Text style={[styles.alertTitle, { color: isDarkMode ? '#fff' : '#1A1A1A' }]}>{title}</Text>
          <Text style={[styles.alertMessage, { color: isDarkMode ? '#aaa' : '#666' }]}>{message}</Text>
          <TouchableOpacity style={[styles.alertBtn, { backgroundColor: type === 'error' ? '#FF3B30' : '#1A1A1A' }]} onPress={onClose}>
            <Text style={styles.alertBtnText}>TAMAM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- 2. FİLTRE (HUNİ) ASANSÖRÜ ---
const FilterModal = ({ visible, onClose, onSelect, isDarkMode }: any) => {
  if (!visible) return null;
  const secenekler = [
    { id: 'tumu', icon: 'list', text: 'Tüm Envanteri Göster' },
    { id: 'kritik', icon: 'warning', text: 'Kritik Stokları Göster (< 2)' },
    { id: 'isme', icon: 'text', text: 'İsme Göre Sırala' },
  ];
  return (
    <Modal visible={true} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.filterContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.filterTitleHeader, { color: isDarkMode ? '#fff' : '#1A1A1A', borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>GÖRÜNÜM VE FİLTRELEME</Text>
          {secenekler.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.filterItem, { borderBottomColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]} 
              onPress={() => onSelect(item.id)}
            >
              <Ionicons name={item.icon as any} size={20} color={item.id === 'kritik' ? '#FF3B30' : '#1A1A1A'} style={{ marginRight: 15 }} />
              <Text style={[styles.filterItemText, { color: item.id === 'kritik' ? '#FF3B30' : (isDarkMode ? '#ddd' : '#333') }]}>{item.text}</Text>
              <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#555' : '#ccc'} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function StokTakibiAnaEkran({ visible, onClose, isDarkMode = false }: any) {
  const [aramaMetni, setAramaMetni] = useState('');
  const [aktifFiltre, setAktifFiltre] = useState('tumu'); 
  
  const [stokGirisVisible, setStokGirisVisible] = useState(false);
  const [stokCikisVisible, setStokCikisVisible] = useState(false);
  const [envanterYonetimVisible, setEnvanterYonetimVisible] = useState(false); 
  const [filterVisible, setFilterVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' });

  const [permission, requestPermission] = useCameraPermissions();
  const [envanterDB, setEnvanterDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // MÜDÜR: Okunan barkodu forma paslamak için hafıza
  const [scannedBarcode, setScannedBarcode] = useState(''); 

  const theme = {
    bg: isDarkMode ? '#121212' : '#f4f6f8',
    cardBg: isDarkMode ? '#1e1e1e' : '#fff',
    borderColor: isDarkMode ? '#333' : '#e0e0e0',
    textColor: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    primary: '#FF3B30', 
    barcodeBg: isDarkMode ? '#2c2c2c' : '#1A1A1A', 
  };

  const fetchEnvanter = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/stok/all`);
      const result = await response.json();
      if (result.success) {
        setEnvanterDB(result.data);
      }
    } catch (error) { console.error("Sunucuya bağlanılamadı:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (visible) { fetchEnvanter(); }
  }, [visible, stokGirisVisible, stokCikisVisible]);

  const sonIkiHareket = useMemo(() => {
    return envanterDB.slice(0, 3);
  }, [envanterDB]);

  if (!visible) return null;

  // --- MÜDÜR: AKILLI RADAR VE OTOMATİK DOLDURMA ---
  const handleSmartScan = async ({ data }: any) => {
    setCameraVisible(false);
    setScannedBarcode(data); // Okunanı hafızaya al
    try {
      const response = await fetch(`${API_URL}/api/stok/search?barkod=${data}`);
      const res = await response.json();

      if (res.success && res.found) {
        const item = res.data;
        Alert.alert(
          "📦 ÜRÜN BULUNDU",
          `Malzeme: ${item.malzeme_adi}\nDepodaki Miktar: ${item.miktar}\n\nNe yapmak istiyorsunuz?`,
          [
            { text: "İPTAL", style: "cancel" },
            { text: "[-1] SAT", onPress: () => quickAction(item.id, data, 'sell') },
            { text: "[+1] EKLE", onPress: () => quickAction(item.id, data, 'add') }
          ]
        );
      } else {
        Alert.alert("🚨 KAYITSIZ ÜRÜN", "Bu barkod depoda yok. Kayıt açılsın mı?", [
          { text: "HAYIR", style: "cancel" },
          { text: "EVET", onPress: () => setStokGirisVisible(true) }
        ]);
      }
    } catch (e) { Alert.alert("Hata", "Radar taraması başarısız."); }
  };

  const quickAction = async (id: number, barkod: string, type: 'add' | 'sell') => {
    setLoading(true);
    try {
      const endpoint = type === 'add' ? '/api/stok/add' : '/api/stok/sell';
      const body = type === 'add' ? 
        { barkod, miktar: 1, malzeme_adi: '', alis_fiyati: 0 } : 
        { id, barkod, cikan_adet: 1, satis_fiyati: 0 };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const resData = await res.json();
      if (resData.success) {
        fetchEnvanter();
        Alert.alert("Başarılı", "Stok güncellendi.");
      }
    } catch (e) { Alert.alert("Hata", "İşlem yapılamadı."); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        
        {cameraVisible ? (
          <View style={StyleSheet.absoluteFillObject}>
            <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleSmartScan} />
            
            {/* --- MÜDÜR: KADRAJ TASARIMI --- */}
            <View style={styles.scannerOverlay}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.middleContainer}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.focusedContainer}>
                  <View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} />
                  <View style={styles.radarTextRow}><Ionicons name="scan-outline" size={18} color="#FF3B30" /><Text style={styles.radarText}>BARKOD RADARI AKTİF</Text></View>
                </View>
                <View style={styles.unfocusedContainer}></View>
              </View>
              <View style={styles.unfocusedContainer}>
                <TouchableOpacity style={styles.camCloseBottom} onPress={() => setCameraVisible(false)}>
                  <Ionicons name="close-circle" size={60} color="#fff" />
                  <Text style={{color:'#fff', fontWeight:'bold', marginTop:5}}>İPTAL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textColor }]}>STOK & DEPO</Text>
              <Text style={[styles.headerSub, { color: theme.subText }]}>Kurumsal Envanter Yönetimi</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color={theme.primary} /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <TouchableOpacity 
              style={[styles.barcodeBox, { backgroundColor: theme.barcodeBg, borderColor: theme.primary, borderWidth: 1.5 }]} 
              onPress={async () => {
                if (!permission?.granted) await requestPermission();
                setCameraVisible(true);
              }}
            >
              <Ionicons name="barcode-outline" size={40} color="#fff" />
              <Text style={styles.barcodeTitle}>HIZLI BARKOD RADARI</Text>
              <Ionicons name="scan" size={28} color={theme.primary} />
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.mainActionBox, { backgroundColor: '#1A1A1A' }]} onPress={() => { setScannedBarcode(''); setStokGirisVisible(true); }}>
                <View style={styles.iconCircle}><Ionicons name="arrow-down" size={24} color="#fff" /></View>
                <Text style={styles.actionMainText}>STOK GİRİŞİ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mainActionBox, { backgroundColor: theme.primary }]} onPress={() => setStokCikisVisible(true)}>
                <View style={styles.iconCircle}><Ionicons name="arrow-up" size={24} color="#fff" /></View>
                <Text style={styles.actionMainText}>STOK ÇIKIŞI</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.subText, marginBottom: 0 }]}>SON ÜÇ HAREKET</Text>
              <TouchableOpacity style={styles.allListBtn} onPress={() => setEnvanterYonetimVisible(true)}>
                <Ionicons name="list" size={16} color={theme.primary} />
                <Text style={[styles.allListBtnText, { color: theme.primary }]}>TÜMÜNÜ LİSTELE</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
               <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
            ) : (
              sonIkiHareket.map((item) => (
                <View key={item.id} style={[styles.listItem, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <View style={styles.listIconBox}><Ionicons name="cube" size={24} color={theme.subText} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listTitle, { color: theme.textColor }]}>{item.malzeme_adi}</Text>
                    <Text style={[styles.listBrand, { color: theme.subText }]}>{item.marka || 'Markasız'} • {item.barkod}</Text>
                  </View>
                  <View style={[styles.listBadge, { backgroundColor: item.miktar < 2 ? '#FF3B30' : theme.barcodeBg }]}><Text style={styles.listBadgeText}>{item.miktar} Adet</Text></View>
                </View>
              ))
            )}
          </ScrollView>

          <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} onSelect={(secilenMod: string) => { setAktifFiltre(secilenMod); setFilterVisible(false); }} isDarkMode={isDarkMode} />
          
          <StokGirisiFormu visible={stokGirisVisible} onClose={() => { setStokGirisVisible(false); setScannedBarcode(''); }} isDarkMode={isDarkMode} initialBarcode={scannedBarcode} />
          <StokCikisiFormu visible={stokCikisVisible} onClose={() => setStokCikisVisible(false)} isDarkMode={isDarkMode} />
          <StokYonetimListesi visible={envanterYonetimVisible} onClose={() => setEnvanterYonetimVisible(false)} isDarkMode={isDarkMode} />
          <HandsomeAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({ ...alertConfig, visible: false })} isDarkMode={isDarkMode} />
        </SafeAreaView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 25 },
  headerTitle: { fontSize: 26, fontWeight: '900' },
  headerSub: { fontSize: 13, fontWeight: '600', opacity: 0.6 },
  barcodeBox: { flexDirection: 'row', alignItems: 'center', padding: 22, borderRadius: 24, marginBottom: 20, justifyContent: 'space-between' },
  barcodeTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  mainActionBox: { flex: 1, height: 110, borderRadius: 25, padding: 20, marginHorizontal: 5, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionMainText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12, marginTop: 15 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  allListBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 59, 48, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  allListBtnText: { fontSize: 11, fontWeight: '900', marginLeft: 5 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1.5, marginBottom: 12 },
  listIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  listBrand: { fontSize: 12, fontWeight: '600', opacity: 0.8 },
  listBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  listBadgeText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  alertContent: { width: '85%', borderRadius: 30, padding: 35, alignItems: 'center' },
  alertIconWrapper: { marginBottom: 20 },
  alertTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  alertMessage: { fontSize: 15, textAlign: 'center', marginVertical: 20, lineHeight: 22 },
  alertBtn: { width: '100%', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  alertBtnText: { color: '#fff', fontWeight: '900' },
  filterContent: { width: '100%', position: 'absolute', bottom: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50 },
  filterTitleHeader: { fontSize: 15, fontWeight: '900', marginBottom: 20, textAlign: 'center', borderBottomWidth: 1, paddingBottom: 15 },
  filterItem: { flexDirection: 'row', paddingVertical: 18, borderBottomWidth: 1, alignItems: 'center' },
  filterItemText: { fontSize: 15, fontWeight: '700' },
  scannerOverlay: { flex: 1, backgroundColor: 'transparent' },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  middleContainer: { flexDirection: 'row', height: 260 },
  focusedContainer: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#FF3B30', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  radarTextRow: { position: 'absolute', bottom: -40, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  radarText: { color: '#FF3B30', fontSize: 12, fontWeight: '900', marginLeft: 8 },
  camCloseBottom: { alignItems: 'center' }
});