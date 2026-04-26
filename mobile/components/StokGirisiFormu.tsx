import React, { useState, useRef, useEffect  } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard, ActivityIndicator, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
// Müdür: Ekran boyutlarını hedef kutusu için alıyoruz
const { width, height } = Dimensions.get('window');

// MÜDÜR: Buraya 'initialBarcode' diye bir giriş kapısı (prop) ekledik
export default function StokGirisiFormu({ visible, onClose, isDarkMode, initialBarcode }: any) {
  const initialState = {
    tur: '', usta: '', barkod: '', malzeme_adi: '', marka: '', uyumlu_cihaz: '', miktar: '1',
    alis_fiyati: '', request_id: null
  };
  
  const [f, setF] = useState(initialState);
  const [focus, setFocus] = useState(''); 
  const [loading, setLoading] = useState(false);
  // --- MÜDÜR: FİYAT RADARI HAFIZALARI ---
  const [eskiAlis, setEskiAlis] = useState('');
  const [fiyatGuncelle, setFiyatGuncelle] = useState(true);


  // --- MÜDÜR: RADAR ALARM STATE'İ EKLENDİ ---
  const [radarMsg, setRadarMsg] = useState({ type: '', text: '' }); 
  
  const [showTurModal, setShowTurModal] = useState(false);
  const [showUstaModal, setShowUstaModal] = useState(false); 
  const [showUstaSiparisModal, setShowUstaSiparisModal] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  
  const [ustaSiparisleri, setUstaSiparisleri] = useState([]);
  const [permission, requestPermission] = useCameraPermissions();

  const ustaListesi = [
    { label: '👨‍🔧 Usta 1 (Aktif)', value: 'Usta 1', active: true },
    { label: '👨‍🔧 Usta 2 (Pasif)', value: 'Usta 2', active: false },
    { label: '👨‍🔧 Usta 3 (Pasif)', value: 'Usta 3', active: false },
  ];

  // --- MÜDÜR: TRANSFERİ YAKALAYAN GÖZ BURASI ---
  useEffect(() => {
    if (visible) {
      setFocus('');
      if (initialBarcode) {
        // Eğer dışarıdan (Radardan) barkod gelmişse onu kutuya yaz ve radarı çalıştır
        setF({ ...initialState, barkod: initialBarcode });
        checkRadar('barkod', initialBarcode);
      } else {
        setF(initialState);
        setRadarMsg({ type: '', text: '' });
         // 🚨 YENİ EKLENEN: Form her açıldığında eski fiyat hafızasını sil
        setEskiAlis('');
      }
    }
  }, [visible, initialBarcode]);
  
  const rMarka = useRef<TextInput>(null);
  const rCihaz = useRef<TextInput>(null);
  const rMiktar = useRef<TextInput>(null);
  const rAlis = useRef<TextInput>(null);

  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    borderColor: isDarkMode ? '#333' : '#eee',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#555',
   
    primary: '#FF3B30',
    accent: isDarkMode ? '#FF3B30' : '#1A1A1A', // Gece Kırmızı, Gündüz Siyah
      
   
    
  };

  // --- MÜDÜR: AKILLI RADAR SORGUSU (BOZULMADI AMA SAMSUNGFACİASI İÇİN DÜZELTİLDİ) ---
  const checkRadar = async (searchType: 'barkod' | 'malzeme_adi', value: string) => {
    try {
      setRadarMsg({ type: 'loading', text: 'Radar taranıyor...' });
      
      // MÜDÜR: Samsung Galaxy saçmalığını bitiren hamle! 
      // Sadece barkod ile arama yapıyoruz, malzeme_adi ile arama yapıp Samsung Galaxy falan getirmesini engelliyoruz.
     
     


      // MÜDÜR: Samsung Galaxy saçmalığını bitiren hamle revize edildi! 
      // Eğer isimle arıyorsak, backend'deki "tam_eslesme" ajanına yolluyoruz ki birebir aynısını ve TEK BİR kayıt getirsin.
      const url = searchType === 'barkod' ? 
        `${API_URL}/api/stok/search?barkod=${encodeURIComponent(value)}` : 
        `${API_URL}/api/stok/search?tam_eslesme=${encodeURIComponent(value)}`;







      const response = await fetch(url);
      const res = await response.json();

      if (res.success && res.found) {
        // MÜDÜR: Malzeme depoda var! Kutuları otomatik doldur, yeşil alarmı yak.
        setF(prev => ({
          ...prev,
          barkod: res.data.barkod,
          malzeme_adi: res.data.malzeme_adi,
          marka: res.data.marka || prev.marka,
          uyumlu_cihaz: res.data.uyumlu_cihaz || prev.uyumlu_cihaz, // Müdür: TV ise TV gelecek!
          alis_fiyati: res.data.alis_fiyati ? res.data.alis_fiyati.toString() : prev.alis_fiyati
        }));

        // MÜDÜR: Bulunan malın sistemdeki eski fiyatını hafızaya alıyoruz
        setEskiAlis(res.data.alis_fiyati ? res.data.alis_fiyati.toString() : '');

        setRadarMsg({ type: 'success', text: `✅ DİKKAT: Bu malzeme depoda kayıtlı! Barkod: ${res.data.barkod}` });
      } else {
        // MÜDÜR: Malzeme yok! Kırmızı/Sarı alarmı yak.
        setRadarMsg({ type: 'warning', text: '🚨 YENİ ÜRÜN: Depoda eşleşme bulunamadı. Lütfen yeni barkod üretin veya okutun.' });
      }
    } catch (e) {
      setRadarMsg({ type: '', text: '' });
      console.error("Radar hatası:", e);
    }
  };
  // ------------------------------------

  const generateSuniBarkod = () => {
    const nanoId = Math.floor(1000 + Math.random() * 9000);
    const yeniBarkod =`GLCK-${Date.now().toString().slice(-6)}-${nanoId}`;
    setF(prev => ({ ...prev, barkod: yeniBarkod }));
  };

  const fetchUstaSiparisleri = async () => {
    try {
      const res = await fetch(`${API_URL}/api/material-requests/pending`); 
      const data = await res.json();
      setUstaSiparisleri(data.filter((i: any) => i.status !== 'Geldi'));
    } catch (e) { console.error("Siparişler çekilemedi", e); }
  };

  const handleBarCodeScanned = ({ data }: any) => {
    setF(prev => ({ ...prev, barkod: data }));
    setCameraVisible(false);
    // MÜDÜR: Barkod okutulunca radarı tetikle
    checkRadar('barkod', data);
  };





