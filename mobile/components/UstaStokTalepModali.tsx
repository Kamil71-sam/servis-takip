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
  onSuccess: () => void; // MÜDÜR: İş başarıyla bittiğinde ana ekrana haber veren şalter
  serviceId: number;
  kayitNo: string;
  markaModel: string;
  isDarkMode: boolean;
}

// MÜDÜR: Sepete atılacak ürünün şablonu
interface CartItem {
  id: string;
  partName: string;
  quantity: number;
  desc: string;
}

export default function UstaStokTalepModali({ visible, onClose, onSuccess, serviceId, kayitNo, markaModel, isDarkMode }: Props) {
  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  
  // MÜDÜR: Sınırsız Sepet burada tutuluyor
  const [cart, setCart] = useState<CartItem[]>([]);

  const theme = {
    bg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFF' : '#333',
    inputBg: isDarkMode ? '#2C2C2C' : '#F5F5F5',
    border: isDarkMode ? '#444' : '#E0E0E0',
    cardBg: isDarkMode ? '#2A2A2A' : '#F9F9F9'
  };

  // 1. Ürünü Sepete Ekleme Motoru
  const handleAddToCart = () => {
    if (!partName.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen malzeme adını yazın.");
      return;
    }
    
    const newItem: CartItem = {
      id: Date.now().toString(), 
      partName: partName.trim(),
      quantity: parseInt(quantity) || 1,
      desc: desc.trim()
    };

    setCart([...cart, newItem]); 
    
    setPartName('');
    setQuantity('1');
    setDesc('');
  };

  // 2. Ürünü Sepetten Çıkarma
  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };






  // 3. Tüm Sepeti Tek Seferde Fırlatma
  const handleSendAll = async () => {
    if (cart.length === 0) {
      Alert.alert("Sepet Boş", "Lütfen önce sepete malzeme ekleyin.");
      return;
    }

    try {
      setLoading(true);
      
      for (const item of cart) {
        await sendMaterialRequest({
          service_id: serviceId,
          usta_email: 'Usta_1', 
          part_name: item.partName,
          quantity: item.quantity,
          
          // 🚨 İŞTE TEMİZLİK: Sadece ustanın yazdığı ham notu gönderiyoruz!
          // Eğer usta not yazmadıysa boş bırakıyoruz.
          description: item.desc ? item.desc : '' 
        });
      }
      
      Alert.alert("Başarılı", `${cart.length} adet malzeme talebi iletildi.`);
      setCart([]); 
      onSuccess(); 
      onClose();   
    } catch (err) {
      Alert.alert("Hata", "Taleplerin tamamı veya bir kısmı gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };


  

  /*
  // 3. Tüm Sepeti Tek Seferde Fırlatma
  const handleSendAll = async () => {
    if (cart.length === 0) {
      Alert.alert("Sepet Boş", "Lütfen önce sepete malzeme ekleyin.");
      return;
    }

    try {
      setLoading(true);
      
      for (const item of cart) {
        await sendMaterialRequest({
          service_id: serviceId,
          usta_email: 'Usta_1', 
          part_name: item.partName,
          quantity: item.quantity,
          description: `Cihaz: ${markaModel} - Not: ${item.desc}`
        });
      }
      
      Alert.alert("Başarılı", `${cart.length} adet malzeme talebi iletildi.`);
      setCart([]); 
      onSuccess(); // MÜDÜR: İşte o kritik şalter! Parçalar gittiyse ana ekrana haber ver.
      onClose();   
    } catch (err) {
      Alert.alert("Hata", "Taleplerin tamamı veya bir kısmı gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

*/






  // Modalı kapatırken her şeyi sıfırla
  const handleClose = () => {
    setPartName('');
    setQuantity('1');
    setDesc('');
    setCart([]);
    onClose();
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

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Malzeme Adı / Parça Adı</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
              placeholder="Örn: Samsung A52 Ekran"
              placeholderTextColor="#888"
              value={partName}
              onChangeText={setPartName}
            />

            <View style={{flexDirection: 'row', gap: 10, alignItems: 'flex-end'}}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Miktar</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
              <View style={{flex: 2}}>
                <Text style={styles.label}>Detay / Model (Opsiyonel)</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
                  placeholder="Opsiyonel..."
                  placeholderTextColor="#888"
                  value={desc}
                  onChangeText={setDesc}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addBtnText}>LİSTEYE (SEPETE) EKLE</Text>
            </TouchableOpacity>

            {cart.length > 0 && (
              <View style={styles.cartSection}>
                <Text style={[styles.label, { color: '#FF3B30', marginTop: 0 }]}>
                  SİPARİŞ LİSTESİ ({cart.length} ÜRÜN)
                </Text>
                {cart.map((item) => (
                  <View key={item.id} style={[styles.cartItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cartItemName, { color: theme.text }]}>
                        {item.quantity}x {item.partName}
                      </Text>
                      {item.desc ? <Text style={styles.cartItemDesc}>{item.desc}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveFromCart(item.id)} style={{ padding: 5 }}>
                      <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {cart.length > 0 ? (
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendAll} disabled={loading}>
                <Text style={styles.sendBtnText}>
                  {loading ? 'Gönderiliyor...' : 'TÜMÜNÜ SİPARİŞ VER'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontStyle: 'italic', fontSize: 12 }}>
                  Sipariş vermek için önce listeye malzeme ekleyin.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Vazgeç / İptal Et</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  content: { borderRadius: 20, padding: 20, maxHeight: '85%' },
  title: { fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  infoBox: { backgroundColor: '#FF3B3015', padding: 12, borderRadius: 10, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#FF3B30' },
  infoText: { fontSize: 13, color: '#FF3B30', fontWeight: 'bold' },
  label: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 5, color: '#888', marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  addBtn: { backgroundColor: '#333', flexDirection: 'row', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, marginLeft: 8 },
  cartSection: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
  cartItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  cartItemName: { fontSize: 14, fontWeight: 'bold' },
  cartItemDesc: { fontSize: 11, color: '#888', marginTop: 2 },
  sendBtn: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  sendBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontWeight: 'bold' }
});