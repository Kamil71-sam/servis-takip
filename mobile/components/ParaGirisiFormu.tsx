import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Modal, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- ÖZEL SEÇİM PENCERESİ ---
const CustomSelect = ({ visible, title, data, onSelect, onClose, isDarkMode }: any) => {
  if (!visible) return null; // KORUMA: Görünmezse motoru yorma, tamamen yok et!
  return (
    <Modal visible={true} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.selectContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.selectTitle, { color: isDarkMode ? '#fff' : '#1A1A1A', borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>{title}</Text>
          {data.map((item: string) => (
            <TouchableOpacity key={item} style={[styles.selectItem, { borderBottomColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]} onPress={() => onSelect(item)}>
              <Text style={[styles.selectItemText, { color: isDarkMode ? '#ddd' : '#333' }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// --- DURUM PENCERESİ ---
const StatusModal = ({ visible, type, message, onConfirm, isDarkMode }: any) => {
  if (!visible) return null; // KORUMA
  return (
    <Modal visible={true} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onConfirm}>
        <View style={[styles.miniStatusContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }, type === 'error' && { borderColor: '#FF3B30', borderWidth: 1.5 }]}>
          <View style={styles.statusRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusMainText, { color: isDarkMode ? '#fff' : '#1A1A1A' }, type === 'error' && { color: '#FF3B30' }]}>
                {type === 'success' ? 'KASA GÜNCELLENDİ' : 'EKSİK BİLGİ'}
              </Text>
              <Text style={[styles.statusSubText, { color: isDarkMode ? '#aaa' : '#666' }]}>{message}</Text>
            </View>
            <TouchableOpacity style={[styles.miniConfirmBtn, { backgroundColor: isDarkMode ? '#333' : '#1A1A1A' }, type === 'error' && { backgroundColor: '#FF3B30' }]} onPress={onConfirm}>
              <Ionicons name={type === 'success' ? "arrow-forward" : "close"} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// --- YENİ CİHAZ ONAY PENCERESİ ---
const DeviceConfirmModal = ({ visible, device, onApprove, onReject, isDarkMode }: any) => {
  if (!visible || !device) return null; // KORUMA
  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.confirmContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.confirmTitle, { color: isDarkMode ? '#fff' : '#1A1A1A', borderColor: isDarkMode ? '#333' : '#eee' }]}>CİHAZ DOĞRULAMA</Text>
          
          <View style={[styles.deviceInfoRow, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <Text style={styles.deviceInfoLabel}>Tür:</Text>
            <Text style={[styles.deviceInfoValue, { color: isDarkMode ? '#ddd' : '#333' }]}>{device.cihazTuru}</Text>
          </View>
          <View style={[styles.deviceInfoRow, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <Text style={styles.deviceInfoLabel}>Marka / Model:</Text>
            <Text style={[styles.deviceInfoValue, { color: isDarkMode ? '#ddd' : '#333' }]}>{device.marka} {device.model}</Text>
          </View>
          <View style={[styles.deviceInfoRow, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <Text style={styles.deviceInfoLabel}>Seri No:</Text>
            <Text style={[styles.deviceInfoValue, { color: isDarkMode ? '#ddd' : '#333' }]}>{device.seriNo}</Text>
          </View>
          <View style={[styles.deviceInfoRow, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <Text style={styles.deviceInfoLabel}>İlgilenen Usta:</Text>
            <Text style={[styles.deviceInfoValue, { color: isDarkMode ? '#ddd' : '#333' }]}>{device.usta}</Text>
          </View>
          <View style={[styles.deviceInfoRow, { borderBottomColor: 'transparent' }]}>
            <Text style={styles.deviceInfoLabel}>Verilen Fiyat Teklifi:</Text>
            <Text style={[styles.deviceInfoValue, { color: '#FF3B30', fontSize: 18 }]}>{device.fiyatTeklifi}</Text>
          </View>

          <View style={styles.confirmBtnRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
              <Text style={styles.rejectBtnText}>YANLIŞ CİHAZ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
              <Text style={styles.approveBtnText}>ONAYLA & GEÇ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// PARA FORMATLAMA MOTORU
const formatMoney = (val: string) => {
  if (!val) return '';
  let clean = val.toString().replace(/\./g, '').replace(',', '.');
  let num = parseFloat(clean);
  if (isNaN(num)) return '';
  let parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(',');
};

const parseMoney = (val: string) => {
  if (!val) return 0;
  let clean = val.toString().replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
};

// VERİTABANI SİMÜLASYONU (RADAR MOTORU)
const mockDatabaseSearch = (kayitNo: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (kayitNo === '1001') {
        resolve({ durum: 'bulundu', cihazTuru: 'Cep Telefonu', marka: 'Apple', model: 'iPhone 13 Pro', seriNo: 'IMEI-847593028', usta: 'Ahmet Usta', fiyatTeklifi: '1.500,00 ₺' });
      } else if (kayitNo === '1002') {
        resolve({ durum: 'bulundu', cihazTuru: 'Laptop', marka: 'Lenovo', model: 'ThinkPad T14', seriNo: 'SN-9948XQ', usta: 'Mehmet Usta', fiyatTeklifi: '3.200,00 ₺' });
      } else {
        resolve({ durum: 'bulunamadi' });
      }
    }, 800); 
  });
};

export default function ParaGirisiFormu({ visible, onClose, isDarkMode }: any) {
  const initialState = { 
    tur: 'Seçiniz...', tutar: '', aciklama: '',
    urunAdi: '', marka: '', numara: '', 
    usta: 'Seçiniz...',
    kayitNo: '', cihazTuru: '', model: '', seriNo: '', fiyatTeklifi: ''
  };
  
  const [f, setF] = useState(initialState);
  const [focus, setFocus] = useState('');
  const [modalState, setModalState] = useState<'tur' | 'usta' | null>(null);
  const [status, setStatus] = useState({ visible: false, type: 'success' as 'success'|'error', msg: '', errorTarget: '' });
  
  const [isSearching, setIsSearching] = useState(false);
  const [isRecordFound, setIsRecordFound] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [tempDeviceData, setTempDeviceData] = useState<any>(null);

  const rKayitNo = useRef<TextInput>(null);
  const rUrunAdi = useRef<TextInput>(null);
  const rMarka = useRef<TextInput>(null);
  const rNumara = useRef<TextInput>(null);
  const rTutar = useRef<TextInput>(null);
  const rAciklama = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setF(initialState);
      setFocus('tur');
      setIsRecordFound(false);
    }
  }, [visible]);

  const handleConfirmAction = () => {
    if (status.type === 'success') {
      setStatus({ ...status, visible: false });
      onClose(); 
    } else {
      const target = status.errorTarget;
      setStatus({ ...status, visible: false });
      setTimeout(() => {
        if (target === 'tur') setModalState('tur');
        else if (target === 'usta') setModalState('usta');
        else if (target === 'urunAdi') rUrunAdi.current?.focus();
        else if (target === 'tutar') rTutar.current?.focus();
        else if (target === 'aciklama') rAciklama.current?.focus();
      }, 300);
    }
  };

  const handleSearchRecord = async () => {
    if (!f.kayitNo || f.kayitNo.length < 3) {
      setStatus({ visible: true, type: 'error', msg: 'Lütfen geçerli bir Kayıt No girin! (Örn: 1001)', errorTarget: '' });
      return;
    }
    Keyboard.dismiss();
    setIsSearching(true);
    setFocus('');

    const sonuc: any = await mockDatabaseSearch(f.kayitNo);
    setIsSearching(false);

    if (sonuc.durum === 'bulundu') {
      setTempDeviceData(sonuc);
      setConfirmModalVisible(true);
    } else {
      setIsRecordFound(false);
      setStatus({ visible: true, type: 'error', msg: 'Bu numaraya ait bir servis kaydı bulunamadı!', errorTarget: '' });
      setTimeout(() => rKayitNo.current?.focus(), 500);
    }
  };

  const handleApproveDevice = () => {
    setF({
      ...f,
      cihazTuru: tempDeviceData.cihazTuru,
      marka: tempDeviceData.marka,
      model: tempDeviceData.model,
      seriNo: tempDeviceData.seriNo,
      usta: tempDeviceData.usta,
      fiyatTeklifi: tempDeviceData.fiyatTeklifi
    });
    setIsRecordFound(true);
    setConfirmModalVisible(false);
    
    setTimeout(() => {
      setFocus('tutar');
      rTutar.current?.focus();
    }, 400);
  };

  const handleRejectDevice = () => {
    setConfirmModalVisible(false);
    setIsRecordFound(false);
    setF({ ...f, kayitNo: '' });
    
    setTimeout(() => {
      setFocus('kayitNo');
      rKayitNo.current?.focus();
    }, 400);
  };

  const handleSaveAttempt = () => {
    if (f.tur === 'Seçiniz...') { setStatus({ visible: true, type: 'error', msg: 'Lütfen işlem türünü seçiniz! (*)', errorTarget: 'tur' }); return; }
    
    if (f.tur === 'Satıştan Giriş' && (!f.urunAdi || f.urunAdi.length < 2)) {
      setStatus({ visible: true, type: 'error', msg: 'Satılan ürün adını giriniz! (*)', errorTarget: 'urunAdi' }); return;
    }

    if (f.tur === 'Tamirden Giriş' && !isRecordFound) {
      setStatus({ visible: true, type: 'error', msg: 'Lütfen geçerli bir Kayıt No bulup cihazı onaylayın!', errorTarget: '' }); return;
    }

    const rawTutar = parseMoney(f.tutar);
    if (rawTutar <= 0) { setStatus({ visible: true, type: 'error', msg: 'Lütfen geçerli bir tutar giriniz! (*)', errorTarget: 'tutar' }); return; }

    Keyboard.dismiss();
    setStatus({ visible: true, type: 'success', msg: 'Tutar kasaya işlendi.', errorTarget: '' });
  };

  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    cardBg: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    inputBg: isDarkMode ? '#2c2c2c' : '#f2f2f2',
    borderColor: isDarkMode ? '#444' : '#eee',
    textColor: isDarkMode ? '#fff' : '#000',
    labelColor: isDarkMode ? '#aaa' : '#333',
    badgeBtnBg: isDarkMode ? '#333' : '#1A1A1A',
    dbBoxBg: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    dbBoxBorder: isDarkMode ? '#444' : '#ddd',
    dbLabelColor: isDarkMode ? '#888' : '#777',
    dbValueColor: isDarkMode ? '#aaa' : '#999',
    readOnlyBg: isDarkMode ? '#222' : '#e9ecef', 
  };

  // KORUMA: Ana modalı da yorma
  if (!visible) return null;

  return (
    <Modal visible={true} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={40} style={{flex: 1}}>
          <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
            
            <View style={styles.header}>
              <View style={[styles.badge, { backgroundColor: theme.badgeBtnBg }]}><Text style={styles.bt}>PARA GİRİŞİ</Text></View>
              <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={42} color="#FF3B30" /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{paddingBottom: 150}}>
              
              <Text style={[styles.label, { color: theme.labelColor }]}>GİRİŞ TÜRÜ (*)</Text>
              <TouchableOpacity 
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focus === 'tur' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                onPress={() => { setModalState('tur'); setFocus('tur'); Keyboard.dismiss(); }}
              >
                <Text style={{color: f.tur !== 'Seçiniz...' ? theme.textColor : '#aaa', fontWeight: '500'}}>{f.tur}</Text>
              </TouchableOpacity>

              {f.tur === 'Satıştan Giriş' && (
                <View>
                  <Text style={[styles.label, { color: theme.labelColor }]}>SATILAN ÜRÜN ADI (*)</Text>
                  <TextInput ref={rUrunAdi} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'urunAdi' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('urunAdi')} value={f.urunAdi} onChangeText={(v)=>setF({...f, urunAdi:v})} returnKeyType="next" onSubmitEditing={()=>rMarka.current?.focus()} blurOnSubmit={false} />

                  <View style={styles.rowLayout}>
                    <View style={{flex: 1, marginRight: 10}}>
                      <Text style={[styles.label, { color: theme.labelColor }]}>MARKASI</Text>
                      <TextInput ref={rMarka} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'marka' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('marka')} value={f.marka} onChangeText={(v)=>setF({...f, marka:v})} returnKeyType="next" onSubmitEditing={()=>rNumara.current?.focus()} blurOnSubmit={false} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={[styles.label, { color: theme.labelColor }]}>NUMARASI</Text>
                      <TextInput ref={rNumara} style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'numara' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} onFocus={()=>setFocus('numara')} value={f.numara} onChangeText={(v)=>setF({...f, numara:v})} returnKeyType="next" onSubmitEditing={()=>rTutar.current?.focus()} blurOnSubmit={false} />
                    </View>
                  </View>

                  <View style={styles.rowLayout}>
                    <View style={{flex: 1, marginRight: 10}}>
                      <Text style={[styles.label, { color: theme.labelColor }]}>STOK MİKTARI</Text>
                      <View style={[styles.input, { backgroundColor: theme.dbBoxBg, borderColor: theme.dbBoxBorder }]}>
                        <Text style={{color: theme.dbValueColor, fontStyle: 'italic'}}>DB'den Alınacak...</Text>
                      </View>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={[styles.label, { color: theme.labelColor }]}>KALAN MİKTAR</Text>
                      <View style={[styles.input, { backgroundColor: theme.dbBoxBg, borderColor: theme.dbBoxBorder }]}>
                        <Text style={{color: theme.dbValueColor, fontStyle: 'italic'}}>Hesaplanacak...</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {f.tur === 'Tamirden Giriş' && (
                <View style={[styles.radarBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <Text style={[styles.label, { color: theme.labelColor, marginTop: 0 }]}>KAYIT NO (ARANACAK FİŞ NO) (*)</Text>
                  
                  <View style={[styles.inputWithIcon, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }, focus === 'kayitNo' && [styles.redBorder, { backgroundColor: theme.cardBg }]]}>
                    <TextInput 
                      ref={rKayitNo} 
                      style={[styles.flexInput, { color: theme.textColor }]} 
                      onFocus={()=>setFocus('kayitNo')} 
                      keyboardType="numeric"
                      placeholder="Örn: 1001" 
                      placeholderTextColor={isDarkMode ? '#666' : '#aaa'} 
                      value={f.kayitNo} 
                      onChangeText={(v)=>{
                        setF({...f, kayitNo:v});
                        if (isRecordFound) setIsRecordFound(false);
                      }} 
                      returnKeyType="search" 
                      blurOnSubmit={true}
                      onSubmitEditing={handleSearchRecord} 
                    />
                    <TouchableOpacity onPress={handleSearchRecord} disabled={isSearching} style={styles.searchBtn}>
                      {isSearching ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="search" size={20} color="#fff" />}
                    </TouchableOpacity>
                  </View>

                  {isRecordFound && (
                    <View style={styles.lockedDataContainer}>
                      <View style={styles.rowLayout}>
                        <View style={{flex: 1, marginRight: 10}}>
                          <Text style={[styles.label, { color: theme.labelColor }]}>CİHAZ TÜRÜ</Text>
                          <View style={[styles.input, { backgroundColor: theme.readOnlyBg, borderColor: theme.borderColor }]}>
                            <Text style={{ color: theme.labelColor, fontWeight: '500' }}>{f.cihazTuru}</Text>
                          </View>
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={[styles.label, { color: theme.labelColor }]}>MARKASI</Text>
                          <View style={[styles.input, { backgroundColor: theme.readOnlyBg, borderColor: theme.borderColor }]}>
                            <Text style={{ color: theme.labelColor, fontWeight: '500' }}>{f.marka}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.rowLayout}>
                        <View style={{flex: 1, marginRight: 10}}>
                          <Text style={[styles.label, { color: theme.labelColor }]}>MODEL</Text>
                          <View style={[styles.input, { backgroundColor: theme.readOnlyBg, borderColor: theme.borderColor }]}>
                            <Text style={{ color: theme.labelColor, fontWeight: '500' }}>{f.model}</Text>
                          </View>
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={[styles.label, { color: theme.labelColor }]}>SERİ NO / IMEI</Text>
                          <View style={[styles.input, { backgroundColor: theme.readOnlyBg, borderColor: theme.borderColor }]}>
                            <Text style={{ color: theme.labelColor, fontWeight: '500' }}>{f.seriNo}</Text>
                          </View>
                        </View>
                      </View>

                      <Text style={[styles.label, { color: theme.labelColor }]}>İLGİLENEN USTA</Text>
                      <View style={[styles.input, { backgroundColor: theme.readOnlyBg, borderColor: theme.borderColor }]}>
                        <Text style={{ color: theme.labelColor, fontWeight: '500' }}>{f.usta}</Text>
                      </View>

                      <Text style={[styles.label, { color: theme.labelColor }]}>MÜŞTERİYE VERİLEN FİYAT TEKLİFİ</Text>
                      <View style={[styles.input, { backgroundColor: theme.readOnlyBg, borderColor: theme.borderColor }]}>
                        <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>{f.fiyatTeklifi}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {f.tur !== 'Seçiniz...' && (
                <View>
                  <Text style={[styles.label, { color: theme.labelColor }]}>İŞLEM TUTARI (₺) (*)</Text>
                  <TextInput 
                    ref={rTutar} 
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor }, focus === 'tutar' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                    onFocus={()=>setFocus('tutar')} 
                    onBlur={() => setF({...f, tutar: formatMoney(f.tutar)})}
                    keyboardType="decimal-pad" 
                    value={f.tutar} 
                    onChangeText={(v)=>setF({...f, tutar:v})} 
                    returnKeyType="next" 
                    blurOnSubmit={false} 
                    onSubmitEditing={()=>rAciklama.current?.focus()} 
                  />

                  <Text style={[styles.label, { color: theme.labelColor }]}>AÇIKLAMA / NOT</Text>
                  <TextInput 
                    ref={rAciklama} 
                    style={[styles.input, { height: 80, backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textColor, marginBottom: 30 }, focus === 'aciklama' && [styles.redBorder, { backgroundColor: theme.cardBg }]]} 
                    onFocus={()=>setFocus('aciklama')} 
                    multiline={true} 
                    blurOnSubmit={true} 
                    returnKeyType="done"
                    value={f.aciklama} 
                    onChangeText={(v)=>setF({...f, aciklama:v})} 
                    onSubmitEditing={() => Keyboard.dismiss()} 
                  />

                  <View style={[styles.dbPriceBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                    <Text style={[styles.dbPriceLabel, { color: theme.labelColor }]}>BU İŞLEMDE KASAYA GİREN (GENEL TOPLAM)</Text>
                    <Text style={[styles.dbPriceValue, { color: theme.textColor }]}>
                      {f.tutar ? `+ ${formatMoney(f.tutar)} ₺` : '0,00 ₺'}
                    </Text>
                  </View>

                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.badgeBtnBg }]} onPress={handleSaveAttempt}>
                    <Text style={styles.saveBtnText}>KASAYA İŞLE</Text>
                  </TouchableOpacity>
                </View>
              )}

            </ScrollView>

            <CustomSelect 
              visible={modalState === 'tur'} title="GİRİŞ TÜRÜ" data={['Kasaya Nakit Girişi', 'Satıştan Giriş', 'Tamirden Giriş']} isDarkMode={isDarkMode} 
              onSelect={(v: string) => { 
                setF({...f, tur: v}); setModalState(null); 
                if(v === 'Satıştan Giriş') { setFocus('urunAdi'); setTimeout(() => rUrunAdi.current?.focus(), 450); }
                else if(v === 'Tamirden Giriş') { setFocus('kayitNo'); setTimeout(() => rKayitNo.current?.focus(), 450); }
                else { setFocus('tutar'); setTimeout(() => rTutar.current?.focus(), 450); }
              }} 
              onClose={() => setModalState(null)} 
            />

            <CustomSelect 
              visible={modalState === 'usta'} title="USTA SEÇİMİ" data={['Usta 1', 'Usta 2', 'Usta 3']} isDarkMode={isDarkMode} 
              onSelect={(v: string) => { setF({...f, usta: v}); setModalState(null); setFocus('tutar'); setTimeout(() => rTutar.current?.focus(), 450); }} 
              onClose={() => setModalState(null)} 
            />

            <DeviceConfirmModal 
              visible={confirmModalVisible} 
              device={tempDeviceData} 
              onApprove={handleApproveDevice} 
              onReject={handleRejectDevice} 
              isDarkMode={isDarkMode} 
            />

            <StatusModal visible={status.visible} type={status.type} message={status.msg} onConfirm={handleConfirmAction} isDarkMode={isDarkMode} />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 50 : 20, marginBottom: 15 },
  badge: { padding: 12, borderRadius: 12 },
  bt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  label: { fontSize: 11, fontWeight: '900', marginTop: 15, marginBottom: 5 },
  input: { borderRadius: 12, padding: 15, borderWidth: 1.5, fontSize: 16, fontWeight: '500' },
  
  inputWithIcon: { borderRadius: 12, paddingLeft: 15, paddingRight: 5, paddingVertical: 5, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flexInput: { flex: 1, fontSize: 16, fontWeight: '500', height: 40 },
  radarBox: { padding: 15, borderRadius: 15, borderWidth: 1.5, marginBottom: 10, marginTop: 25 },
  searchBtn: { backgroundColor: '#FF3B30', padding: 10, borderRadius: 10, width: 45, alignItems: 'center', justifyContent: 'center' },
  lockedDataContainer: { marginTop: 15, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#ddd' },
  
  confirmContent: { width: '85%', borderRadius: 20, padding: 20, elevation: 20 },
  confirmTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 15, borderBottomWidth: 1, paddingBottom: 10 },
  deviceInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  deviceInfoLabel: { fontSize: 14, fontWeight: 'bold', color: '#888' },
  deviceInfoValue: { fontSize: 15, fontWeight: '700', flex: 1, textAlign: 'right' },
  confirmBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  rejectBtn: { flex: 1, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FF3B30', padding: 12, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  rejectBtnText: { color: '#FF3B30', fontWeight: '900', fontSize: 13 },
  approveBtn: { flex: 1, backgroundColor: '#34C759', padding: 12, borderRadius: 12, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  redBorder: { borderColor: '#FF3B30' },
  rowLayout: { flexDirection: 'row', justifyContent: 'space-between' },
  dbPriceBox: { padding: 20, borderRadius: 15, marginTop: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5 },
  dbPriceLabel: { fontSize: 10, fontWeight: '900' },
  dbPriceValue: { fontSize: 26, fontWeight: '900', marginTop: 5 },
  saveBtn: { height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  miniStatusContent: { width: '90%', borderRadius: 15, padding: 20, elevation: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 18, fontWeight: '900' },
  statusSubText: { fontSize: 14, marginTop: 5, fontWeight: '500' },
  miniConfirmBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  selectContent: { width: '85%', borderRadius: 25, padding: 20, elevation: 20 },
  selectTitle: { fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 15, borderBottomWidth: 1.5, paddingBottom: 15 },
  selectItem: { paddingVertical: 15, borderBottomWidth: 1, alignItems: 'center' },
  selectItemText: { fontSize: 16, fontWeight: '700' },
});