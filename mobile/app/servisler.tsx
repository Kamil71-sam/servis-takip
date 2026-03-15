import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, StatusBar, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// api.ts bağlantısı (Müdür: deleteService'i buradan tamamen sildik, sadece işimize yarayanlar var)
import { getServices, updateService } from '../services/api';

export default function ServisListesi() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDarkMode = params.theme === 'dark';

  const [servisler, setServisler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // DÜZENLEME MODALI
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    issue_text: '', status: '', atanan_usta: '', offer_price: '', musteri_notu: ''
  });

  // MÜDÜR: STATÜ (DURUM) MODALI
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedForStatus, setSelectedForStatus] = useState<any>(null);

  const theme = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    cardBg: isDarkMode ? '#1e1e1e' : '#FDFDFD',
    textColor: isDarkMode ? '#FFFFFF' : '#1E1E1E',
    subText: isDarkMode ? '#AAAAAA' : '#666666',
    borderColor: isDarkMode ? '#333333' : '#E0E0E0',
    primary: '#FF3B30',
    antrasit: isDarkMode ? '#DDDDDD' : '#333333',
    inputBg: isDarkMode ? '#2c2c2c' : '#F9F9F9',
    success: '#34C759', // Yeşil (Hazır)
    warning: '#FF9500', // Turuncu (Bekliyor)
    info: '#007AFF', // Mavi (İşlemde)
    archive: '#8E8E93' // Gri (Teslim/İptal)
  };

  const fetchServisler = async () => {
    try {
      setLoading(true);
      const data = await getServices();
      // MÜDÜR: Arşive kalkanları (Pasif, Teslim Edildi, İptal Edildi) listeden gizliyoruz
      const aktifServisler = (data || []).filter((s: any) => {
        const d = s.durum || '';
        return !d.includes('PASIF') && !d.includes('Teslim Edildi') && !d.includes('İptal Edildi');
      });
      setServisler(aktifServisler);
    } catch (error) {
      console.log('Yükleme hatası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServisler(); }, []);

  const handleEditPress = (item: any) => {
    setSelectedService(item);
    setEditForm({
      issue_text: item.ariza || '',
      status: item.durum || 'Yeni Kayıt',
      atanan_usta: item.usta || '',
      offer_price: item.price?.toString() || '',
      musteri_notu: item.eklenen_notlar || ''
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      await updateService(selectedService.id, editForm);
      Alert.alert("Başarılı", "Servis kaydı güncellendi.");
      setModalVisible(false);
      fetchServisler();
    } catch (error) {
      Alert.alert("Hata", "Güncelleme yapılamadı.");
    }
  };

  // MÜDÜR: YENİ DURUM DEĞİŞTİRME FONKSİYONU
  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateService(selectedForStatus.id, { status: newStatus });
      setStatusModalVisible(false);
      
      const isArchive = newStatus === 'Teslim Edildi' || newStatus === 'İptal Edildi';
      Alert.alert(
        "Durum Güncellendi", 
        isArchive ? `Cihaz "${newStatus}" olarak işaretlendi ve arşive kaldırıldı.` : `Cihazın durumu "${newStatus}" yapıldı.`,
        [{ text: "Tamam", onPress: () => fetchServisler() }]
      );
    } catch (error) {
      Alert.alert("Hata", "Durum güncellenemedi.");
    }
  };

  const openStatusModal = (item: any) => {
    setSelectedForStatus(item);
    setStatusModalVisible(true);
  };

  const filtered = (servisler || []).filter((s: any) => {
    const val = search.toLowerCase().trim();
    return (s.musteri_adi || "").toLowerCase().includes(val) || 
           (s.marka_model || "").toLowerCase().includes(val) || 
           (s.plaka || "").toLowerCase().includes(val);
  });

  const getStatusColor = (status: string) => {
    if (status === 'Yeni Kayıt') return theme.primary;
    if (status === 'Teşhis Kondu' || status === 'Parça Bekliyor') return theme.warning;
    if (status === 'Onaylandı') return theme.info;
    if (status === 'Hazır') return theme.success;
    return theme.antrasit;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>Servis Kayıtları</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={35} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
        <Ionicons name="search-outline" size={20} color={theme.subText} />
        <TextInput 
          style={[styles.input, { color: theme.textColor }]} 
          placeholder="İsim, cihaz veya servis no ara..." 
          placeholderTextColor={theme.subText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? ( <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} /> ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <View style={styles.cardMain}>
                <Text style={[styles.name, { color: theme.textColor }]}>{(item.musteri_adi || "İSİMSİZ").toUpperCase()}</Text>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.durum) }]}>
                  <Text style={styles.statusBadgeText}>{item.durum || 'Yeni Kayıt'}</Text>
                </View>

                <View style={styles.infoLine}>
                  <Ionicons name="hardware-chip-outline" size={14} color={theme.primary} />
                  <Text style={[styles.cardText, { color: theme.textColor }]}> {item.marka_model || '-'}</Text>
                </View>
                <View style={styles.infoLine}>
                  <Ionicons name="receipt-outline" size={14} color={theme.subText} />
                  <Text style={[styles.cardText, { color: theme.subText }]}> No: {item.plaka || '-'}</Text>
                </View>
                <View style={styles.infoLine}>
                  <Ionicons name="calendar-outline" size={14} color={theme.subText} />
                  <Text style={[styles.cardText, { color: theme.subText }]}> {item.tarih || '-'}</Text>
                </View>
              </View>

              <View style={styles.actionCol}>
                <TouchableOpacity style={styles.actionRow} onPress={() => handleEditPress(item)}>
                  <Text style={[styles.actionLabel, { color: theme.antrasit }]}>Düzenle</Text>
                  <Ionicons name="create" size={20} color={theme.antrasit} />
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                
                <TouchableOpacity style={styles.actionRow} onPress={() => openStatusModal(item)}>
                  <Text style={[styles.actionLabel, { color: theme.info }]}>Durum Değiş</Text>
                  <Ionicons name="swap-horizontal" size={20} color={theme.info} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* DÜZENLEME MODALI */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>Servis Düzenle</Text>
              
              <View style={[styles.deviceBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                <Text style={styles.deviceLabel}>DÜZENLENEN CİHAZ</Text>
                <Text style={[styles.deviceText, { color: theme.textColor }]}>
                  {selectedService?.cihaz_tipi} - {selectedService?.marka_model}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>arıza şikayeti</Text>
                <TextInput style={[styles.modalInput, { color: theme.textColor, borderColor: theme.borderColor }]}
                  value={editForm.issue_text} onChangeText={(t) => setEditForm({...editForm, issue_text: t})} multiline />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>müşteri notu</Text>
                <TextInput style={[styles.modalInput, { color: theme.textColor, borderColor: theme.borderColor }]}
                  value={editForm.musteri_notu} onChangeText={(t) => setEditForm({...editForm, musteri_notu: t})} multiline />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>atanan usta</Text>
                <TextInput style={[styles.modalInput, { color: theme.textColor, borderColor: theme.borderColor }]}
                  value={editForm.atanan_usta} onChangeText={(t) => setEditForm({...editForm, atanan_usta: t})} />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.borderColor }]} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: theme.textColor, fontWeight: '600' }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleUpdate}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Güncelle</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MÜDÜR: DURUM (STATÜ) DEĞİŞTİRME MODALI (Ayakları Toparlandı) */}
      <Modal visible={statusModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.statusModalContent, { backgroundColor: theme.bg }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor, marginBottom: 5 }]}>Durum Güncelle</Text>
            <Text style={[styles.statusSubTitle, { color: theme.subText }]}>{selectedForStatus?.marka_model}</Text>

            {/* Müdür: flexShrink: 1 ekledik ki ekran daralırsa ScrollView boyundan fedakarlık etsin, alt tarafı dışarı itmesin */}
            <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingVertical: 5 }} showsVerticalScrollIndicator={false}>
              {[
                { label: 'Yeni Kayıt', color: theme.primary },
                { label: 'Teşhis Kondu', color: theme.warning },
                { label: 'Onaylandı', color: theme.info },
                { label: 'Parça Bekliyor', color: theme.warning },
                { label: 'Hazır', color: theme.success },
              ].map((s, idx) => (
                <TouchableOpacity key={idx} style={[styles.statusOptionRow, { borderColor: theme.borderColor }]} onPress={() => handleStatusChange(s.label)}>
                  <View style={[styles.statusDot, { backgroundColor: s.color }]} />
                  <Text style={[styles.statusOptionText, { color: theme.textColor }]}>{s.label}</Text>
                  {selectedForStatus?.durum === s.label && <Ionicons name="checkmark-circle" size={22} color={s.color} />}
                </TouchableOpacity>
              ))}

              <View style={[styles.divider, { backgroundColor: theme.borderColor, marginVertical: 10 }]} />
              
              <Text style={{ fontSize: 11, color: theme.subText, textAlign: 'center', marginBottom: 10 }}>Aşağıdaki işlemler cihazı arşive kaldırır</Text>
              
              <TouchableOpacity style={[styles.statusOptionRow, { borderColor: theme.borderColor }]} onPress={() => handleStatusChange('Teslim Edildi')}>
                <View style={[styles.statusDot, { backgroundColor: theme.archive }]} />
                <Text style={[styles.statusOptionText, { color: theme.textColor, fontWeight: 'bold' }]}>Teslim Edildi (İşi Kapat)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.statusOptionRow, { borderColor: theme.borderColor, borderBottomWidth: 0 }]} onPress={() => handleStatusChange('İptal Edildi')}>
                <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.statusOptionText, { color: theme.primary, fontWeight: 'bold' }]}>İptal Edildi (İşi Kapat)</Text>
              </TouchableOpacity>

            </ScrollView>

            <TouchableOpacity style={[styles.closeModalBtn, { backgroundColor: theme.inputBg }]} onPress={() => setStatusModalVisible(false)}>
              <Text style={{ color: theme.textColor, fontWeight: '600' }}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, height: 45, borderRadius: 10, marginBottom: 15, borderWidth: 1 },
  input: { flex: 1, marginLeft: 6, fontSize: 15 },
  card: { flexDirection: 'row', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, alignItems: 'center', minHeight: 120 },
  cardMain: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, marginBottom: 8 },
  statusBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  infoLine: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  cardText: { fontSize: 12, marginLeft: 4 },
  actionCol: { alignItems: 'flex-end', borderLeftWidth: 1, paddingLeft: 12, marginLeft: 8, justifyContent: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  actionLabel: { fontSize: 10, marginRight: 6, fontWeight: '700', textTransform: 'uppercase' },
  divider: { height: 1, width: '100%', marginVertical: 6, opacity: 0.2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 22, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  deviceBox: { padding: 12, borderRadius: 10, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#FF3B30', borderWidth: 1 },
  deviceLabel: { fontSize: 10, color: '#888', fontWeight: 'bold', marginBottom: 3 },
  deviceText: { fontSize: 14, fontWeight: '700' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', fontWeight: 'bold' },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  btn: { flex: 0.48, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // MÜDÜR: Statü Modalı Stilleri (Burayı Toparladık)
  statusModalContent: { 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25, // iPhone'un alt çizgisine çarpmasın diye pay verdik
    maxHeight: '75%' // Kesin limit koyduk, daha fazla büyümez!
  },
  statusSubTitle: { fontSize: 12, textAlign: 'center', fontWeight: 'bold', marginBottom: 10 },
  statusOptionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  statusOptionText: { flex: 1, fontSize: 15, fontWeight: '500' },
  closeModalBtn: { marginTop: 15, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});