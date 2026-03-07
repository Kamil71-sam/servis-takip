import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, SafeAreaView, Platform, TextInput, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// DEPOYA SON GİREN 5 ÜRÜNÜN SİMÜLASYONU
const sonGelenler = [
  { id: '1', isim: 'iPhone 13 Ekran', marka: 'Apple (Orijinal)', miktar: '10 Adet', tarih: 'Bugün 10:45', usta: 'Ahmet Usta' },
  { id: '2', isim: 'Samsung S22 Batarya', marka: 'Samsung', miktar: '25 Adet', tarih: 'Dün 16:20', usta: 'Mehmet Usta' },
  { id: '3', isim: 'Type-C Şarj Soketi', marka: 'Muadil', miktar: '100 Adet', tarih: '05.03.2026', usta: 'Stok' },
  { id: '4', isim: 'Termal Macun 5g', marka: 'Arctic', miktar: '5 Adet', tarih: '04.03.2026', usta: 'Ali Usta' },
  { id: '5', isim: 'ThinkPad Klavye', marka: 'Lenovo', miktar: '2 Adet', tarih: '02.03.2026', usta: 'Ahmet Usta' },
];

export default function StokTakibiAnaEkran({ visible, onClose, isDarkMode = false }: any) {
  const [aramaMetni, setAramaMetni] = useState('');

  // TEMA MOTORU
  const theme = {
    bg: isDarkMode ? '#121212' : '#f4f6f8',
    cardBg: isDarkMode ? '#1e1e1e' : '#fff',
    borderColor: isDarkMode ? '#333' : '#e0e0e0',
    textColor: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    primary: '#007AFF', // Depo Mavi Teması
    barcodeBg: isDarkMode ? '#2c2c2c' : '#1A1A1A', 
  };

  // KORUMA: Görünmezse motoru yorma
  if (!visible) return null;

  return (
    <Modal visible={true} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
          
          {/* BAŞLIK VE KAPATMA (X) / YAZICI İKONU */}
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
                <Ionicons name="close-circle" size={42} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            
            {/* BARKOD RADARI (KAMERA BUTONU) */}
            <TouchableOpacity style={[styles.barcodeBox, { backgroundColor: theme.barcodeBg }]} activeOpacity={0.8}>
              <View style={styles.barcodeIconWrapper}>
                <Ionicons name="barcode-outline" size={40} color="#fff" />
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={12} color="#1A1A1A" />
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.barcodeTitle}>BARKOD OKUT (KAMERA)</Text>
                <Text style={styles.barcodeSub}>Cihaz ile Hızlı Giriş / Çıkış / Düzenleme</Text>
              </View>
              <Ionicons name="scan" size={28} color={theme.primary} />
            </TouchableOpacity>

            {/* HIZLI İŞLEMLER (DÜĞMELER) */}
            <Text style={[styles.sectionTitle, { color: theme.subText }]}>HIZLI İŞLEMLER</Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                  <Ionicons name="add-circle" size={28} color="#34C759" />
                </View>
                <Text style={[styles.actionBtnText, { color: theme.textColor }]}>Stok Girişi</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                  <Ionicons name="remove-circle" size={28} color="#FF3B30" />
                </View>
                <Text style={[styles.actionBtnText, { color: theme.textColor }]}>Stok Çıkışı</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}>
                  <Ionicons name="clipboard" size={28} color="#007AFF" />
                </View>
                <Text style={[styles.actionBtnText, { color: theme.textColor }]}>Usta Talepleri</Text>
              </TouchableOpacity>
            </View>

            {/* DETAYLI ARAMA */}
            <View style={[styles.searchContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Ionicons name="search" size={22} color={theme.subText} style={{ marginRight: 10 }} />
              <TextInput 
                style={[styles.searchInput, { color: theme.textColor }]}
                placeholder="Parça No, Cihaz, Marka ara..."
                placeholderTextColor={theme.subText}
                value={aramaMetni}
                onChangeText={setAramaMetni}
                returnKeyType="search"
              />
              <TouchableOpacity style={[styles.searchFilterBtn, { backgroundColor: theme.primary }]}>
                <Ionicons name="options" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* SON GELENLER LİSTESİ */}
            <View style={styles.listHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.subText, marginTop: 0 }]}>SON GELEN 5 MALZEME</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>

            {sonGelenler.map((item) => (
              <View key={item.id} style={[styles.listItem, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <View style={styles.listIconBox}>
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
                <View style={styles.listBadge}>
                  <Text style={styles.listBadgeText}>{item.miktar}</Text>
                </View>
              </View>
            ))}

          </ScrollView>
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
  
  barcodeBox: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 25, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10 },
  barcodeIconWrapper: { position: 'relative' },
  cameraBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#007AFF', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1A1A1A' },
  barcodeTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  barcodeSub: { color: '#aaa', fontSize: 12, fontWeight: '500', marginTop: 3 },

  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12, marginTop: 10 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 15, paddingHorizontal: 5, borderRadius: 16, borderWidth: 1.5, marginHorizontal: 4 },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionBtnText: { fontSize: 12, fontWeight: '800', textAlign: 'center' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingLeft: 15, paddingRight: 5, paddingVertical: 5, borderRadius: 16, borderWidth: 1.5, marginBottom: 30 },
  searchInput: { flex: 1, height: 45, fontSize: 15, fontWeight: '600' },
  searchFilterBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAllText: { fontSize: 13, fontWeight: '800' },
  
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1.5, marginBottom: 12 },
  listIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listContent: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  listBrand: { fontSize: 13, fontWeight: '600', marginBottom: 5 },
  listSubRow: { flexDirection: 'row', alignItems: 'center' },
  listDate: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
  listBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  listBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});