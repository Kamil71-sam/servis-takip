import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Modal, ScrollView, SafeAreaView, Platform, TextInput, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ParaGirisiFormu from './ParaGirisiFormu';
import ParaCikisiFormu from './ParaCikisiFormu';

// AKILLI TARİH MOTORLARI 
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

// TARİH ARALIĞI SEÇME ASANSÖRÜ
const DateRangeModal = ({ visible, onClose, onApply, isDarkMode }: any) => {
  const [baslangic, setBaslangic] = useState('');
  const [bitis, setBitis] = useState('');

  const handleSorgula = () => {
    Keyboard.dismiss();
    if (baslangic && bitis) {
      onApply(baslangic, bitis);
    }
  };

  const theme = {
    bg: isDarkMode ? '#1e1e1e' : '#fff',
    text: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    borderColor: isDarkMode ? '#444' : '#eee',
    btnBg: isDarkMode ? '#333' : '#1A1A1A'
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.rangeContent, { backgroundColor: theme.bg }]}>
          <Text style={[styles.rangeTitle, { color: theme.text }]}>TARİH ARALIĞI SEÇ</Text>
          
          <Text style={[styles.rangeLabel, { color: theme.subText }]}>BAŞLANGIÇ TARİHİ</Text>
          <View style={[styles.rangeInputBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
            <TextInput style={[styles.rangeInput, { color: theme.text }]} keyboardType="numeric" maxLength={10} placeholder="GG.AA.YYYY" placeholderTextColor={theme.subText} value={baslangic} onChangeText={(v)=>setBaslangic(formatDate(v))} returnKeyType="next" />
            <TouchableOpacity onPress={() => setBaslangic(getTodayString())}>
              <Ionicons name="calendar" size={24} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.rangeLabel, { color: theme.subText }]}>BİTİŞ TARİHİ</Text>
          <View style={[styles.rangeInputBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
            <TextInput style={[styles.rangeInput, { color: theme.text }]} keyboardType="numeric" maxLength={10} placeholder="GG.AA.YYYY" placeholderTextColor={theme.subText} value={bitis} onChangeText={(v)=>setBitis(formatDate(v))} returnKeyType="done" onSubmitEditing={handleSorgula} />
            <TouchableOpacity onPress={() => setBitis(getTodayString())}>
              <Ionicons name="calendar" size={24} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <View style={styles.rangeBtnRow}>
            <TouchableOpacity style={[styles.rangeBtn, { backgroundColor: '#FF3B30' }]} onPress={onClose}>
              <Text style={styles.rangeBtnText}>İPTAL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rangeBtn, { backgroundColor: theme.btnBg }]} onPress={handleSorgula}>
              <Text style={styles.rangeBtnText}>SORGULA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// MÜDÜR: YENİ GRUP/KATEGORİ FİLTRE ASANSÖRÜ
