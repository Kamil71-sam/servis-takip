import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  TextInput,
  Modal, 
  StatusBar,
  useColorScheme,
  Platform,
  KeyboardAvoidingView, // 🚨 EKLENDİ
  ScrollView         // 🚨 EKLENDİ
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UstaPaneli() {
  const router = useRouter(); 
  const params = useLocalSearchParams(); 
  const systemColorScheme = useColorScheme();

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




// 🚨 MÜDÜR: ARTIK BURADA VERİTABANINA YAZMIYORUZ! SADECE ÇANTAYA KOYUP YOLLUYORUZ!
  const handleCompleteJob = () => {
    if (!price) return Alert.alert("Hata", "Lütfen bir ücret girin.");
    
    // Yazılanları çantaya koy
    const girilenFiyat = price;
    const girilenNot = note;
    
    // Modalı kapat, inputları temizle
    setModalVisible(false);
    setPrice('');
    setNote('');

    // Kuryeyi doğrudan Hesaplama Ekranına yolluyoruz. 
    // İş hala listede duruyor, geri basarsa kaybolmaz!
    router.push({
      pathname: "/RandevuTahsilatUsta",
      params: { 
        id: selectedJob.id, 
        servis_no: selectedJob.servis_no,
        musteri: selectedJob.musteri_adi,
        cihaz: selectedJob.detay,
        maliyet: girilenFiyat,      // Fiyat çantada
        usta_notu: girilenNot,      // Not çantada
        theme: isDarkMode ? 'dark' : 'light' 
      }
    });
  };



/*
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
        setModalVisible(false);
        setPrice('');
        setNote('');
        fetchJobs();

        // 🚨 MÜDÜR: KURYEYE GECE MODU ŞİFRESİ (THEME) VERİLDİ!
        router.push({
          pathname: "/RandevuTahsilatUsta",
          params: { 
            id: selectedJob.id, 
            servis_no: selectedJob.servis_no,
            musteri: selectedJob.musteri_adi,
            cihaz: selectedJob.detay,
            maliyet: price,
            theme: isDarkMode ? 'dark' : 'light' // <--- EKSİK OLAN ANAHTAR BUYDU!
          }
        });
      }
    } catch (e) {
      Alert.alert("Hata", "Sunucuya ulaşılamıyor.");
    }
  };


*/





  const renderItem = ({ item }: any) => {
    let dAdres = "";
    let dCihaz = "";
    let dNot = "";
    let isParsed = false;
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
        <View style={styles.servisNoBadge}>
          <Text style={styles.servisNoText}>KAYIT NO: {item.servis_no}</Text>
        </View>

        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#fff' }]}>
            {item.musteri_adi || "İsimsiz Müşteri"}
          </Text>
          <View style={[styles.statusBadge, isDarkMode && { backgroundColor: '#2C2C2E' }]}>
            <Text style={[styles.statusText, isDarkMode && { color: '#4DA8DA' }]}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={[styles.jobDate, isDarkMode && { color: '#888' }]}>
          📅 {item.tarih} - 🕒 {item.saat}
        </Text>
        
        <View style={{ marginTop: 15, marginBottom: 20, gap: 10 }}>
          {isParsed ? (
            <>
              {dAdres ? <Text style={[styles.infoText, isDarkMode && { color: '#AAA' }]}>📍 ADRES: {dAdres}</Text> : null}
              {dCihaz ? <Text style={[styles.infoText, { color: isDarkMode ? '#FFF' : '#000', fontWeight: '700' }]}>🔧 CİHAZ: {dCihaz}</Text> : null}
              {dNot ? <Text style={[styles.infoText, isDarkMode && { color: '#AAA' }]}>📝 NOT: {dNot}</Text> : null}
            </>
          ) : (
            rawText ? <Text style={[styles.infoText, isDarkMode && { color: '#AAA' }]}>{rawText}</Text> : null
          )}
        </View>

        <TouchableOpacity 
          style={[styles.finishBtn, isDarkMode && { backgroundColor: '#FF3B30' }]} 
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
          <Text style={[styles.subTitle, isDarkMode && { color: '#888' }]}>Usta 1 - Aktif İşler</Text>
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
               <Text style={{textAlign: 'center', marginTop: 10, color: '#888'}}>Usta 1 için aktif randevu yok.</Text>
            </View>
          }
        />
      )}






      {/* 🚨 MÜDÜR: ÜCRET KAYDI MODALI (Klavyeye Karşı Zırhlı) */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.modalContainer, isDarkMode && { backgroundColor: '#121212' }]}>
          
          {/* 🛡️ KLAVYE ZIRHI BAŞLANGICI */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={[styles.modalHeader, isDarkMode && { borderBottomColor: '#333' }]}>
              <View style={{ width: 40 }} /> 
              <Text style={[styles.modalTitle, isDarkMode && { color: '#fff' }]}>ÜCRET KAYDI</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeCircle}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* 🛡️ ESNEME YAYI (İçerik yukarı kayabilsin diye) */}
            <ScrollView 
              contentContainerStyle={{ padding: 25, paddingBottom: 100 }} 
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.label, isDarkMode && { color: '#AAA' }]}>Alınan Ücret</Text>
              <TextInput 
                style={[styles.input, isDarkMode && { backgroundColor: '#1E1E1E', color: '#fff', borderColor: '#333' }]} 
                placeholder="0.00 TL" 
                placeholderTextColor={isDarkMode ? "#666" : "#999"}
                keyboardType="numeric" 
                value={price} 
                onChangeText={setPrice} 
                autoFocus 
              />

              <Text style={[styles.label, isDarkMode && { color: '#AAA' }]}>Usta Notu</Text>
              <TextInput 
                style={[styles.input, isDarkMode && { backgroundColor: '#1E1E1E', color: '#fff', borderColor: '#333', height: 120, textAlignVertical: 'top' }]} 
                placeholder="Not yazın..." 
                placeholderTextColor={isDarkMode ? "#666" : "#999"}
                multiline
                value={note} 
                onChangeText={setNote} 
              />

              <TouchableOpacity 
                style={[styles.saveBtn, isDarkMode && { backgroundColor: '#FF3B30', shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 }]} 
                onPress={handleCompleteJob}
              >
                <Text style={{color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1}}>KAYDET</Text>
              </TouchableOpacity>
            </ScrollView>

          </KeyboardAvoidingView>
          {/* 🛡️ KLAVYE ZIRHI BİTİŞİ */}

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
  infoText: { fontSize: 14, lineHeight: 22, color: '#555' },
  finishBtn: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 12, marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  finishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeCircle: { backgroundColor: '#FF3B30', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: { backgroundColor: '#f9f9f9', padding: 18, borderRadius: 12, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  saveBtn: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 2 },
  servisNoBadge: {
    backgroundColor: '#FF3B30',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: -5,
  },
  servisNoText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  }
});