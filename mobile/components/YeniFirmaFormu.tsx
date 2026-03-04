import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, 
  ScrollView, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface YeniFirmaFormuProps {
  visible: boolean;
  onClose: () => void;
}

export default function YeniFirmaFormu({ visible, onClose }: YeniFirmaFormuProps) {
  const [firmaAdi, setFirmaAdi] = useState('');
  const [vergiNo, setVergiNo] = useState('');
  const [yetkili, setYetkili] = useState('');
  const [telefon, setTelefon] = useState('');

  const vergiNoRef = useRef<TextInput>(null);
  const yetkiliRef = useRef<TextInput>(null);
  const telefonRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setFirmaAdi('');
      setVergiNo('');
      setYetkili('');
      setTelefon('');
    }
  }, [visible]);

  const handleDone = () => {
    Keyboard.dismiss();
  };

  const handleKaydet = () => {
    console.log("Firma Mühürlendi:", firmaAdi);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        {/* MÜHÜR: Pencere kısılmasını önlemek için 'padding' ve offset ayarı sabitlendi */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined} // Android'de 'height' yerine 'undefined' yaparak zıplamayı kestik
          style={styles.container}
        >
          <View style={styles.formCard}>
            <View style={styles.header}>
              <Text style={styles.title}>YENİ FİRMA KAYDI</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={32} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              bounces={false} 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{ flexGrow: 1 }} // İçeriği yayarak boşluğu korur
            >
              <Text style={styles.label}>Firma / Şirket Adı</Text>
              <TextInput 
                style={styles.input} 
                value={firmaAdi} 
                onChangeText={setFirmaAdi} 
                placeholder="Örn: Kalandar Yazılım Ltd." 
                returnKeyType="next"
                onSubmitEditing={() => vergiNoRef.current?.focus()}
                blurOnSubmit={false}
              />

              <Text style={styles.label}>Vergi Numarası / Dairesi</Text>
              <TextInput 
                ref={vergiNoRef}
                style={styles.input} 
                value={vergiNo} 
                onChangeText={setVergiNo} 
                placeholder="Vergi Bilgileri" 
                keyboardType="numeric" 
                returnKeyType="next"
                onSubmitEditing={() => yetkiliRef.current?.focus()}
                blurOnSubmit={false}
              />

              <Text style={styles.label}>Yetkili Kişi</Text>
              <TextInput 
                ref={yetkiliRef}
                style={styles.input} 
                value={yetkili} 
                onChangeText={setYetkili} 
                placeholder="Ad Soyad" 
                returnKeyType="next"
                onSubmitEditing={() => telefonRef.current?.focus()}
                blurOnSubmit={false}
              />

              <Text style={styles.label}>İletişim Telefonu</Text>
              <TextInput 
                ref={telefonRef}
                style={styles.input} 
                value={telefon} 
                onChangeText={setTelefon} 
                placeholder="05xx..." 
                keyboardType="phone-pad" 
                returnKeyType="done"
                onSubmitEditing={handleDone}
              />

              <TouchableOpacity 
                style={styles.btnKaydet} 
                activeOpacity={0.8} 
                onPress={handleKaydet}
              >
                <Text style={styles.btnText}>FİRMAYI SİSTEME MÜHÜRLE</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  container: { width: '100%', justifyContent: 'center' }, // Ortalamayı burada sabitledik
  formCard: { backgroundColor: '#fff', borderRadius: 25, padding: 25, minHeight: 500, maxHeight: '90%' }, // 'minHeight' ile çökme engellendi
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '900', color: '#333' },
  closeBtn: { backgroundColor: '#fff', borderRadius: 16 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 15, fontSize: 14, color: '#333' },
  btnKaydet: { backgroundColor: '#333', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});