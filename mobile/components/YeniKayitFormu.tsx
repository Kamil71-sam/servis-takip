import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, Platform, ScrollView, Alert, KeyboardAvoidingView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function YeniKayitFormu({ visible, onClose }: Props) {
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [device, setDevice] = useState('');
  const [issue, setIssue] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const deviceRef = useRef<TextInput>(null);
  const issueRef = useRef<TextInput>(null);

  const handleFocus = (y: number) => {
    scrollRef.current?.scrollTo({ y, animated: true });
  };

  const handleSave = () => {
    if (!customer || !phone) {
      Alert.alert("Eksik", "Müdür, isim ve telefon mühür için şart!");
      return;
    }
    Alert.alert("Başarılı", "Kayıt veritabanına mühürlendi!");
    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent={true} 
      onRequestClose={onClose}
      onShow={() => setTimeout(() => nameInputRef.current?.focus(), 200)}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalContent}
          keyboardVerticalOffset={Platform.OS === 'android' ? -50 : 0} // Butonu klavyenin üstünde tutar
        >
          <View style={styles.header}>
            <Text style={styles.title}>YENİ SERVİS KAYDI</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={35} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollRef}
            keyboardShouldPersistTaps="always" 
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Müşteri Adı Soyadı</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                ref={nameInputRef}
                style={styles.input} 
                placeholder="İsim Soyisim..." 
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                onChangeText={setCustomer}
                onFocus={() => handleFocus(0)}
              />
            </View>

            <Text style={styles.label}>Telefon Numarası</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                ref={phoneRef}
                style={styles.input} 
                placeholder="05xx..." 
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => deviceRef.current?.focus()}
                onChangeText={setPhone}
                onFocus={() => handleFocus(50)}
              />
            </View>

            <Text style={styles.label}>Cihaz Modeli</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                ref={deviceRef}
                style={styles.input} 
                placeholder="Örn: Samsung S22" 
                returnKeyType="next"
                onSubmitEditing={() => issueRef.current?.focus()}
                onChangeText={setDevice}
                onFocus={() => handleFocus(100)}
              />
            </View>

            <Text style={styles.label}>Arıza Detayı</Text>
            <View style={[styles.inputWrapper, { height: 90 }]}>
              <TextInput 
                ref={issueRef}
                style={[styles.input, { textAlignVertical: 'top' }]} 
                placeholder="Arıza nedir?" 
                multiline={true}
                numberOfLines={3}
                onChangeText={setIssue}
                onFocus={() => handleFocus(180)}
              />
            </View>
            
            {/* Boşluk bırakıyoruz ki klavye açılınca ScrollView sonuna kadar gitsin */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* KLAVYENİN ÜZERİNDE SABİT DURAN KAYDET BUTONU */}
          <TouchableOpacity style={styles.stickySaveBtn} onPress={handleSave} activeOpacity={0.9}>
            <Ionicons name="checkmark-done-circle" size={24} color="#fff" style={{marginRight: 10}} />
            <Text style={styles.saveBtnText}>KAYDI MÜHÜRLE VE TAMAMLA</Text>
          </TouchableOpacity>
          
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 15 },
  modalContent: { backgroundColor: '#fff', borderRadius: 25, padding: 20, maxHeight: '95%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '900', color: '#333' },
  label: { fontSize: 12, fontWeight: '900', color: '#666', marginBottom: 5 },
  inputWrapper: { backgroundColor: '#f7f7f7', borderRadius: 12, borderWidth: 1.5, borderColor: '#eee', paddingHorizontal: 15, height: 50, marginBottom: 12 },
  input: { flex: 1, fontSize: 15, color: '#333', fontWeight: '700' },
  stickySaveBtn: { 
    backgroundColor: '#333', 
    height: 60, 
    borderRadius: 15, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 10, // Android'de klavyenin üstünde parlaması için
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});