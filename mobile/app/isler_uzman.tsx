import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal, 
  ScrollView,
  StatusBar,
  useColorScheme,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUzmanTumIsler, updateServiceProcess } from '../services/api_uzman';

// MÜDÜR: YENİ STOK TALEP MODALI BURAYA EKLENDİ
import UstaStokTalepModali from '../components/UstaStokTalepModali';

interface Task {
  id: string;
  servis_no?: string;
  status: string;
  durum?: string;
  issue: string;
  cihaz_turu?: string;
  marka_model?: string;
  seri_no?: string;
  musteri_notu?: string;
  customer?: string; 
  created_at?: string;
}

export default function IslerUzman() {
  const router = useRouter();
  
  const params = useLocalSearchParams();
  const systemTheme = useColorScheme();
  
  const isDarkMode = params.theme ? params.theme === 'dark' : systemTheme === 'dark';
  const filterMode = params.filterMode; 

  const theme = {
    bg: isDarkMode ? '#121212' : '#F4F4F4',
    cardBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    subText: isDarkMode ? '#AAAAAA' : '#666666',
    borderColor: isDarkMode ? '#333333' : '#E0E0E0',
    primary: '#FF3B30',
    inputBg: isDarkMode ? '#2C2C2C' : '#FFFFFF',
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prices, setPrices] = useState<{[key: string]: string}>({}); 
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [stokModalVisible, setStokModalVisible] = useState(false);
  const [currentTaskForStok, setCurrentTaskForStok] = useState<Task | null>(null);

  // 🚨 MÜDÜR: FİYAT RADARI STATELERİ 🚨
  const [fiyatModalVisible, setFiyatModalVisible] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [aramaSonuclari, setAramaSonuclari] = useState<any[]>([]);
  const [araniyor, setAraniyor] = useState(false);

  const ustaAdi = 'Usta_1'; 
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await getUzmanTumIsler(ustaAdi); 
      if (res && res.success) {
        setTasks(res.data || []); 
      }
    } catch (err) {
      console.error("Liste yükleme hatası:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (item: Task, nextStatus: string) => {
    const price = prices[item.id];
    
    if (nextStatus === 'Onay Bekliyor' && !price) {
      Alert.alert("Hata", "Müşteriye iletilecek fiyatı giriniz.");
      return;
    }

    if (nextStatus === 'Parça Bekliyor') {
      const startSiparisHazirla = () => {
          setCurrentTaskForStok(item);
          setTimeout(() => {
            setStokModalVisible(true);
          }, 50);
      };

      if (Platform.OS === 'web') {
        if (window.confirm("Bu cihaz için sipariş listesini oluşturmak istiyor musunuz?")) {
            startSiparisHazirla();
        }
      } else {
        Alert.alert(
          "Malzeme / Parça Talebi",
          "Bu cihaz için sipariş listesini oluşturun. (Sipariş girmeden durum değişmez)",
          [
            { text: "Vazgeç", style: "cancel" },
            { text: "Siparişi Hazırla", onPress: startSiparisHazirla }
          ],
          { cancelable: true }
        );
      }
      return;
    }

    await processStatusChange(item, nextStatus);
  };

  const processStatusChange = async (item: Task, nextStatus: string) => {
    const price = prices[item.id];
    try {
      const res = await updateServiceProcess({
        id: parseInt(item.id),
        status: nextStatus,
        old_status: item.status,
        changed_by: ustaAdi,
        offer_price: price ? parseFloat(price) : undefined,
        expert_note: nextStatus === 'Onay Bekliyor' ? `Usta ${price} TL fiyat verdi` : "Durum usta tarafından güncellendi"
      });

      if (res.success) {
        Alert.alert("Başarılı", `İş durumu "${nextStatus}" olarak güncellendi.`);
        setPrices({...prices, [item.id]: ''}); 
        loadTasks(); 
      }
    } catch (err) {
      Alert.alert("Hata", "Güncelleme yapılamadı.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  // 🚨 MÜDÜR: FİYAT ARAMA MOTORU 🚨
  const fiyatAra = async (text: string) => {
    setAramaMetni(text);
    if (text.length < 3) {
      setAramaSonuclari([]);
      return;
    }
    
    setAraniyor(true);
    try {
      const queryParam = !isNaN(Number(text)) && text.length > 5 ? `barkod=${text}` : `malzeme_adi=${text}`;
      const response = await fetch(`${API_URL}/api/stok/search?${queryParam}`);
      const json = await response.json();
      
      if (json.success && json.data) {
        const sonuclar = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : []);
        setAramaSonuclari(sonuclar);
      } else {
        setAramaSonuclari([]);
      }
    } catch (error) {
      console.log("Fiyat Radar Hatası:", error);
    } finally {
      setAraniyor(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textColor }]}>Onarım Listesi</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={theme.subText} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.subText }]}>Şantiye Yükleniyor...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "padding"} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={10}
        >
          <FlatList
            data={[...tasks].sort((a, b) => {
              if (filterMode === 'onlyParca') {
                const aIsTarget = a.status === 'Parça Bekliyor';
                const bIsTarget = b.status === 'Parça Bekliyor';
                if (aIsTarget && !bIsTarget) return -1;
                if (!aIsTarget && bIsTarget) return 1;
              }
              return 0;
            })}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[styles.listPadding, { paddingBottom: 150 }]} 
            keyboardShouldPersistTaps="handled" 
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
            renderItem={({ item }) => {
              const isDimmed = filterMode === 'onlyParca' && item.status !== 'Parça Bekliyor';

              return (
                <View 
                  style={[
                    styles.taskCard, 
                    { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
                    isDimmed && { opacity: 0.2 } 
                  ]}
                  pointerEvents={isDimmed ? 'none' : 'auto'} 
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.idBadge, { backgroundColor: isDarkMode ? '#3a1010' : '#FEF2F2' }]}>
                      <Text style={styles.idText}>#{item.servis_no || item.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, {backgroundColor: item.status === 'Yeni Kayıt' ? theme.primary : (isDarkMode ? '#333' : '#F1F5F9')}]}>
                      <Text style={[styles.statusText, {color: item.status === 'Yeni Kayıt' ? '#FFF' : theme.textColor}]}>
                        {item.status?.toUpperCase() || 'YENİ KAYIT'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Ionicons name="person-circle" size={20} color={theme.primary} />
                    <Text style={{ fontSize: 15, fontWeight: '800', color: theme.textColor }}>
                      {item.customer || 'Müşteri Bilgisi Yok'}
                    </Text>
                  </View>
                  
                  <Text style={styles.deviceHeaderText}>{item.cihaz_turu || 'Cihaz'}</Text>
                  <Text style={[styles.markaText, { color: theme.textColor }]}>{item.marka_model}</Text>

                  <Text style={[styles.issueText, { color: theme.subText }]} numberOfLines={2}>{item.issue}</Text>

                  <View style={[styles.actionContainer, { backgroundColor: isDarkMode ? '#252525' : '#F9F9F9' }]}>
                    
                    {item.status === 'Yeni Kayıt' && (
                      <View style={styles.priceRow}>
                        <TextInput 
                          style={[styles.priceInput, { backgroundColor: theme.inputBg, color: theme.textColor, borderColor: theme.borderColor }]}
                          placeholder="Maliyet (TL)"
                          placeholderTextColor={theme.subText}
                          keyboardType="numeric"
                          value={prices[item.id] || ''}
                          onChangeText={(val) => setPrices({...prices, [item.id]: val})}
                        />
                        
                        {/* 🚨 MÜDÜR: YEŞİL "FİYAT GÖR" BUTONU BURAYA EKLENDİ 🚨 */}
                        <TouchableOpacity 
                          style={styles.btnFiyatGor} 
                          onPress={() => {
                            setSelectedTask(item);
                            setFiyatModalVisible(true);
                          }}
                        >
                          <Ionicons name="pricetags-outline" size={22} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.btnFiyat, { backgroundColor: isDarkMode ? '#444' : '#1A1A1A' }]} 
                          onPress={() => handleUpdateStatus(item, 'Onay Bekliyor')}
                        >
                          <Text style={styles.btnText}>Fiyat Bildir</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {item.status === 'Onaylandı' && (
                      <TouchableOpacity 
                        style={styles.btnBasla} 
                        onPress={() => handleUpdateStatus(item, 'Tamirde')}
                      >
                        <Text style={styles.btnText}>TAMİRİ BAŞLAT (İŞE GİRİŞ)</Text>
                      </TouchableOpacity>
                    )}

                    {item.status === 'Tamirde' && (
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: theme.textColor, marginBottom: 12, textAlign: 'center' }}>
                          🛠️ CİHAZ TEZGAHTA / TAMİR EDİLİYOR
                        </Text>
                        <View style={{flexDirection: 'row', gap: 10}}>
                          <TouchableOpacity 
                            style={[styles.btnBasla, {backgroundColor: '#FF9500', flex: 1}]} 
                            onPress={() => handleUpdateStatus(item, 'Parça Bekliyor')}
                          >
                            <Text style={styles.btnText}>Malzeme/Parça İste</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.btnBasla, {backgroundColor: '#34C759', flex: 1}]} 
                            onPress={() => handleUpdateStatus(item, 'Hazır')}
                          >
                            <Text style={styles.btnText}>Tamir Bitti (Hazır)</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    
                    {item.status === 'Parça Bekliyor' && (
                       <View style={[styles.btnBasla, {backgroundColor: isDarkMode ? '#333' : '#E5E5EA', paddingVertical: 14, borderWidth: 1, borderColor: theme.borderColor}]}>
                          <Ionicons name="time-outline" size={18} color={isDarkMode ? "#AAA" : "#888"} style={{marginBottom: 4}} />
                          <Text style={[styles.btnText, {color: isDarkMode ? '#AAA' : '#666', fontWeight: '900', fontSize: 12}]}>
                            SİPARİŞ BANKOYA İLETİLDİ - ONAY BEKLENİYOR
                          </Text>
                       </View>
                    )}
                  </View>

                  <View style={[styles.cardFooterRevize, { borderTopColor: theme.borderColor }]}>
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="clipboard-outline" size={16} color={theme.subText} />
                      <Text style={[styles.detailInfoText, { color: theme.subText }]}>İş Detayı</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.btnAcBox}
                      onPress={() => { 
                        setSelectedTask(item); 
                        setTimeout(() => setModalVisible(true), 50);
                      }}
                    >
                      <Text style={styles.btnAcText}>DETAYLARI AÇ</Text>
                      <Ionicons name="chevron-forward" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </KeyboardAvoidingView>
      )}

      {/* DETAY MODALI */}
      <Modal 
        animationType="fade" 
        transparent={true} 
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg, zIndex: 1000 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>Cihaz ve Servis Detayı</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
               <DetailItem label="Müşteri" value={selectedTask?.customer} theme={theme} />
               <DetailItem label="Marka / Model" value={selectedTask?.marka_model} theme={theme} />
               <DetailItem label="Seri No" value={selectedTask?.seri_no} theme={theme} />
               <DetailItem label="Arıza Kaydı" value={selectedTask?.issue} theme={theme} />
               
               <View style={[styles.noteBox, { backgroundColor: isDarkMode ? '#332b00' : '#FFF9C4', borderLeftColor: '#FBC02D' }]}>
                 <Text style={[styles.noteLabel, { color: isDarkMode ? '#FBC02D' : '#7F5F00' }]}>MÜŞTERİ / BANKO NOTU</Text>
                 <Text style={[styles.noteValue, { color: theme.textColor }]}>{selectedTask?.musteri_notu || 'Not bulunmuyor.'}</Text>
               </View>

               <DetailItem label="Geliş Tarihi" value={selectedTask?.created_at ? new Date(selectedTask.created_at).toLocaleString('tr-TR') : '-'} theme={theme} />
               
               <TouchableOpacity 
                style={[styles.modalCloseBtn, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }]} 
                onPress={() => setModalVisible(false)}
               >
                 <Text style={styles.btnText}>KAPAT</Text>
               </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 🚨 MÜDÜR: YENİ "FİYAT GÖR" RADAR MODALI 🚨 */}
      <Modal visible={fiyatModalVisible} animationType="fade" transparent={true}>
        <View style={styles.fiyatOverlay}>
          <View style={[styles.fiyatContent, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
            
            <View style={styles.fiyatHeader}>
              <Text style={[styles.fiyatTitle, isDarkMode && { color: '#fff' }]}>Envanter Fiyat Radarı</Text>
              <TouchableOpacity onPress={() => { setFiyatModalVisible(false); setAramaMetni(''); setAramaSonuclari([]); }}>
                <Ionicons name="close-circle" size={28} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <View style={styles.fiyatInfoBox}>
              <Text style={styles.fiyatInfoText}>Kayıt No: <Text style={{fontWeight: '900'}}>{selectedTask?.servis_no || selectedTask?.id}</Text></Text>
              <Text style={styles.fiyatInfoText}>Cihaz: {selectedTask?.marka_model || "Bilinmiyor"}</Text>
            </View>

            <View style={styles.fiyatSearchContainer}>
              <Ionicons name="search" size={20} color="#888" style={{marginLeft: 10}} />
              <TextInput 
                style={[styles.fiyatSearchInput, isDarkMode && { color: '#fff' }]}
                placeholder="Barkod veya Malzeme İsmi Ara..."
                placeholderTextColor="#888"
                value={aramaMetni}
                onChangeText={fiyatAra}
                autoFocus
              />
            </View>

            {araniyor && <ActivityIndicator size="small" color="#FF3B30" style={{ marginVertical: 10 }} />}

            <ScrollView style={{ marginTop: 10, maxHeight: 300 }} keyboardShouldPersistTaps="handled">
              {aramaSonuclari.map((item, index) => (
                <View key={index} style={[styles.fiyatResultItem, isDarkMode && { borderBottomColor: '#333' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fiyatItemName, isDarkMode && { color: '#fff' }]}>{item.malzeme_adi}</Text>
                    <Text style={styles.fiyatItemDetails}>{item.marka} {item.model ? `- ${item.model}` : ''}</Text>
                    <Text style={styles.fiyatItemBarkod}>Barkod: {item.barkod}</Text>
                  </View>
                  <View style={styles.fiyatTag}>
                    <Text style={styles.fiyatTagText}>{item.alis_fiyati} ₺</Text>
                  </View>
                </View>
              ))}
              
              {!araniyor && aramaMetni.length >= 3 && aramaSonuclari.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Malzeme bulunamadı.</Text>
              )}
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* STOK TALEP MODALI */}
      <UstaStokTalepModali 
        visible={stokModalVisible}
        onClose={() => setStokModalVisible(false)}
        onSuccess={() => {
          if (currentTaskForStok) {
            processStatusChange(currentTaskForStok, 'Parça Bekliyor');
          }
        }}
        serviceId={currentTaskForStok ? parseInt(currentTaskForStok.id) : 0}
        kayitNo={currentTaskForStok?.servis_no || currentTaskForStok?.id || ''}
        markaModel={currentTaskForStok?.marka_model || ''}
        isDarkMode={isDarkMode}
      />

    </SafeAreaView>
  );
}

