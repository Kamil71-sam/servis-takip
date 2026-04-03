import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, Modal, Platform, KeyboardAvoidingView, ScrollView, Alert, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ParaCikisiEkrani() {
  const router = useRouter();
  const { isDarkMode: isDarkModeParam } = useLocalSearchParams();
  const isDarkMode = isDarkModeParam === 'true'; 

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [radarMsg, setRadarMsg] = useState({ type: '', text: '' }); 

  const theme = {
    bg: isDarkMode ? '#121212' : '#fdfdfd',
    text: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    inputBg: isDarkMode ? '#1e1e1e' : '#f2f2f2',
    inputBorder: isDarkMode ? '#333' : '#eee',
    modalBg: isDarkMode ? '#1e1e1e' : '#fff',
    modalBorder: isDarkMode ? '#333' : '#f0f0f0',
    btnBg: isDarkMode ? '#fff' : '#1A1A1A',
    btnText: isDarkMode ? '#1A1A1A' : '#fff',
    primary: '#FF3B30',
    placeholderColor: isDarkMode ? '#777' : '#aaa'
  };

  const [islemTuru, setIslemTuru] = useState('');
  const [tutar, setTutar] = useState(''); 
  const [aciklama, setAciklama] = useState('');
  
  const [barkod, setBarkod] = useState('');
  const [miktar, setMiktar] = useState('1'); 
  const [birimFiyat, setBirimFiyat] = useState(''); 
  const [bulunanUrun, setBulunanUrun] = useState<any>(null); 

  const birimFiyatRef = useRef<TextInput>(null);
  const [secenekModalVisible, setSecenekModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const islemTipleri = ["Genel Gider Çıkışı", "Stok Alımı", "Diğer Giderler"];


  //const islemTipleri = ["Genel Gider Çıkışı", "Toptancıya Ödeme / Stok Alımı", "Diğer Giderler"];

  const handleBarkodAra = async (arananBarkod: string) => {
    if (!arananBarkod) return;
    try {
      setRadarMsg({ type: 'loading', text: 'Radar taranıyor...' });
      const response = await fetch(`${API_URL}/api/stok/search?barkod=${encodeURIComponent(arananBarkod)}`);
      const res = await response.json();

      if (res.success && res.found) {
        setBulunanUrun(res.data);
        setBirimFiyat(res.data.alis_fiyati ? res.data.alis_fiyati.toString() : '0');
        setRadarMsg({ type: 'success', text: `✅ ÜRÜN BULUNDU` });


        } else {
        setBulunanUrun(null);
        setBirimFiyat('');
        setRadarMsg({ type: 'warning', text: '🚨 KAYITSIZ BARKOD!\nLütfen stok girişi bölümünden malzeme kaydı yapın.' });
      }



    } catch (e) {
      setRadarMsg({ type: 'error', text: 'Bağlantı hatası!' });
    }
  };

  const handleBarCodeScanned = ({ data }: any) => {
    setBarkod(data);
    setCameraVisible(false);
    handleBarkodAra(data);
  };

  const handleSavePress = () => {
    if (!islemTuru) { Alert.alert("Eksik", "İşlem türü seçiniz."); return; }


    if (islemTuru === "Stok Alımı") {

    



      if (!bulunanUrun) { Alert.alert("Eksik", "Barkod okutunuz."); return; }
      if (!birimFiyat) { Alert.alert("Eksik", "Birim fiyat giriniz."); return; }
      
      const sistemFiyati = bulunanUrun.alis_fiyati ? parseFloat(bulunanUrun.alis_fiyati) : 0;
      const girilenFiyat = parseFloat(birimFiyat || '0');

      if (sistemFiyati === girilenFiyat) {
        Alert.alert(
          "Depo Fiyatı Onayı",
          `Sistemdeki alış fiyatı ${sistemFiyati} ₺.\nDeğiştirmek ister misiniz yoksa bu fiyattan mı kaydedelim?`,
          [
            { text: "Evet, Değiştir", onPress: () => { birimFiyatRef.current?.focus(); } },
            { text: "Fiyat Doğru, Kaydet", onPress: () => executeKasaVeStokKaydi() }
          ]
        );
      } else {
        executeKasaVeStokKaydi(); 
      }
    } else {
      if (!tutar) { Alert.alert("Eksik", "Tutar giriniz."); return; }
      executeKasaVeStokKaydi();
    }
  };

  // 🚨 MÜDÜR: İŞTE O SİHİRLİ BAĞLANTININ KURULDUĞU YER BURASI!
  const executeKasaVeStokKaydi = async () => {
    setLoading(true);
    try {
      let finalEndpoint = '';
      let payload = {};


      if (islemTuru === "Stok Alımı") {




        // Senin Stok.js'deki /add motorunu çalıştırıyoruz (Otomatik kasayı da düşer)
        finalEndpoint = `${API_URL}/api/stok/add`;
        payload = {
          barkod: barkod,
          malzeme_adi: bulunanUrun.malzeme_adi,
          uyumlu_cihaz: bulunanUrun.uyumlu_cihaz,
          marka: bulunanUrun.marka,
          miktar: parseInt(miktar || '1'),
          alis_fiyati: parseFloat(birimFiyat || '0'),
          fiyat_guncelle: true // Senin koddaki şalteri açtık
        };
      } else {
        // Genel gider veya diğer çıkışlar için düz Kasa kapısı
        finalEndpoint = `${API_URL}/api/kasa/add`;
        payload = {
          kategori: islemTuru,
          islem_yonu: 'ÇIKIŞ',
          tutar: parseFloat(tutar || '0'),
          aciklama: aciklama,
          islem_yapan: 'Sistem'
        };
      }

      const response = await fetch(finalEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert("Başarılı", "İşlem jilet gibi işlendi.", [
          { text: "TAMAM", onPress: () => { DeviceEventEmitter.emit('kasaYenile'); router.back(); }}
        ]);
      } else {
        Alert.alert("Hata", data.error || data.message || "İşlem kaydedilemedi.");
      }
    } catch (error) {
      Alert.alert("Hata", "Sunucu bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  if (cameraVisible) {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleBarCodeScanned} />
        <View style={styles.scannerOverlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              <View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} />
              <View style={styles.radarTextRow}><Ionicons name="scan-outline" size={18} color="#FF3B30" /><Text style={styles.radarText}>BARKOD RADARI AKTİF</Text></View>
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.unfocusedContainer}>
            <TouchableOpacity style={styles.camCloseBottom} onPress={() => setCameraVisible(false)}><Ionicons name="close-circle" size={60} color="#fff" /><Text style={{color:'#fff', fontWeight:'bold'}}>İPTAL</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={32} color="#FF3B30" /></TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>KASA İŞLEMLERİ V2</Text>
            <View style={{ width: 32 }} /> 
          </View>

          <Text style={[styles.label, { color: theme.subText }]}>İŞLEM TÜRÜ</Text>
          <TouchableOpacity style={[styles.dropdownButton, { backgroundColor: theme.inputBg }]} onPress={() => setSecenekModalVisible(true)}>
            <Text style={[styles.dropdownText, { color: islemTuru ? theme.text : theme.subText }]}>{islemTuru ? islemTuru : "Seçiniz..."}</Text>
            <Ionicons name="chevron-down" size={22} color={theme.subText} />
          </TouchableOpacity>

          {islemTuru !== "Stok Alımı" ? (

          





            <View>
              <Text style={[styles.label, { color: theme.subText }]}>ÇIKIŞ TUTARI (₺)</Text>

              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}><TextInput style={[styles.input, { color: theme.text }]} placeholder="0.00" placeholderTextColor={theme.placeholderColor} keyboardType="numeric" value={tutar} onChangeText={setTutar} /></View>

              <Text style={[styles.label, { color: theme.subText }]}>İŞLEM AÇIKLAMASI (*)</Text>

              <View style={[styles.inputContainer, { height: 100, backgroundColor: theme.inputBg }]}><TextInput style={[styles.input, { color: theme.text, textAlignVertical: 'top', paddingTop: 15 }]} placeholder="Detay..." placeholderTextColor={theme.placeholderColor} multiline value={aciklama} onChangeText={setAciklama} /></View>

            
            
            
            </View>
          ) : (
            <View>
              {radarMsg.text && <View style={[styles.alarmBox, { borderColor: radarMsg.type === 'success' ? '#34C759' : '#FF3B30' }]}><Text style={{ color: radarMsg.type === 'success' ? '#34C759' : '#FF3B30', fontWeight: 'bold' }}>{radarMsg.text}</Text></View>}
              
              <Text style={[styles.label, { color: theme.subText }]}>BARKOD OKUT VEYA YAZ (*)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={[styles.inputContainer, { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg }]}>

                  <TextInput style={[styles.input, { flex: 1, color: theme.text, paddingHorizontal: 15 }]} placeholder="Barkod..." placeholderTextColor={theme.placeholderColor} value={barkod} onChangeText={setBarkod} onEndEditing={() => handleBarkodAra(barkod)} />

                  
                  
                  <TouchableOpacity style={styles.araBtn} onPress={() => handleBarkodAra(barkod)}><Ionicons name="search" size={20} color="#fff" /></TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.kameraBtn} onPress={async () => { if (!permission?.granted) await requestPermission(); setCameraVisible(true); }}><Ionicons name="camera-outline" size={26} color="#fff" /></TouchableOpacity>
              </View>

              {bulunanUrun && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.label, { color: theme.subText }]}>MALZEME ADI</Text>
                  <View style={[styles.infoBox, { backgroundColor: theme.inputBg }]}><Text style={{color: theme.text, fontWeight: 'bold'}}>{bulunanUrun.malzeme_adi}</Text></View>
                  
                  <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <View style={{ flex: 1, marginRight: 5 }}>
                      <Text style={[styles.label, { color: theme.subText }]}>ALINAN ADET</Text>
                      <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}><TextInput style={[styles.input, { color: theme.text, textAlign: 'center' }]} keyboardType="numeric" value={miktar} onChangeText={setMiktar} /></View>
                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                      <Text style={[styles.label, { color: theme.subText }]}>BİRİM FİYAT (₺)</Text>
                      <View style={[styles.inputContainer, { backgroundColor: 'rgba(52, 199, 89, 0.1)', borderColor: '#34C759', borderWidth: 1 }]}>

                        <TextInput ref={birimFiyatRef} style={[styles.input, { color: '#1B5E20', fontWeight: 'bold', textAlign: 'center' }]} placeholder="0.00" placeholderTextColor={theme.placeholderColor} keyboardType="numeric" value={birimFiyat} onChangeText={setBirimFiyat} />
                                                 
                     
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.btnBg }]} onPress={handleSavePress} disabled={loading}>
            {loading ? <ActivityIndicator color={theme.btnText} /> : <Text style={[styles.submitBtnText, { color: theme.btnText }]}>KAYDET</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>


      <Modal visible={secenekModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.modalBg }]}>
              {islemTipleri.map((tip, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.modalItem, { borderBottomColor: theme.modalBorder }]} 
                  onPress={() => { 
                    setIslemTuru(tip); 
                    setSecenekModalVisible(false); 
                    setTutar(''); 
                    setAciklama(''); 
                    setBulunanUrun(null); 
                    setBarkod(''); 
                    setRadarMsg({type:'', text:''}); 
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: 'bold' }}>{tip}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setSecenekModalVisible(false)} style={{marginTop: 15}}>
                <Text style={{color: '#FF3B30', fontWeight: 'bold'}}>VAZGEÇ</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Modal>




      






    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 30 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 5, marginTop: 15 },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, paddingHorizontal: 15, height: 55 },
  dropdownText: { fontSize: 16, fontWeight: '700' },
  inputContainer: { borderRadius: 12, height: 55, justifyContent: 'center' },
  input: { height: '100%', fontSize: 16, fontWeight: '600', paddingHorizontal: 15 },
  infoBox: { borderRadius: 12, padding: 15, minHeight: 55, justifyContent: 'center' },
  submitBtn: { borderRadius: 12, height: 60, justifyContent: 'center', alignItems: 'center', marginTop: 35 },
  submitBtnText: { fontSize: 15, fontWeight: '900' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 20, borderRadius: 20, alignItems: 'center' },
  modalItem: { paddingVertical: 15, width: '100%', alignItems: 'center', borderBottomWidth: 1 },

  




  araBtn: { width: 55, height: 55, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  kameraBtn: { width: 55, height: 55, backgroundColor: '#1A1A1A', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  alarmBox: { padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center', marginBottom: 10 },
  scannerOverlay: { flex: 1 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  middleContainer: { flexDirection: 'row', height: 260 },
  focusedContainer: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#FF3B30', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  radarTextRow: { position: 'absolute', bottom: -40, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  radarText: { color: '#FF3B30', fontSize: 12, fontWeight: '900', marginLeft: 8 },
  camCloseBottom: { alignItems: 'center', marginTop: 20 }
});