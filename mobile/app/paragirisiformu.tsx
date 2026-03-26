import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Alert, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

/**
 * MALİ HESAPLAMA ALGORİTMASI
 * Tanım: Brüt maliyet üzerine %25 kâr marjı ve toplam üzerinden %20 KDV ekler.
 */
const calculateNihaiFiyat = (hamFiyat: number, iskontoOrani: string | number = 0): number => {
  const hamKar = hamFiyat * 0.25; 
  const indirimliKar = hamKar * (1 - (Number(iskontoOrani) / 100)); 
  const araToplam = hamFiyat + indirimliKar;
  const kdvli = araToplam * 1.20; 
  return Math.round(kdvli);
};

interface SQLDeviceData {
  kayitNumarasi: string;
  musteriFirmaAdi: string;
  cihazTuru: string;
  marka: string;
  model: string;
  seriNo: string;
  garantiDurumu: string;
  musteriNotu: string;
  atananUsta: string;
  arizaNotu: string;
  durum: string;
  kayitTarihi: string;
  ustaTeklifi: number; 
}

export default function ParaGirisiFormuV2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.41:3000';
  const isDarkMode = false; 

  const initialState = { 
    tur: (params.islem_turu as string) || 'Seçiniz...', 
    tutar: '', 
    aciklama: '',
    kayitNo: (params.servis_no as string) || '', 
    iskonto: '0',
    cihazData: null as SQLDeviceData | null,
    servis_id: params.servis_id ? Number(params.servis_id) : null
  };
  
  const [f, setF] = useState(initialState);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [isRecordFound, setIsRecordFound] = useState(!!params.servis_id);
  const [modalState, setModalState] = useState<'tur' | null>(null);


   /**
   * SERVİS MODÜLÜNDEN GELEN VERİLERİN ENTEGRASYONU (ZIRH GİYDİRİLDİ)
   */
  useEffect(() => {
    if (params.servis_id && params.usta_fiyati) {
        const ustaFiyati = Number(params.usta_fiyati);
        const gelenTur = (params.islem_turu as string) || 'Tamir Ücreti Tahsili';

        // --- MÜDÜRÜN ÇİFTE VERGİ KALKANI BURAYA GERİ GELDİ ---
        const ham = gelenTur.includes('Randevu') ? (ustaFiyati / 1.5) : ustaFiyati;
        const hesaplanan = gelenTur.includes('Randevu') ? ustaFiyati : calculateNihaiFiyat(ustaFiyati, 0);
        
        const mockRes: SQLDeviceData = {
            kayitNumarasi: params.servis_no as string,
            musteriFirmaAdi: params.musteri as string || 'Müşteri',
            cihazTuru: gelenTur.includes('Randevu') ? 'Randevu İşlemi' : 'Cihaz',
            marka: '', model: '', seriNo: '', garantiDurumu: '', musteriNotu: '',
            atananUsta: '', arizaNotu: '', durum: '', kayitTarihi: '',
            ustaTeklifi: ham
        };

        setF(prev => ({ 
            ...prev, 
            tur: gelenTur,
            tutar: hesaplanan.toString(), // <-- ARTIK KDV BİNMEYECEK
            aciklama: `${params.servis_no} nolu işlem tahsilatı.`,
            cihazData: mockRes,
            servis_id: Number(params.servis_id),
            kayitNo: (params.servis_no as string) || ''
        }));
        setIsRecordFound(true);
    }
  }, [params.servis_id]); 






    /*
   * SERVİS MODÜLÜNDEN GELEN VERİLERİN ENTEGRASYONU (BUDANMADI)
   
  useEffect(() => {
    if (params.servis_id && params.usta_fiyati) {
        const ustaFiyati = Number(params.usta_fiyati);
        const hesaplanan = calculateNihaiFiyat(ustaFiyati, 0);
        
        const mockRes: SQLDeviceData = {
            kayitNumarasi: params.servis_no as string,
            musteriFirmaAdi: params.musteri as string || 'Müşteri',
            cihazTuru: 'Cihaz',
            marka: '', model: '', seriNo: '', garantiDurumu: '', musteriNotu: '',
            atananUsta: '', arizaNotu: '', durum: '', kayitTarihi: '',
            ustaTeklifi: ustaFiyati
        };

        setF(prev => ({ 
            ...prev, 
            tur: (params.islem_turu as string) || 'Tamir Ücreti Tahsili',
            tutar: hesaplanan.toString(),
            aciklama: `${params.servis_no} nolu servis tahsilatı.`,
            cihazData: mockRes,
            servis_id: Number(params.servis_id),
            kayitNo: (params.servis_no as string) || ''
        }));
        setIsRecordFound(true);
    }
  }, [params.servis_id]);

*/





  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#555',
    borderColor: isDarkMode ? '#333' : '#eee',
    accentColor: '#FF3B30'
  };



