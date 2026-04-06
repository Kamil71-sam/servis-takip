import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, SafeAreaView, Modal, ActivityIndicator, Alert, Dimensions,DeviceEventEmitter
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; 

import StokGirisiFormu from './StokGirisiFormu'; 
import StokCikisiFormu from './StokCikisiFormu';
import StokYonetimListesi from './StokYonetimListesi'; 

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// --- 1. YAKIŞIKLI ALERT KUTUSU ---
const HandsomeAlert = ({ visible, title, message, onClose, type, isDarkMode }: any) => {
  if (!visible) return null;
  return (
    <Modal visible={true} transparent animationType="fade"> 
      <View style={styles.modalOverlay}>
        <View style={[styles.alertContent, { backgroundColor: isDarkMode ? '#1b1b1b' : '#fff' }]}>
          <View style={styles.alertIconWrapper}> 
            <Ionicons name={type === 'error' ? "close-circle" : "checkmark-circle"} size={60} color={type === 'error' ? "#FF3B30" : "#34C759"} />
          </View>
          <Text style={[styles.alertTitle, { color: isDarkMode ? '#fff' : '#1A1A1A' }]}>{title}</Text>
          <Text style={[styles.alertMessage, { color: isDarkMode ? '#aaa' : '#666' }]}>{message}</Text>
          <TouchableOpacity style={[styles.alertBtn, { backgroundColor: type === 'error' ? '#fd3328' : '#1A1A1A' }]} onPress={onClose}>
            <Text style={styles.alertBtnText}>TAMAM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- 2. FİLTRE ASANSÖRÜ ---
const FilterModal = ({ visible, onClose, onSelect, isDarkMode }: any) => {
  if (!visible) return null;
  const secenekler = [
    { id: 'tumu', icon: 'list', text: 'Tüm Envanteri Göster' },
    { id: 'kritik', icon: 'warning', text: 'Kritik Stokları Göster (< 2)' },
    { id: 'isme', icon: 'text', text: 'İsme Göre Sırala' },
  ];
  return (
    <Modal visible={true} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.filterContent, { backgroundColor: isDarkMode ? '#222222' : '#fff' }]}>
          <Text style={[styles.filterTitleHeader, { color: isDarkMode ? '#fff' : '#1a1a1a', borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>GÖRÜNÜM VE FİLTRELEME</Text>
          {secenekler.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.filterItem, { borderBottomColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]} 
              onPress={() => onSelect(item.id)}
            >
              <Ionicons name={item.icon as any} size={20} color={item.id === 'kritik' ? '#ff3025' : '#1A1A1A'} style={{ marginRight: 15 }} />
              <Text style={[styles.filterItemText, { color: item.id === 'kritik' ? '#FF3B30' : (isDarkMode ? '#ddd' : '#333') }]}>{item.text}</Text>
              <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#555' : '#ccc'} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function StokTakibiAnaEkran({ visible, onClose, isDarkMode = false }: any) {
  const [aktifFiltre, setAktifFiltre] = useState('tumu'); 
  const [stokGirisVisible, setStokGirisVisible] = useState(false);
  const [stokCikisVisible, setStokCikisVisible] = useState(false);
  const [envanterYonetimVisible, setEnvanterYonetimVisible] = useState(false); 
  const [filterVisible, setFilterVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' });

  // --- İSKONTO VE GEÇMİŞ MOTORU ---
  const [discountRate, setDiscountRate] = useState(0); 
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false); 
  const [historyData, setHistoryData] = useState<any[]>([]); 
  const [selectedItemName, setSelectedItemName] = useState('');

  // --- ÖZEL TARAMA SONUCU MODALI ---
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scannedItem, setScannedItem] = useState<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [envanterDB, setEnvanterDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState(''); 

  const theme = {
    bg: isDarkMode ? '#2e2d2d' : '#f4f6f8',
    cardBg: isDarkMode ? '#1e1e1e' : '#fff',
    borderColor: isDarkMode ? '#333' : '#e0e0e0',
    textColor: isDarkMode ? '#fff' : '#1A1A1A',
    subText: isDarkMode ? '#aaa' : '#666',
    primary: '#FF3B30',
    barcodeBg: isDarkMode ? '#2c2c2c' : '#1A1A1A', 
  };

  const fetchEnvanter = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/stok/all`);
      const result = await response.json();
      if (result.success) setEnvanterDB(result.data);
    } catch (error) { console.error("Sunucuya bağlanılamadı:", error); }
    finally { setLoading(false); }
  };

  const fetchHistory = async (id: number, name: string) => {
    setSelectedItemName(name);
    try {
      const response = await fetch(`${API_URL}/api/stok/history/${id}`);
      const res = await response.json();
      if (res.success && res.data.length > 0) {
        setHistoryData(res.data);
        setHistoryVisible(true);
      } else {
        setAlertConfig({ visible: true, title: "Bilgi", message: "Bu ürünün henüz fiyat geçmişi yok.", type: 'success' });
      }
    } catch (e) { 
        setAlertConfig({ visible: true, title: "Hata", message: "Geçmiş verileri alınamadı.", type: 'error' }); 
    }
  };

  useEffect(() => {
    if (visible) fetchEnvanter();
  }, [visible, stokGirisVisible, stokCikisVisible]);

  const sonIkiHareket = useMemo(() => envanterDB.slice(0, 3), [envanterDB]);

  const openDiscountPrompt = () => setDiscountModalVisible(true);

  if (!visible) return null;



const handleSmartScan = async ({ data }: any) => {
    setCameraVisible(false);
    setScannedBarcode(data); 
    try {
      const response = await fetch(`${API_URL}/api/stok/search?barkod=${data}`);
      const res = await response.json();
      
      if (res.success && res.found) {
        
        // 🚨 İŞTE BÜTÜN DÜĞÜMÜ ÇÖZEN SATIR: Kutuysa aç, değilse olduğu gibi al
        const gercekItem = Array.isArray(res.data) ? res.data[0] : res.data;
        
        setScannedItem(gercekItem); // Artık kutuyu değil, direkt 20 adet olan ürünü verdik
        setScanModalVisible(true);
        
      } else {
        Alert.alert("🚨 KAYITSIZ", "Kayıt açılsın mı?", [
          { text: "HAYIR", style: "cancel" },
          { text: "EVET", onPress: () => setStokGirisVisible(true) }
        ]);
      }
    } catch (e) { 
        setAlertConfig({ visible: true, title: "Hata", message: "Radar taraması başarısız.", type: 'error' }); 
    }
  };



/*
  const handleSmartScan = async ({ data }: any) => {
    setCameraVisible(false);
    setScannedBarcode(data); 
    try {
      const response = await fetch(`${API_URL}/api/stok/search?barkod=${data}`);
      const res = await response.json();
      
      if (res.success && res.found) {
        setScannedItem(res.data);
        setScanModalVisible(true);
      } else {
        Alert.alert("🚨 KAYITSIZ", "Kayıt açılsın mı?", [
          { text: "HAYIR", style: "cancel" },
          { text: "EVET", onPress: () => setStokGirisVisible(true) }
        ]);
      }
    } catch (e) { 
        setAlertConfig({ visible: true, title: "Hata", message: "Radar taraması başarısız.", type: 'error' }); 
    }
  };
*/





// --- 🚨 1. MÜDÜRÜN KAPI GÜVENLİĞİ (ONAY ALMADAN KASAYA DOKUNMAZ) ---
  const quickAction = async (id: number, barkod: string, type: 'add' | 'sell') => {
    if (type === 'add') {
      const kayitliFiyat = scannedItem?.alis_fiyati || 0;
      
      Alert.alert(
        "Stok Alım Onayı",
        `📦 ${scannedItem?.malzeme_adi || 'Ürün'}\n💰 Kayıtlı Alış Fiyatı: ${kayitliFiyat} ₺\n\nBu tutar KASADAN ÇIKIŞ olarak işlenecektir. Onaylıyor musunuz?\n\n(Eğer ürünü farklı fiyattan aldıysanız İPTAL edip 'Envanter Yönetimi' bölümünden güncelleyiniz.)`,
        [
          { text: "İPTAL", style: "cancel" },
          { text: "ONAYLA VE KASADAN DÜŞ", onPress: () => executeBackendRequest(id, barkod, type) }
        ]
      );
    } else {
      // Satış işlemiyse direkt motora gönder
      executeBackendRequest(id, barkod, type);
    }
  };

  // --- ⚙️ 2. ASIL İŞLEM MOTORU (ONAYDAN SONRA ÇALIŞIR) ---
  const executeBackendRequest = async (id: number, barkod: string, type: 'add' | 'sell') => {
    setLoading(true);
    try {
      const endpoint = type === 'add' ? '/api/stok/add' : '/api/stok/sell';
      const body = type === 'add' ? 
        { barkod, miktar: 1, malzeme_adi: '', alis_fiyati: 0 } : 
        { id, barkod, cikan_adet: 1, is_relative: discountRate > 0, manual_discount: discountRate };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const resData = await res.json();
      
      if (resData.success) {
        fetchEnvanter();

        // --- 🚨 KASAYA HABER VERİYORUZ ---
        DeviceEventEmitter.emit('kasaYenile');

        setAlertConfig({ visible: true, title: "Başarılı", message: resData.message || "İşlem tamamlandı.", type: 'success' });
      }
    } catch (e) { 
        setAlertConfig({ visible: true, title: "Hata", message: "İşlem yapılamadı.", type: 'error' }); 
    }
    finally { setLoading(false); }
  };

  /*

        const quickAction = async (id: number, barkod: string, type: 'add' | 'sell') => {
            setLoading(true);
            try {
              const endpoint = type === 'add' ? '/api/stok/add' : '/api/stok/sell';
              const body = type === 'add' ? 
                { barkod, miktar: 1, malzeme_adi: '', alis_fiyati: 0 } : 
                { id, barkod, cikan_adet: 1, is_relative: discountRate > 0, manual_discount: discountRate };

              const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              });
              const resData = await res.json();
              
              if (resData.success) {
                fetchEnvanter();

                // --- 🚨 İŞTE ATEŞLEME MEKANİZMASI: KASAYA HABER VERİYORUZ ---
                DeviceEventEmitter.emit('kasaYenile');

                // --- 🚨 MÜDÜRÜN FİYAT UYARI KİLİDİ ---
                let uyariMesaji = resData.message || "Stok güncellendi.";
                
                // Sadece 'add' (+1 EKLE) işleminde bu uyarıyı ver
                if (type === 'add' && resData.data) {
                    const guncelFiyat = resData.data.alis_fiyati || 0;
                    uyariMesaji = `İşlem Başarılı: +1 Eklendi.\n\n💰 Kayıtlı Alış Fiyatı: ${guncelFiyat} ₺\n(Kasadan bu tutar düşüldü)\n\nFarklı bir fiyattan aldıysanız, Envanter Yönetimi'nden güncelleyin!`;
                }

                // Güncellenmiş mesajı ekrana bas
                setAlertConfig({ visible: true, title: "Başarılı", message: uyariMesaji, type: 'success' });
              }
            } catch (e) { 
                setAlertConfig({ visible: true, title: "Hata", message: "İşlem yapılamadı.", type: 'error' }); 
            }
            finally { setLoading(false); }
          };




   
  const quickAction = async (id: number, barkod: string, type: 'add' | 'sell') => {
    setLoading(true);
    try {
      const endpoint = type === 'add' ? '/api/stok/add' : '/api/stok/sell';
      const body = type === 'add' ? 
        { barkod, miktar: 1, malzeme_adi: '', alis_fiyati: 0 } : 
        { id, barkod, cikan_adet: 1, is_relative: discountRate > 0, manual_discount: discountRate };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const resData = await res.json();
      if (resData.success) {
        fetchEnvanter();

       

        // --- 🚨 İŞTE ATEŞLEME MEKANİZMASI: KASAYA HABER VERİYORUZ ---
        DeviceEventEmitter.emit('kasaYenile');



        setAlertConfig({ visible: true, title: "Başarılı", message: resData.message || "Stok güncellendi.", type: 'success' });
      }
    } catch (e) { 
        setAlertConfig({ visible: true, title: "Hata", message: "İşlem yapılamadı.", type: 'error' }); 
    }
    finally { setLoading(false); }
  };

*/




  return (
    <Modal visible={true} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        
        {cameraVisible ? (
          <View style={StyleSheet.absoluteFillObject}>
            <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleSmartScan} />
            <View style={styles.scannerOverlay}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.middleContainer}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.focusedContainer}>
                  <View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} />
                  <View style={styles.radarTextRow}><Ionicons name="scan-outline" size={18} color="#FF3B30" /><Text style={styles.radarText}>HIZLI İŞLEMLER AKTİF</Text></View>
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
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
          
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textColor }]}>STOK & DEPO</Text>
              <Text style={[styles.headerSub, { color: theme.subText }]}>Kurumsal Envanter Yönetimi</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color={theme.primary} /></TouchableOpacity>
          </View>

          {/* ÇERÇEVELİ HIZLI TARAMA BÖLGESİ */}
          <View style={[styles.framedContainer, { borderColor: theme.borderColor, backgroundColor: theme.cardBg }]}>
            <Text style={[styles.frameTitle, { color: theme.subText }]}>HIZLI İŞLEM BÖLGESİ</Text>
            
            <View style={styles.radarActionContainer}>
              <TouchableOpacity 
                style={[styles.barcodeBox, { backgroundColor: theme.barcodeBg, borderColor: theme.primary, borderWidth: 1.5, flex: 2 }]} 
                onPress={async () => {
                  if (!permission?.granted) await requestPermission();
                  setCameraVisible(true);
                }}
              >
                <Ionicons name="barcode-outline" size={15} color="#fff" />
                <Text style={styles.barcodeTitle}>HIZLI İŞLEMLER</Text>
                <Ionicons name="scan" size={20} color={theme.primary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.discountBox, { backgroundColor: discountRate > 0 ? '#FF3B30' : theme.bg, borderColor: discountRate > 0 ? '#FF3B30' : theme.borderColor }]} 
                onPress={openDiscountPrompt}
              >
                <Text style={[styles.discountIcon, { color: discountRate > 0 ? '#fff' : theme.textColor }]}>%</Text>
                <Text style={[styles.discountText, { color: discountRate > 0 ? '#fff' : theme.subText }]}>{discountRate > 0 ? `%${discountRate}` : 'İNDİRİM'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.actionRow, { marginHorizontal: 19 }]}>
            <TouchableOpacity style={[styles.mainActionBox, { backgroundColor: '#1A1A1A' }]} onPress={() => { setScannedBarcode(''); setStokGirisVisible(true); }}>
              <View style={styles.iconCircle}><Ionicons name="arrow-down" size={24} color="#fff" /></View>
              <Text style={styles.actionMainText}>STOK GİRİŞİ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mainActionBox, { backgroundColor: theme.primary }]} onPress={() => setStokCikisVisible(true)}>
              <View style={styles.iconCircle}><Ionicons name="arrow-up" size={24} color="#fff" /></View>
              <Text style={styles.actionMainText}>STOK ÇIKIŞI</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.listHeaderRow, { marginHorizontal: 25 }]}>
            <Text style={[styles.sectionTitle, { color: theme.subText, marginBottom: 0 }]}>SON ÜÇ HAREKET</Text>
            <TouchableOpacity style={styles.allListBtn} onPress={() => setEnvanterYonetimVisible(true)}>
              <Ionicons name="list" size={30} color={theme.primary} />
              <Text style={[styles.allListBtnText, { color: theme.primary }]}>ENVANTER YÖNETİMİ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 20 }}>
            {loading ? (
               <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
            ) : (
              sonIkiHareket.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  activeOpacity={1} 
                  style={[styles.listItem, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
                >
                  <View style={styles.listIconBox}><Ionicons name="cube" size={24} color={theme.subText} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listTitle, { color: theme.textColor }]}>{item.malzeme_adi}</Text>
                    <Text style={[styles.listBrand, { color: theme.subText }]}>{item.marka || 'Markasız'} • {item.barkod}</Text>
                  </View>
                  <View style={[styles.listBadge, { backgroundColor: item.miktar < 2 ? '#fa3328' : theme.barcodeBg }]}><Text style={styles.listBadgeText}>{item.miktar} Adet</Text></View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} onSelect={(m: string) => { setAktifFiltre(m); setFilterVisible(false); }} isDarkMode={isDarkMode} />
          <StokGirisiFormu visible={stokGirisVisible} onClose={() => setStokGirisVisible(false)} isDarkMode={isDarkMode} initialBarcode={scannedBarcode} />
          <StokCikisiFormu visible={stokCikisVisible} onClose={() => setStokCikisVisible(false)} isDarkMode={isDarkMode} externalDiscount={discountRate} />
          <StokYonetimListesi visible={envanterYonetimVisible} onClose={() => setEnvanterYonetimVisible(false)} isDarkMode={isDarkMode} onShowHistory={fetchHistory} />
          <HandsomeAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({ ...alertConfig, visible: false })} isDarkMode={isDarkMode} />

          {/* İNDİRİM MODALI */}
          <Modal visible={discountModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={[styles.alertContent, { backgroundColor: isDarkMode ? '#1b1b1b' : '#fff' }]}>
                <Ionicons name="pricetag" size={40} color="#FF3B30" style={{ marginBottom: 15 }} />
                <Text style={[styles.alertTitle, { color: isDarkMode ? '#fff' : '#1A1A1A' }]}>İskonto Oranı</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 25, marginTop:20 }}>
                  {[0, 5, 10, 15, 20, 25, 50].map((rate) => (
                    <TouchableOpacity key={rate} style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, backgroundColor: discountRate === rate ? '#FF3B30' : (isDarkMode ? '#333' : '#f0f0f0') }} onPress={() => { setDiscountRate(rate); setDiscountModalVisible(false); }}>
                      <Text style={{ fontWeight: 'bold', color: discountRate === rate ? '#fff' : (isDarkMode ? '#ddd' : '#333') }}>{rate === 0 ? 'İptal' : `%${rate}`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[styles.alertBtn, { backgroundColor: '#1A1A1A' }]} onPress={() => setDiscountModalVisible(false)}><Text style={styles.alertBtnText}>KAPAT</Text></TouchableOpacity>
              </View>
            </View>
          </Modal>


          {/* TARİHÇE MODALI */}
          <Modal visible={historyVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={[styles.alertContent, { backgroundColor: isDarkMode ? '#1b1b1b' : '#fff', height: '70%', width: '90%' }]}>
                <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%', marginBottom:15}}>
                  <Text style={[styles.alertTitle, { color: isDarkMode ? '#fff' : '#1A1A1A', fontSize: 18 }]}>{selectedItemName} - Tarihçe</Text>
                  <TouchableOpacity onPress={() => setHistoryVisible(false)}><Ionicons name="close-circle" size={30} color="#FF3B30" /></TouchableOpacity>
                </View>
                
                <ScrollView style={{width:'100%'}} showsVerticalScrollIndicator={false}>
                  {historyData.map((h, i) => (
                    <View key={i} style={{borderBottomWidth:1, borderColor: isDarkMode ? '#333' : '#eee', paddingVertical:12}}>
                       <Text style={{fontSize:10, color:'#888', fontWeight: 'bold'}}>{new Date(h.degisim_tarihi).toLocaleString('tr-TR')}</Text>
                       
                       {/* MÜDÜR: Satış uçuruldu, Alış tek kutuda merkeze alındı */}
                       <View style={{ marginTop: 8, backgroundColor: isDarkMode ? '#2c2c2c' : '#f9f9f9', padding: 12, borderRadius: 12 }}>
                          <Text style={{fontSize:11, color:theme.subText, marginBottom: 6, fontWeight: '900'}}>ALIŞ FİYATI DEĞİŞİMİ</Text>
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Ionicons name="pricetag" size={16} color={theme.primary} style={{marginRight: 8}} />
                            <Text style={{
                              fontWeight: 'bold', 
                              fontSize: 16, 
                              color: parseFloat(h.yeni_alis) > parseFloat(h.eski_alis) ? '#FF3B30' : '#34C759'
                            }}>
                              {h.eski_alis} ₺ ➔ {h.yeni_alis} ₺
                            </Text>
                          </View>
                       </View>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity 
                  style={[styles.alertBtn, { backgroundColor: '#1A1A1A', marginTop: 15 }]} 
                  onPress={() => setHistoryVisible(false)}
                >
                  <Text style={styles.alertBtnText}>KAPAT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>






          
  




          {/* 4 BUTONLU ÖZEL TARAMA SONUCU MODALI */}
          <Modal visible={scanModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={[styles.alertContent, { backgroundColor: isDarkMode ? '#1b1b1b' : '#fff', padding: 25, width: '90%' }]}>
                
                <View style={{alignItems: 'center', marginBottom: 15}}>
                  <Ionicons name="cube" size={50} color={theme.primary} />
                  <Text style={{fontSize: 18, fontWeight: '900', color: theme.textColor, textAlign: 'center', marginTop: 10}}>
                    {discountRate > 0 ? `🏷️ %${discountRate} İSKONTO AKTİF` : "📦 ÜRÜN BULUNDU"}
                  </Text>
                </View>

                <View style={{backgroundColor: isDarkMode ? '#333' : '#f5f5f5', padding: 15, borderRadius: 15, width: '100%', marginBottom: 25}}>
                  <Text style={{fontSize: 17, color: theme.textColor, fontWeight: '800', textAlign: 'center'}}>{scannedItem?.malzeme_adi}</Text>
                  <Text style={{fontSize: 14, color: theme.subText, textAlign: 'center', marginTop: 8}}>
                    Depodaki Miktar: <Text style={{fontWeight: '900', color: Number(scannedItem?.miktar) < 2 ? '#FF3B30' : theme.textColor}}>
                      {scannedItem != null ? String(scannedItem.miktar) : '0'}
                    </Text>
                  </Text>
                </View>

                {/* Butonlar: 2x2 Grid Yapısı */}
                <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12}}>
                   <TouchableOpacity style={[styles.scanActionBtn, {backgroundColor: '#34C759'}]} onPress={() => { setScanModalVisible(false); quickAction(scannedItem?.id, scannedBarcode, 'add'); }}>
                      <Ionicons name="add-circle" size={22} color="#fff" />
                      <Text style={styles.scanActionBtnText}>+1 EKLE</Text>
                   </TouchableOpacity>

                   <TouchableOpacity style={[styles.scanActionBtn, {backgroundColor: '#FF3B30'}]} onPress={() => { setScanModalVisible(false); quickAction(scannedItem?.id, scannedBarcode, 'sell'); }}>
                      <Ionicons name="remove-circle" size={22} color="#fff" />
                      <Text style={styles.scanActionBtnText}>-1 SAT</Text>
                   </TouchableOpacity>
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                   <TouchableOpacity style={[styles.scanActionBtn, {backgroundColor: '#5c5453'}]} onPress={() => { setScanModalVisible(false); fetchHistory(scannedItem?.id, scannedItem?.malzeme_adi); }}>
                      <Ionicons name="time" size={22} color="#fff" />
                      <Text style={styles.scanActionBtnText}>GEÇMİŞ</Text>
                   </TouchableOpacity>

                   <TouchableOpacity style={[styles.scanActionBtn, {backgroundColor: '#1A1A1A'}]} onPress={() => setScanModalVisible(false)}>
                      <Ionicons name="close" size={22} color="#fff" />
                      <Text style={styles.scanActionBtnText}>İPTAL</Text>
                   </TouchableOpacity>
                </View>

              </View>
            </View>
          </Modal>

        </SafeAreaView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 15, paddingHorizontal: 20 },
  headerTitle: { fontSize: 26, fontWeight: '900' },
  headerSub: { fontSize: 13, fontWeight: '600', opacity: 0.6 },
  
  framedContainer: { marginHorizontal: 20, marginBottom: 20, padding: 15, borderRadius: 24, borderWidth: 1.5, elevation: 2 },
  frameTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 15, textAlign: 'center' },
  radarActionContainer: { flexDirection: 'row', gap: 10 },
  
  barcodeBox: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 18, justifyContent: 'space-around' },
  barcodeTitle: { color: '#fff', fontSize: 14, fontWeight: '900' },
  discountBox: { flex: 1, borderRadius: 18, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  discountIcon: { fontSize: 20, fontWeight: '900' },
  discountText: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  mainActionBox: { flex: 1, height: 110, borderRadius: 25, padding: 20, marginHorizontal: 5, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionMainText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12, marginTop: 15 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  allListBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(117, 114, 114, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  allListBtnText: { fontSize: 11, fontWeight: '900', marginLeft: 5 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 16, borderWidth: 1.5, marginBottom: 10 },
  listIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  listBrand: { fontSize: 12, fontWeight: '600', opacity: 0.8 },
  listBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  listBadgeText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  alertContent: { width: '85%', borderRadius: 30, padding: 35, alignItems: 'center' },
  alertIconWrapper: { marginBottom: 20 },
  alertTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  alertMessage: { fontSize: 15, textAlign: 'center', marginVertical: 20, lineHeight: 22 },
  alertBtn: { width: '100%', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  alertBtnText: { color: '#fff', fontWeight: '900' },
  filterContent: { width: '100%', position: 'absolute', bottom: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50 },
  filterTitleHeader: { fontSize: 15, fontWeight: '900', marginBottom: 20, textAlign: 'center', borderBottomWidth: 1, paddingBottom: 15 },
  filterItem: { flexDirection: 'row', paddingVertical: 18, borderBottomWidth: 1, alignItems: 'center' },
  filterItemText: { fontSize: 15, fontWeight: '700' },
  scannerOverlay: { flex: 1, backgroundColor: 'transparent' },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(7, 7, 7, 0.6)', justifyContent: 'center', alignItems: 'center' },
  middleContainer: { flexDirection: 'row', height: 260 },
  focusedContainer: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#FF3B30', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  radarTextRow: { position: 'absolute', bottom: -40, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  radarText: { color: '#e62929', fontSize: 12, fontWeight: '900', marginLeft: 8 },
  camCloseBottom: { alignItems: 'center' },
  
  scanActionBtn: { flex: 0.48, paddingVertical: 15, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, elevation: 3 },
  scanActionBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 }
});