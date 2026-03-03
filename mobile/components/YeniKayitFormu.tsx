import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, KeyboardAvoidingView, Platform, ScrollView, Alert 
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

  const phoneRef = useRef<TextInput>(null);
  const deviceRef = useRef<TextInput>(null);
  const issueRef = useRef<TextInput>(null);

  const handleSave = async () => {
    if (!customer || !phone) {
      Alert.alert("Hata", "Müşteri adı ve telefon boş geçilemez!");
      return;
    }
    // Müdür, buraya SQL bağlantısını (fetch) sonra ekleyeceğiz
    Alert.alert("Başarılı", `${customer} kaydı dükkana mühürlendi!`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>YENİ SERVİS KAYDI</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={32} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Müşteri Adı Soyadı</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder="Müşteri İsmi..." 
                blurOnSubmit={false}
                onSubmitEditing={() => phoneRef.current?.focus()}
                onChangeText={setCustomer}
              />
            </View>

            <Text style={styles.label}>Telefon Numarası</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                ref={phoneRef}
                style={styles.input} 
                placeholder="05xx..." 
                keyboardType="phone-pad"
                blurOnSubmit={false}
                onSubmitEditing={() => deviceRef.current?.focus()}
                onChangeText={setPhone}
              />
            </View>

            <Text style={styles.label}>Cihaz Modeli</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                ref={deviceRef}
                style={styles.input} 
                placeholder="Örn: Samsung S22" 
                blurOnSubmit={false}
                onSubmitEditing={() => issueRef.current?.focus()}
                onChangeText={setDevice}
              />
            </View>

            <Text style={styles.label}>Arıza Detayı</Text>
            <View style={[styles.inputWrapper, {height: 80}]}>
              <TextInput 
                ref={issueRef}
                style={[styles.input, {textAlignVertical: 'top', paddingTop: 10}]} 
                placeholder="Arıza nedir?" 
                multiline
                onChangeText={setIssue}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>KAYDI MÜHÜRLE</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '900', color: '#333' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  inputWrapper: { backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1.5, borderColor: '#eee', paddingHorizontal: 15, height: 50, marginBottom: 15 },
  input: { flex: 1, fontSize: 15, color: '#333', fontWeight: '600' },
  saveBtn: { backgroundColor: '#333', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 5 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' }
});