/**
   * VERİTABANI ÜZERİNDEN MANUEL KAYIT SORGULAMA (ZIRHLI V2 VE RANDEVU MAKASI)
   */
  const handleSearchRecord = async () => {
    if (!f.kayitNo) return;
    
    console.log("Seçilen Tür:", f.tur); // İspiyoncu logumuz
    setIsSearching(true);
    
    try {
        // --- MÜDÜRÜN AKILLI MAKASI ---
        // Eğer Randevu seçiliyse yeni radara, değilse eski tamir radarına git!
        const searchUrl = f.tur.includes('Randevu')
            ? `${API_BASE_URL}/api/kasa/search-randevu?servis_no=${f.kayitNo}`
            : `${API_BASE_URL}/api/kasa_v2/search-v2?servis_no=${f.kayitNo}`;

        // MÜDÜR: Artık sabit adrese değil, yukarıdaki makasın seçtiği adrese gidiyoruz!
        const response = await fetch(searchUrl);
        const resData = await response.json();
        
        console.log("CEVAP GELDİ Mİ?:", resData); 

        if (resData.success && resData.found) {
            const dev = resData.device;
            const ustaFiyati = Number(dev.fiyatTeklifi) || 0;

            // --- MÜDÜRÜN KİLİDİ ---
            if (ustaFiyati <= 0) {
                Alert.alert("DUR!", "Bu cihazın/randevunun ücreti 0 veya boş görünüyor. Lütfen önce ustaya fiyat girişi yaptırın.");
                setIsRecordFound(false); 
                return; 
            }

            // MÜDÜR: RANDEVUYSA KDV ÇIKAR (1.5'e böl), TAMİRSE OLDUĞU GİBİ AL
            const hamFiyat = f.tur.includes('Randevu') ? (ustaFiyati / 1.5) : ustaFiyati;

            const v2ResData: SQLDeviceData = {
                kayitNumarasi: dev.servis_no || dev["Kayıt Numarası"],
                musteriFirmaAdi: dev.musteri_adi || dev["Müşteri Firma Adı"] || 'Belirtilmemiş',
                cihazTuru: dev.cihaz_turu || (f.tur.includes('Randevu') ? 'Randevu İşlemi' : 'Cihaz'),
                marka: dev.marka || '', model: dev.model || '', seriNo: dev.seri_no || '',
                garantiDurumu: '', musteriNotu: '', atananUsta: '', arizaNotu: '',
                durum: dev.status || 'Hazır', kayitTarihi: '',
                ustaTeklifi: hamFiyat // Formun iskontosu bozulmasın diye ham fiyatı yolladık
            };

            // MÜDÜR: Randevuysa ustanın rakamını direkt ekrana bas, tamirse hesaplama motoruna sok
            const hesaplanan = f.tur.includes('Randevu') ? ustaFiyati : calculateNihaiFiyat(ustaFiyati, 0);

            setF({ 
              ...f, 
              cihazData: v2ResData, 
              iskonto: '0', 
              tutar: hesaplanan.toString(), 
              servis_id: dev.id, 
              aciklama: `${v2ResData.kayitNumarasi} nolu işlem tahsilatı.` 
            });
            setIsRecordFound(true);
        } else {
            Alert.alert("BİLGİ", "Girilen numarada uygun bir kayıt bulunamadı.");
            setIsRecordFound(false);
        }
    } catch (e) { 
      Alert.alert("BAĞLANTI HATASI", "Sorgulama hattında bir sorun oluştu."); 
    } finally { 
      setIsSearching(false); 
    }
  };








