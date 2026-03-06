import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Modal, ScrollView, SafeAreaView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ParaGirisiFormu from './ParaGirisiFormu';
import ParaCikisiFormu from './ParaCikisiFormu';

// GEÇİCİ MOTOR VERİSİ (DB Bağlanana Kadar Vitrini Doldurmak İçin)
const MOCK_HAREKETLER = [
  { id: 1, tip: 'giris', baslik: 'Cep Telefonu Tamiri (Usta 1)', tarih: '06.03.2026', tutar: '1.500,00' },
  { id: 2, tip: 'cikis', baslik: 'Stok Alımı - Anakart', tarih: '05.03.2026', tutar: '800,00' },
  { id: 3, tip: 'giris', baslik: 'Kasaya Nakit Girişi', tarih: '04.03.2026', tutar: '5.000,00' },
  { id: 4, tip: 'cikis', baslik: 'Genel Gider - Fatura', tarih: '02.03.2026', tutar: '1.250,00' },
  { id: 5, tip: 'giris', baslik: 'Satıştan Giriş - Kılıf', tarih: '01.03.2026', tutar: '450,00' },
];

export default function MaliIslemlerAnaEkran({ visible, onClose, isDarkMode }: any) {
  const [entryVisible, setEntryVisible] = useState(false);
  const [exitVisible, setExitVisible] = useState(false); 
  const [aktifFiltre, setAktifFiltre] = useState('son5');

  const theme = {
    bg: isDarkMode ? '#121212' : '#fdfdfd',
    cardBg: isDarkMode ? '#1e1e1e' : '#fff',
    borderColor: isDarkMode ? '#333' : '#eee',
    textColor: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    btnBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    activeFilterBg: isDarkMode ? '#fff' : '#1A1A1A',
    activeFilterText: isDarkMode ? '#1A1A1A' : '#fff',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
          
          {/* --- BAŞLIK --- */}
          <View style={styles.header}>
            <View style={[styles.titleBadge, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }]}>
              <Text style={styles.title}>MALİ İŞLEMLER</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={42} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
            
            {/* --- 1. ZİRVE: NET KASA VE TERAZİ --- */}
            <View style={[styles.summaryCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.summaryLabel, { color: theme.subText }]}>NET KASA DURUMU</Text>
              <Text style={[styles.netKasaText, { color: theme.textColor }]}>24.500,00 ₺</Text>
              
              <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
              
              <View style={styles.teraziRow}>
                <View style={styles.teraziCol}>
                  <Text style={[styles.teraziLabel, { color: theme.subText }]}>TOPLAM GİREN</Text>
                  {/* Yeşili sildik, giren para ağırbaşlı siyah/beyaz formatta */}
                  <Text style={[styles.teraziValue, { color: theme.textColor }]}>+ 31.950,00 ₺</Text>
                </View>
                <View style={styles.teraziColRight}>
                  <Text style={[styles.teraziLabel, { color: theme.subText }]}>TOPLAM ÇIKAN</Text>
                  {/* Çıkan para senin mühürlediğin gibi cayır cayır kırmızı */}
                  <Text style={[styles.teraziValue, { color: '#FF3B30' }]}>- 7.450,00 ₺</Text>
                </View>
              </View>
            </View>

            {/* --- 2. MOTORLAR: GİRİŞ VE ÇIKIŞ BUTONLARI --- */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]} onPress={() => setEntryVisible(true)}>
                <View style={[styles.iconCircle, { backgroundColor: theme.btnBg }]}>
                  <Ionicons name="arrow-down" size={24} color={theme.textColor} />
                </View>
                <Text style={[styles.actionBtnText, { color: theme.textColor }]}>PARA GİRİŞİ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]} onPress={() => setExitVisible(true)}>
                <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="arrow-up" size={24} color="#FF3B30" />
                </View>
                <Text style={[styles.actionBtnText, { color: '#FF3B30' }]}>PARA ÇIKIŞI</Text>
              </TouchableOpacity>
            </View>

            {/* --- 3. ŞALTER: FİLTRELER --- */}
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>HAREKET SORGULAMA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity style={[styles.filterPill, aktifFiltre === 'son5' ? { backgroundColor: theme.activeFilterBg } : { backgroundColor: theme.btnBg }]} onPress={() => setAktifFiltre('son5')}>
                <Text style={[styles.filterText, aktifFiltre === 'son5' ? { color: theme.activeFilterText } : { color: theme.subText }]}>Son 5 Hareket</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterPill, aktifFiltre === '7gun' ? { backgroundColor: theme.activeFilterBg } : { backgroundColor: theme.btnBg }]} onPress={() => setAktifFiltre('7gun')}>
                <Text style={[styles.filterText, aktifFiltre === '7gun' ? { color: theme.activeFilterText } : { color: theme.subText }]}>7 Günlük</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterPill, aktifFiltre === '1ay' ? { backgroundColor: theme.activeFilterBg } : { backgroundColor: theme.btnBg }]} onPress={() => setAktifFiltre('1ay')}>
                <Text style={[styles.filterText, aktifFiltre === '1ay' ? { color: theme.activeFilterText } : { color: theme.subText }]}>1 Aylık</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterPill, { backgroundColor: theme.btnBg, flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name="calendar-outline" size={16} color={theme.subText} style={{ marginRight: 5 }} />
                <Text style={[styles.filterText, { color: theme.subText }]}>Tarih Seç</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* --- 4. ZEMİN: SON HAREKETLER DEFTERİ --- */}
            <View style={[styles.listContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              {MOCK_HAREKETLER.map((islem, index) => (
                <View key={islem.id} style={[styles.listItem, index !== MOCK_HAREKETLER.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.borderColor }]}>
                  <View style={styles.listLeft}>
                    <View style={[styles.listIconBox, { backgroundColor: islem.tip === 'giris' ? theme.btnBg : '#FFEBEE' }]}>
                      <Ionicons name={islem.tip === 'giris' ? "add" : "remove"} size={20} color={islem.tip === 'giris' ? theme.textColor : '#FF3B30'} />
                    </View>
                    <View>
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

          {/* FORMLARA GEÇİŞ KÖPRÜLERİ */}
          <ParaGirisiFormu visible={entryVisible} onClose={() => setEntryVisible(false)} isDarkMode={isDarkMode} />
          <ParaCikisiFormu visible={exitVisible} onClose={() => setExitVisible(false)} isDarkMode={isDarkMode} />
          
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
  actionBtn: { width: '48%', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 18, borderWidth: 1, elevation: 2 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  actionBtnText: { fontSize: 13, fontWeight: '900' },

  sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 15, marginLeft: 5 },
  filterScroll: { marginBottom: 20, paddingLeft: 5 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 10, justifyContent: 'center' },
  filterText: { fontSize: 13, fontWeight: 'bold' },

  listContainer: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 15, elevation: 2 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  listLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  listIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  listDate: { fontSize: 12, fontWeight: '500' },
  listAmount: { fontSize: 16, fontWeight: '900' }
});