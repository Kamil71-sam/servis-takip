import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Alert, Dimensions, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');

// MÜDÜR: externalDiscount artık dışarıdan (Ana Ekran'dan) geliyor
export default function StokCikisiFormu({ visible, onClose, isDarkMode, externalDiscount = 0 }: any) {
  
  // --- 🚨 MÜDÜR: TYPESCRIPT'İN KIZMAMASI İÇİN YENİ ODALARI BURAYA DA EKLEDİK ---
  const initialState = {
    barkod: '', 
    malzeme_adi: '', 
    marka: '', 
    uyumlu_cihaz: '', 
    cikan_adet: '1', 
    satis_fiyati: '', 
    mevcut_stok: 0, 
    id: null as any,
    alis_fiyati: 0,  // 🚨 İŞTE TYPESCRIPT'İN ARADIĞI MALİYET ODASI
    eski_satis: 0    // 🚨 İŞTE TYPESCRIPT'İN ARADIĞI B PLANI ODASI
  };
  
  const [f, setF] = useState(initialState);
  const [focus, setFocus] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [radarMsg, setRadarMsg] = useState({ type: '', text: '' }); 
  const [cameraVisible, setCameraVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();

  // Canlı İskonto hafızası
  const [iskonto, setIskonto] = useState(externalDiscount ? externalDiscount.toString() : '0'); 







  useEffect(() => {
    if (visible) {
      setF(initialState);
      setFocus('');
      setRadarMsg({ type: '', text: '' });
      setIskonto(externalDiscount ? externalDiscount.toString() : '0'); // Form açıldığında iskontoyu sıfırla/yenile
    }
  }, [visible, externalDiscount]);

  // --- 1. SADECE VERİYİ ÇEKİP HAFIZAYA ATAN KISIM ---
  const calculateFinalPrice = async (barkod: string) => {
    if (!barkod) return;
    try {
      setRadarMsg({ type: 'loading', text: 'Radar taranıyor...' });
      const response = await fetch(`${API_URL}/api/stok/search?barkod=${encodeURIComponent(barkod)}`);
      const res = await response.json();

      if (res.success && res.found) {
        const item = res.data;
        setF(prev => ({
          ...prev,
          id: item.id,
          barkod: item.barkod,
          malzeme_adi: item.malzeme_adi,
          marka: item.marka || '',
          uyumlu_cihaz: item.uyumlu_cihaz || '',
          mevcut_stok: item.miktar,
          alis_fiyati: parseFloat(item.alis_fiyati || "0"), // 🚨 Maliyeti hafızaya at
          eski_satis: parseFloat(item.satis_fiyati || "0")  // 🚨 B planı için hafızaya at
        }));
        setRadarMsg({ type: 'success', text: `✅ ÜRÜN BULUNDU: Stok okundu.` });
      } else {
        setRadarMsg({ type: 'warning', text: '🚨 HATA: Kayıtsız Barkod!' });
      }
    } catch (e) {
      setRadarMsg({ type: 'error', text: 'Bağlantı hatası!' });
    }
  };

  // --- 2. 🚨 MÜDÜR: CANLI HESAPLAMA MOTORU (Sihir Burada) ---
  // Sen iskontoyu değiştirdikçe bu motor otomatik çalışıp fiyatı günceller!
 
 
// --- 2. 🚨 MÜDÜR: CANLI HESAPLAMA MOTORU (Gerçek Esnaf Matematiği) ---
  useEffect(() => {
    if (f.id) { // Sadece ürün barkodu okutulduysa çalışsın
      const dukkanKari = 25; 
      const dukkanKdv = 20;
      const girilenIskonto = parseFloat(iskonto || '0');
      let hesaplananSatis = 0;

      if (f.alis_fiyati > 0) {
        // 1. Edeceğimiz brüt kâr miktarını buluyoruz
        const hamKarMiktari = f.alis_fiyati * (dukkanKari / 100); 
        
        // 2. İskontoyu sadece KÂR MİKTARINDAN düşüyoruz (Ana paraya dokunmak yok!)
        const netKarMiktari = hamKarMiktari * (1 - (girilenIskonto / 100)); 
        
        // 3. Maliyetin üzerine kalan net kârı ekliyoruz
        const matrah = f.alis_fiyati + netKarMiktari; 
        
        // 4. En son KDV'yi çakıp yuvarlıyoruz
        hesaplananSatis = Math.round(matrah * (1 + (dukkanKdv / 100)));
      } else {
        // Alış fiyatı yoksa eski satış fiyatından düş (B planı)
        hesaplananSatis = Math.round(f.eski_satis * (1 - (girilenIskonto / 100)));
      }

      setF(prev => ({ ...prev, satis_fiyati: hesaplananSatis.toFixed(2) }));
    }
  }, [iskonto, f.alis_fiyati, f.eski_satis, f.id]);




 
  





  const handleBarCodeScanned = ({ data }: any) => {
    setF(prev => ({ ...prev, barkod: data }));
    setCameraVisible(false);
    calculateFinalPrice(data);
  };

  const executeSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/stok/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: f.id,
          barkod: f.barkod,
          cikan_adet: parseInt(f.cikan_adet),
          // MÜDÜR: Hesaplanan fiyatı olduğu gibi gönderiyoruz
          satis_fiyati: parseFloat(f.satis_fiyati),
          // 🚨 MÜDÜR: Ekrana yazdığımız taze iskontoyu yolluyoruz!
          manual_discount: parseFloat(iskonto || '0') 
        })
      });
      const res = await response.json();
      if (res.success) {
        setConfirmModalVisible(false);
        setSuccessModalVisible(true); 
      } else {
        Alert.alert("Hata", res.error || "Satış tamamlanamadı.");
      }
    } catch (e) { 
        Alert.alert("Hata", "Bağlantı sorunu oluştu."); 
    }
    finally { setLoading(false); }
  };

  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    borderColor: isDarkMode ? '#333' : '#eee',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#555',
    primary: isDarkMode ? '#FF3B30' : '#1A1A1A' // Gece Kırmızı, Gündüz Siyah!
    
   // primary: '#FF3B30'
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        
        {cameraVisible ? (
          <View style={StyleSheet.absoluteFillObject}>
            <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleBarCodeScanned} />
            <View style={styles.scannerOverlay}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.middleContainer}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.focusedContainer}>
                  <View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} />
                  <View style={styles.radarTextRow}>
                    <Ionicons name="scan-outline" size={18} color="#FF3B30" />
                    <Text style={styles.radarText}>BARKOD RADARI AKTİF</Text>
                  </View>
                </View>
                <View style={styles.unfocusedContainer}></View>
              </View>
              <View style={styles.unfocusedContainer}>
                <TouchableOpacity style={styles.camCloseBottom} onPress={() => setCameraVisible(false)}>
                  <Ionicons name="close-circle" size={60} color="#fff" />
                  <Text style={{color:'#fff', fontWeight:'bold', marginTop:5}}>İPTAL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
            <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
              <View style={styles.header}>
                <View>
                   <Text style={[styles.title, { color: theme.textColor }]}>STOK ÇIKIŞI / SATIŞ</Text>
                   {parseFloat(iskonto) > 0 && <Text style={{color: '#FF9500', fontSize: 11, fontWeight: 'bold'}}>%{iskonto} İNDİRİM UYGULANIYOR</Text>}
                </View>
                <TouchableOpacity onPress={onClose} style={styles.solidCloseBtn}><Ionicons name="close" size={26} color="#fff" /></TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 150}}>
                {radarMsg.text ? (
                  <View style={[styles.alarmBox, { backgroundColor: radarMsg.type === 'success' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)', borderColor: radarMsg.type === 'success' ? '#34C759' : '#FF3B30' }]}>
                    <Text style={[styles.alarmText, { color: radarMsg.type === 'success' ? '#34C759' : '#FF3B30' }]}>{radarMsg.text}</Text>
                  </View>
                ) : null}

                <Text style={[styles.label, { color: theme.labelColor }]}>BARKOD OKUT (*)</Text>
                <View style={styles.row}>
                  <TextInput 
                    style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.textColor, borderColor: focus === 'barkod' ? theme.primary : theme.borderColor }]} 
                    value={f.barkod} placeholder="Barkod..." placeholderTextColor="#888"
                    onFocus={() => setFocus('barkod')}
                    onChangeText={v => setF({...f, barkod: v})} 
                    onEndEditing={() => calculateFinalPrice(f.barkod)}
                  />
                  <TouchableOpacity style={styles.iconBtn} onPress={async () => { if (!permission?.granted) await requestPermission(); setCameraVisible(true); }}>
                    <Ionicons name="camera" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.labelColor }]}>MALZEME ADI</Text>
                <View style={[styles.infoBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}><Text style={{color: theme.textColor}}>{f.malzeme_adi || '---'}</Text></View>

                <View style={styles.row}>
                   <View style={{flex:1, marginRight: 5}}>
                      <Text style={[styles.label, { color: theme.labelColor }]}>MARKA</Text>
                      <View style={[styles.infoBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}><Text style={{color: theme.textColor}}>{f.marka || '---'}</Text></View>
                   </View>
                   <View style={{flex:1, marginLeft: 5}}>
                      <Text style={[styles.label, { color: theme.labelColor }]}>UYUMLU CİHAZ</Text>
                      <View style={[styles.infoBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}><Text style={{color: theme.textColor}}>{f.uyumlu_cihaz || '---'}</Text></View>
                   </View>
                </View>

                <View style={styles.row}>
                  {/* 1. KUTU: ÇIKAN ADET */}
                  <View style={{flex: 1, marginRight: 5}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>ÇIKAN ADET</Text>
                    <TextInput 
                      style={[styles.input, { marginHorizontal: 0, backgroundColor: theme.inputBg, color: theme.textColor, borderColor: focus === 'cikan' ? theme.primary : theme.borderColor }]} 
                      keyboardType="numeric" value={f.cikan_adet} placeholder="1" placeholderTextColor="#888"
                      onFocus={() => setFocus('cikan')}
                      onChangeText={v => setF({...f, cikan_adet: v})} 
                    />
                  </View>

                  {/* 🚨 2. KUTU: YENİ İSKONTO ALANI 🚨 */}
                  <View style={{flex: 1, marginHorizontal: 5}}>
                    <Text style={[styles.label, { color: '#FF9500' }]}>İSKONTO (%)</Text>
                    <TextInput 
                      style={[styles.input, { marginHorizontal: 0, backgroundColor: 'rgba(255, 149, 0, 0.1)', color: '#FF9500', fontWeight: 'bold', borderColor: focus === 'iskonto' ? '#FF9500' : theme.borderColor }]} 
                      keyboardType="numeric" value={iskonto} placeholder="0" placeholderTextColor="#888"
                      onFocus={() => setFocus('iskonto')}
                      onChangeText={setIskonto} 
                    />
                  </View>

                  {/* 3. KUTU: CANLI SATIŞ FİYATI */}
                  <View style={{flex: 1.5, marginLeft: 5}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>SATIŞ (₺)</Text>
                    <View style={[styles.infoBox, { marginHorizontal: 0, backgroundColor: '#E8F5E9', borderColor: '#34C759', borderWidth: 2 }]}>
                        <Text style={{color: '#1B5E20', fontWeight: 'bold', fontSize: 16}}>
                            {f.satis_fiyati ? `${f.satis_fiyati} ₺` : '0.00 ₺'}
                        </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  disabled={loading}
                  style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: loading ? 0.5 : 1 }]} 
                  onPress={() => {
                   if (!f.id || !f.cikan_adet || !f.satis_fiyati) { Alert.alert("Hata", "Barkod okutun veya zorunlu alanları doldurun!"); return; }
                   if (parseInt(f.cikan_adet) > f.mevcut_stok) { Alert.alert("Hata", "Stok yetersiz!"); return; }
                   setConfirmModalVisible(true);
                }}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>SATIŞI ONAYLA</Text>}
                </TouchableOpacity>
              </ScrollView>

              {/* ONAY MODALI */}
              <Modal visible={confirmModalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                  <View style={[styles.alertContent, { backgroundColor: theme.cardBg }]}>
                    <Ionicons name="card-outline" size={60} color={theme.primary} />
                    <Text style={[styles.alertMessage, { color: theme.textColor, marginTop: 15 }]}>
                        {f.cikan_adet} adet {f.malzeme_adi} satışı yapılıyor.{"\n"}
                        Toplam Tutar: {(parseFloat(f.satis_fiyati) * parseInt(f.cikan_adet)).toFixed(2)} ₺
                    </Text>
                    <View style={styles.modalBtnRow}>
                      <TouchableOpacity style={[styles.alertBtn, { backgroundColor: '#888', width: '45%' }]} onPress={() => setConfirmModalVisible(false)}><Text style={styles.alertBtnText}>VAZGEÇ</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.alertBtn, { backgroundColor: theme.primary, width: '45%' }]} onPress={executeSave}><Text style={styles.alertBtnText}>SATIŞ YAP</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* BAŞARI MODALI */}
              <Modal visible={successModalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                  <View style={[styles.alertContent, { backgroundColor: theme.cardBg }]}>
                    <Ionicons name="checkmark-circle" size={70} color="#34C759" />
                    <Text style={[styles.alertTitle, { color: theme.textColor, marginTop: 10 }]}>Tahsilat Başarılı</Text>
                    <TouchableOpacity style={[styles.alertBtn, { backgroundColor: '#1A1A1A', width: '100%', marginTop: 20 }]} onPress={() => { setSuccessModalVisible(false); onClose(); }}><Text style={styles.alertBtnText}>TAMAM</Text></TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </SafeAreaView>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 20, paddingHorizontal: 20 },
  title: { fontSize: 18, fontWeight: '900' },
  solidCloseBtn: { backgroundColor: '#FF3B30', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 10, fontWeight: '900', marginTop: 15, marginBottom: 5, paddingHorizontal: 20 },
  input: { borderRadius: 12, padding: 15, borderWidth: 1.5, fontSize: 14, marginHorizontal: 20, minHeight: 50, justifyContent: 'center' },
  infoBox: { borderRadius: 12, padding: 15, borderWidth: 1, marginHorizontal: 20, minHeight: 50, justifyContent: 'center', opacity: 0.9 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 5 },
  iconBtn: { width: 50, height: 50, backgroundColor: '#1A1A1A', borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  saveBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginHorizontal: 20 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  alertContent: { width: '85%', borderRadius: 30, padding: 30, alignItems: 'center' },
  alertTitle: { fontSize: 22, fontWeight: '900' },
  alertMessage: { fontSize: 15, textAlign: 'center', fontWeight: '600', lineHeight: 22 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 25 },
  alertBtn: { height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  alertBtnText: { color: '#fff', fontWeight: '900' },
  alarmBox: { marginHorizontal: 20, marginTop: 15, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  alarmText: { fontSize: 13, fontWeight: 'bold' },
  scannerOverlay: { flex: 1, backgroundColor: 'transparent' },
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
  camCloseBottom: { alignItems: 'center' }
});