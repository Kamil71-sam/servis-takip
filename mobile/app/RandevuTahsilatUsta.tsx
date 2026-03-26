import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RandevuTahsilatUsta() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  
  // Gelen veriler (Usta ekranından servis_no ve id gelecek)
  const { id, servis_no, musteri, cihaz } = params;
   
  // MÜDÜR: Usta panelinden gelen maliyeti kucaklayan mıknatıs
  useEffect(() => {
    if (params.maliyet) {
      setHamMaliyet(String(params.maliyet));
    }
  }, [params.maliyet]);



  const [hamMaliyet, setHamMaliyet] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // MÜDÜR: MEŞHUR HESAPLAMA MOTORU
  const calculateFinal = (val: string) => {
    const ham = parseFloat(val) || 0;
    if (ham <= 0) return 0;
    // Formül: Ham Maliyet * 1.25 (Kâr) * 1.20 (KDV)
    return Math.round(ham * 1.25 * 1.20);
  };

  const finalTutar = calculateFinal(hamMaliyet);

  const handleFinalKaydet = async () => {
    if (!hamMaliyet || finalTutar <= 0) {
      Alert.alert("Hata", "Lütfen geçerli bir maliyet giriniz.");
      return;
    }

    Alert.alert(
      "TAHSİLAT ONAYI",
      `Müşteriden ${finalTutar} ₺ tahsil ettiniz mi? Bu kayıt Banko onayına düşecektir.`,
      [
        { text: "VAZGEÇ", style: "cancel" },
        { 
          text: "EVET, ALDIM", 
          onPress: async () => {
            setIsSaving(true);
            try {


            // MÜDÜR: Env'den gelen tertemiz 3000 portlu adresi kullanıyoruz
        const response = await fetch(`${API_URL}/api/operation/tahsilat-kaydet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
        id: id, // params'dan gelen ID
        usta_maliyet: parseFloat(hamMaliyet),
        tahsil_edilen_tutar: finalTutar, // Senin hesapladığın kdvli karlı rakam
        status: 'Mali Onay Bekliyor' // Banko onayına düşmesi için
           })
             });






                /*
              // MÜDÜR: Burası senin 'api/randevu/usta-bitir' ucuna gidecek
              // Şimdilik taslak URL, backend hazır olunca güncelleriz
              const response = await fetch(`http://192.168.1.41:8081/api/randevu/usta-bitir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  appointment_id: id,
                  servis_no: servis_no,
                  usta_maliyet: parseFloat(hamMaliyet),
                  tahsil_edilen_tutar: finalTutar,
                  status: 'Onay Bekliyor' // Banko listesine düşmesi için
                })
              });
                    */



              const res = await response.json();
              if (res.success) {
                Alert.alert("BAŞARILI", "Kayıt Banko onayına gönderildi.", [
                  { text: "TAMAM", onPress: () => router.back() }
                ]);
              }
            } catch (error) {
              Alert.alert("Hata", "Sunucuya ulaşılamadı.");
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Randevu Kapatma</Text>
            <View style={{width: 28}} />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>KAYIT NO: {servis_no || id}</Text>
            <Text style={styles.musteriAdi}>{musteri || 'Müşteri Bilgisi Yok'}</Text>
            <Text style={styles.cihazBilgi}>{cihaz || 'Cihaz Bilgisi Yok'}</Text>
          </View>

          <View style={styles.formBox}>
            <Text style={styles.inputLabel}>HAM MALİYET (PARÇA + EMEK)</Text>
            <TextInput 
              style={styles.input}
              placeholder="0.00 TL"
              keyboardType="numeric"
              value={hamMaliyet}
              onChangeText={setHamMaliyet}
            />

            <View style={styles.divider} />

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>MÜŞTERİDEN ALINACAK TOPLAM</Text>
              <Text style={styles.resultValue}>{finalTutar} ₺</Text>
              <Text style={styles.taxNote}>(%25 Kâr ve %20 KDV Dahil)</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, isSaving && {opacity: 0.7}]} 
            onPress={handleFinalKaydet}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>TAHSİLAT YAPILDI / İŞİ BİTİR</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  infoCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2 },
  infoLabel: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold', marginBottom: 5 },
  musteriAdi: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  cihazBilgi: { fontSize: 14, color: '#666', marginTop: 4 },
  formBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 2 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#888', marginBottom: 10 },
  input: { borderBottomWidth: 2, borderBottomColor: '#EEE', fontSize: 24, fontWeight: 'bold', paddingVertical: 10, color: '#1A1A1A' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 25 },
  resultBox: { alignItems: 'center' },
  resultLabel: { fontSize: 13, fontWeight: 'bold', color: '#34C759', marginBottom: 10 },
  resultValue: { fontSize: 42, fontWeight: 'bold', color: '#1A1A1A' },
  taxNote: { fontSize: 11, color: '#AAA', marginTop: 5 },
  saveBtn: { backgroundColor: '#1A1A1A', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }

});

