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

  // MÜDÜR: Hem 'theme' hem 'isDarkMode' şifrelerini yakalayan tam koruma
  const isDarkMode = params.theme === 'dark' || params.isDarkMode === 'true' || String(params.isDarkMode) === 'true';
  
  // Gelen veriler (usta_notu'nu da çantadan alıyoruz)
  const { id, servis_no, musteri, cihaz, usta_notu } = params;
   
  useEffect(() => {
    if (params.maliyet) {
      setHamMaliyet(String(params.maliyet));
    }
  }, [params.maliyet]);

  const [hamMaliyet, setHamMaliyet] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // MÜDÜR: DİNAMİK TEMA (Boya Kutusu)
  const theme = {
    bg: isDarkMode ? '#121212' : '#F8F9FA',
    card: isDarkMode ? '#1E1E1E' : '#FFF',
    text: isDarkMode ? '#FFF' : '#1A1A1A',
    subText: isDarkMode ? '#AAA' : '#666',
    border: isDarkMode ? '#333' : '#EEE',
    primary: '#FF3B30',
    success: '#34C759',
    btnBg: isDarkMode ? '#FF3B30' : '#1A1A1A', 
    btnText: '#FFF'
  };

  const calculateFinal = (val: string) => {
    const ham = parseFloat(val) || 0;
    if (ham <= 0) return 0;
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
              // 🚨 İŞLEM 1: Önce Ustanın işini bitir ve notunu kaydet (Usta Panelinden buraya taşıdık)
              const completeRes = await fetch(`${API_URL}/api/operation/complete-job/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  price: parseFloat(hamMaliyet), 
                  usta_notu: usta_notu || 'Not girilmedi' 
                }),
              });
              const completeResult = await completeRes.json();

              if (!completeResult.success) {
                Alert.alert("Hata", "İşlem kaydedilirken bir sorun oluştu.");
                setIsSaving(false);
                return; // İlk adım patlarsa ikinciye geçme
              }

              // 🚨 İŞLEM 2: Şimdi tahsilat bilgisini kaydet (Mevcut olan kod)
              const response = await fetch(`${API_URL}/api/operation/tahsilat-kaydet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: id, 
                  usta_maliyet: parseFloat(hamMaliyet),
                  tahsil_edilen_tutar: finalTutar, 
                  status: 'Mali Onay Bekliyor' 
                })
              });

              const res = await response.json();
              if (res.success) {
                Alert.alert("BAŞARILI", "Kayıt Banko onayına gönderildi.", [
                  // MÜDÜR: İşlem bitince Usta paneline geri dönüyor, liste güncellenmiş olacak.
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Randevu Kapatma</Text>
            <View style={{width: 28}} />
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <Text style={styles.infoLabel}>KAYIT NO: {servis_no || id}</Text>
            <Text style={[styles.musteriAdi, { color: theme.text }]}>{musteri || 'Müşteri Bilgisi Yok'}</Text>
            <Text style={[styles.cihazBilgi, { color: theme.subText }]}>{cihaz || 'Cihaz Bilgisi Yok'}</Text>
          </View>

          <View style={[styles.formBox, { backgroundColor: theme.card }]}>
            <Text style={styles.inputLabel}>HAM MALİYET (PARÇA + EMEK)</Text>
            <TextInput 
              style={[styles.input, { color: theme.text, borderBottomColor: theme.border }]}
              placeholder="0.00 TL"
              placeholderTextColor={theme.subText}
              keyboardType="numeric"
              value={hamMaliyet}
              onChangeText={setHamMaliyet}
            />

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>MÜŞTERİDEN ALINACAK TOPLAM</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>{finalTutar} ₺</Text>
              <Text style={[styles.taxNote, { color: theme.subText }]}>(%25 Kâr ve %20 KDV Dahil)</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.saveBtn, 
              { backgroundColor: theme.btnBg }, 
              isSaving && {opacity: 0.7},
              isDarkMode && { shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 }
            ]} 
            onPress={handleFinalKaydet}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator color={theme.btnText} /> : <Text style={[styles.saveBtnText, { color: theme.btnText }]}>TAHSİLAT YAPILDI / İŞİ BİTİR</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  infoCard: { padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2 },
  infoLabel: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold', marginBottom: 5 },
  musteriAdi: { fontSize: 18, fontWeight: 'bold' },
  cihazBilgi: { fontSize: 14, marginTop: 4 },
  formBox: { padding: 20, borderRadius: 15, elevation: 2 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#888', marginBottom: 10 },
  input: { borderBottomWidth: 2, fontSize: 24, fontWeight: 'bold', paddingVertical: 10 },
  divider: { height: 1, marginVertical: 25 },
  resultBox: { alignItems: 'center' },
  resultLabel: { fontSize: 13, fontWeight: 'bold', color: '#34C759', marginBottom: 10 },
  resultValue: { fontSize: 42, fontWeight: 'bold' },
  taxNote: { fontSize: 11, marginTop: 5 },
  saveBtn: { height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  saveBtnText: { fontSize: 16, fontWeight: 'bold' }
});