const KategoriSelectModal = ({ visible, onClose, onSelect, isDarkMode }: any) => {
  const kategoriler = ['Tümü', 'Tamir', 'Satış', 'Stok Alımı', 'Nakit', 'Genel Gider'];
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.rangeContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.rangeTitle, { color: isDarkMode ? '#fff' : '#1A1A1A' }]}>KATEGORİ SEÇ</Text>
          {kategoriler.map((kat) => (
            <TouchableOpacity 
              key={kat} 
              style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#2c2c2c' : '#eee', alignItems: 'center' }} 
              onPress={() => onSelect(kat)}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: isDarkMode ? '#ddd' : '#333' }}>{kat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// GEÇİCİ MOTOR VERİSİ (Kategoriye göre süzmek için grup bilgisi eklendi)
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
  
  // FİLTRE MOTORU
  const [aktifFiltre, setAktifFiltre] = useState('son5');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [secilenTarihAraligi, setSecilenTarihAraligi] = useState('');
  
  // MÜDÜR: KATEGORİ MOTORU
  const [kategoriModalVisible, setKategoriModalVisible] = useState(false);
  const [secilenKategori, setSecilenKategori] = useState('Tümü');

  const handleTarihSorgula = (bas: string, bit: string) => {
    setSecilenTarihAraligi(`${bas} - ${bit}`);
    setAktifFiltre('tarih');
    setDateModalVisible(false);
  };

  const handleKategoriSec = (kat: string) => {
    setSecilenKategori(kat);
    setKategoriModalVisible(false);
  };

  // MÜDÜR: KATEGORİYE GÖRE LİSTEYİ SÜZEN MOTOR
  const filtrelenmisHareketler = secilenKategori === 'Tümü' 
    ? MOCK_HAREKETLER 
    : MOCK_HAREKETLER.filter(h => h.grup === secilenKategori);

  const theme = {
    bg: isDarkMode ? '#121212' : '#fdfdfd',
    cardBg: isDarkMode ? '#1e1e1e' : '#fff',
    borderColor: isDarkMode ? '#333' : '#eee',
    textColor: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    btnBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    activeFilterBg: isDarkMode ? '#fff' : '#1A1A1A',
    activeFilterText: isDarkMode ? '#1A1A1A' : '#fff',
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

            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>HAREKET SORGULAMA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              
              {/* MÜDÜR: YENİ KATEGORİ/GRUP FİLTRESİ BURADA */}
              <TouchableOpacity 
                style={[styles.filterPill, secilenKategori !== 'Tümü' ? { backgroundColor: theme.activeFilterBg } : { backgroundColor: theme.btnBg }, { flexDirection: 'row', alignItems: 'center', borderColor: theme.borderColor, borderWidth: 1 }]} 
                onPress={() => setKategoriModalVisible(true)}
              >
                <Ionicons name="filter" size={16} color={secilenKategori !== 'Tümü' ? theme.activeFilterText : theme.subText} style={{ marginRight: 5 }} />
                <Text style={[styles.filterText, secilenKategori !== 'Tümü' ? { color: theme.activeFilterText } : { color: theme.subText }]}>
                  Grup: {secilenKategori}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filterPill, aktifFiltre === 'son5' ? { backgroundColor: theme.activeFilterBg } : { backgroundColor: theme.btnBg }]} onPress={() => setAktifFiltre('son5')}>
                <Text style={[styles.filterText, aktifFiltre === 'son5' ? { color: theme.activeFilterText } : { color: theme.subText }]}>Son 5</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.filterPill, aktifFiltre === '7gun' ? { backgroundColor: theme.activeFilterBg } : { backgroundColor: theme.btnBg }]} onPress={() => setAktifFiltre('7gun')}>
                <Text style={[styles.filterText, aktifFiltre === '7gun' ? { color: theme.activeFilterText } : { color: theme.subText }]}>7 Günlük</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.filterPill, aktifFiltre === 'tarih' ? { backgroundColor: theme.activeFilterBg } : { backgroundColor: theme.btnBg }, { flexDirection: 'row', alignItems: 'center' }]} 
                onPress={() => setDateModalVisible(true)}
              >
                <Ionicons name="calendar-outline" size={16} color={aktifFiltre === 'tarih' ? theme.activeFilterText : theme.subText} style={{ marginRight: 5 }} />
                <Text style={[styles.filterText, aktifFiltre === 'tarih' ? { color: theme.activeFilterText } : { color: theme.subText }]}>
                  {aktifFiltre === 'tarih' ? secilenTarihAraligi : 'Tarih Seç'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={[styles.listContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              {/* MÜDÜR: LİSTE ARTIK SEÇİLEN GRUBA GÖRE SÜZÜLÜYOR */}
              {filtrelenmisHareketler.length === 0 ? (
                <Text style={{ textAlign: 'center', padding: 20, color: theme.subText, fontWeight: 'bold' }}>Bu gruba ait hareket bulunamadı.</Text>
              ) : (
                filtrelenmisHareketler.map((islem, index) => (
                  <View key={islem.id} style={[styles.listItem, index !== filtrelenmisHareketler.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.borderColor }]}>
                    <View style={styles.listLeft}>
                      <View style={[styles.listIconBox, { backgroundColor: islem.tip === 'giris' ? theme.btnBg : '#FFEBEE' }]}>
                        <Ionicons name={islem.tip === 'giris' ? "add" : "remove"} size={20} color={islem.tip === 'giris' ? theme.textColor : '#FF3B30'} />
                      </View>
                      <View style={{ flex: 1, paddingRight: 15 }}>
                        <Text style={[styles.listTitle, { color: theme.textColor }]} numberOfLines={1}>{islem.baslik}</Text>
                        <Text style={[styles.listDate, { color: theme.subText }]}>{islem.tarih} • {islem.grup}</Text>
                      </View>
                    </View>
                    <Text style={[styles.listAmount, { color: islem.tip === 'giris' ? theme.textColor : '#FF3B30' }]}>
                      {islem.tip === 'giris' ? '+' : '-'} {islem.tutar} ₺
                    </Text>
                  </View>
                ))
              )}
            </View>

          </ScrollView>

          {/* GİZLİ ASANSÖRLER */}
          <ParaGirisiFormu visible={entryVisible} onClose={() => setEntryVisible(false)} isDarkMode={isDarkMode} />
          <ParaCikisiFormu visible={exitVisible} onClose={() => setExitVisible(false)} isDarkMode={isDarkMode} />
          
          <DateRangeModal visible={dateModalVisible} onClose={() => setDateModalVisible(false)} onApply={handleTarihSorgula} isDarkMode={isDarkMode} />
          <KategoriSelectModal visible={kategoriModalVisible} onClose={() => setKategoriModalVisible(false)} onSelect={handleKategoriSec} isDarkMode={isDarkMode} />
          
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

  sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 15, marginLeft: 5 },
  filterScroll: { marginBottom: 20, paddingLeft: 5 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, justifyContent: 'center' },
  filterText: { fontSize: 13, fontWeight: 'bold' },

  listContainer: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 15, elevation: 2 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  listLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  listIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  listDate: { fontSize: 12, fontWeight: '500' },
  listAmount: { fontSize: 16, fontWeight: '900' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  rangeContent: { width: '85%', borderRadius: 25, padding: 25, elevation: 20 },
  rangeTitle: { fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 20, borderBottomWidth: 1.5, borderBottomColor: '#f0f0f0', paddingBottom: 15 },
  rangeLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 5 },
  rangeInputBox: { borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  rangeInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  rangeBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  rangeBtn: { width: '48%', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  rangeBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});