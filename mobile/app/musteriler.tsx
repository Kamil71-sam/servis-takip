import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, StatusBar, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// api.ts bağlantısı
import { getCustomers, updateCustomer, deleteCustomer } from '../services/api';

export default function MusterilerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDarkMode = params.theme === 'dark';

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // MÜDÜR: Veritabanındaki 5 sütun eksiksiz tanımlandı (Undefined çökmesini engeller)
  const [editForm, setEditForm] = useState({
    name: '', phone: '', fax: '', email: '', address: ''
  });

  const theme = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    cardBg: isDarkMode ? '#1e1e1e' : '#FDFDFD',
    textColor: isDarkMode ? '#FFFFFF' : '#1E1E1E',
    subText: isDarkMode ? '#AAAAAA' : '#666666',
    borderColor: isDarkMode ? '#333333' : '#E0E0E0',
    primary: '#FF3B30',
    antrasit: isDarkMode ? '#DDDDDD' : '#333333',
    inputBg: isDarkMode ? '#2c2c2c' : '#F9F9F9'
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers((data || []).filter((c: any) => c.musteri_turu !== 'kurumsal'));
    } catch (error) { 
      console.log('Yükleme hatası'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  const handleEditPress = (item: any) => {
    setSelectedCustomer(item);
    // Modal açıldığında undefined kalmasın diye hepsine || '' eklendi
    setEditForm({
      name: item.name || '',
      phone: item.phone || '',
      fax: item.fax || '',
      email: item.email || '',
      address: item.address || ''
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editForm.name) {
      Alert.alert("Uyarı", "Müşteri adı boş bırakılamaz!");
      return;
    }
    try {
      // Bütün veriler eksiksiz gidiyor, backend çökmeyecek
      await updateCustomer(selectedCustomer.id, editForm);
      Alert.alert("Başarılı", "Müşteri bilgileri güncellendi.");
      setModalVisible(false);
      loadCustomers();
    } catch (error) {
      Alert.alert("Hata", "Sunucu hatası: Bilgiler güncellenemedi.");
    }
  };



const handleDelete = (id: number, name: string) => {
    Alert.alert("Kayıt Silme", `${name} silinecek. Emin misiniz?`, [
      { text: "Vazgeç", style: "cancel" },
      { text: "SİL", style: "destructive", onPress: async () => {
          try {
            const res = await deleteCustomer(id);
            if (res && res.success === false) { 
              Alert.alert("Hata", res.message); 
            } else { 
              // MÜDÜR: Ekranda uyarı kalır, 'Tamam'a basınca liste yenilenir.
              Alert.alert("Başarılı", "Müşteri kaydı sistemden başarıyla silindi.", [
                { text: "Tamam", onPress: () => loadCustomers() }
              ]);
            }
          } catch (e) { Alert.alert("Hata", "Silme işlemi yapılamadı."); }
      }}
    ]);
  };


  









  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>Müşteri Listesi</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={35} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
        <Ionicons name="search-outline" size={20} color={theme.subText} />
        <TextInput 
          style={[styles.input, { color: theme.textColor }]} 
          placeholder="İsim veya telefon ara..." 
          placeholderTextColor={theme.subText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? ( <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} /> ) : (
        <FlatList
          data={customers.filter(c => (c.name || "").toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <View style={styles.cardMain}>
                <Text style={[styles.name, { color: theme.textColor }]}>{item.name}</Text>
                <View style={styles.infoLine}>
                  <Ionicons name="call" size={15} color={theme.primary} />
                  <Text style={[styles.cardText, { color: theme.textColor }]}> {item.phone || '-'}</Text>
                </View>
                <View style={styles.infoLine}>
                  <Ionicons name="location" size={15} color={theme.subText} />
                  <Text style={[styles.cardText, { color: theme.subText }]} numberOfLines={1}> {item.address || '-'}</Text>
                </View>
              </View>

              <View style={styles.actionCol}>
                <TouchableOpacity style={styles.actionRow} onPress={() => handleEditPress(item)}>
                  <Text style={[styles.actionLabel, { color: theme.antrasit }]}>Kayıt Düzenle</Text>
                  <Ionicons name="create" size={22} color={theme.antrasit} />
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                <TouchableOpacity style={styles.actionRow} onPress={() => handleDelete(item.id, item.name)}>
                  <Text style={[styles.actionLabel, { color: theme.primary }]}>Kayıt Silme</Text>
                  <Ionicons name="trash" size={22} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* MÜDÜR: 5 Kutulu Eksiksiz Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>Müşteri Düzenle</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ad soyad</Text>
                <TextInput style={[styles.modalInput, { color: theme.textColor, borderColor: theme.borderColor }]}
                  value={editForm.name} onChangeText={(t) => setEditForm({...editForm, name: t})} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>telefon</Text>
                <TextInput style={[styles.modalInput, { color: theme.textColor, borderColor: theme.borderColor }]}
                  value={editForm.phone} onChangeText={(t) => setEditForm({...editForm, phone: t})} keyboardType="phone-pad" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>faks</Text>
                <TextInput style={[styles.modalInput, { color: theme.textColor, borderColor: theme.borderColor }]}
                  value={editForm.fax} onChangeText={(t) => setEditForm({...editForm, fax: t})} keyboardType="phone-pad" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>e-posta</Text>
                <TextInput style={[styles.modalInput, { color: theme.textColor, borderColor: theme.borderColor }]}
                  value={editForm.email} onChangeText={(t) => setEditForm({...editForm, email: t})} keyboardType="email-address" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>adres</Text>
                <TextInput style={[styles.modalInput, { color: theme.textColor, borderColor: theme.borderColor, height: 70 }]}
                  value={editForm.address} onChangeText={(t) => setEditForm({...editForm, address: t})} multiline />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, height: 45, borderRadius: 10, marginBottom: 15, borderWidth: 1 },
  input: { flex: 1, marginLeft: 6, fontSize: 15 },
  
  // ORTA BOY KART STİLLERİ (Senin beğendiğin tam ayar)
  card: { flexDirection: 'row', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, alignItems: 'center', minHeight: 110 },
  cardMain: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  infoLine: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  cardText: { fontSize: 13, marginLeft: 4 },
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