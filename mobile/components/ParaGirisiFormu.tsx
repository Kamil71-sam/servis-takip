import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- MÜDÜRÜN MALİ HESAP MOTORU ---
const calculateNihaiFiyat = (hamFiyat: number, iskontoOrani: string | number = 0): number => {
  const hamKar = hamFiyat * 0.25; 
  const indirimliKar = hamKar * (1 - (Number(iskontoOrani) / 100)); 
  const araToplam = hamFiyat + indirimliKar;
  const kdvli = araToplam * 1.20; 
  return Math.round(kdvli);
};

// --- VERİ YAPILARI ---
interface SQLDeviceData {
  kayitNumarasi: string;
  musteriFirmaAdi: string;
  cihazTuru: string;
  marka: string;
  model: string;
  seriNo: string;
  garantiDurumu: string;
  musteriNotu: string;
  atananUsta: string;
  arizaNotu: string;
  durum: string;
  kayitTarihi: string;
  ustaTeklifi: number; 
}

interface StokData {
  barkod: string;
  urunAdi: string;
  marka: string;
  model: string;
  teklifFiyat: number;
  bagliServisNo: string;
  musteriAdi: string;
  atananUsta: string;
  ustaNotu: string;
}

export default function ParaGirisiFormu({ visible, onClose, isDarkMode }: any) {
  // .env VANASI
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.41:3000';

  const initialState = { 
    tur: 'Seçiniz...', 
    tutar: '', 
    aciklama: '',
    kayitNo: '', 
    iskonto: '0',
    barkod: '',
    cihazData: null as SQLDeviceData | null,
    stokData: null as StokData | null
  };
  
  const [f, setF] = useState(initialState);
  const [isSearching, setIsSearching] = useState(false);
  const [isRecordFound, setIsRecordFound] = useState(false);
  const [modalState, setModalState] = useState<'tur' | null>(null);

  // MÜDÜR: Her açılışta kutuları boşaltan vana
  useEffect(() => {
    if (visible) {
      setF(initialState);
      setIsRecordFound(false);
    }
  }, [visible]);

  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#555',
    borderColor: isDarkMode ? '#333' : '#eee',
    accentColor: '#FF3B30'
  };

  // --- 1. FONKSİYON: TAMİR / RANDEVU SORGULAMA ---
  const handleSearchRecord = async () => {
    if (!f.kayitNo) return;
    setIsSearching(true);
    try {
        const response = await fetch(`${API_BASE_URL}/api/kasa/search-service?servis_no=${f.kayitNo}`);
        const resData = await response.json();
        
        if (resData.success && resData.found) {
            const dev = resData.device;
            // Backend'den gelen veriyi bizim form yapısına eşliyoruz
            const mockRes: SQLDeviceData = {
                kayitNumarasi: dev.servis_no,
                musteriFirmaAdi: dev.musteri_adi || 'Belirtilmemiş',
                cihazTuru: dev.cihaz_turu || 'Cihaz',
                marka: dev.marka,
                model: dev.model,
                seriNo: dev.seriNo,
                garantiDurumu: dev.garanti_durumu || 'Bilinmiyor',
                musteriNotu: dev.musteri_notu || '-',
                atananUsta: dev.atanan_usta || 'Atanmamış',
                arizaNotu: dev.ariza_notu || '-',
                durum: dev.status || '-',
                kayitTarihi: '-',
                ustaTeklifi: Number(dev.fiyatTeklifi) || 0
            };
            const hesaplanan = calculateNihaiFiyat(mockRes.ustaTeklifi, 0);
            setF({ ...f, cihazData: mockRes, stokData: null, iskonto: '0', tutar: hesaplanan.toString() });
            setIsRecordFound(true);
        } else {
            Alert.alert("BULUNAMADI", "Bu numaraya ait bir kayıt yok.");
        }
    } catch (e) {
        Alert.alert("BAĞLANTI HATASI", "Sorgu yapılamadı.");
    } finally {
        setIsSearching(false);
    }
  };

  // --- 2. FONKSİYON: STOK SORGULAMA (BARKOD) ---
  const handleSearchStock = async () => {
    if (!f.barkod) return;
    setIsSearching(true);
    // Simülasyon (Backend'de search-stock ucu açılınca burası fetch olacak)
    setTimeout(() => {
      const mockStok: StokData = {
        barkod: f.barkod,
        urunAdi: 'Kombi Anakart',
        marka: 'Vaillant',
        model: 'VRT-2026',
        teklifFiyat: 3500,
        bagliServisNo: 'SRV-8842',
        musteriAdi: 'Ahmet Yılmaz',
        atananUsta: 'Kemal Usta',
        ustaNotu: 'Anakart aşırı voltajdan yanmış, yenisi takıldı.'
      };
      const hesaplanan = calculateNihaiFiyat(mockStok.teklifFiyat, 0);
      setF({ ...f, stokData: mockStok, cihazData: null, iskonto: '0', tutar: hesaplanan.toString() });
      setIsRecordFound(true);
      setIsSearching(false);
    }, 800);
  };

  // --- 3. FONKSİYON: KASAYA İŞLEME (ASIL KAYIT) ---
  const handleSaveToKasa = async () => {
    if (f.tur === 'Kasaya Nakit Girişi' && (!f.tutar || !f.aciklama)) {
      Alert.alert("EKSİK BİLGİ", "Nakit girişinde Tutar ve Not alanları zorunludur!");
      return;
    }

    const islemPaketi = {
      islem_yonu: 'GİRİŞ',
      kategori: f.tur,
      tutar: parseFloat(f.tutar.replace(',', '.')),
      aciklama: f.aciklama,
      islem_yapan: 'Admin', // Giriş yapan kullanıcı bilgisi eklenebilir
      servis_no: f.kayitNo || f.barkod || null
    };

    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/kasa/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(islemPaketi)
      });
      const resData = await response.json();
      if (resData.success) {
        Alert.alert("BAŞARILI", "Kasa İşlemleri mühürlendi.");
        onClose();
        setF(initialState);
      } else {
        Alert.alert("HATA", "Veritabanı hatası: " + resData.error);
      }
    } catch (e) {
      Alert.alert("BAĞLANTI KOPTU", "Server'a ulaşılamıyor.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleIskontoChange = (oran: string) => {
    const bazFiyat = f.cihazData?.ustaTeklifi || f.stokData?.teklifFiyat || 0;
    const yeniFiyat = calculateNihaiFiyat(bazFiyat, oran);
    setF({ ...f, iskonto: oran, tutar: yeniFiyat.toString() });
  };

  if (!visible) return null;

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
          
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.textColor }]}>KASA İŞLEMLERİ</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={40} color={theme.accentColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
            
            <Text style={[styles.label, { color: theme.labelColor }]}>İŞLEM TÜRÜ</Text>
            <TouchableOpacity 
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]} 
              onPress={() => setModalState('tur')}
            >
              <Text style={{ color: theme.textColor, fontWeight: 'bold' }}>{f.tur}</Text>
              <Ionicons name="chevron-down" size={20} color={theme.labelColor} />
            </TouchableOpacity>

            {(f.tur === 'Tamir Ücreti Tahsili' || f.tur === 'Randevu Geliri Tahsili') && (
              <View>
                <Text style={[styles.label, { color: theme.labelColor }]}>KAYIT NUMARASI SORGULA</Text>
                <View style={styles.searchRow}>
                  <TextInput 
                    style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.textColor }]}
                    placeholder="Servis No girin..."
                    keyboardType="numeric"
                    value={f.kayitNo}
                    onChangeText={(v) => { setF({...f, kayitNo: v}); setIsRecordFound(false); }}
                  />
                  <TouchableOpacity style={[styles.searchBtn, {backgroundColor: theme.accentColor}]} onPress={handleSearchRecord}>
                    {isSearching ? <ActivityIndicator color="#fff" /> : <Ionicons name="search" size={24} color="#fff" />}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {f.tur === 'Stoktan Ürün Satışı' && (
              <View>
                <Text style={[styles.label, { color: theme.labelColor }]}>BARKOD NO (OKUT / YAZ)</Text>
                <View style={styles.searchRow}>
                  <TextInput 
                    style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.textColor }]}
                    placeholder="Barkod girin..."
                    value={f.barkod}
                    onChangeText={(v) => { setF({...f, barkod: v}); setIsRecordFound(false); }}
                  />
                  <TouchableOpacity style={[styles.searchBtn, {backgroundColor: '#34C759'}]} onPress={handleSearchStock}>
                    {isSearching ? <ActivityIndicator color="#fff" /> : <Ionicons name="barcode-outline" size={24} color="#fff" />}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isRecordFound && (
              <View style={[styles.infoList, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <Text style={styles.listTitle}>CİHAZ / ÜRÜN VE MÜŞTERİ BİLGİLERİ</Text>
                
                {f.cihazData && (
                  <>
                    <InfoRow label="Müşteri / Firma:" value={f.cihazData.musteriFirmaAdi} isDarkMode={isDarkMode} />
                    <InfoRow label="Cihaz Türü:" value={f.cihazData.cihazTuru} isDarkMode={isDarkMode} />
                    <InfoRow label="Marka / Model:" value={`${f.cihazData.marka} ${f.cihazData.model}`} isDarkMode={isDarkMode} />
                    <InfoRow label="Seri Numarası:" value={f.cihazData.seriNo} isDarkMode={isDarkMode} />
                    <InfoRow label="Garanti Durumu:" value={f.cihazData.garantiDurumu} isDarkMode={isDarkMode} />
                    <InfoRow label="Atanan Usta:" value={f.cihazData.atananUsta} isDarkMode={isDarkMode} />
                    <InfoRow label="Usta Fiyat Teklifi:" value={`${f.cihazData.ustaTeklifi} ₺`} isDarkMode={isDarkMode} highlight />
                    <View style={styles.noteBox}>
                      <Text style={styles.noteLabel}>Arıza & İşlem Notu:</Text>
                      <Text style={[styles.noteText, {color: theme.textColor}]}>{f.cihazData.arizaNotu}</Text>
                    </View>
                  </>
                )}

                {f.stokData && (
                  <>
                    <InfoRow label="Servis No:" value={f.stokData.bagliServisNo} isDarkMode={isDarkMode} />
                    <InfoRow label="Müşteri Adı Soyadı:" value={f.stokData.musteriAdi} isDarkMode={isDarkMode} />
                    <InfoRow label="Ürün / Marka:" value={`${f.stokData.urunAdi} - ${f.stokData.marka}`} isDarkMode={isDarkMode} />
                    <InfoRow label="Model:" value={f.stokData.model} isDarkMode={isDarkMode} />
                    <InfoRow label="Atanan Usta:" value={f.stokData.atananUsta} isDarkMode={isDarkMode} />
                    <InfoRow label="Teklif Fiyat:" value={`${f.stokData.teklifFiyat} ₺`} isDarkMode={isDarkMode} highlight />
                    <View style={styles.noteBox}>
                      <Text style={styles.noteLabel}>Usta Notu:</Text>
                      <Text style={[styles.noteText, {color: theme.textColor}]}>{f.stokData.ustaNotu}</Text>
                    </View>
                  </>
                )}

                <View style={styles.priceSection}>
                  <Text style={[styles.label, {color: '#FF9500', marginTop: 0}]}>KÂR ÜZERİNDEN İSKONTO (%)</Text>
                  <TextInput 
                    style={[styles.input, {backgroundColor: isDarkMode ? '#333' : '#fff', borderColor: '#FF9500', color: '#FF9500', fontWeight: 'bold'}]}
                    keyboardType="numeric"
                    maxLength={2}
                    value={f.iskonto}
                    onChangeText={handleIskontoChange}
                  />
                </View>
              </View>
            )}

            {f.tur !== 'Seçiniz...' && (
              <View style={{ marginTop: 25 }}>
                <Text style={[styles.label, { color: theme.labelColor }]}>GENEL TOPLAM TAHSİLAT (₺)</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.inputBg, color: '#34C759', fontSize: 30, fontWeight: '900' }]}
                  value={f.tutar}
                  editable={f.tur === 'Kasaya Nakit Girişi'}
                  onChangeText={(v) => setF({...f, tutar: v})}
                  keyboardType="numeric"
                />

                <Text style={[styles.label, { color: theme.labelColor, marginTop: 15 }]}>İŞLEM AÇIKLAMASI (*)</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textColor, height: 80 }]}
                  multiline
                  placeholder="Not düşmek zorunludur..."
                  value={f.aciklama}
                  onChangeText={(v) => setF({...f, aciklama: v})}
                />

                <TouchableOpacity 
                    style={[styles.saveBtn, isSearching && {opacity: 0.5}]} 
                    onPress={handleSaveToKasa}
                    disabled={isSearching}
                >
                  {isSearching ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>KASA İŞLEMLERİNİ TAMAMLA</Text>}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal visible={modalState === 'tur'} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
              {['Kasaya Nakit Girişi', 'Tamir Ücreti Tahsili', 'Randevu Geliri Tahsili', 'Stoktan Ürün Satışı'].map((item) => (
                <TouchableOpacity key={item} style={styles.modalItem} onPress={() => { setF({...f, tur: item}); setModalState(null); }}>
                  <Text style={{ color: theme.textColor, fontWeight: 'bold' }}>{item}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setModalState(null)} style={{marginTop: 15}}><Text style={{color: 'red'}}>Kapat</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </Modal>
  );
}

