import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, SafeAreaView, Platform, TextInput, Modal, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- DEPOYA SON GİREN 5 ÜRÜNÜN SİMÜLASYONU ---
const sonGelenler = [
  { id: '1', isim: 'iPhone 13 Ekran', marka: 'Apple (Orijinal)', miktar: '10 Adet', tarih: 'Bugün 10:45', usta: 'Ahmet Usta' },
  { id: '2', isim: 'Samsung S22 Batarya', marka: 'Samsung', miktar: '25 Adet', tarih: 'Dün 16:20', usta: 'Mehmet Usta' },
  { id: '3', isim: 'Type-C Şarj Soketi', marka: 'Muadil', miktar: '100 Adet', tarih: '05.03.2026', usta: 'Stok' },
  { id: '4', isim: 'Termal Macun 5g', marka: 'Arctic', miktar: '5 Adet', tarih: '04.03.2026', usta: 'Ali Usta' },
  { id: '5', isim: 'ThinkPad Klavye', marka: 'Lenovo', miktar: '2 Adet', tarih: '02.03.2026', usta: 'Ahmet Usta' },
];

// --- FİLTRE (HUNİ) ASANSÖRÜ ---
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
          <Text style={[styles.filterTitle, { color: isDarkMode ? '#fff' : '#1A1A1A', borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>DETAYLI ARAMA / LİSTELEME</Text>
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

// --- BARKOD İŞLEM SEÇİMİ ASANSÖRÜ ---
const BarcodeActionModal = ({ visible, onClose, onSelectAction, isDarkMode }: any) => {
  if (!visible) return null;
  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.confirmContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.confirmTitle, { color: isDarkMode ? '#fff' : '#1A1A1A', borderBottomColor: isDarkMode ? '#333' : '#eee' }]}>BARKOD İŞLEMİ</Text>
          <Text style={{ textAlign: 'center', marginBottom: 20, color: isDarkMode ? '#aaa' : '#666', fontWeight: '600' }}>
            Okutacağınız barkod ile ne yapmak istiyorsunuz?
          </Text>
          <View style={styles.confirmBtnRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => onSelectAction('cikis')}>
              <Text style={styles.rejectBtnText}>STOK ÇIKIŞI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveBtn} onPress={() => onSelectAction('giris')}>
              <Text style={styles.approveBtnText}>STOK GİRİŞİ</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>İptal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- BARKOD SONUÇ VE ONAY ASANSÖRÜ ---
const BarcodeResultModal = ({ visible, isScanning, onApprove, onReject, isDarkMode }: any) => {
  if (!visible) return null;
  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.confirmContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          {isScanning ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="large" color="#FF3B30" />
              <Text style={{ marginTop: 15, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#333' }}>Kamera Açılıyor & Barkod Aranıyor...</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.confirmTitle, { color: isDarkMode ? '#fff' : '#1A1A1A', borderBottomColor: isDarkMode ? '#333' : '#eee' }]}>CİHAZ BULUNDU</Text>
              
              <View style={[styles.deviceInfoRow, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
                <Text style={styles.deviceInfoLabel}>Parça / Cihaz:</Text>
                <Text style={[styles.deviceInfoValue, { color: isDarkMode ? '#ddd' : '#333' }]}>iPhone 13 Orijinal Ekran</Text>
              </View>
              <View style={[styles.deviceInfoRow, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
                <Text style={styles.deviceInfoLabel}>Parça No:</Text>
                <Text style={[styles.deviceInfoValue, { color: isDarkMode ? '#ddd' : '#333' }]}>APL-SCR-13PRO</Text>
              </View>
              <View style={[styles.deviceInfoRow, { borderBottomColor: 'transparent' }]}>
                <Text style={styles.deviceInfoLabel}>Mevcut Stok:</Text>
                <Text style={[styles.deviceInfoValue, { color: '#FF3B30', fontSize: 18 }]}>14 Adet</Text>
              </View>

              <View style={styles.confirmBtnRow}>
                <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
                  <Text style={styles.rejectBtnText}>YANLIŞ ÜRÜN</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
                  <Text style={styles.approveBtnText}>DOĞRU, İŞLE</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default function StokTakibiAnaEkran({ visible, onClose, isDarkMode = false }: any) {
  const [aramaMetni, setAramaMetni] = useState('');
  
  // Asansör Kilitleri
  const [filterVisible, setFilterVisible] = useState(false);
  const [barcodeActionVisible, setBarcodeActionVisible] = useState(false);
  const [barcodeResultVisible, setBarcodeResultVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Elle Kayıt Odaklanması İçin Ref
  const rAramaMotoru = useRef<TextInput>(null);

  // TEMA MOTORU (Sadece Kırmızı, Antrasit ve Açık Renkler)
  const theme = {
    bg: isDarkMode ? '#121212' : '#f4f6f8',
    cardBg: isDarkMode ? '#1e1e1e' : '#fff',
    borderColor: isDarkMode ? '#333' : '#e0e0e0',
    textColor: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    primary: '#FF3B30', // MÜDÜR: Mavi gitti, her yer Kırmızı!
    barcodeBg: isDarkMode ? '#2c2c2c' : '#1A1A1A', 
  };

  if (!visible) return null;

  // BARKOD MOTORU SİMÜLASYONU
  const handleBarcodeSelectAction = (action: string) => {
    setBarcodeActionVisible(false);
    setBarcodeResultVisible(true);
    setIsScanning(true);
    
    // Kameranın açılıp okuma süresi simülasyonu
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  const handleBarcodeReject = () => {
    setBarcodeResultVisible(false);
    // Yanlış denilirse asansörü kapat ve arama/manuel giriş kutusuna odaklan
    setTimeout(() => {
      rAramaMotoru.current?.focus();
    }, 400);
  };

  const handleBarcodeApprove = () => {
    setBarcodeResultVisible(false);
    // Burada stok giriş/çıkış formuna yönlendirilecek (Şimdilik asansör kapanıyor)
    alert("Kayıt Ekranına Aktarılıyor...");
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
          
          {/* BAŞLIK VE KAPATMA (X) / YAZICI İKONU (Mali bölümdeki renkler) */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textColor }]}>STOK & DEPO</Text>
              <Text style={[styles.headerSub, { color: theme.subText }]}>Envanter Yönetim Merkezi</Text>
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
            
            {/* BARKOD RADARI (KAMERA BUTONU) */}
            <TouchableOpacity 
              style={[styles.barcodeBox, { backgroundColor: theme.barcodeBg, borderColor: theme.primary, borderWidth: 1.5 }]} 
              activeOpacity={0.8}
              onPress={() => setBarcodeActionVisible(true)}
            >
              <View style={styles.barcodeIconWrapper}>
                <Ionicons name="barcode-outline" size={40} color="#fff" />
                <View style={[styles.cameraBadge, { backgroundColor: theme.primary }]}>
                  <Ionicons name="camera" size={12} color="#fff" />
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.barcodeTitle}>KAMERA İLE BARKOD OKUT</Text>
                <Text style={styles.barcodeSub}>Otomatik Giriş / Çıkış / Düzenleme</Text>
              </View>
              <Ionicons name="scan" size={28} color={theme.primary} />
            </TouchableOpacity>

            {/* MÜDÜR: YAN YANA GİRİŞ/ÇIKIŞ KUTULARI (Mali formdaki dbPriceBox tarzı) */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <Ionicons name="add-circle" size={28} color="#34C759" style={{ marginBottom: 5 }} />
                <Text style={[styles.actionBoxText, { color: theme.textColor }]}>STOK GİRİŞİ</Text>
                <Text style={styles.actionBoxSub}>Manuel Kayıt</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <Ionicons name="remove-circle" size={28} color={theme.primary} style={{ marginBottom: 5 }} />
                <Text style={[styles.actionBoxText, { color: theme.textColor }]}>STOK ÇIKIŞI</Text>
                <Text style={styles.actionBoxSub}>Usta Talepleri</Text>
              </TouchableOpacity>
            </View>

            {/* PARÇA VE CİHAZ ARAMA BÖLÜMÜ */}
            <Text style={[styles.sectionTitle, { color: theme.subText, marginTop: 15 }]}>PARÇA VE CİHAZ ARAMA / LİSTELEME</Text>
            <View style={[styles.searchContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Ionicons name="search" size={22} color={theme.subText} style={{ marginRight: 10 }} />
              <TextInput 
                ref={rAramaMotoru}
                style={[styles.searchInput, { color: theme.textColor }]}
                placeholder="Manuel Barkod veya Parça No girin..."
                placeholderTextColor={theme.subText}
                value={aramaMetni}
                onChangeText={setAramaMetni}
                returnKeyType="search"
              />
              <TouchableOpacity 
                style={[styles.searchFilterBtn, { backgroundColor: theme.primary }]}
                onPress={() => setFilterVisible(true)}
              >
                <Ionicons name="funnel" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* SON GELENLER LİSTESİ */}
            <View style={styles.listHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.subText, marginTop: 0 }]}>SON İŞLEM GÖREN 5 MALZEME</Text>
            </View>

            {sonGelenler.map((item) => (
              <View key={item.id} style={[styles.listItem, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <View style={[styles.listIconBox, { backgroundColor: isDarkMode ? '#222' : '#f0f0f0' }]}>
                  <Ionicons name="cube" size={24} color={theme.subText} />
                </View>
                <View style={styles.listContent}>
                  <Text style={[styles.listTitle, { color: theme.textColor }]}>{item.isim}</Text>
                  <Text style={[styles.listBrand, { color: theme.subText }]}>{item.marka}</Text>
                  <View style={styles.listSubRow}>
                    <Ionicons name="time-outline" size={14} color={theme.subText} />
                    <Text style={[styles.listDate, { color: theme.subText }]}>{item.tarih} - {item.usta}</Text>
                  </View>
                </View>
                <View style={[styles.listBadge, { backgroundColor: theme.barcodeBg }]}>
                  <Text style={styles.listBadgeText}>{item.miktar}</Text>
                </View>
              </View>
            ))}

          </ScrollView>

          {/* ASANSÖRLER */}
          <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} isDarkMode={isDarkMode} />
          
          <BarcodeActionModal 
            visible={barcodeActionVisible} 
            onClose={() => setBarcodeActionVisible(false)} 
            onSelectAction={handleBarcodeSelectAction} 
            isDarkMode={isDarkMode} 
          />
          
          <BarcodeResultModal 
            visible={barcodeResultVisible}
            isScanning={isScanning}
            onApprove={handleBarcodeApprove}
            onReject={handleBarcodeReject}
            isDarkMode={isDarkMode}
          />

        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 25 },
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
  headerSub: { fontSize: 13, fontWeight: '600', marginTop: 3 },
  printerBtn: { padding: 12, borderRadius: 12, borderWidth: 1.5 },
  
  barcodeBox: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 20, elevation: 10, shadowColor: '#FF3B30', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10 },
  barcodeIconWrapper: { position: 'relative' },
  cameraBadge: { position: 'absolute', bottom: -5, right: -5, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1A1A1A' },
  barcodeTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  barcodeSub: { color: '#aaa', fontSize: 12, fontWeight: '500', marginTop: 3 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  actionBox: { flex: 1, padding: 15, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', marginHorizontal: 5 },
  actionBoxText: { fontSize: 13, fontWeight: '900', marginTop: 5 },
  actionBoxSub: { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 2 },

  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingLeft: 15, paddingRight: 5, paddingVertical: 5, borderRadius: 16, borderWidth: 1.5, marginBottom: 30 },
  searchInput: { flex: 1, height: 45, fontSize: 14, fontWeight: '600' },
  searchFilterBtn: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1.5, marginBottom: 12 },
  listIconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listContent: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  listBrand: { fontSize: 13, fontWeight: '600', marginBottom: 5 },
  listSubRow: { flexDirection: 'row', alignItems: 'center' },
  listDate: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
  listBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  listBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // ASANSÖR (MODAL) STİLLERİ
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  confirmContent: { width: '85%', borderRadius: 20, padding: 20, elevation: 20 },
  confirmTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 15, borderBottomWidth: 1, paddingBottom: 10 },
  deviceInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  deviceInfoLabel: { fontSize: 14, fontWeight: 'bold', color: '#888' },
  deviceInfoValue: { fontSize: 15, fontWeight: '700', flex: 1, textAlign: 'right' },
  confirmBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  rejectBtn: { flex: 1, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FF3B30', padding: 12, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  rejectBtnText: { color: '#FF3B30', fontWeight: '900', fontSize: 13 },
  approveBtn: { flex: 1, backgroundColor: '#FF3B30', padding: 12, borderRadius: 12, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  filterContent: { width: '100%', position: 'absolute', bottom: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50, elevation: 20 },
  filterTitle: { fontSize: 15, fontWeight: '900', marginBottom: 20, borderBottomWidth: 1, paddingBottom: 15, textAlign: 'center' },
  filterItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
  filterItemText: { fontSize: 15, fontWeight: '700' },
});