const handleSaveAttempt = () => {
    if (!f.barkod || !f.malzeme_adi || !f.alis_fiyati) {
      alert("Barkod, Malzeme Adı ve Alış Fiyatı zorunludur!");
      return;
    }

    const girilenFiyat = parseFloat(f.alis_fiyati);
    const sistemdekiFiyat = parseFloat(eskiAlis || '0');

    // 🚨 FİYAT DEĞİŞİMİ TESPİT EDİLDİYSE İKAZ VER
    if (sistemdekiFiyat > 0 && girilenFiyat !== sistemdekiFiyat) {
      Alert.alert(
        "⚠️ FİYAT DEĞİŞİMİ TESPİT EDİLDİ",
        `Bu ürünün sistemdeki eski alış fiyatı: ${sistemdekiFiyat} ₺\nSizin girdiğiniz yeni fiyat: ${girilenFiyat} ₺\n\nKasadan ${girilenFiyat} ₺ çıkış yapılacak.\n\nPeki stoktaki temel alış fiyatı da güncellensin mi?`,
        [
          { text: "Vazgeç", style: "cancel" },
          { 
            text: "Hayır, Eski Fiyatı Koru", 
            onPress: () => {
              setFiyatGuncelle(false); // Şalteri kapat, veritabanı fiyatı değişmesin
              Keyboard.dismiss();
              setConfirmModalVisible(true);
            }
          },
          { 
            text: "Evet, Fiyatı Güncelle", 
            onPress: () => {
              setFiyatGuncelle(true); // Şalteri aç, veritabanı da yeni fiyat olsun
              Keyboard.dismiss();
              setConfirmModalVisible(true);
            }
          }
        ]
      );
      return; // Alert açıldığı için işlemi burada durdur
    }

    // Fiyat değişmediyse veya ilk kez giriliyorsa direkt onaya geç
    setFiyatGuncelle(true); 
    Keyboard.dismiss();
    setConfirmModalVisible(true); 
  };







  const executeSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/stok/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barkod: f.barkod,
          malzeme_adi: f.malzeme_adi,
          uyumlu_cihaz: f.uyumlu_cihaz,
          marka: f.marka,
          miktar: parseInt(f.miktar),
          alis_fiyati: parseFloat(f.alis_fiyati),
          request_id: f.request_id,
          // 🚨 MÜDÜR: Son Eklentimiz! Fiyat güncellensin mi şalteri.
          fiyat_guncelle: fiyatGuncelle
        })
      });

      const res = await response.json();
      if (res.success) {
        setConfirmModalVisible(false);
        setSuccessModalVisible(true); 
      } else { alert("Hata: " + res.error); setConfirmModalVisible(false); }
    } catch (e) { alert("Sunucu bağlantı hatası!"); setConfirmModalVisible(false); }
    finally { setLoading(false); }
  };





  const handleFinalClose = () => {
    setSuccessModalVisible(false);
    setF(initialState);
    setRadarMsg({ type: '', text: '' });
    // 🚨 YENİ EKLENEN: Ekran kapanırken hafızayı sil
    setEskiAlis('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        
        {/* Müdür: Burası o meşhur kadrajın giydirildiği kamera modalı */}
        {cameraVisible ? (
          <View style={StyleSheet.absoluteFillObject}>
            <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleBarCodeScanned} />
            
            {/* --- MÜDÜR: KADRAJ TASARIMI --- */}
            <View style={styles.scannerOverlay}>
              {/* Üst Karartma */}
              <View style={styles.unfocusedContainer}></View>
              
              {/* Orta (Odak) Satırı */}
              <View style={styles.middleContainer}>
                {/* Sol Karartma */}
                <View style={styles.unfocusedContainer}></View>
                
                {/* Müdür: Tam ortadaki hedef kutusu */}
                <View style={styles.focusedContainer}>
                  {/* Kırmızı Köşe Çizgileri */}
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                  
                  {/* Müdür: Hedef Altı Yazısı */}
                  <View style={styles.radarTextRow}>
                    <Ionicons name="scan-outline" size={18} color="#FF3B30" />
                    <Text style={styles.radarText}>BARKOD RADARI AKTİF</Text>
                  </View>
                </View>
                
                {/* Sağ Karartma */}
                <View style={styles.unfocusedContainer}></View>
              </View>
              
              {/* Alt Karartma ve İptal Butonu */}
              <View style={styles.unfocusedContainer}>
                <TouchableOpacity style={styles.camCloseBottom} onPress={() => setCameraVisible(false)}>
                  <Ionicons name="close-circle" size={60} color="#fff" />
                  <Text style={{color:'#fff', fontWeight:'bold', marginTop:5}}>İPTAL</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* ------------------------------------------ */}
          </View>
        ) : (
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 40}
            style={{flex: 1}}
          >
            <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
              
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textColor }]}>MAL KABUL / STOK GİRİŞİ</Text>
                <TouchableOpacity onPress={handleFinalClose} style={styles.solidCloseBtn}>
                  <Ionicons name="close" size={26} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom: 150}}>
                
                <Text style={[styles.label, { color: theme.labelColor }]}>İŞLEM TÜRÜ (*)</Text>
                <TouchableOpacity style={[styles.input, { backgroundColor: theme.inputBg, borderColor: focus === 'tur' ? theme.primary : theme.borderColor }]} onPress={() => { setShowTurModal(true); setFocus('tur'); }}>
                  <Text style={{color: f.tur ? theme.textColor : '#888'}}>{f.tur || 'Seçiniz...'}</Text>
                </TouchableOpacity>

                {f.tur === 'Bekleyen Parça' && (
                  <View>
                    <Text style={[styles.label, { color: theme.labelColor }]}>TALEBİ KARŞILANAN USTA (*)</Text>
                    <TouchableOpacity style={[styles.input, { backgroundColor: theme.inputBg, borderColor: focus === 'usta' ? theme.primary : theme.borderColor }]} onPress={() => { setShowUstaModal(true); setFocus('usta'); }}>
                      <Text style={{color: f.usta ? theme.textColor : '#888'}}>{f.usta || 'Usta Seçiniz...'}</Text>
                    </TouchableOpacity>

                    {f.usta && !f.malzeme_adi && (
                      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#FFCC00', marginTop: 15, height: 45, borderRadius: 12 }]} onPress={() => { fetchUstaSiparisleri(); setShowUstaSiparisModal(true); }}>
                        <Text style={[styles.saveBtnText, {color: '#000', fontSize: 16}]}>SİPARİŞLERİ GÖSTER</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* --- MÜDÜR: RADAR ALARM ETİKETİ BURADA GÖSTERİLİR --- */}
                {radarMsg.text ? (
                  <View style={[styles.alarmBox, { 
                    backgroundColor: radarMsg.type === 'success' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 149, 0, 0.15)',
                    borderColor: radarMsg.type === 'success' ? '#34C759' : '#FF9500'
                  }]}>
                    <Text style={[styles.alarmText, { color: radarMsg.type === 'success' ? '#34C759' : '#FF9500' }]}>
                      {radarMsg.text}
                    </Text>
                  </View>
                ) : null}
                {/* ---------------------------------------------------- */}

                <Text style={[styles.label, { color: theme.labelColor }]}>BARKOD / SERİ NO (*)</Text>
                <View style={styles.row}>
                  <TextInput 
                    style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.textColor, borderColor: focus === 'barkod' ? theme.primary : theme.borderColor }]} 
                    value={f.barkod} placeholder="Okutun veya yazın..." placeholderTextColor="#888"
                    onFocus={() => setFocus('barkod')}
                    onChangeText={v => setF({...f, barkod: v})} 
                    onEndEditing={() => { if(f.barkod) checkRadar('barkod', f.barkod); }} // Elden barkod yazılıp klavye kapanınca da arasın
                  />
                  <TouchableOpacity style={styles.iconBtn} onPress={async () => { if (!permission?.granted) await requestPermission(); setCameraVisible(true); }}>
                    <Ionicons name="camera" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#34C759' }]} onPress={generateSuniBarkod}>
                    <Ionicons name="brush" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.labelColor }]}>MALZEME ADI (*)</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textColor, borderColor: focus === 'malzeme_adi' ? theme.primary : theme.borderColor }]} 
                  value={f.malzeme_adi} 
                  onFocus={() => setFocus('malzeme_adi')}
                  onChangeText={v => setF({...f, malzeme_adi: v})} 
                  returnKeyType="next"
                  blurOnSubmit={false} 
                  onSubmitEditing={() => rMarka.current?.focus()}
                />

                <Text style={[styles.label, { color: theme.labelColor }]}>MARKA</Text>
                <TextInput 
                  ref={rMarka}
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textColor, borderColor: focus === 'marka' ? theme.primary : theme.borderColor }]} 
                  value={f.marka} 
                  onFocus={() => setFocus('marka')}
                  onChangeText={v => setF({...f, marka: v})} 
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => rCihaz.current?.focus()}
                />

                <View style={styles.row}>
                  <View style={{flex: 1, marginRight: 10}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>UYUMLU CİHAZ</Text>
                    <TextInput 
                      ref={rCihaz}
                      style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textColor, borderColor: focus === 'uyumlu_cihaz' ? theme.primary : theme.borderColor }]} 
                      value={f.uyumlu_cihaz} 
                      onFocus={() => setFocus('uyumlu_cihaz')}
                      onChangeText={v => setF({...f, uyumlu_cihaz: v})} 
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => rMiktar.current?.focus()}
                    />
                  </View>
                  <View style={{width: 100}}>
                    <Text style={[styles.label, { color: theme.labelColor }]}>MİKTAR</Text>
                    <TextInput 
                      ref={rMiktar}
                      style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textColor, textAlign: 'center', borderColor: focus === 'miktar' ? theme.primary : theme.borderColor }]} 
                      keyboardType="numeric" value={f.miktar} 
                      onFocus={() => setFocus('miktar')}
                      onChangeText={v => setF({...f, miktar: v})} 
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => rAlis.current?.focus()}
                    />
                  </View>
                </View>

                <Text style={[styles.label, { color: theme.labelColor }]}>ALIŞ FİYATI (₺) (*)</Text>
                <TextInput 
                  ref={rAlis}
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textColor, borderColor: focus === 'alis_fiyati' ? theme.primary : theme.borderColor }]} 
                  keyboardType="numeric" value={f.alis_fiyati} 
                  onFocus={() => setFocus('alis_fiyati')}
                  onChangeText={v => setF({...f, alis_fiyati: v})} 
                  returnKeyType="done"
                  onSubmitEditing={() => { Keyboard.dismiss(); setFocus(''); }}
                />

                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSaveAttempt}>
                  <Text style={styles.saveBtnText}>KAYIT</Text>
                </TouchableOpacity>

              </ScrollView>

              {/* MODALLAR */}
              <Modal visible={showTurModal} transparent animationType="fade">
                <TouchableOpacity style={styles.overlay} onPress={() => setShowTurModal(false)}>
                  <View style={[styles.miniModal, { backgroundColor: theme.cardBg }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { setF({...f, tur: 'Stok Tamamlama', usta: '', request_id: null}); setShowTurModal(false); setFocus(''); setRadarMsg({type:'', text:''}); }}>
                      <Text style={[styles.menuText, { color: theme.textColor }]}>📦 Stok Tamamlama (Genel)</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem} onPress={() => { 
                        setF({...f, tur: 'Bekleyen Parça', usta: ''}); 
                        setShowTurModal(false); 
                        setTimeout(() => setShowUstaModal(true), 300); 
                        setFocus('usta'); 
                      }}>
                      <Text style={[styles.menuText, { color: theme.textColor }]}>👨‍🔧 Bekleyen Parça (Usta Siparişi)</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>

              <Modal visible={showUstaModal} transparent animationType="fade">
                <TouchableOpacity style={styles.overlay} onPress={() => setShowUstaModal(false)}>
                  <View style={[styles.miniModal, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.modalTitle, { color: theme.textColor, marginBottom: 10 }]}>USTA SEÇİNİZ</Text>
                    {ustaListesi.map((u, index) => (
                      <TouchableOpacity key={index} style={styles.menuItem} onPress={() => {
                        if (!u.active) {
                          alert("Askeri Nizam: Bu usta şu an pasif modda, işlem yapılamaz!");
                        } else {
                          setF({...f, usta: u.value});
                          setShowUstaModal(false);
                          setTimeout(() => {
                            fetchUstaSiparisleri();
                            setShowUstaSiparisModal(true);
                          }, 300);
                        }
                      }}>
                        <Text style={[styles.menuText, { color: u.active ? theme.textColor : '#888' }]}>{u.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>



                    
                </TouchableOpacity>
              </Modal>

              <Modal visible={showUstaSiparisModal} transparent animationType="slide">
                <View style={styles.overlay}>
                  <View style={[styles.siparisModal, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.modalTitle, { color: theme.textColor }]}>USTA TALEPLERİ LİSTESİ</Text>
                    <ScrollView>


                      {ustaSiparisleri.map((s: any) => (

                        <TouchableOpacity 
                                key={s.id} 
                                style={styles.siparisItem} 
                                onPress={() => {
                                  setF({
                                    ...f, 
                                    tur: 'Bekleyen Parça', 
                                    malzeme_adi: s.material_name, 
                                    uyumlu_cihaz: s.device_model, 
                                    miktar: s.quantity.toString(), 
                                    request_id: s.id
                                  });
                                  setShowUstaSiparisModal(false);
                                  checkRadar('malzeme_adi', s.material_name);
                                }}
                              >
                                {/* Üst Kısım: Malzeme ve Cihaz Bilgisi (Standart Veri) */}
                                <Text style={{fontWeight: '900', color: theme.textColor}}>{s.material_name}</Text>
                                <Text style={{fontSize: 12, color: '#888'}}>{s.device_model} - {s.quantity} Adet</Text>

                                {/* 🚨 SADECE NOT ALANI: Sadece ham metni gösteren temiz kutu */}
                                {s.description ? (
                                  <View style={{
                                    backgroundColor: 'rgba(255, 204, 0, 0.1)', 
                                    padding: 6, 
                                    marginTop: 6, 
                                    borderRadius: 6, 
                                    borderLeftWidth: 3, 
                                    borderLeftColor: '#FFCC00'
                                  }}>

                                  {/* 🚨 İŞTE İSTEDİĞİN O BAŞLIK 🚨 */}
                                    <Text style={{
                                      fontSize: 11, 
                                      fontWeight: '900', 
                                      color: '#B45309', // Koyu sarı/turuncu tonu, göz yormaz ama dikkat çeker
                                      marginBottom: 3
                                    }}>
                                      📌 USTA NOTU:
                                    </Text>

                                    <Text style={{
                                      fontSize: 12, 
                                      color: theme.textColor, 
                                      fontStyle: 'italic',
                                      lineHeight: 16
                                    }}>
                                      {s.description}
                                    </Text>
                                  </View>
                                ) : null}
                              </TouchableOpacity>
                        
                        





                      ))}
                    </ScrollView>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setShowUstaSiparisModal(false)}><Text style={{color: '#fff', fontWeight: 'bold'}}>KAPAT</Text></TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Modal visible={confirmModalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                  <View style={[styles.alertContent, { backgroundColor: theme.cardBg }]}>
                    <View style={styles.alertIconWrapper}>
                      <Ionicons name="warning" size={60} color="#FFCC00" />
                    </View>
                    <Text style={[styles.alertMessage, { color: theme.textColor }]}>Ürünü envantere kayıt etmek üzeresiniz.</Text>
                    
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20}}>
                      <TouchableOpacity style={[styles.alertBtn, { backgroundColor: '#FF3B30', width: '45%' }]} onPress={() => setConfirmModalVisible(false)}>
                        <Text style={styles.alertBtnText}>İPTAL</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.alertBtn, { backgroundColor: '#34C759', width: '45%' }]} onPress={executeSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark-circle" size={32} color="#fff" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              <Modal visible={successModalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                  <View style={[styles.alertContent, { backgroundColor: theme.cardBg }]}>
                    <View style={styles.alertIconWrapper}>
                      <Ionicons name="checkmark-circle" size={70} color="#34C759" />
                    </View>
                    <Text style={[styles.alertTitle, { color: theme.textColor }]}>Kayıt Başarılı</Text>
                    <TouchableOpacity style={[styles.alertBtn, { backgroundColor: theme.accent, width: '100%', marginTop: 25 }]} onPress={handleFinalClose}>
                      <Text style={styles.alertBtnText}>TAMAM</Text>
                    </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 20, paddingHorizontal: 20 },
  title: { fontSize: 20, fontWeight: '900' },
  solidCloseBtn: { backgroundColor: '#FF3B30', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '900', marginTop: 15, marginBottom: 5, paddingHorizontal: 20 },
  input: { borderRadius: 12, padding: 15, borderWidth: 1.5, fontSize: 14, marginHorizontal: 20, minHeight: 50 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  iconBtn: { width: 50, height: 50, backgroundColor: '#1A1A1A', borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  saveBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 15, marginHorizontal: 20, marginBottom: 25 },
  saveBtnText: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  miniModal: { width: '80%', borderRadius: 20, padding: 10 },
  menuItem: { padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  menuText: { fontSize: 16, fontWeight: '600' },
  siparisModal: { width: '90%', height: '60%', borderRadius: 25, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  siparisItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 5 },
  closeBtn: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  camClose: { position: 'absolute', top: 60, right: 30 },
  alertContent: { width: '85%', borderRadius: 30, padding: 35, alignItems: 'center' },
  alertIconWrapper: { marginBottom: 15 },
  alertTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  alertMessage: { fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 26 },
  alertBtn: { height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  alertBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  // MÜDÜR: ALARM ETİKETİ STİLLERİ
  alarmBox: { marginHorizontal: 20, marginTop: 15, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  alarmText: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },

  // --- MÜDÜR: YENİ RADAR (KADRAJ) STİLLERİ ---
  scannerOverlay: { flex: 1, backgroundColor: 'transparent' },
  // Odak dışı alanlar için yarı saydam siyahlık
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  // Tam ortadaki odak şeridi
  middleContainer: { flexDirection: 'row', height: 260 },
  // Müdür: Tam ortadaki hedef kutusu
  focusedContainer: { width: 260, height: 260, position: 'relative' },
  // Köşe çizgilerinin ortak stili
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#FF3B30', borderWidth: 4 },
  // Konumlandırma
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  // Müdür: Hedef altı yazı sırası
  radarTextRow: { position: 'absolute', bottom: -40, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  radarText: { color: '#FF3B30', fontSize: 12, fontWeight: '900', marginLeft: 8 },
  // Alt karartmadaki iptal butonu
  camCloseBottom: { alignItems: 'center' }
});