const InfoRow = ({ label, value, isDarkMode, highlight }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, { color: highlight ? '#FF3B30' : (isDarkMode ? '#ddd' : '#333') }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 45, marginBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 11, fontWeight: 'bold', marginBottom: 5, letterSpacing: 0.5 },
  input: { padding: 16, borderRadius: 15, borderWidth: 1, borderColor: 'transparent', fontSize: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchBtn: { width: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  infoList: { padding: 20, borderRadius: 20, marginTop: 20, borderWidth: 1.5, borderStyle: 'dashed' },
  listTitle: { fontSize: 13, fontWeight: '900', color: '#888', marginBottom: 15, textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  infoLabel: { fontSize: 13, color: '#888', fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: 'bold', textAlign: 'right', flex: 1, marginLeft: 10 },
  noteBox: { marginTop: 15, padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.03)' },
  noteLabel: { fontSize: 11, fontWeight: 'bold', color: '#888', marginBottom: 4 },
  noteText: { fontSize: 13, fontStyle: 'italic' },
  priceSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
  saveBtn: { backgroundColor: '#1A1A1A', padding: 22, borderRadius: 20, marginTop: 30, marginBottom: 50, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 25, alignItems: 'center' },
  modalItem: { paddingVertical: 18, width: '100%', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' }
});