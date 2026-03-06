import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Modal, ScrollView, SafeAreaView, Platform, TextInput, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ParaGirisiFormu from './ParaGirisiFormu';
import ParaCikisiFormu from './ParaCikisiFormu';

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

const getTodayString = () => {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
};

// --- MÜDÜR: İŞTE O YENİ, JİLET GİBİ ÇIKTI ALMA PENCERESİ ---
const CiktiAlModal = ({ visible, onClose, onConfirm, isDarkMode }: any) => {
  const theme = {
    bg: isDarkMode ? '#1e1e1e' : '#fff',
    text: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    cancelBg: isDarkMode ? '#333' : '#e0e0e0',
    cancelText: isDarkMode ? '#fff' : '#333'
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.ciktiModalContent, { backgroundColor: theme.bg }]}>
          <View style={[styles.ciktiIconBox, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="document-text" size={36} color="#FF3B30" />
          </View>
          <Text style={[styles.ciktiTitle, { color: theme.text }]}>PDF ÇIKTISI AL</Text>
          <Text style={[styles.ciktiDesc, { color: theme.subText }]}>
            Ekranda listelenen nakit hareketleri PDF formatında hazırlanıp cihazınıza indirilecektir. Onaylıyor musunuz?
          </Text>
          
          <View style={styles.ciktiBtnRow}>
            <TouchableOpacity style={[styles.ciktiBtn, { backgroundColor: theme.cancelBg }]} onPress={onClose}>
              <Text style={[styles.ciktiBtnText, { color: theme.cancelText }]}>İPTAL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ciktiBtn, { backgroundColor: '#FF3B30' }]} onPress={onConfirm}>
              <Text style={[styles.ciktiBtnText, { color: '#fff' }]}>OLUŞTUR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
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
    inputBg: isDarkMode ? '#2c2c2c' : '#f9f9f9',
  };

  const handleUygula = () => {
    let filtreOzeti = '';
    if (aktifSekme === 'zaman') {
      filtreOzeti = seciliAyar === 'Tarih Aralığı' ? `${baslangic} - ${bitis}` : `Zaman: ${seciliAyar}`;
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
                
                {seciliAyar === 'Tarih Aralığı' && (
                  <View style={{ width: '100%', marginTop: 15 }}>
                    <Text style={[styles.rangeLabel, { color: theme.subText }]}>BAŞLANGIÇ - BİTİŞ</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <TextInput style={[styles.rangeHalfInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} keyboardType="numeric" maxLength={10} placeholder="Başlangıç" placeholderTextColor={theme.subText} value={baslangic} onChangeText={(v)=>setBaslangic(formatDate(v))} />
                      <TextInput style={[styles.rangeHalfInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} keyboardType="numeric" maxLength={10} placeholder="Bitiş" placeholderTextColor={theme.subText} value={bitis} onChangeText={(v)=>setBitis(formatDate(v))} />
                    </View>
                  </View>
                )}
              </View>
            )}

            {aktifSekme === 'gelir' && (
              <View style={styles.filterOptionsGrid}>
                {['Tümü', 'Satış', 'Tamir', 'Nakit'].map(opt => (
                  <TouchableOpacity key={opt} style={[styles.filterOptBtn, { borderColor: theme.border }, gelirTipi === opt && { backgroundColor: theme.activeBg, borderColor: theme.activeBg }]} onPress={() => setGelirTipi(opt)}>
                    <Text style={[styles.filterOptText, { color: gelirTipi === opt ? '#fff' : theme.text }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}

                {gelirTipi === 'Tamir' && (
                  <View style={{ width: '100%', marginTop: 20 }}>
                    <Text style={[styles.rangeLabel, { color: theme.subText }]}>HANGİ USTANIN GELİRİ?</Text>
                    <View style={styles.filterOptionsGrid}>
                      {['Tümü', 'Usta 1', 'Usta 2', 'Usta 3'].map(usta => (
                        <TouchableOpacity key={usta} style={[styles.filterOptBtn, { borderColor: theme.border, paddingVertical: 10 }, seciliUsta === usta && { backgroundColor: theme.activeBg, borderColor: theme.activeBg }]} onPress={() => setSeciliUsta(usta)}>
                          <Text style={[styles.filterOptText, { color: seciliUsta === usta ? '#fff' : theme.text }]}>{usta}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
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

const MOCK_HAREKETLER = [
  { id: 1, tip: 'giris', grup: 'Tamir', baslik: 'Cep Telefonu Tamiri (Usta 1)', tarih: '06.03.2026', tutar: '1.500,00' },
  { id: 2, tip: 'cikis', grup: 'Stok Alımı', baslik: 'Stok Alımı - Anakart', tarih: '05.03.2026', tutar: '800,00' },
  { id: 3, tip: 'giris', grup: 'Nakit', baslik: 'Kasaya Nakit Girişi', tarih: '04.03.2026', tutar: '5.000,00' },
  { id: 4, tip: 'cikis', grup: 'Genel Gider', baslik: 'Genel Gider - Fatura', tarih: '02.03.2026', tutar: '1.250,00' },
  { id: 5, tip: 'giris', grup: 'Satış', baslik: 'Satıştan Giriş - Kılıf', tarih: '01.03.2026', tutar: '450,00' },
];

export default function MaliIslemlerAnaEkran({ visible, onClose, isDarkMode }: any) {
  const [entryVisible, setEntryVisible] = useState(false);
  const [exitVisible, setExitVisible] = useState(false); 
  
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [ciktiModalVisible, setCiktiModalVisible] = useState(false);
  
  // Arka planda filtre çalışmaya devam edecek ama ekranda yazısı görünmeyecek
  const [aktifFiltreMetni, setAktifFiltreMetni] = useState('Son 5 Hareket');

  const handleFiltreUygula = (ozetMetni: string) => {
    setAktifFiltreMetni(ozetMetni);
    setFilterModalVisible(false);
  };

  const handlePdfOnayla = () => {
    setCiktiModalVisible(false);
    // DB Bağlanınca buraya PDF indirme motoru eklenecek
    console.log("PDF Çıktısı Hazırlanıyor...");
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
            <View style={[styles.titleBadge, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }]}>
              <Text style={styles.title}>MALİ İŞLEMLER</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={42} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
            
            <View style={[styles.summaryCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.summaryLabel, { color: theme.subText }]}>NET KASA DURUMU</Text>
              <Text style={[styles.netKasaText, { color: theme.textColor }]}>24.500,00 ₺</Text>
              <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
              <View style={styles.teraziRow}>
                <View style={styles.teraziCol}>
                  <Text style={[styles.teraziLabel, { color: theme.subText }]}>TOPLAM GİREN</Text>
                  <Text style={[styles.teraziValue, { color: theme.textColor }]}>+ 31.950,00 ₺</Text>
                </View>
                <View style={styles.teraziColRight}>
                  <Text style={[styles.teraziLabel, { color: theme.subText }]}>TOPLAM ÇIKAN</Text>
                  <Text style={[styles.teraziValue, { color: '#FF3B30' }]}>- 7.450,00 ₺</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtnSolid, { backgroundColor: theme.girisBtnBg }]} onPress={() => setEntryVisible(true)} activeOpacity={0.8}>
                <View style={[styles.iconCircleSolid, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Ionicons name="arrow-down" size={26} color="#fff" />
                </View>
                <Text style={styles.actionBtnTextSolid}>PARA GİRİŞİ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtnSolid, { backgroundColor: theme.cikisBtnBg }]} onPress={() => setExitVisible(true)} activeOpacity={0.8}>
                <View style={[styles.iconCircleSolid, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name="arrow-up" size={26} color="#fff" />
                </View>
                <Text style={styles.actionBtnTextSolid}>PARA ÇIKIŞI</Text>
              </TouchableOpacity>
            </View>

            {/* MÜDÜR: İSTEDİĞİN GİBİ DÜZENLENEN BAŞLIK KISMI */}
            <View style={styles.listHeaderRow}>
              {/* SOL: HUNİ (FİLTRE) */}
              <TouchableOpacity style={[styles.iconActionBtn, { backgroundColor: theme.btnBg }]} onPress={() => setFilterModalVisible(true)}>
                <Ionicons name="funnel" size={20} color={theme.textColor} />
              </TouchableOpacity>
              
              {/* ORTA: YAZI (Altındaki açıklama silindi, tam ortalandı) */}
              <Text style={[styles.sectionTitleCentered, { color: theme.textColor }]}>NAKİT HAREKETLERİ</Text>
              
              {/* SAĞ: YAZICI (ÇIKTI) */}
              <TouchableOpacity style={[styles.iconActionBtn, { backgroundColor: theme.btnBg }]} onPress={() => setCiktiModalVisible(true)}>
                <Ionicons name="print" size={22} color={theme.textColor} />
              </TouchableOpacity>
            </View>

            <View style={[styles.listContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              {MOCK_HAREKETLER.map((islem, index) => (
                <View key={islem.id} style={[styles.listItem, index !== MOCK_HAREKETLER.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.borderColor }]}>
                  <View style={styles.listLeft}>
                    <View style={[styles.listIconBox, { backgroundColor: islem.tip === 'giris' ? theme.btnBg : '#FFEBEE' }]}>
                      <Ionicons name={islem.tip === 'giris' ? "add" : "remove"} size={20} color={islem.tip === 'giris' ? theme.textColor : '#FF3B30'} />
                    </View>
                    <View style={{ flex: 1, paddingRight: 15 }}>
                      <Text style={[styles.listTitle, { color: theme.textColor }]} numberOfLines={1}>{islem.baslik}</Text>
                      <Text style={[styles.listDate, { color: theme.subText }]}>{islem.tarih}</Text>
                    </View>
                  </View>
                  <Text style={[styles.listAmount, { color: islem.tip === 'giris' ? theme.textColor : '#FF3B30' }]}>
                    {islem.tip === 'giris' ? '+' : '-'} {islem.tutar} ₺
                  </Text>
                </View>
              ))}
            </View>

          </ScrollView>

          <ParaGirisiFormu visible={entryVisible} onClose={() => setEntryVisible(false)} isDarkMode={isDarkMode} />
          <ParaCikisiFormu visible={exitVisible} onClose={() => setExitVisible(false)} isDarkMode={isDarkMode} />
          
          <GelismisFiltreModal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} onApply={handleFiltreUygula} isDarkMode={isDarkMode} />
          <CiktiAlModal visible={ciktiModalVisible} onClose={() => setCiktiModalVisible(false)} onConfirm={handlePdfOnayla} isDarkMode={isDarkMode} />
          
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 25 },
  titleBadge: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  
  summaryCard: { borderRadius: 25, padding: 25, borderWidth: 1, elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 20 },
  summaryLabel: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },
  netKasaText: { fontSize: 38, fontWeight: '900', textAlign: 'center', marginVertical: 10 },
  divider: { height: 1, width: '100%', marginVertical: 15 },
  teraziRow: { flexDirection: 'row', justifyContent: 'space-between' },
  teraziCol: { flex: 1 },
  teraziColRight: { flex: 1, alignItems: 'flex-end' },
  teraziLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 5 },
  teraziValue: { fontSize: 18, fontWeight: '900' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionBtnSolid: { width: '48%', paddingVertical: 18, borderRadius: 20, alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  iconCircleSolid: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionBtnTextSolid: { fontSize: 15, fontWeight: '900', color: '#fff' },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  iconActionBtn: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  sectionTitleCentered: { flex: 1, fontSize: 16, fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 },

  listContainer: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 15, elevation: 2 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  listLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  listIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  listDate: { fontSize: 12, fontWeight: '500' },
  listAmount: { fontSize: 16, fontWeight: '900' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  
  // FİLTRE PANELİ STİLLERİ
  filterPanelContent: { width: '90%', borderRadius: 25, padding: 25, elevation: 20 },
  filterTabsRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, marginBottom: 15 },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  filterTabText: { fontSize: 13, fontWeight: '900' },
  filterOptionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  filterOptBtn: { width: '48%', borderWidth: 1, borderRadius: 15, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  filterOptText: { fontSize: 14, fontWeight: 'bold' },
  rangeLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 5 },
  rangeHalfInput: { width: '48%', borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '500', textAlign: 'center' },
  applyBtn: { width: '100%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  // ÇIKTI AL MODALI STİLLERİ
  ciktiModalContent: { width: '85%', borderRadius: 25, padding: 25, alignItems: 'center', elevation: 20 },
  ciktiIconBox: { width: 70, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  ciktiTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  ciktiDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  ciktiBtnRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  ciktiBtn: { width: '48%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  ciktiBtnText: { fontSize: 15, fontWeight: 'bold' }
});