const DetailItem = ({label, value, theme}: any) => (
  <View style={styles.detailItem}>
    <Text style={[styles.detailLabel, { color: theme.subText }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.textColor }]}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, elevation: 3, borderBottomWidth: 1 },
  backBtn: { padding: 5 },
  refreshBtn: { padding: 5 },
  title: { fontSize: 18, fontWeight: 'bold' },
  listPadding: { padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { marginTop: 10, fontWeight: 'bold' },
  taskCard: { borderRadius: 16, padding: 16, marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  idBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  idText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  deviceHeaderText: { fontSize: 13, fontWeight: 'bold', color: '#FF3B30', textTransform: 'uppercase' },
  markaText: { fontSize: 17, fontWeight: '900', marginBottom: 6 },
  issueText: { fontSize: 14, marginBottom: 15, fontStyle: 'italic' },
  actionContainer: { marginBottom: 15, padding: 12, borderRadius: 12 },
  priceRow: { flexDirection: 'row', gap: 8 },
  priceInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 45, fontSize: 16 },
  btnFiyat: { paddingHorizontal: 15, borderRadius: 10, justifyContent: 'center' },
  
  // 🚨 MÜDÜR: YENİ BUTON STİLİ 🚨
  btnFiyatGor: { backgroundColor: '#34C759', width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  btnBasla: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  cardFooterRevize: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1 },
  detailInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailInfoText: { fontSize: 14, fontWeight: '700' },
  btnAcBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B30', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, zIndex: 10 },
  btnAcText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginRight: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', zIndex: 999 },
  modalContent: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '85%' }, 
  modalHeader: { justifyContent: 'center', alignItems: 'center', marginBottom: 15 }, 
  modalTitle: { fontSize: 18, fontWeight: '900' },
  detailItem: { marginBottom: 12 }, 
  detailLabel: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  detailValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  noteBox: { padding: 12, borderRadius: 10, marginBottom: 15, borderLeftWidth: 4 }, 
  noteLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  noteValue: { fontSize: 13, fontWeight: '500' },
  modalCloseBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 5 },

  // 🚨 MÜDÜR: FİYAT RADARI STİLLERİ 🚨
  fiyatOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  fiyatContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#eee' },
  fiyatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  fiyatTitle: { fontSize: 18, fontWeight: '900', color: '#333' },
  fiyatInfoBox: { backgroundColor: '#FF3B3015', padding: 12, borderRadius: 10, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#FF3B30' },
  fiyatInfoText: { fontSize: 13, color: '#FF3B30', fontWeight: 'bold' },
  fiyatSearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd' },
  fiyatSearchInput: { flex: 1, padding: 12, fontSize: 15 },
  fiyatResultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  fiyatItemName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  fiyatItemDetails: { fontSize: 11, color: '#666', marginTop: 2 },
  fiyatItemBarkod: { fontSize: 10, color: '#999', marginTop: 2 },
  fiyatTag: { backgroundColor: '#FF3B30', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  fiyatTagText: { color: '#fff', fontWeight: '900', fontSize: 14 }
});