/*


   * VERİTABANI ÜZERİNDEN MANUEL KAYIT SORGULAMA (V2 HATTINA ÇEKİLDİ)
  
  const handleSearchRecord = async () => {
    if (!f.kayitNo) return;

   // MÜDÜR: TELEFON ŞU AN HANGİ KAPIYA GİTMEYE ÇALIŞIYOR? BUNU TERMİNALE YAZDIR!
    console.log("Seçilen Tür:", f.tur);
    setIsSearching(true);
    try {
        // MÜDÜR: BURAYI YENİ KASA_V2 HATTINA BAĞLADIM (Bozmadan Güçlendirildi)
        const response = await fetch(`${API_BASE_URL}/api/kasa_v2/search-v2?servis_no=${f.kayitNo}`);
        const resData = await response.json();
        
        // --- MÜDÜRÜN KONTROL HATTI: BU SATIRI EKLE ---
        console.log("CEVAP GELDİ Mİ?:", resData); 
        // --------------------------------------------




        if (resData.success && resData.found) {
            const dev = resData.device;
            const ustaFiyati = Number(dev.fiyatTeklifi) || 0;


            // --- MÜDÜRÜN KİLİDİ BURAYA GELECEK ---
           if (ustaFiyati <= 0) {
        Alert.alert("DUR!", "Bu cihazın tamir ücreti 0 veya boş görünüyor. Lütfen önce ustaya fiyat girişi yaptırın.");
        setIsRecordFound(false); // Bilgileri ekrana basma, kilitli kalsın
        return; // Fonksiyonu burada bitir, aşağıya geçme
              }
            // ------------------------------------





            const v2ResData: SQLDeviceData = {
                kayitNumarasi: dev.servis_no || dev["Kayıt Numarası"],
                musteriFirmaAdi: dev.musteri_adi || dev["Müşteri Firma Adı"] || 'Belirtilmemiş',
                cihazTuru: dev.cihaz_turu || 'Cihaz',
                marka: dev.marka || '', model: dev.model || '', seriNo: dev.seri_no || '',
                garantiDurumu: '', musteriNotu: '', atananUsta: '', arizaNotu: '',
                durum: dev.status || 'Hazır', kayitTarihi: '',
                ustaTeklifi: ustaFiyati
            };

            const hesaplanan = calculateNihaiFiyat(ustaFiyati, 0);

            setF({ 
              ...f, 
              cihazData: v2ResData, 
              iskonto: '0', 
              tutar: hesaplanan.toString(), 
              servis_id: dev.id, 
              aciklama: `${v2ResData.kayitNumarasi} nolu cihaz tamir bedeli tahsilatı.` 
            });
            setIsRecordFound(true);
        } else {
            Alert.alert("BİLGİ", "Girilen numarada 'Hazır' durumda bir kayıt bulunamadı.");
            setIsRecordFound(false);
        }
    } catch (e) { 
      Alert.alert("BAĞLANTI HATASI", "Sorgulama (V2) hattında bir sorun oluştu."); 
    } finally { 
      setIsSearching(false); 
    }
  };


* /

/**
   * ASIL KAYIT İŞLEMİ (Sadece Onay Verilirse Çalışır)
   */
  const executeSave = async (ozelMesaj: string) => { 
    setIsSaving(true);
    try {
      // --- MÜDÜRÜN İZOLE KAPISI GERİ GELDİ ---
      // Randevuysa direkt tahsilat/temizlik kapısına gider, değilse eski tamir kapılarına!
      const url = f.tur.includes('Randevu') 
          ? `${API_BASE_URL}/api/tahsilat/banko-tahsilat` 
          : (f.servis_id ? `${API_BASE_URL}/api/tahsilat/process` : `${API_BASE_URL}/api/kasa/add`);
      
      const payload = f.servis_id ? {
          id: f.servis_id,
          servis_no: f.kayitNo,
          kategori: f.tur,
          tutar: parseFloat(f.tutar),
          aciklama: f.aciklama,
          islem_yapan: 'Banko',
          new_status: 'Teslim Edildi' // <-- Bu komut backend'i tetikleyecek
      } : {
          islem_yonu: 'GİRİŞ',
          kategori: f.tur,
          tutar: parseFloat(f.tutar),
          aciklama: f.aciklama,
          islem_yapan: 'Admin',
          servis_no: f.kayitNo || null
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      
      if (resData.success) {
        Alert.alert("İŞLEM BAŞARILI", ozelMesaj, [
          { text: "TAMAM", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("HATA", resData.error);
      }
    } catch (e) { 
      Alert.alert("SUNUCU HATASI", "Veri iletimi başarısız."); 
    } finally { 
      setIsSaving(false); 
    }
  };





/**
   * ASIL KAYIT İŞLEMİ (Sadece Onay Verilirse Çalışır)
   
  const executeSave = async (ozelMesaj: string) => { 
    setIsSaving(true);
    try {
      const url = f.servis_id ? `${API_BASE_URL}/api/tahsilat/process` : `${API_BASE_URL}/api/kasa/add`;
      
      const payload = f.servis_id ? {
          id: f.servis_id,
          servis_no: f.kayitNo,
          kategori: f.tur,
          tutar: parseFloat(f.tutar),
          aciklama: f.aciklama,
          islem_yapan: 'Banko',
          new_status: 'Teslim Edildi'
      } : {
          islem_yonu: 'GİRİŞ',
          kategori: f.tur,
          tutar: parseFloat(f.tutar),
          aciklama: f.aciklama,
          islem_yapan: 'Admin',
          servis_no: f.kayitNo || null
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      
      if (resData.success) {
        // MÜDÜR: Burası senin istediğin o dinamik mesajı basan yer!
        Alert.alert("İŞLEM BAŞARILI", ozelMesaj, [
          { text: "TAMAM", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("HATA", resData.error);
      }
    } catch (e) { 
      Alert.alert("SUNUCU HATASI", "Veri iletimi başarısız."); 
    } finally { 
      setIsSaving(false); 
    }
  };



  
  // Parantez içine 'ozelMesaj' kelimesini ekledik:
const executeSave = async (ozelMesaj: string) => {  

  // const executeSave = async () => {
    setIsSaving(true);
    try {
      const url = f.servis_id ? `${API_BASE_URL}/api/tahsilat/process` : `${API_BASE_URL}/api/kasa/add`;
      
      const payload = f.servis_id ? {
          id: f.servis_id,
          servis_no: f.kayitNo,
          kategori: f.tur,
          tutar: parseFloat(f.tutar),
          aciklama: f.aciklama,
          islem_yapan: 'Banko',
          new_status: 'Teslim Edildi'
      } : {
          islem_yonu: 'GİRİŞ',
          kategori: f.tur,
          tutar: parseFloat(f.tutar),
          aciklama: f.aciklama,
          islem_yapan: 'Admin',
          servis_no: f.kayitNo || null
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (resData.success) {
        Alert.alert("İŞLEM BAŞARILI", "Kasa hareketi kaydedildi ve cihaz teslim edildi durumuna alındı.", [
          { text: "TAMAM", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("HATA", resData.error);
      }
    } catch (e) { 
      Alert.alert("SUNUCU HATASI", "Veri iletimi başarısız."); 
    } finally { 
      setIsSaving(false); 
    }
    

  };

*/

/**
   * TAHSİLAT BUTONUNA BASILDIĞINDA ÇALIŞAN AKILLI BARİKAT
   */
  const handleFinalTahsilat = async () => {
    const isTahsilat = f.tur.includes('Tahsilat') || f.tur.includes('Tamir') || f.tur.includes('Randevu');

    // 0 TL Kontrolü
    if (parseFloat(f.tutar) <= 0 || isNaN(parseFloat(f.tutar))) {
      Alert.alert("HATA", "Tahsilat tutarı 0 veya geçersiz olamaz!");
      return;
    }

    if (isTahsilat && !f.servis_id) {
      Alert.alert("EKSİK VERİ", "Lütfen önce geçerli bir servis kaydı sorgulayınız.");
      return;
    }

    if (!f.tutar || !f.aciklama || f.tur === 'Seçiniz...') {
      Alert.alert("EKSİK VERİ", "İşlem türü, tutar ve açıklama alanları zorunludur.");
      return;
    }

    // --- MÜDÜRÜN AKILLI MESAJ AYARI ---
    let onayMesaji = "";
    let basariliMesaji = "";

    if (f.tur === 'Kasaya Nakit Girişi') {
      onayMesaji = `${f.tutar} ₺ tutarındaki nakit girişi kasaya işlenecek. Onaylıyor musunuz?`;
      basariliMesaji = "Nakit girişi başarıyla kaydedildi.";
    } 
    else if (f.tur === 'Stoktan Ürün Satışı') {
      onayMesaji = `${f.tutar} ₺ tutarındaki ürün satış geliri kasaya işlenecek. Onaylıyor musunuz?`;
      basariliMesaji = "Ürün satış kaydı ve gelir girişi yapıldı.";
    }
    else {
      // Tamir ve Randevu işlemleri için (Cihazla bağlantılı olanlar)
      onayMesaji = `${f.tutar} ₺ tutarındaki tahsilat kasaya girilecek ve bu cihaz listeden 'Teslim Edildi' olarak düşecek. Emin misiniz?`;
      basariliMesaji = "Kasa hareketi kaydedildi ve cihaz teslim edildi durumuna alındı.";
    }

    Alert.alert(
      "İŞLEMİ ONAYLIYOR MUSUNUZ?",
      onayMesaji,
      [
        { text: "VAZGEÇ", style: "cancel" },
        { text: "EVET, KAYDET", onPress: () => executeSave(basariliMesaji) } // Mesajı buraya gönderiyoruz
      ]
    );
  };








 /*
     const handleFinalTahsilat = async () => {
    const isTahsilat = f.tur.includes('Tahsilat') || f.tur.includes('Tamir') || f.tur.includes('Randevu');

    // 0 TL Kontrolü
    if (parseFloat(f.tutar) <= 0 || isNaN(parseFloat(f.tutar))) {
      Alert.alert("HATA", "Tahsilat tutarı 0 veya geçersiz olamaz!");
      return;
    }

    if (isTahsilat && !f.servis_id) {
      Alert.alert("EKSİK VERİ", "Lütfen önce geçerli bir servis kaydı sorgulayınız.");
      return;
    }

    if (!f.tutar || !f.aciklama || f.tur === 'Seçiniz...') {
      Alert.alert("EKSİK VERİ", "İşlem türü, tutar ve açıklama alanları zorunludur.");
      return;
    }

    // MÜDÜRÜN SON ONAYI:
    Alert.alert(
      "İŞLEMİ ONAYLIYOR MUSUNUZ?",
      `${f.tutar} ₺ tutarındaki tahsilat kasaya girilecek ve bu cihaz listeden 'Teslim Edildi' olarak düşecek. Emin misiniz?`,
      [
        { text: "VAZGEÇ", style: "cancel" },
        { text: "EVET, KAYDET", onPress: () => executeSave() }
      ]
    );
  };


*/








  



  const handleIskontoChange = (oran: string) => {
    const bazFiyat = f.cihazData?.ustaTeklifi || 0;
    const yeniFiyat = calculateNihaiFiyat(bazFiyat, oran);
    setF({ ...f, iskonto: oran, tutar: yeniFiyat.toString() });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        
        <View style={[styles.header, { marginTop: Platform.OS === 'android' ? 50 : 10 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={35} color={theme.accentColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textColor }]}>KASA İŞLEMLERİ V2</Text>
          <View style={{width: 35}} />
        </View>



         <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
          
          <Text style={[styles.label, { color: theme.labelColor }]}>İŞLEM TÜRÜ</Text>
          <TouchableOpacity 
            style={[styles.staticInput, { backgroundColor: theme.inputBg, flexDirection: 'row', justifyContent: 'space-between' }]}
            onPress={() => !params.servis_id && setModalState('tur')}
          >
            <Text style={{ color: theme.textColor, fontWeight: 'bold' }}>{f.tur}</Text>
            {!params.servis_id && <Ionicons name="chevron-down" size={20} color={theme.labelColor} />}
          </TouchableOpacity>

          {!params.servis_id && (
            <>
              {(f.tur.includes('Tahsili')) && (
                <View style={styles.searchContainer}>
                  <Text style={[styles.label, { color: theme.accentColor }]}>HAZIR CİHAZ NUMARASI GİRİN (*)</Text>
                  <View style={styles.searchRow}>
                    <TextInput 
                      style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.textColor, borderColor: theme.accentColor, borderWidth: 1 }]}
                      placeholder="Örn: 26032401" keyboardType="numeric" value={f.kayitNo}
                      onChangeText={(v) => { setF({...f, kayitNo: v}); setIsRecordFound(false); }}
                    />
                    <TouchableOpacity style={[styles.searchBtn, {backgroundColor: theme.accentColor}]} onPress={handleSearchRecord}>
                      {isSearching ? <ActivityIndicator color="#fff" /> : <Ionicons name="search" size={24} color="#fff" />}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}

          {isRecordFound && (
            <View style={[styles.infoList, { backgroundColor: theme.cardBg, borderColor: theme.accentColor, borderStyle: 'solid' }]}>
              <Text style={styles.listTitle}>CİHAZ VE MÜŞTERİ BİLGİLERİ</Text>
              
              {f.cihazData && (
                <>
                  <InfoRow label="Müşteri:" value={f.cihazData.musteriFirmaAdi} isDarkMode={isDarkMode} />
                  <InfoRow label="Cihaz:" value={`${f.cihazData.marka} ${f.cihazData.model}`} isDarkMode={isDarkMode} />
                  <InfoRow label="Usta Teklifi:" value={`${f.cihazData.ustaTeklifi} ₺`} isDarkMode={isDarkMode} highlight />
                </>
              )}

              <View style={styles.priceSection}>
                <Text style={[styles.label, {color: '#FF9500', marginTop: 0}]}>KÂR İSKONTOSU (%)</Text>
                <TextInput 
                  style={[styles.input, {backgroundColor: isDarkMode ? '#333' : '#fff', borderColor: '#FF9500', borderWidth: 1, color: '#FF9500', fontWeight: 'bold', textAlign: 'center'}]}
                  keyboardType="numeric" maxLength={2} value={f.iskonto} onChangeText={handleIskontoChange}
                />
              </View>
            </View>
          )}

          <View style={{ marginTop: 25 }}>
            <Text style={[styles.label, { color: theme.labelColor }]}>TAHSİLAT TUTARI (Kâr+KDV Dahil)</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, color: '#34C759', fontSize: 20, fontWeight: '900', textAlign: 'center' }]}
              value={f.tutar}
              editable={f.tur === 'Kasaya Nakit Girişi'} // Tamirde kilitli!
              onChangeText={(v) => setF({...f, tutar: v})}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.labelColor, marginTop: 15 }]}>İŞLEM AÇIKLAMASI (*)</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textColor, height: 80, textAlignVertical: 'top' }]}
              multiline placeholder="Detay yazınız..."
              value={f.aciklama} onChangeText={(v) => setF({...f, aciklama: v})}
            />

            <TouchableOpacity 
                style={[styles.saveBtn, (isSaving || isSearching) && {opacity: 0.5}]} 
                onPress={handleFinalTahsilat}
                disabled={isSaving || isSearching}
            >
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>İŞLEMİ ONAYLA VE KAYDET</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalState === 'tur'} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
              {['Kasaya Nakit Girişi', 'Tamir Ücreti Tahsili', 'Randevu Geliri Tahsili', 'Stoktan Ürün Satışı'].map((item) => (
                <TouchableOpacity key={item} style={styles.modalItem} onPress={() => { 
                  setF({...initialState, tur: item}); 
                  setIsRecordFound(false);
                  setModalState(null); 
                }}>
                  <Text style={{ color: theme.textColor, fontWeight: 'bold' }}>{item}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setModalState(null)} style={{marginTop: 15}}>
                <Text style={{color: 'red', fontWeight: 'bold'}}>VAZGEÇ</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Modal>

    </SafeAreaView>
  );
}

