import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, Modal, SafeAreaView, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function StokYonetimListesi({ visible, onClose, isDarkMode }: any) {
  const [envanter, setEnvanter] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [arama, setArama] = useState('');
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const theme = {
    bg: isDarkMode ? '#121212' : '#F4F4F4',
    card: isDarkMode ? '#1E1E1E' : '#FFF',
    text: isDarkMode ? '#FFF' : '#1A1A1A',
    subText: isDarkMode ? '#AAA' : '#666',
    border: isDarkMode ? '#333' : '#EEE',
    primary: '#FF3B30'
  };

  const fetchEnvanter = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/stok/all`);
      const data = await res.json();
      if (data.success) setEnvanter(data.data);
    } catch (e) {
      console.error("Liste çekilemedi", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) fetchEnvanter();
  }, [visible]);

  const handleSil = (item: any) => {
    Alert.alert(
      "🛑 DİKKAT: KAYIT SİLİNİYOR",
      `${item.malzeme_adi} isimli ürünü envanterden KALICI olarak silmek istediğinize emin misiniz?`,
      [
        { text: "VAZGEÇ", style: "cancel" },
        { 
          text: "EVET, SİL", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/stok/delete/${item.id}`, { method: 'DELETE' });
              const data = await res.json();
              if (data.success) {
                Alert.alert("Başarılı", "Malzeme envanterden uçuruldu.");
                fetchEnvanter();
              }
            } catch (e) { Alert.alert("Hata", "Silme işlemi başarısız."); }
          }
        }
      ]
    );
  };

  const handleGuncelle = async () => {
    try {
      const res = await fetch(`${API_URL}/api/stok/update/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedItem,
          miktar: parseInt(selectedItem.miktar),
          alis_fiyati: parseFloat(selectedItem.alis_fiyati)
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditModalVisible(false);
        fetchEnvanter();
        Alert.alert("Başarılı", "Bilgiler güncellendi.");
      }
    } catch (e) { Alert.alert("Hata", "Güncelleme yapılamadı."); }
  };

  const filtrelenmişListe = useMemo(() => {
    return envanter.filter(i => 
      (i.malzeme_adi && i.malzeme_adi.toLowerCase().includes(arama.toLowerCase())) || 
      (i.barkod && i.barkod.includes(arama))
    );
  }, [arama, envanter]);

  if (!visible) return null;

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Ionicons name="arrow-back" size={28} color={theme.text} /></TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>STOK YÖNETİM LİSTESİ</Text>
          <TouchableOpacity onPress={fetchEnvanter}><Ionicons name="refresh" size={24} color={theme.primary} /></TouchableOpacity>
        </View>

        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.subText} />
          <TextInput 
            placeholder="Ara (İsim veya Barkod)..." 
            placeholderTextColor="#888"
            style={[styles.searchInput, { color: theme.text }]}
            value={arama}
            onChangeText={setArama}
          />
        </View>

        {loading ? <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} /> : (
          <FlatList 
            data={filtrelenmişListe}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{item.malzeme_adi}</Text>
                  <Text style={[styles.cardSub, { color: theme.subText }]}>{item.marka || 'Markasız'} | {item.barkod}</Text>
                  <Text style={[styles.cardStock, { color: item.miktar < 2 ? theme.primary : '#34C759' }]}>Stok: {item.miktar} Adet</Text>
                </View>
                <View style={styles.actionColumn}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => { setSelectedItem(item); setEditModalVisible(true); }}>
                    <Ionicons name="create" size={22} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleSil(item)}>
                    <Ionicons name="trash" size={22} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        <Modal visible={editModalVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.editContent, { backgroundColor: theme.card }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>KAYIT DÜZENLE</Text>
                <Text style={styles.inputLabel}>Malzeme Adı</Text>
                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={selectedItem?.malzeme_adi} onChangeText={(v) => setSelectedItem({...selectedItem, malzeme_adi: v})}/>
                <Text style={styles.inputLabel}>Marka</Text>
                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={selectedItem?.marka} onChangeText={(v) => setSelectedItem({...selectedItem, marka: v})}/>
                <Text style={styles.inputLabel}>Miktar</Text>
                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} keyboardType="numeric" value={selectedItem?.miktar?.toString()} onChangeText={(v) => setSelectedItem({...selectedItem, miktar: v})}/>
                <Text style={styles.inputLabel}>Alış Fiyatı (₺)</Text>
                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} keyboardType="numeric" value={selectedItem?.alis_fiyati?.toString()} onChangeText={(v) => setSelectedItem({...selectedItem, alis_fiyati: v})}/>
                <Text style={styles.inputLabel}>Barkod</Text>
                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: isDarkMode ? '#111' : '#f9f9f9' }]} value={selectedItem?.barkod} onChangeText={(v) => setSelectedItem({...selectedItem, barkod: v})}/>
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}><Text style={styles.btnText}>İPTAL</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleGuncelle}><Text style={styles.btnText}>KAYDET</Text></TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 10 },
  title: { fontSize: 18, fontWeight: '900' },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 10 },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 14 },
  card: { flexDirection: 'row', padding: 15, borderRadius: 18, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSub: { fontSize: 12, marginTop: 4 },
  cardStock: { fontSize: 13, fontWeight: '900', marginTop: 8 },
  actionColumn: { flexDirection: 'row' },
  editBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 10, marginRight: 8 },
  deleteBtn: { backgroundColor: '#FF3B30', padding: 10, borderRadius: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  editContent: { width: '90%', maxHeight: '80%', borderRadius: 25, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#888', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  cancelBtn: { flex: 1, backgroundColor: '#888', padding: 15, borderRadius: 12, marginRight: 10, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: '#34C759', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '900' }
});