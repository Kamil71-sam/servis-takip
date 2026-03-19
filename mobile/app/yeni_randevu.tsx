import React, { useState, useRef, useEffect } from 'react'; 
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Alert, ScrollView, ActivityIndicator, Platform, StatusBar,
  KeyboardAvoidingView, Keyboard, Modal, FlatList 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios';
import { BlurView } from 'expo-blur'; // MÜDÜR: Blur için bunu ekledik

const API_BASE = 'http://192.168.1.41:3000/api';

export default function YeniRandevu() {
  const router = useRouter();
  
  const { theme } = useLocalSearchParams();
  const isDarkMode = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
  
  // MÜDÜR: Şık Onay Ekranı State'leri
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [assignedServiceNo, setAssignedServiceNo] = useState('');

  // REHBER STATE'LERİ
  const [modalVisible, setModalVisible] = useState(false);
  const [allCustomers, setAllCustomers] = useState<any[]>([]); 
  const [searchQuery, setSearchQuery] = useState('');

  const [phone, setPhone] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState({ id: null, name: '', exists: false });
  const [customerType, setCustomerType] = useState('bireysel'); 
  const [unregistered, setUnregistered] = useState(false); 
  const [address, setAddress] = useState(''); 

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

  useEffect(() => {
    fetchAllCustomers();
  }, []);

  const fetchAllCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/customers/all`); 
      if (res.data.success) {
        setAllCustomers(res.data.data);
      }
    } catch (err) {
      console.log("Rehber verisi çekilemedi.");
    }
  };

  const handleSelectFromGuide = (item: any) => {
    setPhone(item.phone);
    setCustomerInfo({ id: item.id, name: item.name, exists: true });
    setCustomerType(item.tip || 'bireysel');
    setUnregistered(false);
    setModalVisible(false);
    setTimeout(() => addressRef.current?.focus(), 500);
  };

  const handleGoToDashboard = () => {
    setSuccessModalVisible(false);
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

    setLoading(true);
    setSaveStatus(null);
    Keyboard.dismiss();

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
      // MÜDÜR: ÖNCE ÇAKIŞMA KONTROLÜ YAPIYORUZ
      const conflictRes = await axios.get(`${API_BASE}/appointments/check-conflict?date=${dbDate}&time=${time}`);
      
      if (conflictRes.data.isOccupied) {
        setLoading(false);
        Alert.alert("Randevu Çakışması", "Bu tarih ve saatte zaten bir randevu mevcut. Lütfen başka bir zaman seçin.");
        return;
      }

      // EĞER SAAT BOŞSA KAYDA DEVAM ET
      const res = await axios.post(`${API_BASE}/appointments/ekle`, {
        customer_id: customerInfo.id,
        type: customerType, 
        device_brand: brand, 
        device_model: model,
        date: dbDate, 
        time,
        usta: usta, 
        issue: paketlenmisVeri 
      });
      
      if (res.data.success) {
        setAssignedServiceNo(res.data.servis_no || 'Atandı');
        setSaveStatus('success'); 
        setSuccessModalVisible(true); // ŞIK EKRANI AÇ
      }
    } catch (err: any) {
      setSaveStatus('error'); 
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
        <TouchableOpacity onPress={() => router.replace({ pathname: '/dashboard', params: { theme: theme } })} style={styles.closeBtn}>
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
              <TouchableOpacity 
                style={styles.guideBtn} 
                onPress={() => { fetchAllCustomers(); setModalVisible(true); }}
              >
                <Ionicons name="person-add-outline" size={26} color="#FFF" />
              </TouchableOpacity>
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

          {/* CİHAZ BİLGİLERİ */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && darkStyles.textSub]}>Cihaz Çeşidi / Marka / Model</Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              <TextInput 
                ref={deviceTypeRef}
                style={[styles.input, isDarkMode && darkStyles.input, {flex: 1}, focusField === 'deviceType' && styles.focusedBorder]}
                placeholder="Çeşit"
                placeholderTextColor={isDarkMode ? "#888" : "#999"}
                returnKeyType="next"
                onFocus={() => setFocusField('deviceType')}
                onBlur={() => setFocusField(null)}
                onSubmitEditing={() => brandRef.current?.focus()}
                blurOnSubmit={false}
                value={deviceType}
                onChangeText={setDeviceType}
              />
              <TextInput 
                ref={brandRef}
                style={[styles.input, isDarkMode && darkStyles.input, {flex: 1}, focusField === 'brand' && styles.focusedBorder]}
                placeholder="Marka"
                placeholderTextColor={isDarkMode ? "#888" : "#999"}
                returnKeyType="next"
                onFocus={() => setFocusField('brand')}
                onBlur={() => setFocusField(null)}
                onSubmitEditing={() => modelRef.current?.focus()}
                blurOnSubmit={false}
                value={brand}
                onChangeText={setBrand}
              />
              <TextInput 
                ref={modelRef}
                style={[styles.input, isDarkMode && darkStyles.input, {flex: 1}, focusField === 'model' && styles.focusedBorder]}
                placeholder="Model"
                placeholderTextColor={isDarkMode ? "#888" : "#999"}
                returnKeyType="next"
                onFocus={() => setFocusField('model')}
                onBlur={() => setFocusField(null)}
                onSubmitEditing={() => dateRef.current?.focus()}
                blurOnSubmit={false}
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
                onSubmitEditing={() => Keyboard.dismiss()} 
                blurOnSubmit={false}
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          {showDatePicker && (<DateTimePicker value={dateObj} mode="date" display="default" onChange={onChangeDate} />)}

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
              returnKeyType="done"
              blurOnSubmit={true} 
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

      {/* REHBER MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && {backgroundColor: '#1A1A1A'}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && {color: '#FFF'}]}>Müşteri Rehberi</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={[styles.input, isDarkMode && darkStyles.input, {marginBottom: 15}]}
              placeholder="İsim veya telefon ile ara..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={allCustomers.filter(c => (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.phone || '').includes(searchQuery))}
              keyExtractor={(item, index) => `${item.tip}-${item.id}-${index}`}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.customerItem} onPress={() => handleSelectFromGuide(item)}>
                  <Ionicons name={item.tip === 'firma' ? "business" : "person"} size={24} color={item.tip === 'firma' ? "#FF9500" : "#4CAF50"} />
                  <View style={{marginLeft: 15}}>
                    <Text style={[styles.customerName, isDarkMode && {color: '#FFF'}]}>{item.name}</Text>
                    <Text style={styles.customerPhone}>{item.phone}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* MÜDÜR: JİLET GİBİ ONAY EKRANI (BLUR'LU VE TİKLİ) */}
      <Modal animationType="fade" transparent={true} visible={successModalVisible}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.successWrapper}>
            <View style={styles.successCard}>
              <View style={styles.successHeaderRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.successTitleText}>İŞLEM TAMAM</Text>
                  <View style={styles.successBadgeBox}>
                    <Text style={styles.successBadgeLabel}>KAYIT NO:</Text>
                    <Text style={styles.successBadgeValue}>{assignedServiceNo}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.successTickBox} onPress={handleGoToDashboard}>
                  <Ionicons name="checkmark" size={40} color="#FFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.successInfoText}>Randevu Kaydı Başarıyla Tamamlandı.</Text>
            </View>
          </View>
        </BlurView>
      </Modal>

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
  guideBtn: { backgroundColor: '#000000', padding: 10, borderRadius: 10, marginLeft: 10 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 12, borderRadius: 10, marginBottom: 20, gap: 8 },
  infoText: { color: '#2E7D32', fontSize: 14 },
  saveBtn: { backgroundColor: '#000000', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '75%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  customerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  customerName: { fontSize: 16, fontWeight: '600' },
  customerPhone: { fontSize: 14, color: '#888' },
  // MÜDÜR: ONAY EKRANI ÖZEL STİLLERİ
  successWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  successCard: { backgroundColor: '#FFF', width: '85%', borderRadius: 30, padding: 25, shadowColor: "#000", shadowOpacity: 0.2, elevation: 15 },
  successHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  successTitleText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  successBadgeBox: { flexDirection: 'row', backgroundColor: '#EE404C', padding: 7, borderRadius: 8, marginTop: 5, alignSelf: 'flex-start' },
  successBadgeLabel: { color: '#FFF', fontSize: 12, marginRight: 5 },
  successBadgeValue: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  successTickBox: { backgroundColor: '#000', width: 70, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  successInfoText: { color: '#666', fontSize: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15, marginTop: 10 }
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#121212' },
  header: { backgroundColor: '#1A1A1A', borderBottomColor: '#2C2C2C' },
  textMain: { color: '#F8F9FA' },
  textSub: { color: '#9BA4B5' },
  input: { backgroundColor: '#2C2C2C', borderColor: '#3A3A3A', color: '#FFF' },
  trackingBadge: { backgroundColor: '#1E1E1E' }, 
  infoBox: { backgroundColor: '#1B2E1D' },
  infoText: { color: '#81C784' },
  saveBtn: { backgroundColor: '#000000' }
});