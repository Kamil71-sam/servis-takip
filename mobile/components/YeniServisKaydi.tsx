import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard,
  SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCustomers, createServiceRecord, getCustomerDevices, createDevice } from '../services/api';

const CustomSelect = ({ visible, title, data, onSelect, onClose, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.selectOverlay} activeOpacity={1} onPress={onClose}>
      <View style={[styles.selectContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
        <Text style={[styles.selectTitle, { color: isDarkMode ? '#fff' : '#1A1A1A', borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>{title}</Text>
        <ScrollView style={{maxHeight: 280}} showsVerticalScrollIndicator={true}>
          {data.map((item: any, index: number) => (
            <TouchableOpacity key={item.id || index} style={styles.selectItem} onPress={() => onSelect(item)}>
              <Text style={[styles.selectItemText, { color: isDarkMode ? '#ddd' : '#333' }]}>
                {item.name || (item.brand ? `${item.brand} ${item.model}` : item)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

const StatusModal = ({ visible, type, message, recordNo, onConfirm, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.selectOverlay}>
      <View style={[styles.miniStatusContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusMainText, { color: isDarkMode ? '#fff' : '#1A1A1A' }]}>{type === 'success' ? 'İŞLEM TAMAM' : 'HATA'}</Text>
            {type === 'success' && recordNo && (
              <View style={styles.recordNoBadge}><Text style={styles.recordNoText}>KAYIT NO: {recordNo}</Text></View>
            )}
            <Text style={[styles.statusSubText, { color: isDarkMode ? '#aaa' : '#666' }]}>{message}</Text>
          </View>
          <TouchableOpacity style={[styles.miniConfirmBtn, { backgroundColor: '#333' }]} onPress={onConfirm}>
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function YeniServisKaydi({ visible, onClose, isDarkMode }: any) {
  const initialState = {
    customer_id: null as number | null, cihaz_sahibi: '', device_id: null as number | null, cihaz_bilgisi: 'Seçiniz...',
    cihaz_turu: 'Seçiniz...', marka: '', model: '', seri_no: '', garanti: 'Yok',
    muster_notu: '', ariza_notu: '', usta: 'Seçilmedi'
  };

  const [servis, setServis] = useState(initialState);
  const [modalType, setModalType] = useState<'tür' | 'musteri' | 'cihaz' | 'garanti' | 'usta' | null>(null);
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '', recordNo: '' });
  const [customers, setCustomers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [showNewDeviceForm, setShowNewDeviceForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<string>('');

  const rMarka = useRef<TextInput>(null);
  const rModel = useRef<TextInput>(null);
  const rSeri = useRef<TextInput>(null);
  const rMNot = useRef<TextInput>(null);
  const rAriza = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  // MÜDÜR: Form her açıldığında her şeyi "SÜPÜRÜYORUZ"
  useEffect(() => { 
    if (visible) {
      setServis(initialState);
      setShowNewDeviceForm(false);
      setFocusField('');
      loadCustomers(); 
    }
  }, [visible]);

  const loadCustomers = async () => {
    try { const data = await getCustomers(); setCustomers(data); } catch (e) { console.log("Hata"); }
  };

  const handleCustomerSelect = async (customer: any) => {
    setServis({
      ...initialState, 
      customer_id: Number(customer.id), 
      cihaz_sahibi: customer.name, 
      cihaz_bilgisi: 'Cihaz Seçiniz...'
    });
    setModalType(null);
    setFocusField('cihaz_sec');
    setShowNewDeviceForm(false);
    
    try {
      const customerDevices = await getCustomerDevices(customer.id);
      // MÜDÜR: Listenin en başına "Temizle" seçeneği eklendi
      setDevices([{ id: null, brand: '--- SEÇİMİ TEMİZLE ---', model: '' }, ...customerDevices]);
    } catch (e) { console.log("Cihaz listesi çekilemedi"); }
  };

  const handleExistingDeviceSelect = (device: any) => {
    if (device.id === null) {
      // Temizle seçildiyse sıfırla
      setServis({ ...servis, device_id: null, cihaz_bilgisi: 'Seçiniz...', marka: '', model: '', cihaz_turu: 'Seçiniz...' });
    } else {
      setServis({
        ...servis,
        device_id: device.id,
        cihaz_bilgisi: `${device.brand} ${device.model}`,
        marka: device.brand,
        model: device.model,
        cihaz_turu: device.cihaz_turu || 'Belirtilmemiş'
      });
      setFocusField('usta');
      setTimeout(() => {
          scrollRef.current?.scrollTo({ y: 180, animated: true }); 
      }, 100);
    }
    setModalType(null);
    setShowNewDeviceForm(false);
  };

  const handleCreateNewDevice = async () => {
    if (!servis.customer_id) return;
    setLoading(true);
    try {
      const newDev = await createDevice({
        customer_id: Number(servis.customer_id),
        brand: servis.marka,
        model: servis.model,
        serial_no: servis.seri_no || 'N/A',
        cihaz_turu: servis.cihaz_turu,
        garanti_durumu: servis.garanti,
        muster_notu: servis.muster_notu
      });
      setServis({...servis, device_id: Number(newDev.id), cihaz_bilgisi: `${servis.marka} ${servis.model}`});
      setShowNewDeviceForm(false);
      
      Alert.alert(
        "Başarılı", 
        "Yeni cihaz tanımlandı.",
        [{ 
          text: "OK", 
          onPress: () => {
            setFocusField('usta');
            setTimeout(() => {
                scrollRef.current?.scrollTo({ y: 180, animated: true }); 
            }, 100);
          }
        }]
      );
    } catch (e) { Alert.alert("Hata", "Cihaz kaydedilemedi."); } finally { setLoading(false); }
  };

  const handleSaveAttempt = async () => {
    if (!servis.device_id) return Alert.alert("Hata", "Cihaz seçilmedi!");
    setLoading(true);
    try {
      const result = await createServiceRecord({
        device_id: Number(servis.device_id),
        issue_text: servis.ariza_notu,
        atanan_usta: servis.usta 
      });
      
      // MÜDÜR: Ekrana ID değil, SQL'den gelen 26031001 PLAKASINI basıyoruz!
      setStatus({ 
        visible: true, 
        type: 'success', 
        msg: 'Servis Kaydı Tamamlandı.', 
        recordNo: result.servis_no // <-- BURASI DEĞİŞTİ!
      });

    } catch (error) {
      setStatus({ visible: true, type: 'error', msg: 'Kayıt hatası!', recordNo: '' });
    } finally { setLoading(false); }
  };

  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    inputBg: isDarkMode ? '#1e1e1e' : '#f5f5f5',
    borderColor: isDarkMode ? '#333' : '#ddd',
    textColor: isDarkMode ? '#fff' : '#000',
    formBg: isDarkMode ? '#1A1A1A' : '#fcfcfc'
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={40} style={{flex: 1}}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.textColor }]}>YENİ SERVİS KAYDI</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={38} color="#FF3B30" /></TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{ paddingBottom: 200 }}>
              <Text style={styles.label}>MÜŞTERİ SEÇİMİ (*)</Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.mainInput, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focusField === 'musteri' && styles.focusedBorder]} onPress={() => {setFocusField('musteri'); setModalType('musteri');}}><Text style={{color: theme.textColor}}>{servis.cihaz_sahibi || "Müşteri Seçin..."}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.sideIconBtn} onPress={() => setModalType('musteri')}><Ionicons name="person-add" size={24} color="#fff" /></TouchableOpacity>
              </View>

              <Text style={styles.label}>CİHAZ SEÇİMİ (Eski Cihazı Seç veya + ile Yeni Ekle)</Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.mainInput, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focusField === 'cihaz_sec' && styles.focusedBorder]} onPress={() => {if(!servis.customer_id) return Alert.alert("Hata","Önce Müşteri Seç!"); setFocusField('cihaz_sec'); setModalType('cihaz');}}><Text style={{color: theme.textColor}}>{servis.cihaz_bilgisi}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.sideIconBtn, { backgroundColor: showNewDeviceForm ? '#FF3B30' : '#333' }]} onPress={() => {
                    if(!servis.customer_id) return Alert.alert("Hata","Önce Müşteri Seç!"); 
                    if(!showNewDeviceForm) {
                        setServis({...servis, device_id: null, cihaz_bilgisi: 'Yeni Cihaz Girişi...', marka: '', model: '', seri_no: '', muster_notu: ''});
                    }
                    setShowNewDeviceForm(!showNewDeviceForm); 
                    setFocusField('yeni_cihaz');
                }}>
                  <Ionicons name={showNewDeviceForm ? "close" : "add"} size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              {showNewDeviceForm && (
                <View style={[styles.newDeviceForm, { backgroundColor: theme.formBg }]}>
                   <Text style={[styles.label, {color: theme.textColor}]}>CİHAZ TÜRÜ</Text>
                   <TouchableOpacity style={[styles.innerSelect, {backgroundColor: theme.inputBg}]} onPress={() => {setFocusField('tur'); setModalType('tür');}}><Text style={{color: theme.textColor}}>{servis.cihaz_turu}</Text><Ionicons name="chevron-down" size={20} color={theme.textColor} /></TouchableOpacity>
                   <View style={[styles.row, { marginTop: 15 }]}>
                      <TextInput maxLength={30} ref={rMarka} style={[styles.innerInput, {backgroundColor: theme.inputBg, color: theme.textColor}, focusField === 'marka' && styles.focusedBorder]} placeholder="Marka" placeholderTextColor="#888" onFocus={() => setFocusField('marka')} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => rModel.current?.focus()} onChangeText={(v)=>setServis({...servis, marka: v})} />
                      <TextInput maxLength={30} ref={rModel} style={[styles.innerInput, {backgroundColor: theme.inputBg, color: theme.textColor, marginLeft: 10}, focusField === 'model' && styles.focusedBorder]} placeholder="Model" placeholderTextColor="#888" onFocus={() => setFocusField('model')} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => rSeri.current?.focus()} onChangeText={(v)=>setServis({...servis, model: v})} />
                   </View>
                   <TextInput maxLength={50} ref={rSeri} style={[styles.innerInput, {backgroundColor: theme.inputBg, color: theme.textColor, width: '100%', marginTop: 10}, focusField === 'seri' && styles.focusedBorder]} placeholder="Seri Numarası" placeholderTextColor="#888" onFocus={() => setFocusField('seri')} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => {Keyboard.dismiss(); setFocusField('garanti'); setModalType('garanti');}} onChangeText={(v)=>setServis({...servis, seri_no: v})} />
                   <Text style={[styles.label, { marginTop: 15, color: theme.textColor }]}>GARANTİ DURUMU</Text>
                   <TouchableOpacity style={[styles.innerSelect, {backgroundColor: theme.inputBg}, focusField === 'garanti' && styles.focusedBorder]} onPress={() => {setFocusField('garanti'); setModalType('garanti');}}><Text style={{color: theme.textColor}}>{servis.garanti}</Text><Ionicons name="shield-half" size={20} color={theme.textColor} /></TouchableOpacity>
                   <Text style={[styles.label, { marginTop: 15, color: theme.textColor }]}>MÜŞTERİ NOTU / AKSESUAR (Max 100)</Text>
                   <TextInput maxLength={100} ref={rMNot} style={[styles.innerInput, {backgroundColor: theme.inputBg, color: theme.textColor, width: '100%'}, focusField === 'not' && styles.focusedBorder]} placeholder="Notlar..." placeholderTextColor="#888" onFocus={() => setFocusField('not')} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => {Keyboard.dismiss(); setFocusField('tanimla');}} onChangeText={(v)=>setServis({...servis, muster_notu: v})} />
                   <TouchableOpacity style={[styles.addBtn, focusField === 'tanimla' && styles.focusedBorder]} onPress={handleCreateNewDevice}><Text style={styles.addBtnText}>CİHAZI MÜŞTERİYE TANIMLA</Text></TouchableOpacity>
                </View>
              )}

              <View style={{ height: 25 }} /> 

              <Text style={styles.label}>ATANAN USTA</Text>
              <TouchableOpacity style={[styles.mainInput, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focusField === 'usta' && styles.focusedBorder]} onPress={() => {setFocusField('usta'); setModalType('usta');}}><Text style={{color: theme.textColor}}>{servis.usta}</Text><Ionicons name="construct-outline" size={20} color={theme.textColor} /></TouchableOpacity>

              <Text style={styles.label}>ARIZA / ŞİKAYET DETAYI (* - Max 250)</Text>
              <TextInput maxLength={250} ref={rAriza} style={[styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focusField === 'ariza' && styles.focusedBorder]} onFocus={() => setFocusField('ariza')} multiline returnKeyType="done" blurOnSubmit={true} onSubmitEditing={() => {Keyboard.dismiss(); setFocusField('kaydet');}} onChangeText={(v)=>setServis({...servis, ariza_notu: v})} placeholder="Cihazın şikayeti nedir?" />

              <View style={[styles.row, { marginTop: 30, marginBottom: 50 }]}>
                <TouchableOpacity style={[styles.saveBtn]} onPress={handleSaveAttempt}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>KAYDET</Text>}</TouchableOpacity>
                <TouchableOpacity style={styles.printBtn}><Ionicons name="print" size={24} color="#fff" /></TouchableOpacity>
              </View>
            </ScrollView>

            <CustomSelect visible={modalType === 'musteri'} title="MÜŞTERİ" data={customers} isDarkMode={isDarkMode} onSelect={handleCustomerSelect} onClose={() => setModalType(null)} />
            <CustomSelect visible={modalType === 'cihaz'} title="KAYITLI CİHAZLAR" data={devices} isDarkMode={isDarkMode} onSelect={handleExistingDeviceSelect} onClose={() => setModalType(null)} />
            <CustomSelect visible={modalType === 'tür'} title="TÜR" data={['Cep Telefonu', 'Notebook', 'Masaüstü Bilgisayar', 'Yazıcı', 'Tablet']} isDarkMode={isDarkMode} onSelect={(v: string) => { setServis({...servis, cihaz_turu: v}); setModalType(null); setTimeout(() => rMarka.current?.focus(), 400); }} onClose={() => setModalType(null)} />
            <CustomSelect visible={modalType === 'garanti'} title="GARANTİ" data={['Yok', 'Var (Resmi)', 'Var (Dükkan)']} isDarkMode={isDarkMode} onSelect={(v: string) => { setServis({...servis, garanti: v}); setModalType(null); setTimeout(() => rMNot.current?.focus(), 400); }} onClose={() => setModalType(null)} />
            <CustomSelect visible={modalType === 'usta'} title="USTA" data={['Usta 1', 'Usta 2', 'Usta 3']} isDarkMode={isDarkMode} onSelect={(v: string) => { setServis({...servis, usta: v}); setModalType(null); setTimeout(() => rAriza.current?.focus(), 400); }} onClose={() => setModalType(null)} />
            <StatusModal visible={status.visible} type={status.type} message={status.msg} recordNo={status.recordNo} isDarkMode={isDarkMode} onConfirm={() => { if (status.type === 'success') { onClose(); setServis(initialState); } setStatus({...status, visible: false}); }} />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#888' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 15, alignItems: 'center' },
  mainInput: { flex: 1, height: 52, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 15, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' },
  sideIconBtn: { width: 52, height: 52, backgroundColor: '#1A1A1A', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  focusedBorder: { borderColor: '#FF3B30', borderWidth: 2.5 },
  newDeviceForm: { padding: 20, borderRadius: 15, marginBottom: 20, borderWidth: 1.5, borderColor: '#ddd' },
  innerSelect: { height: 48, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 },
  innerInput: { flex: 1, height: 48, borderRadius: 10, paddingHorizontal: 15, fontSize: 14 },
  addBtn: { backgroundColor: '#333', height: 50, borderRadius: 12, marginTop: 25, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  textArea: { height: 100, borderWidth: 1.5, borderRadius: 12, padding: 15, textAlignVertical: 'top' },
  saveBtn: { flex: 1, height: 60, backgroundColor: '#1A1A1A', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  printBtn: { width: 60, height: 60, backgroundColor: '#333', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  selectContent: { width: '85%', borderRadius: 20, padding: 20, elevation: 10 },
  selectTitle: { fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 20, borderBottomWidth: 1, paddingBottom: 10 },
  selectItem: { paddingVertical: 15, borderBottomWidth: 0.5, borderColor: '#eee', alignItems: 'center' },
  selectItemText: { fontSize: 15, fontWeight: '600' },
  miniStatusContent: { width: '80%', borderRadius: 15, padding: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 16, fontWeight: '900' },
  statusSubText: { fontSize: 13 },
  miniConfirmBtn: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  recordNoBadge: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginVertical: 10, alignSelf: 'flex-start' },
  recordNoText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});