import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Alert, ScrollView, ActivityIndicator, Platform, StatusBar,
  KeyboardAvoidingView, Keyboard 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios';

const API_BASE = 'http://192.168.1.41:3000/api';

export default function YeniRandevu() {
  const router = useRouter();
  
  const { theme } = useLocalSearchParams();
  const isDarkMode = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState({ id: null, name: '', exists: false });
  const [customerType, setCustomerType] = useState('bireysel'); // MÜDÜR: Firma/Bireysel ayrımı için
  const [unregistered, setUnregistered] = useState(false); 
  const [address, setAddress] = useState(''); 

  // MÜDÜR: Cihaz Bilgileri State'leri
  const [deviceType, setDeviceType] = useState(''); 
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  const [issue, setIssue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [usta, setUsta] = useState('Usta 1'); 

  const [focusField, setFocusField] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  const addressRef = useRef<TextInput>(null);
  const deviceTypeRef = useRef<TextInput>(null);
  const brandRef = useRef<TextInput>(null);
  const modelRef = useRef<TextInput>(null);

  const dateRef = useRef<TextInput>(null);
  const timeRef = useRef<TextInput>(null);
  const issueRef = useRef<TextInput>(null);

  const handleGoToDashboard = () => {
    router.replace({ pathname: '/dashboard', params: { theme: theme } });
  };

const handleSearchCustomer = async (val: string) => {
  setPhone(val);
  if (val.length >= 10) {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/appointments/search-customer?phone=${val}`);
      
      if (res.data.success && res.data.data) {
        setCustomerInfo({ 
          id: res.data.data.id, 
          name: res.data.data.name, 
          exists: true 
        });
        // MÜDÜR: Backend'den gelen tip bilgisini (bireysel/firma) burada yakalıyoruz
        setCustomerType(res.data.data.tip || 'bireysel'); 
        setUnregistered(false); 
        addressRef.current?.focus(); 
      } else {
        setCustomerInfo({ id: null, name: '', exists: false });
        setUnregistered(true); 
      }
    } catch (err) {
      console.log("Müşteri bulunamadı.");
      setCustomerInfo({ id: null, name: '', exists: false });
      setUnregistered(true);
    } finally {
      setLoading(false);
    }
  } else {
    setCustomerInfo({ id: null, name: '', exists: false });
    setUnregistered(false);
  }
};

  const handleDateType = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 8);
    }
    setDate(cleaned);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDate(`${day}-${month}-${year}`);
      timeRef.current?.focus();
    }
  };

const handleSave = async () => {
    if (!phone || !date || !time) {
      Alert.alert("Hata", "Lütfen zorunlu alanları doldur!");
      return;
    }

    if (unregistered) {
      Alert.alert("Dur!", "Bu numara kayıtlı değil. Lütfen önce müşteri kaydı yapın.");
      return;
    }

    let dbDate = date;
    if (date.length === 10 && date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        dbDate = `${parts[2]}-${parts[1]}-${parts[0]}`; 
      }
    }

    const girilenAdres = address ? address.trim() : "Adres Girilmedi";
    const girilenNot = issue ? issue.trim() : "Arıza Notu Yok";
    
    const paketlenmisVeri = `📍 ADRES: ${girilenAdres}\n🔧 CİHAZ: ${deviceType} ${brand} ${model}\n📝 NOT: ${girilenNot}`;

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/appointments/ekle`, {
        customer_id: customerInfo.id,
        type: customerType, // MÜDÜR: Backend'in hangi tabloya yazacağını bilmesi için tipi gönderiyoruz
        device_brand: brand, 
        device_model: model,
        date: dbDate, 
        time,
        usta: usta, 
        issue: paketlenmisVeri 
      });
      
      if (res.data.success) {
        Keyboard.dismiss(); 
        Alert.alert(
            "Başarılı", 
            `Randevu kaydedildi!\n\nKAYIT NO: ${res.data.servis_no || 'Atandı'}`, 
            [{ text: "Tamam", onPress: () => handleGoToDashboard() }]
        );
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      Alert.alert("Kayıt Başarısız", `Hata Detayı: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={[styles.container, isDarkMode && darkStyles.container]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, isDarkMode && darkStyles.header]}>
        <Text style={[styles.headerTitle, isDarkMode && darkStyles.textMain]}>Yeni Randevu</Text>
        <TouchableOpacity onPress={handleGoToDashboard} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "android" ? 50 : 0} 
        style={{flex: 1}}
      >
        <ScrollView 
          style={styles.form} 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 350 }} 
        >
          
          <View style={[styles.trackingBadge, isDarkMode && darkStyles.trackingBadge]}>
            <Ionicons name="barcode-outline" size={20} color={isDarkMode ? "#FFF" : "#333"} />
            <Text style={[styles.trackingText, isDarkMode && darkStyles.textMain]}>
              KAYIT NO: OTOMATİK ATANACAK
            </Text>
          </View>

          {/* TELEFON */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && darkStyles.textSub]}>Müşteri Telefon No</Text>
            <View style={styles.searchRow}>
              <TextInput 
                style={[styles.input, isDarkMode && darkStyles.input, {flex: 1}, focusField === 'phone' && styles.focusedBorder]}
                placeholder="05XX XXX XX XX"
                placeholderTextColor={isDarkMode ? "#888" : "#999"}
                keyboardType="phone-pad"
                returnKeyType="next"
                onFocus={() => setFocusField('phone')}
                onBlur={() => setFocusField(null)}
                onSubmitEditing={() => addressRef.current?.focus()}
                blurOnSubmit={false}
                value={phone}
                onChangeText={handleSearchCustomer}
              />
              {loading && <ActivityIndicator size="small" color="#FF3B30" style={{marginLeft: 10}} />}
            </View>
          </View>

          {customerInfo.exists && (
            <View style={[styles.infoBox, isDarkMode && darkStyles.infoBox]}>
              <Ionicons name="person-circle" size={20} color={customerType === 'firma' ? "#FF9500" : "#4CAF50"} />
              <Text style={[styles.infoText, isDarkMode && darkStyles.infoText]}>
                {customerType === 'firma' ? 'Kayıtlı Firma: ' : 'Kayıtlı Müşteri: '}
                <Text style={{fontWeight:'bold'}}>{customerInfo.name}</Text>
              </Text>
            </View>
          )}

          {unregistered && (
            <View style={[styles.infoBox, { backgroundColor: '#FFEBEB' }, isDarkMode && { backgroundColor: '#3A1C1C' }]}>
              <Ionicons name="warning" size={20} color="#FF3B30" />
              <Text style={[styles.infoText, { color: '#D32F2F' }]}>
                Bu numara kayıtlı değil! Lütfen önce müşteri kaydı oluşturun.
              </Text>
            </View>
          )}

          {/* ADRES */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && darkStyles.textSub]}>Randevu Adresi</Text>
            <TextInput 
              ref={addressRef}
              style={[styles.input, isDarkMode && darkStyles.input, focusField === 'address' && styles.focusedBorder]}
              placeholder="Mahalle, Sokak, No..."
              placeholderTextColor={isDarkMode ? "#888" : "#999"}
              returnKeyType="next"
              onFocus={() => setFocusField('address')}
              onBlur={() => setFocusField(null)}
              onSubmitEditing={() => deviceTypeRef.current?.focus()}
              blurOnSubmit={false}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* MÜDÜR: CİHAZ BİLGİLERİ (3 KUTU YAN YANA) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && darkStyles.textSub]}>Cihaz Çeşidi / Marka / Model</Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              <TextInput 
                ref={deviceTypeRef}
                style={[styles.input, isDarkMode && darkStyles.input, {flex: 1}]}
                placeholder="Çeşit"
                placeholderTextColor={isDarkMode ? "#888" : "#999"}
                returnKeyType="next"
                onSubmitEditing={() => brandRef.current?.focus()}
                value={deviceType}
                onChangeText={setDeviceType}
              />
              <TextInput 
                ref={brandRef}
                style={[styles.input, isDarkMode && darkStyles.input, {flex: 1}]}
                placeholder="Marka"
                placeholderTextColor={isDarkMode ? "#888" : "#999"}
                returnKeyType="next"
                onSubmitEditing={() => modelRef.current?.focus()}
                value={brand}
                onChangeText={setBrand}
              />
              <TextInput 
                ref={modelRef}
                style={[styles.input, isDarkMode && darkStyles.input, {flex: 1}]}
                placeholder="Model"
                placeholderTextColor={isDarkMode ? "#888" : "#999"}
                returnKeyType="next"
                onSubmitEditing={() => dateRef.current?.focus()}
                value={model}
                onChangeText={setModel}
              />
            </View>
          </View>

          {/* TARİH / SAAT */}
          <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
            <View style={[styles.inputGroup, {flex: 1}]}>
              <Text style={[styles.label, isDarkMode && darkStyles.textSub]}>Tarih (GG-AA-YYYY)</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TextInput 
                  ref={dateRef}
                  style={[styles.input, isDarkMode && darkStyles.input, {flex: 1}, focusField === 'date' && styles.focusedBorder]}
                  placeholder="25-04-2026"
                  placeholderTextColor={isDarkMode ? "#888" : "#999"}
                  keyboardType="numeric"
                  returnKeyType="next"
                  maxLength={10}
                  onFocus={() => setFocusField('date')}
                  onBlur={() => setFocusField(null)}
                  onSubmitEditing={() => timeRef.current?.focus()}
                  blurOnSubmit={false}
                  value={date}
                  onChangeText={handleDateType}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{padding: 10}}>
                  <Ionicons name="calendar" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.inputGroup, {flex: 1}]}>
              <Text style={[styles.label, isDarkMode && darkStyles.textSub]}>Saat</Text>
              <TextInput 
                ref={timeRef}
                style={[styles.input, isDarkMode && darkStyles.input, focusField === 'time' && styles.focusedBorder]}
                placeholder="14:30"
                placeholderTextColor={isDarkMode ? "#888" : "#999"}
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
                onFocus={() => setFocusField('time')}
                onBlur={() => setFocusField(null)}
                onSubmitEditing={() => issueRef.current?.focus()}
                blurOnSubmit={false}
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateObj}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          {/* USTA */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && darkStyles.textSub]}>Atanan Usta</Text>
            <View style={[styles.input, isDarkMode && darkStyles.input, { paddingVertical: Platform.OS === 'ios' ? 10 : 0 }]}>
              <Picker
                selectedValue={usta}
                onValueChange={(itemValue) => setUsta(itemValue)}
                style={{ color: isDarkMode ? '#FFF' : '#333' }}
                dropdownIconColor={isDarkMode ? '#FFF' : '#333'}
              >
                <Picker.Item label="Usta 1 (Aktif)" value="Usta 1" />
                <Picker.Item label="Usta 2 (Pasif)" value="Usta 2" color="#999" />
                <Picker.Item label="Usta 3 (Pasif)" value="Usta 3" color="#999" />
              </Picker>
            </View>
          </View>

          {/* NOT */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && darkStyles.textSub]}>Arıza / Randevu Notu</Text>
            <TextInput 
              ref={issueRef}
              style={[styles.input, isDarkMode && darkStyles.input, {height: 100, textAlignVertical: 'top'}, focusField === 'issue' && styles.focusedBorder]}
              placeholder="Notunuzu buraya yazın..."
              placeholderTextColor={isDarkMode ? "#888" : "#999"}
              multiline={true}
              onFocus={() => setFocusField('issue')}
              onBlur={() => setFocusField(null)}
              value={issue}
              onChangeText={setIssue}
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, isDarkMode && darkStyles.saveBtn, unregistered && {backgroundColor: '#ccc'}]} 
            onPress={handleSave}
            disabled={loading || unregistered}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },
  form: { padding: 20 },
  trackingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', padding: 12, borderRadius: 10, marginBottom: 20, justifyContent: 'center', borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed' },
  trackingText: { fontSize: 14, fontWeight: 'bold', marginLeft: 8, color: '#333' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F2F2F2', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, fontSize: 16, color: '#333' },
  focusedBorder: { borderColor: '#FF3B30', borderWidth: 1.5, backgroundColor: '#FFFFFF' }, 
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 12, borderRadius: 10, marginBottom: 20, gap: 8 },
  infoText: { color: '#2E7D32', fontSize: 14 },
  saveBtn: { backgroundColor: '#FF3B30', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#121212' },
  header: { backgroundColor: '#1A1A1A', borderBottomColor: '#2C2C2C' },
  textMain: { color: '#F8F9FA' },
  textSub: { color: '#9BA4B5' },
  input: { backgroundColor: '#2C2C2C', borderColor: '#3A3A3A', color: '#FFF' },
  trackingBadge: { backgroundColor: '#1E1E1E', borderColor: '#444' }, 
  infoBox: { backgroundColor: '#1B2E1D' },
  infoText: { color: '#81C784' },
  saveBtn: { backgroundColor: '#D32F2F' }
});