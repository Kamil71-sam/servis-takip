import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, Linking, StatusBar, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// MÜDÜR: Update ve Delete fonksiyonlarını da çağırdık
import { getFirms, updateFirm, deleteFirm } from '../services/api';

export default function FirmalarSayfasi() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDarkMode = params.theme === 'dark';

  const [firmalar, setFirmalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // --- EKLENEN KISIM: MODAL VE GÜNCELLEME STATELERİ ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    firma_adi: '', yetkili_ad_soyad: '', telefon: '', eposta: '', vergi_no: '', adres: ''
  });

  const theme = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    card: isDarkMode ? '#1e1e1e' : '#FDFDFD',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    sub: isDarkMode ? '#AAAAAA' : '#666666',
    input: isDarkMode ? '#2c2c2c' : '#F9F9F9',
    border: isDarkMode ? '#333333' : '#E0E0E0',
    icon: isDarkMode ? '#ffffff' : '#444444', 
    primary: '#FF3B30',
    antrasit: isDarkMode ? '#DDDDDD' : '#333333'
  };

  const fetchFirmalar = async () => {
    try {
      setLoading(true);
      const data = await getFirms(); 
      
      const siraliData = (data || []).sort((a: any, b: any) => {
        const nameA = (a.firma_adi || "").toLocaleLowerCase('tr');
        const nameB = (b.firma_adi || "").toLocaleLowerCase('tr');
        return nameA.localeCompare(nameB, 'tr');
      });
      
      setFirmalar(siraliData as never[]);
    } catch (e) { 
      console.log("Bağlantı hatası:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchFirmalar(); 
  }, []);

  // --- EKLENEN KISIM: DÜZENLEME VE SİLME FONKSİYONLARI ---
  const handleEditPress = (item: any) => {
    setSelectedFirm(item);
    setEditForm({
      firma_adi: item.firma_adi || '',
      yetkili_ad_soyad: item.yetkili_ad_soyad || '',
      telefon: item.telefon || '',
      eposta: item.eposta || '',
      vergi_no: item.vergi_no || '',
      adres: item.adres || ''
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editForm.firma_adi) {
      Alert.alert("Uyarı", "Firma ünvanı boş bırakılamaz!");
      return;
    }
    try {
      await updateFirm(selectedFirm.id, editForm);
      Alert.alert("Başarılı", "Firma bilgileri güncellendi.");
      setModalVisible(false);
      fetchFirmalar();
    } catch (error) {
      Alert.alert("Hata", "Sunucu hatası: Bilgiler güncellenemedi.");
    }
  };



const handleDelete = (id: number, name: string) => {
    Alert.alert("Kayıt Silme", `${name} silinecek. Emin misiniz?`, [
      { text: "Vazgeç", style: "cancel" },
      { text: "SİL", style: "destructive", onPress: async () => {
          try {
            const res = await deleteFirm(id);
            if (res && res.success === false) { 
              Alert.alert("Hata", res.message); 
            } else { 
              // MÜDÜR: Ekranda uyarı kalır, 'Tamam'a basınca liste yenilenir.
              Alert.alert("Başarılı", "Firma kaydı sistemden başarıyla silindi.", [
                { text: "Tamam", onPress: () => fetchFirmalar() }
              ]);
            }
          } catch (e) { Alert.alert("Hata", "Silme işlemi yapılamadı."); }
      }}
    ]);
  };

  







  const filtered = firmalar.filter((f: any) => {
    const s = search.toLowerCase().trim();
    return (
      (f.firma_adi || "").toLowerCase().includes(s) || 
      (f.yetkili_ad_soyad || "").toLowerCase().includes(s) ||
      (f.telefon || "").includes(s)
    );
  });

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* SOL TARAF: BİLGİLER */}
      <View style={styles.cardMain}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.text }]}>
            {(item.firma_adi || "İsimsiz Firma").toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.infoRow} 
          onPress={() => item.telefon && Linking.openURL(`tel:${item.telefon}`)}
        >
          <Ionicons name="call-outline" size={16} color={theme.primary} style={styles.icon} />
          <Text style={[styles.text, { color: theme.text }]}>{item.telefon || '-'}</Text>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={theme.sub} style={styles.icon} />
          <Text style={[styles.text, { color: theme.sub }]}>Yetkili: {item.yetkili_ad_soyad || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={theme.sub} style={styles.icon} />
          <Text style={[styles.text, { color: theme.sub }]} numberOfLines={1}>{item.adres || '-'}</Text>
        </View>
      </View>

      {/* SAĞ TARAF: AKSİYON BUTONLARI */}
      <View style={styles.actionCol}>
        <TouchableOpacity style={styles.actionRow} onPress={() => handleEditPress(item)}>
          <Text style={[styles.actionLabel, { color: theme.antrasit }]}>Kayıt Düzenle</Text>
          <Ionicons name="create" size={22} color={theme.antrasit} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <TouchableOpacity style={styles.actionRow} onPress={() => handleDelete(item.id, item.firma_adi)}>
          <Text style={[styles.actionLabel, { color: theme.primary }]}>Kayıt Silme</Text>
          <Ionicons name="trash" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Firma Listesi</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={38} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.input, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={20} color={theme.sub} />
        <TextInput 
          style={[styles.searchTextInput, { color: theme.text }]} 
          placeholder="Firma veya yetkili ara..." 
          placeholderTextColor={theme.sub}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* --- EKLENEN KISIM: 6 KUTULU MODAL --- */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Firma Düzenle</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>firma ünvanı</Text>
                <TextInput style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
                  value={editForm.firma_adi} onChangeText={(t) => setEditForm({...editForm, firma_adi: t})} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>yetkili ad soyad</Text>
                <TextInput style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
                  value={editForm.yetkili_ad_soyad} onChangeText={(t) => setEditForm({...editForm, yetkili_ad_soyad: t})} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>telefon</Text>
                <TextInput style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
                  value={editForm.telefon} onChangeText={(t) => setEditForm({...editForm, telefon: t})} keyboardType="phone-pad" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>e-posta</Text>
                <TextInput style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
                  value={editForm.eposta} onChangeText={(t) => setEditForm({...editForm, eposta: t})} keyboardType="email-address" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>vergi numarası</Text>
                <TextInput style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
                  value={editForm.vergi_no} onChangeText={(t) => setEditForm({...editForm, vergi_no: t})} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>adres</Text>
                <TextInput style={[styles.modalInput, { color: theme.text, borderColor: theme.border, height: 70 }]}
                  value={editForm.adres} onChangeText={(t) => setEditForm({...editForm, adres: t})} multiline />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.border }]} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: theme.text, fontWeight: '600' }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleUpdate}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Güncelle</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 45, borderRadius: 10, marginBottom: 15, borderWidth: 1 },
  searchTextInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  
  // KART VE AKSİYON STİLLERİ
  card: { flexDirection: 'row', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, alignItems: 'center', minHeight: 110 },
  cardMain: { flex: 1, justifyContent: 'center' },
  nameRow: { marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 10, width: 18 },
  text: { fontSize: 13, fontWeight: '400' },
  actionCol: { alignItems: 'flex-end', borderLeftWidth: 1, paddingLeft: 12, marginLeft: 8, justifyContent: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  actionLabel: { fontSize: 11, marginRight: 6, fontWeight: '600' },
  divider: { height: 1, width: '100%', marginVertical: 6, opacity: 0.3 },

  // MODAL STİLLERİ
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 22, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: '#888', marginBottom: 4, marginLeft: 2 },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  btn: { flex: 0.48, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }
});