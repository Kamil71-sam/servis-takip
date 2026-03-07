import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, SafeAreaView, Platform, TextInput, Modal, ActivityIndicator,
  KeyboardAvoidingView, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; 

// --- İTHALAT MÜHÜRLERİ (SENİN FORMLARIN) ---
import StokGirisiFormu from './StokGirisiFormu'; 
import StokCikisiFormu from './StokCikisiFormu';

// --- 1. YAKIŞIKLI ALERT (ONAY/HATA) KUTUSU ---
const HandsomeAlert = ({ visible, title, message, onClose, type, isDarkMode }: any) => {
  if (!visible) return null;
  return (
    <Modal visible={true} transparent animationType="fade"> 
      <View style={styles.modalOverlay}>
        <View style={[styles.alertContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <View style={styles.alertIconWrapper}> 
            <Ionicons 
              name={type === 'error' ? "close-circle" : "checkmark-circle"} 
              size={60} 
              color={type === 'error' ? "#FF3B30" : "#34C759"} 
            />
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
const FilterModal = ({ visible, onClose, isDarkMode }: any) => {
  if (!visible) return null;
  const secenekler = [
    { icon: 'text', text: 'İsme Göre Arama' },
    { icon: 'barcode', text: 'Parça No\'ya Göre Arama' },
    { icon: 'hardware-chip', text: 'Malzeme Cinsine Göre' },
    { icon: 'calendar', text: 'Tarihe Göre Filtrele' },
    { icon: 'list', text: 'Tüm Envanter Listesi' },
    { icon: 'print', text: 'Listeyi Yazdır / Raporla' },
  ];
  return (
    <Modal visible={true} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.filterContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.filterTitleHeader, { color: isDarkMode ? '#fff' : '#1A1A1A', borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>DETAYLI ARAMA / LİSTELEME</Text>
          {secenekler.map((item, index) => (
            <TouchableOpacity key={index} style={[styles.filterItem, { borderBottomColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]} onPress={onClose}>
              <Ionicons name={item.icon as any} size={20} color="#FF3B30" style={{ marginRight: 15 }} />
              <Text style={[styles.filterItemText, { color: isDarkMode ? '#ddd' : '#333' }]}>{item.text}</Text>
              <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#555' : '#ccc'} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// --- ANA BİLEŞEN ---
export default function StokTakibiAnaEkran({ visible, onClose, isDarkMode = false }: any) {
  const [aramaMetni, setAramaMetni] = useState('');
  
  // Asansör Kilitleri
  const [stokGirisVisible, setStokGirisVisible] = useState(false);
  const [stokCikisVisible, setStokCikisVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [barcodeActionVisible, setBarcodeActionVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [barcodeResultVisible, setBarcodeResultVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' });

  // Kamera ve Barkod Verileri
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<any>(null);

  const theme = {
    bg: isDarkMode ? '#121212' : '#f4f6f8',
    cardBg: isDarkMode ? '#1e1e1e' : '#fff',
    borderColor: isDarkMode ? '#333' : '#e0e0e0',
    textColor: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    primary: '#FF3B30', 
    barcodeBg: isDarkMode ? '#2c2c2c' : '#1A1A1A', 
  };

  // --- DB SİMÜLASYONU (BARKOD RADARI) ---
  const checkDatabaseForBarcode = (code: string) => {
    const mockDB: any = {
      "8691234567890": { isim: "iPhone 13 Orijinal Ekran", marka: "Apple", stok: 14 },
      "8690000123456": { isim: "Samsung Batarya G998", marka: "Samsung", stok: 5 }
    };
    return mockDB[code] || null;
  };

  const sonGelenler = [
    { id: '1', isim: 'iPhone 13 Ekran', marka: 'Apple', miktar: '10 Adet', tarih: 'Bugün 10:45', usta: 'Ahmet' },
    { id: '2', isim: 'Samsung S22 Pil', marka: 'Samsung', miktar: '25 Adet', tarih: 'Dün 16:20', usta: 'Mehmet' },
    { id: '3', isim: 'Type-C Soket', marka: 'Muadil', miktar: '100 Adet', tarih: '05.03.2026', usta: 'Stok' },
    { id: '4', isim: 'Termal Macun', marka: 'Arctic', miktar: '5 Adet', tarih: '04.03.2026', usta: 'Ali' },
    { id: '5', isim: 'Klavye T14', marka: 'Lenovo', miktar: '2 Adet', tarih: '02.03.2026', usta: 'Ahmet' },
  ];

  if (!visible) return null;

  // --- KAMERA MOTORLARI ---
  const handleBarcodeOpen = async () => {
    setScannedData(null); 
    setBarcodeActionVisible(false);
    if (!permission?.granted) { await requestPermission(); }
    setCameraVisible(true);
  };

  const handleBarCodeScanned = ({ data }: any) => {
    if (scannedData) return;
    const result = checkDatabaseForBarcode(data);
    
    if (result) {
      setScannedData({ code: data, ...result });
      setCameraVisible(false);
      setBarcodeResultVisible(true);
    } else {
      setCameraVisible(false);
      setAlertConfig({ 
        visible: true, 
        title: 'KAYIT BULUNAMADI', 
        message: `Barkod: ${data}\n\nBu ürün sistemde kayıtlı değil. Lütfen Stok Girişi bölümünden yeni kayıt oluşturun.`,
        type: 'error'
      });
    }
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        
        {cameraVisible && (
          <View style={StyleSheet.absoluteFillObject}>
            <CameraView style={StyleSheet.absoluteFillObject} facing="back" onBarcodeScanned={handleBarCodeScanned} />
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraFrame} />
              <TouchableOpacity style={styles.cameraCancelBtn} onPress={() => setCameraVisible(false)}>
                <Text style={styles.cameraCancelText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!cameraVisible && (
          <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
            
            <View style={styles.header}>
              <View>
                <Text style={[styles.headerTitle, { color: theme.textColor }]}>STOK & DEPO</Text>
                <Text style={[styles.headerSub, { color: theme.subText }]}>Kurumsal Envanter Yönetimi</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={[styles.printerBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <Ionicons name="print" size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={{ marginLeft: 15 }}>
                  <Ionicons name="close-circle" size={42} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
              
              {/* BARKOD RADARI */}
              <TouchableOpacity 
                style={[styles.barcodeBox, { backgroundColor: theme.barcodeBg, borderColor: theme.primary, borderWidth: 1.5 }]} 
                onPress={() => setBarcodeActionVisible(true)}
              >
                <Ionicons name="barcode-outline" size={40} color="#fff" />
                <Text style={styles.barcodeTitle}>KAMERA İLE BARKOD RADARI</Text>
                <Ionicons name="scan" size={28} color={theme.primary} />
              </TouchableOpacity>

              {/* FOTODAKİ GİBİ GİRİŞ/ÇIKIŞ KUTULARI */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.mainActionBox, { backgroundColor: '#1A1A1A' }]} onPress={() => setStokGirisVisible(true)}>
                  <View style={styles.iconCircle}><Ionicons name="arrow-down" size={24} color="#fff" /></View>
                  <Text style={styles.actionMainText}>STOK GİRİŞİ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.mainActionBox, { backgroundColor: theme.primary }]} onPress={() => setStokCikisVisible(true)}>
                  <View style={styles.iconCircle}><Ionicons name="arrow-up" size={24} color="#fff" /></View>
                  <Text style={styles.actionMainText}>STOK ÇIKIŞI</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.subText }]}>PARÇA VE CİHAZ ARAMA / LİSTELEME</Text>
              <View style={[styles.searchContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <TextInput style={[styles.searchInput, { color: theme.textColor }]} placeholder="Barkod veya Parça No girin..." placeholderTextColor={theme.subText} value={aramaMetni} onChangeText={setAramaMetni} />
                <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.huniBtn}>
                  <Ionicons name="funnel" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.subText }]}>SON İŞLEM GÖREN 5 MALZEME</Text>
              {sonGelenler.map((item) => (
                <View key={item.id} style={[styles.listItem, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <View style={styles.listIconBox}><Ionicons name="cube" size={24} color={theme.subText} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listTitle, { color: theme.textColor }]}>{item.isim}</Text>
                    <Text style={[styles.listBrand, { color: theme.subText }]}>{item.marka} - {item.usta}</Text>
                    <Text style={[styles.listDate, { color: theme.subText }]}>{item.tarih}</Text>
                  </View>
                  <View style={[styles.listBadge, { backgroundColor: theme.barcodeBg }]}>
                    <Text style={styles.listBadgeText}>{item.miktar}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* ASANSÖR MODALLAR */}
            <Modal visible={barcodeActionVisible} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={[styles.confirmContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
                  <View style={styles.modalHeaderRow}>
                    <Text style={[styles.modalTitleText, { color: isDarkMode ? '#fff' : '#1A1A1A' }]}>BARKOD İŞLEMİ</Text>
                    <TouchableOpacity onPress={() => setBarcodeActionVisible(false)}><Ionicons name="close" size={28} color="#FF3B30" /></TouchableOpacity>
                  </View>
                  <View style={styles.confirmBtnRow}>
                    <TouchableOpacity style={styles.standardBtnOutline} onPress={handleBarcodeOpen}><Text style={styles.standardBtnText}>STOK ÇIKIŞI</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.standardBtnOutline} onPress={handleBarcodeOpen}><Text style={styles.standardBtnText}>STOK GİRİŞİ</Text></TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal visible={barcodeResultVisible} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={[styles.confirmContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
                  <Text style={[styles.modalTitleText, { color: theme.primary }]}>ÜRÜN BİLGİSİ (RADAR)</Text>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Ürün:</Text><Text style={[styles.infoVal, { color: theme.textColor }]}>{scannedData?.isim}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Marka:</Text><Text style={[styles.infoVal, { color: theme.textColor }]}>{scannedData?.marka}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Mevcut Stok:</Text><Text style={[styles.infoVal, { color: theme.primary, fontSize: 18 }]}>{scannedData?.stok} Adet</Text></View>
                  <View style={styles.confirmBtnRow}>
                    <TouchableOpacity style={styles.standardBtnOutline} onPress={() => setBarcodeResultVisible(false)}><Text style={styles.standardBtnText}>KAPAT</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.standardBtnOutline, { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={() => { setBarcodeResultVisible(false); setStokGirisVisible(true); }}><Text style={[styles.standardBtnText, { color: '#fff' }]}>DOĞRU, İŞLE</Text></TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} isDarkMode={isDarkMode} />
            <StokGirisiFormu visible={stokGirisVisible} onClose={() => setStokGirisVisible(false)} isDarkMode={isDarkMode} />
            <StokCikisiFormu visible={stokCikisVisible} onClose={() => setStokCikisVisible(false)} isDarkMode={isDarkMode} />
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
  headerSub: { fontSize: 13, fontWeight: '600' },
  printerBtn: { padding: 12, borderRadius: 12, borderWidth: 1.5 },
  barcodeBox: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 20, justifyContent: 'space-between' },
  barcodeTitle: { color: '#fff', fontSize: 15, fontWeight: '900' },
  
  // FOTODAKİ TASARIM: YAN YANA DEV KUTULAR
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  mainActionBox: { flex: 1, height: 110, borderRadius: 25, padding: 20, marginHorizontal: 5, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionMainText: { color: '#fff', fontSize: 14, fontWeight: '900' },

  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12, marginTop: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 16, borderWidth: 1.5, height: 60, marginBottom: 30 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  huniBtn: { backgroundColor: '#1A1A1A', width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  listItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1.5, marginBottom: 12 },
  listIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listTitle: { fontSize: 15, fontWeight: '800' },
  listBrand: { fontSize: 12, fontWeight: '600' },
  listDate: { fontSize: 10, fontWeight: '600' },
  listBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  listBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, width: '100%' },
  modalTitleText: { fontSize: 18, fontWeight: '900' },
  confirmContent: { width: '90%', borderRadius: 25, padding: 30 },
  confirmBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontWeight: '700', color: '#888' },
  infoVal: { fontWeight: '900' },

  standardBtnOutline: { flex: 1, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#eee', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  standardBtnText: { color: '#1A1A1A', fontWeight: '900', fontSize: 13 },

  alertContent: { width: '85%', borderRadius: 30, padding: 35, alignItems: 'center' },
  alertIconWrapper: { marginBottom: 15 }, 
  alertTitle: { fontSize: 22, fontWeight: '900', marginTop: 10 },
  alertMessage: { fontSize: 15, textAlign: 'center', marginVertical: 15, lineHeight: 22 },
  alertBtn: { width: '100%', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  alertBtnText: { color: '#fff', fontWeight: '900' },

  filterContent: { width: '100%', position: 'absolute', bottom: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50 },
  filterTitleHeader: { fontSize: 15, fontWeight: '900', marginBottom: 20, textAlign: 'center', borderBottomWidth: 1, paddingBottom: 15 },
  filterItem: { flexDirection: 'row', paddingVertical: 18, borderBottomWidth: 1, alignItems: 'center' },
  filterItemText: { fontSize: 15, fontWeight: '700' },

  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  cameraFrame: { width: 250, height: 200, borderWidth: 3, borderColor: '#FF3B30', borderRadius: 20 },
  cameraCancelBtn: { position: 'absolute', bottom: 50, backgroundColor: '#FF3B30', padding: 15, borderRadius: 15 },
  cameraCancelText: { color: '#fff', fontWeight: 'bold' }
});