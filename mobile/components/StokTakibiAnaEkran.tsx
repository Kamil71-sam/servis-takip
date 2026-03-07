import React, { useState, useRef, useMemo } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, SafeAreaView, Platform, TextInput, Modal, KeyboardAvoidingView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; 

import StokGirisiFormu from './StokGirisiFormu'; 
import StokCikisiFormu from './StokCikisiFormu';

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
// MÜDÜR: Seçilen filtreyi ana motora göndermek için onSelect eklendi.
const FilterModal = ({ visible, onClose, onSelect, isDarkMode }: any) => {
  if (!visible) return null;
  const secenekler = [
    { id: 'tumu', icon: 'list', text: 'Tüm Envanteri Göster' },
    { id: 'kritik', icon: 'warning', text: 'Kritik Stokları Göster (< 2)' }, // MÜDÜR: İŞTE YENİ KRİTİK STOK FİLTRESİ
    { id: 'isme', icon: 'text', text: 'İsme Göre Sırala' },
    { id: 'tarih', icon: 'calendar', text: 'Son Eklenenler' },
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

// --- 3. ELLE GİRİŞ ASANSÖRÜ ---
const ManualEntryModal = ({ visible, onClose, onSave, isDarkMode }: any) => {
  if (!visible) return null;
  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.manualContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitleText, { color: isDarkMode ? '#fff' : '#1A1A1A' }]}>YENİ STOK KARTI AÇ</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color="#FF3B30" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%'}}>
                <Text style={[styles.label, { color: isDarkMode ? '#aaa' : '#333' }]}>CİHAZ/PARÇA TÜRÜ</Text>
                <TextInput style={[styles.inputField, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#333' : '#eee', backgroundColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]} placeholder="Örn: Cep Telefonu Ekranı" />
                <Text style={[styles.label, { color: isDarkMode ? '#aaa' : '#333' }]}>MARKA</Text>
                <TextInput style={[styles.inputField, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#333' : '#eee', backgroundColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]} placeholder="Örn: Apple" />
                <Text style={[styles.label, { color: isDarkMode ? '#aaa' : '#333' }]}>MODEL</Text>
                <TextInput style={[styles.inputField, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#333' : '#eee', backgroundColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]} placeholder="Örn: iPhone 13 Pro" />
                <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                <Text style={styles.saveBtnText}>KAYDET VE GİRİŞ YAP</Text>
                </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default function StokTakibiAnaEkran({ visible, onClose, isDarkMode = false }: any) {
  const [aramaMetni, setAramaMetni] = useState('');
  const [aktifFiltre, setAktifFiltre] = useState('tumu'); // 'tumu', 'kritik', 'isme', 'tarih'
  
  const [stokGirisVisible, setStokGirisVisible] = useState(false);
  const [stokCikisVisible, setStokCikisVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [barcodeActionVisible, setBarcodeActionVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [barcodeResultVisible, setBarcodeResultVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' });

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

  // --- MÜDÜR: DB SİMÜLASYONU (KRİTİK STOKLAR EKLENDİ) ---
  const envanterDB = [
    { id: '1', barkod: "8691234567890", isim: "iPhone 13 Ekran", marka: "Apple", miktar: 14, tarih: "Bugün 10:45", usta: "Ahmet U." },
    { id: '2', barkod: "8690000123456", isim: "Samsung S22 Batarya", marka: "Samsung", miktar: 1, tarih: "Dün 16:20", usta: "Mehmet U." }, // KRİTİK!
    { id: '3', barkod: "8691112223334", isim: "Type-C Şarj Soketi", marka: "Muadil", miktar: 150, tarih: "05.03.2026", usta: "Stok" },
    { id: '4', barkod: "8694445556667", isim: "Termal Macun 5g", marka: "Arctic", miktar: 0, tarih: "04.03.2026", usta: "Ali U." }, // KRİTİK (BİTMİŞ)
    { id: '5', barkod: "8697778889990", isim: "ThinkPad T14 Klavye", marka: "Lenovo", miktar: 2, tarih: "02.03.2026", usta: "Ahmet U." }, // SINIRDA (Kritik sayılmaz, <2 kuralı)
  ];

  // --- 1. VE 2. ARAMA MOTORLARI BİRLEŞİYOR (CANLI YAZI + FİLTRE) ---
  const gosterilecekListe = useMemo(() => {
    let sonuc = [...envanterDB];

    // 1. Önce Filtre Seçimine Göre Daralt
    if (aktifFiltre === 'kritik') {
      sonuc = sonuc.filter(item => item.miktar < 2);
    } else if (aktifFiltre === 'isme') {
      sonuc = sonuc.sort((a, b) => a.isim.localeCompare(b.isim));
    }

    // 2. Canlı Metin Araması (Kullanıcı harf girdikçe anında eşleştirir)
    if (aramaMetni) {
      const kucukHarfArama = aramaMetni.toLowerCase();
      sonuc = sonuc.filter(item => 
        item.isim.toLowerCase().includes(kucukHarfArama) || 
        item.marka.toLowerCase().includes(kucukHarfArama) || 
        item.barkod.includes(kucukHarfArama)
      );
    }

    return sonuc;
  }, [aramaMetni, aktifFiltre]);


  if (!visible) return null;

  const checkDatabaseForBarcode = (code: string) => {
    return envanterDB.find(item => item.barkod === code) || null;
  };

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
      setScannedData(result);
      setCameraVisible(false);
      setBarcodeResultVisible(true);
    } else {
      setCameraVisible(false);
      setAlertConfig({ 
        visible: true, title: 'KAYIT BULUNAMADI', type: 'error',
        message: `Barkod: ${data}\n\nBu ürün sistemde yok. Yeni bir stok kartı açmanız gerekiyor.`
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
                <TouchableOpacity style={[styles.printerBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}><Ionicons name="print" size={24} color={theme.primary} /></TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={{ marginLeft: 15 }}><Ionicons name="close-circle" size={42} color={theme.primary} /></TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
              
              <TouchableOpacity style={[styles.barcodeBox, { backgroundColor: theme.barcodeBg, borderColor: theme.primary, borderWidth: 1.5 }]} onPress={() => setBarcodeActionVisible(true)}>
                <Ionicons name="barcode-outline" size={40} color="#fff" />
                <Text style={styles.barcodeTitle}>KAMERA İLE BARKOD RADARI</Text>
                <Ionicons name="scan" size={28} color={theme.primary} />
              </TouchableOpacity>

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
                <Ionicons name="search" size={20} color={theme.subText} />
                <TextInput 
                  style={[styles.searchInput, { color: theme.textColor }]} 
                  placeholder="Ürün adı, Marka veya Barkod yazın..." 
                  placeholderTextColor={theme.subText}
                  value={aramaMetni}
                  onChangeText={setAramaMetni}
                />
                {/* MÜDÜR: AKTİF FİLTRE VARSA DÜĞME RENGİ KIRMIZI OLUR */}
                <TouchableOpacity 
                  onPress={() => setFilterVisible(true)} 
                  style={[styles.huniBtn, { backgroundColor: aktifFiltre !== 'tumu' ? theme.primary : '#1A1A1A' }]}
                >
                  <Ionicons name="funnel" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* LİSTELEME BAŞLIĞI DİNAMİK OLDU */}
              <View style={styles.listHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.subText, marginBottom: 0 }]}>
                  {aktifFiltre === 'kritik' ? '🚨 KRİTİK SEVİYEDEKİ MALZEMELER' : 'ENVANTER LİSTESİ'}
                </Text>
                <Text style={{ fontSize: 12, color: theme.subText, fontWeight: 'bold' }}>{gosterilecekListe.length} Kayıt</Text>
              </View>

              {gosterilecekListe.map((item) => (
                <View key={item.id} style={[styles.listItem, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <View style={styles.listIconBox}><Ionicons name="cube" size={24} color={theme.subText} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listTitle, { color: theme.textColor }]}>{item.isim}</Text>
                    <Text style={[styles.listBrand, { color: theme.subText }]}>{item.marka} • {item.barkod}</Text>
                  </View>
                  {/* MÜDÜR: KRİTİK STOK ROZETİ (2'NİN ALTINDAYSA KIRMIZI YANAR) */}
                  <View style={[styles.listBadge, { backgroundColor: item.miktar < 2 ? '#FF3B30' : theme.barcodeBg }]}>
                    <Text style={styles.listBadgeText}>{item.miktar} Adet</Text>
                  </View>
                </View>
              ))}

              {gosterilecekListe.length === 0 && (
                <View style={{ padding: 30, alignItems: 'center' }}>
                  <Ionicons name="search-outline" size={40} color={theme.borderColor} />
                  <Text style={{ marginTop: 10, color: theme.subText, fontWeight: 'bold' }}>Aramanızla eşleşen ürün bulunamadı.</Text>
                </View>
              )}

            </ScrollView>

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
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mevcut Stok:</Text>
                    <Text style={[styles.infoVal, { color: scannedData?.miktar < 2 ? '#FF3B30' : theme.textColor, fontSize: 18 }]}>
                      {scannedData?.miktar} Adet
                    </Text>
                  </View>
                  <View style={styles.confirmBtnRow}>
                    <TouchableOpacity style={styles.standardBtnOutline} onPress={() => setBarcodeResultVisible(false)}><Text style={styles.standardBtnText}>KAPAT</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.standardBtnOutline, { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={() => { setBarcodeResultVisible(false); setStokGirisVisible(true); }}><Text style={[styles.standardBtnText, { color: '#fff' }]}>İŞLEME DEVAM ET</Text></TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* MÜDÜR: FİLTRE VE ALERT BAĞLANTILARI */}
            <FilterModal 
              visible={filterVisible} 
              onClose={() => setFilterVisible(false)} 
              onSelect={(secilenMod: string) => { setAktifFiltre(secilenMod); setFilterVisible(false); }}
              isDarkMode={isDarkMode} 
            />
            
            {/* KAYIT YOKSA YENİ STOK KARTI AÇMA FORMU (Eski ManualEntry) */}
            <ManualEntryModal visible={false} onClose={() => {}} onSave={() => {}} isDarkMode={isDarkMode} />
            
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
  headerSub: { fontSize: 13, fontWeight: '600', opacity: 0.6 },
  barcodeBox: { flexDirection: 'row', alignItems: 'center', padding: 22, borderRadius: 24, marginBottom: 20, justifyContent: 'space-between' },
  barcodeTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  mainActionBox: { flex: 1, height: 110, borderRadius: 25, padding: 20, marginHorizontal: 5, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionMainText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12, marginTop: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 16, borderWidth: 1.5, height: 60, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  huniBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1.5, marginBottom: 12 },
  listIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  listBrand: { fontSize: 12, fontWeight: '600', opacity: 0.8 },
  listDate: { fontSize: 10, fontWeight: '600' },
  listBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  listBadgeText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, width: '100%' },
  modalTitleText: { fontSize: 18, fontWeight: '900' },
  confirmContent: { width: '90%', borderRadius: 30, padding: 30 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontWeight: '700', color: '#888' },
  infoVal: { fontWeight: '900', fontSize: 16 },
  confirmBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  standardBtnOutline: { flex: 1, height: 55, borderWidth: 2, borderColor: '#eee', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  standardBtnText: { fontWeight: '900', fontSize: 14, color: '#1A1A1A' },
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
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  cameraFrame: { width: 260, height: 200, borderWidth: 4, borderColor: '#FF3B30', borderRadius: 20 },
  cameraCancelBtn: { position: 'absolute', bottom: 60, backgroundColor: '#FF3B30', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 20 },
  cameraCancelText: { color: '#fff', fontWeight: '900' },
  printerBtn: { padding: 12, borderRadius: 12, borderWidth: 1.5 },
  manualContent: { width: '90%', borderRadius: 25, padding: 25, height: '70%' },
  label: { fontSize: 11, fontWeight: '900', marginTop: 15, marginBottom: 5 },
  inputField: { borderRadius: 12, padding: 15, borderWidth: 1.5, fontSize: 16, marginBottom: 10 },
  saveBtn: { backgroundColor: '#FF3B30', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});