const InfoRow = ({ label, value, isDarkMode, highlight }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, { color: highlight ? '#FF3B30' : (isDarkMode ? '#ddd' : '#333') }]}>{value}</Text>
  </View>
);


const styles = StyleSheet.create({
  // Üst Başlık Alanı (Daha kibar)
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 8, 
    paddingHorizontal: 10 
  },
  headerTitle: { fontSize: 15, fontWeight: '900' },

  // Etiketler (Daha okunaklı ve az yer kaplayan)
  label: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    marginBottom: 4, 
    letterSpacing: 0.3,
    textTransform: 'uppercase' // Başlıkları otomatik büyük yapar, şık durur
  },

  // Giriş Kutuları (Yüksekliği azaldı, ekrana sığması sağlandı)
  input: { 
    padding: 9, 
    borderRadius: 12, 
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#eee' 
  },
  staticInput: { 
    padding: 9, 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 1,
    borderColor: '#eee'
  },

  // Sorgulama Alanı
  searchContainer: { marginBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchBtn: { 
    width: 50, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  // Cihaz Bilgi Listesi (Kutu içi daraltıldı)
  infoList: { 
    padding: 10, 
    borderRadius: 15, 
    marginTop: 1, 
    borderWidth: 1.5, 
    borderStyle: 'solid' 
  },
  listTitle: { 
    fontSize: 11, 
    fontWeight: '900', 
    color: '#888', 
    marginBottom: 5, 
    textAlign: 'center' 
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 2
  },
  infoLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  infoValue: { fontSize: 12, fontWeight: 'bold' },

  // İskonto ve Fiyat Bölümü
  priceSection: { 
    marginTop: 8, 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingTop: 8 
  },

  // Kaydet Butonu (Ekranın en altına yapışmasın diye margin ayarlandı)
  saveBtn: { 
    backgroundColor: '#1A1A1A', 
    padding: 15, 
    borderRadius: 15, 
    marginTop: 10, 
    marginBottom: 30, 
    alignItems: 'center',
    shadowColor: "#000", // Butona hafif gölge, "bas beni" desin
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  // Modal (Seçim ekranı)
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '80%', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  modalItem: { 
    paddingVertical: 15, 
    width: '100%', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  }
});