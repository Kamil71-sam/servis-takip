import React, { useState } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendMaterialRequest } from '../services/api_material';

interface Props {
  visible: boolean;
  onClose: () => void;
  serviceId: number;
  kayitNo: string;
  markaModel: string;
  isDarkMode: boolean;
}

export default function UstaStokTalepModali({ visible, onClose, serviceId, kayitNo, markaModel, isDarkMode }: Props) {
  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = {
    bg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFF' : '#333',
    inputBg: isDarkMode ? '#2C2C2C' : '#F5F5F5',
    border: isDarkMode ? '#444' : '#E0E0E0'
  };

  const handleSend = async () => {
    if (!partName) {
      Alert.alert("Hata", "Lütfen malzeme adını yazın.");
      return;
    }

    try {
      setLoading(true);
      await sendMaterialRequest({
        service_id: serviceId,
        usta_email: 'Usta_1', // Login olan ustaya göre dinamikleştirilebilir
        part_name: partName,
        quantity: parseInt(quantity) || 1,
        description: `Cihaz: ${markaModel} - Not: ${desc}`
      });
      
      Alert.alert("Başarılı", "Malzeme talebi müdüre iletildi.");
      setPartName(''); setDesc(''); setQuantity('1');
      onClose();
    } catch (err) {
      Alert.alert("Hata", "Talep gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.bg }]}>
          <Text style={[styles.title, { color: theme.text }]}>Malzeme Talep Formu</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Kayıt No: <Text style={{fontWeight:'900'}}>{kayitNo}</Text></Text>
            <Text style={styles.infoText}>Cihaz: {markaModel}</Text>
          </View>

          <ScrollView>
            <Text style={styles.label}>Malzeme Adı / Parça Adı</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
              placeholder="Örn: Samsung A52 Ekran"
              placeholderTextColor="#888"
              value={partName}
              onChangeText={setPartName}
            />

            <View style={{flexDirection: 'row', gap: 10}}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Miktar</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
            </View>

            <Text style={styles.label}>Detay / Model / Barkod (Opsiyonel)</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, height: 80 }]} 
              multiline
              placeholder="Varsa seri no veya barkod yazın..."
              placeholderTextColor="#888"
              value={desc}
              onChangeText={setDesc}
            />

            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
              <Text style={styles.sendBtnText}>{loading ? 'Gönderiliyor...' : 'TALEBİ GÖNDER'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  content: { borderRadius: 20, padding: 20, maxHeight: '80%' },
  title: { fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  infoBox: { backgroundColor: '#FF3B3015', padding: 12, borderRadius: 10, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#FF3B30' },
  infoText: { fontSize: 13, color: '#FF3B30', fontWeight: 'bold' },
  label: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 5, color: '#888', marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  sendBtn: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  sendBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontWeight: 'bold' }
});