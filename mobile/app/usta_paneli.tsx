import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, Modal, StatusBar, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; 

export default function UstaPaneli() {
  const router = useRouter(); 
  const params = useLocalSearchParams(); 
  const systemColorScheme = useColorScheme();

  // MÜDÜR: Şalter kusursuz çalışıyor
  const isDarkMode = 
    params.theme === 'dark' || 
    params.isDarkMode === 'true' || 
    (params.theme === undefined && params.isDarkMode === undefined && systemColorScheme === 'dark');

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/operation/usta-jobs/${encodeURIComponent("Usta 1")}`);
      const data = await res.json();
      if (data.success) { setJobs(data.data); }
    } catch (e) {
      console.log("Bağlantı koptu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchJobs(); 
    const t = setInterval(fetchJobs, 10000); 
    return () => clearInterval(t);
  }, []);

  const handleCompleteJob = async () => {
    if (!price) return Alert.alert("Hata", "Lütfen bir ücret girin.");
    try {
      const res = await fetch(`${API_URL}/api/operation/complete-job/${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(price), usta_notu: note }),
      });
      const result = await res.json();
      if (result.success) {
        Alert.alert("Başarılı", "İşlem kaydedildi.");
        setModalVisible(false); setPrice(''); setNote(''); fetchJobs();
      }
    } catch (e) {
      Alert.alert("Hata", "Sunucuya ulaşılamıyor.");
    }
  };

  const renderItem = ({ item }: any) => {
    // MÜDÜR: PARÇALAMA MOTORU (Chrome'dan gelen veriye göre)
    let dAdres = "";
    let dCihaz = "";
    let dNot = "";
    let isParsed = false;

    // Backend'den gelen 'detay' verisine bakıyoruz
    const rawText = item.detay || item.issue_text || "";

    if (rawText.includes('ADRES:') || rawText.includes('CİHAZ:')) {
        isParsed = true;
        const lines = rawText.split('\n');
        
        lines.forEach((line: string) => {
            if (line.toUpperCase().includes('ADRES:')) {
                dAdres = line.replace(/[📍🔧📝]/g, '').replace(/ADRES:/gi, '').trim();
            } else if (line.toUpperCase().includes('CİHAZ:')) {
                dCihaz = line.replace(/[📍🔧📝]/g, '').replace(/CİHAZ:/gi, '').trim();
            } else if (line.toUpperCase().includes('NOT:')) {
                dNot = line.replace(/[📍🔧📝]/g, '').replace(/NOT:/gi, '').trim();
            }
        });
    }

    return (
      <View style={[styles.card, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
        
        {/* MÜDÜR: --- YENİ EKLENEN KAYIT NO ROZETİ (Kırmızı Dolgulu, Sola Dayalı) --- */}
        <View style={styles.servisNoBadge}>
          <Text style={styles.servisNoText}>KAYIT NO: {item.servis_no}</Text>
        </View>
        {/* -------------------------------------------------------------------------- */}

        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#fff' }]}>
            {item.musteri_adi || "İsimsiz Müşteri"}
          </Text>
          <View style={[styles.statusBadge, isDarkMode && { backgroundColor: '#333' }]}>
            <Text style={[styles.statusText, isDarkMode && { color: '#2196F3' }]}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={[styles.jobDate, isDarkMode && { color: '#AAA' }]}>
          📅 {item.tarih} - 🕒 {item.saat}
        </Text>
        
        {/* MÜDÜR: JİLET GİBİ KUTULAR (Senin Chrome'dan gelen veriler!) */}
        <View style={{ marginTop: 15, marginBottom: 20, gap: 10 }}>
          {isParsed ? (
            <>
              {dAdres ? (
                <Text style={[styles.infoText, isDarkMode && { color: '#AAA' }]}>
                  📍 ADRES: {dAdres}
                </Text>
              ) : null}
              
              {dCihaz ? (
                <Text style={[styles.infoText, { color: isDarkMode ? '#FFF' : '#000', fontWeight: '700' }]}>
                  🔧 CİHAZ: {dCihaz}
                </Text>
              ) : null}
              
              {dNot ? (
                <Text style={[styles.infoText, isDarkMode && { color: '#AAA' }]}>
                  📝 NOT: {dNot}
                </Text>
              ) : null}
            </>
          ) : (
            rawText ? (
              <Text style={[styles.infoText, isDarkMode && { color: '#AAA' }]}>{rawText}</Text>
            ) : null
          )}
        </View>

        <TouchableOpacity 
          style={[styles.finishBtn, isDarkMode && { backgroundColor: '#333' }]} 
          onPress={() => { setSelectedJob(item); setModalVisible(true); }}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.finishBtnText}> ÜCRET GİRİŞİ</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#121212' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.mainHeader, isDarkMode && { borderBottomColor: '#333' }]}>
        <TouchableOpacity style={styles.backBtnBlack} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
          <Text style={[styles.backBtnTextBlack, isDarkMode && { color: '#fff' }]}>Geri</Text>
        </TouchableOpacity>

        <View style={{alignItems: 'flex-end'}}>
          <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>RANDEVU LİSTESİ</Text>
          <Text style={[styles.subTitle, isDarkMode && { color: '#AAA' }]}>Usta 1 - Aktif İşler</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={isDarkMode ? "#fff" : "#000"} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={{marginTop: 100, alignItems: 'center'}}>
               <Ionicons name="cafe-outline" size={64} color={isDarkMode ? "#444" : "#ccc"} />
               <Text style={{textAlign: 'center', marginTop: 10, color: '#999'}}>Usta 1 için aktif randevu yok.</Text>
            </View>
          }
        />
      )}

      {/* ÜCRET KAYDİ MODALI */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.modalContainer, isDarkMode && { backgroundColor: '#121212' }]}>
          <View style={[styles.modalHeader, isDarkMode && { borderBottomColor: '#333' }]}>
            <View style={{ width: 40 }} /> 
            <Text style={[styles.modalTitle, isDarkMode && { color: '#fff' }]}>ÜCRET KAYDI</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeCircle}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{padding: 25}}>
            <Text style={[styles.label, isDarkMode && { color: '#AAA' }]}>Alınan Ücret</Text>
            <TextInput 
              style={[styles.input, isDarkMode && { backgroundColor: '#1C1C1E', color: '#fff', borderColor: '#333' }]} 
              placeholder="0.00 TL" 
              placeholderTextColor="#666"
              keyboardType="numeric" 
              value={price} 
              onChangeText={setPrice} 
              autoFocus 
            />

            <Text style={[styles.label, isDarkMode && { color: '#AAA' }]}>Usta Notu</Text>
            <TextInput 
              style={[styles.input, isDarkMode && { backgroundColor: '#1C1C1E', color: '#fff', borderColor: '#333', height: 120, textAlignVertical: 'top' }]} 
              placeholder="Not yazın..." 
              placeholderTextColor="#666"
              multiline
              value={note} 
              onChangeText={setNote} 
            />

            <TouchableOpacity 
              style={[styles.saveBtn, isDarkMode && { backgroundColor: '#293d52' }]} 
              onPress={handleCompleteJob}
            >
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>KAYDET</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtnBlack: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  backBtnTextBlack: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 2 },
  title: { fontSize: 20, fontWeight: '900' },
  subTitle: { color: '#888' },
  
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: '900', flex: 1, textAlign: 'center' },
  
  card: { padding: 24, marginHorizontal: 15, marginBottom: 15, backgroundColor: '#fff', borderRadius: 15, elevation: 3, borderWidth: 1, borderColor: '#eee', minHeight: 180 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#2a74be', fontSize: 12, fontWeight: 'bold' },
  jobDate: { color: '#666', marginTop: 8 },
  
  // MÜDÜR: YENİ VERİ TASARIMI
  infoText: { fontSize: 14, lineHeight: 22, color: '#555' },
  
  finishBtn: { backgroundColor: '#1e1c25', padding: 15, borderRadius: 12, marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  finishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeCircle: { backgroundColor: '#ff4d4d', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: { backgroundColor: '#f0f0f0', padding: 18, borderRadius: 12, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  saveBtn: { backgroundColor: '#1b1e20', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 2 },

  // MÜDÜR: --- YENİ EKLENEN ROZET STİLLERİ ---
  servisNoBadge: {
    backgroundColor: '#FF3B30', // Kırmızı Dolgu
    alignSelf: 'flex-start', // Sola Dayalı
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10, // Aşağıdaki Header ile boşluk
    marginTop: -5, // Kart Padding'i 24 olduğu için biraz yukarı çekip dengeledik
  },
  servisNoText: {
    color: '#FFF', // Beyaz Yazı
    fontWeight: 'bold',
    fontSize: 13,
  }
  // -------------------------------------------
});