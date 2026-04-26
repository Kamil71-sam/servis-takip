import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getCustomers,
  createServiceRecord,
  getCustomerDevices,
  createDevice,
  getFirms,
} from '../services/api';

const CustomSelect = ({ visible, title, data, onSelect, onClose, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.selectOverlay} activeOpacity={1} onPress={onClose}>
      <View
        style={[
          styles.selectContent,
          { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' },
        ]}
      >
        <Text
          style={[
            styles.selectTitle,
            {
              color: isDarkMode ? '#fff' : '#1A1A1A',
              borderBottomColor: isDarkMode ? '#333' : '#f0f0f0',
            },
          ]}
        >
          {title}
        </Text>

        <ScrollView
          style={{ maxHeight: 280 }}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="always"
        >
          {data.map((item: any, index: number) => (
            <TouchableOpacity
              key={item.unique_key || (item.id ? item.id.toString() : index.toString())}
              style={styles.selectItem}
              onPress={() => onSelect(item)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.type === 'kurumsal' && (
                  <Ionicons
                    name="business"
                    size={16}
                    color="#FF3B30"
                    style={{ marginRight: 8 }}
                  />
                )}

                <Text
                  style={[
                    styles.selectItemText,
                    { color: isDarkMode ? '#ddd' : '#333' },
                  ]}
                >
                  {item.display_name || item.name || (item.brand ? `${item.brand} ${item.model}` : item)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {data.length === 0 && (
            <Text style={{ textAlign: 'center', padding: 10, color: '#888' }}>
              Kayit bulunamadı...
            </Text>
          )}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

const StatusModal = ({ visible, type, message, recordNo, onConfirm, isDarkMode }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.selectOverlay}>
      <View
        style={[
          styles.miniStatusContent,
          { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' },
        ]}
      >
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.statusMainText,
                { color: isDarkMode ? '#fff' : '#1A1A1A' },
              ]}
            >
              {type === 'success' ? 'İŞLEM TAMAM' : 'HATA'}
            </Text>

            {type === 'success' && recordNo && (
              <View style={styles.recordNoBadge}>
                <Text style={styles.recordNoText}>KAYIT NO: {recordNo}</Text>
              </View>
            )}

            <Text
              style={[
                styles.statusSubText,
                { color: isDarkMode ? '#aaa' : '#666' },
              ]}
            >
              {message}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.miniConfirmBtn, { backgroundColor: '#333' }]}
            onPress={onConfirm}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function YeniServisKaydi({ visible, onClose, isDarkMode }: any) {
  const initialState = {
    customer_id: null as number | null,
    firm_id: null as number | null,
    customer_type: '', 
    cihaz_sahibi: '',
    device_id: null as number | null,
    cihaz_bilgisi: 'Seçiniz...',
    cihaz_turu: 'Seçiniz...',
    marka: '',
    model: '',
    seri_no: '',
    garanti: 'Yok',
    muster_notu: '',
    ariza_notu: '',
    usta: 'Seçilmedi',
  };

  const [servis, setServis] = useState(initialState);
  const [modalType, setModalType] = useState<'tür' | 'musteri' | 'cihaz' | 'garanti' | 'usta' | null>(null);
  const [status, setStatus] = useState({
    visible: false,
    type: 'success' as 'success' | 'error',
    msg: '',
    recordNo: '',
  });
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [showNewDeviceForm, setShowNewDeviceForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<string>('');
  const [searchText, setSearchText] = useState('');

  const rMusteriInput = useRef<TextInput>(null);
  const rMarka = useRef<TextInput>(null);
  const rModel = useRef<TextInput>(null);
  const rSeri = useRef<TextInput>(null);
  const rMNot = useRef<TextInput>(null);
  const rAriza = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const sectionPositions = useRef<Record<string, number>>({});

  const setSectionLayout =
    (key: string) =>
    (event: LayoutChangeEvent) => {
      sectionPositions.current[key] = event.nativeEvent.layout.y;
    };

  const scrollToSection = (key: string, extraOffset: number = 20) => {
    const y = Math.max((sectionPositions.current[key] || 0) - extraOffset, 0);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 120);
  };

  useEffect(() => {
    if (visible) {
      setServis(initialState);
      setShowNewDeviceForm(false);
      setFocusField('');
      setSearchText('');
      loadData();

      const timer = setTimeout(() => {
        rMusteriInput.current?.focus();
      }, 500);
      
      return () => clearTimeout(timer);  
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const [mRes, fRes] = await Promise.all([getCustomers(), getFirms()]);

      const combined = [
        ...mRes.map((c: any) => ({
          unique_key: `m-${c.id}`,
          id: c.id,
          display_name: c.name || `${c.ad} ${c.soyad}`,
          type: 'bireysel',
        })),
        ...fRes.map((f: any) => ({
          unique_key: `f-${f.id}`,
          id: f.id,
          display_name: f.firma_adi,
          type: 'kurumsal',
        })),
      ].sort((a, b) => a.display_name.localeCompare(b.display_name, 'tr'));

      setAllContacts(combined);
    } catch (e) {
      console.log('Veri cekme hatası');
    }
  };

  const filteredContacts = allContacts.filter((c) =>
    c.display_name.toLocaleLowerCase('tr').includes(searchText.toLocaleLowerCase('tr'))
  );

  const handleSearchChange = (t: string) => {
    setSearchText(t);
    if (t.length >= 3) {
      setModalType('musteri');
    } else {
      setModalType(null);
    }
  };

  // MÜDÜR: ZEYNEP-DERİN DENİZCİLİK KARIŞIKLIĞINI BİTİREN KISIM BURASI
  const handleCustomerSelect = async (customer: any) => {
    Keyboard.dismiss();
    rMusteriInput.current?.blur();

    const isKurumsal = customer.type === 'kurumsal';
    const selectedId = Number(customer.id);

    setServis({
      ...initialState, // Tamamen temizleyip öyle dolduruyoruz
      customer_id: isKurumsal ? null : selectedId, // Firma ise müşteri null
      firm_id: isKurumsal ? selectedId : null,     // Bireysel ise firma null
      customer_type: customer.type, 
      cihaz_sahibi: customer.display_name,
      cihaz_bilgisi: 'Cihaz Seciniz...',
    });

    setSearchText(customer.display_name);
    setModalType(null);
    setFocusField('cihaz_sec');

    try {
      const customerDevices = await getCustomerDevices(selectedId, customer.type);
      setDevices([{ id: null, brand: '--- SECIMI TEMIZLE ---', model: '' }, ...customerDevices]);

      setTimeout(() => {
        scrollToSection('deviceSection', 10);
      }, 150);
    } catch (e) {
      console.log('Cihaz çekme hatası');
    }
  };

  const handleExistingDeviceSelect = (device: any) => {
    if (device.id === null) {
      setServis({
        ...servis,
        device_id: null,
        cihaz_bilgisi: 'Seciniz...',
        marka: '',
        model: '',
        cihaz_turu: 'Seciniz...',
      });
    } else {
      setServis({
        ...servis,
        device_id: device.id,
        cihaz_bilgisi: `${device.brand} ${device.model}`,
        marka: device.brand,
        model: device.model,
        cihaz_turu: device.cihaz_turu || 'Belirtilmemis',
      });

      setFocusField('usta');

      setTimeout(() => {
        scrollToSection('ustaSection', 15);
      }, 150);
    }

    setModalType(null);
    setShowNewDeviceForm(false);
  };

  const handleCreateNewDevice = async () => {
    if (!servis.customer_id && !servis.firm_id) return;

    if (!servis.marka.trim() || !servis.model.trim()) {
      Alert.alert('Hata', 'Marka ve model bos bırakılamaz.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customer_id: servis.customer_id, 
        firm_id: servis.firm_id,
        customer_type: servis.firm_id ? 'kurumsal' : 'bireysel',
        brand: servis.marka,
        model: servis.model,
        serial_no: servis.seri_no || 'N/A',
        cihaz_turu: servis.cihaz_turu,
        garanti_durumu: servis.garanti,
        muster_notu: servis.muster_notu,
      };

      const newDev = await createDevice(payload as any);

      setServis({
        ...servis,
        device_id: Number(newDev.id),
        cihaz_bilgisi: `${servis.marka} ${servis.model}`,
      });

      setShowNewDeviceForm(false);

      Alert.alert('Basarılı', 'Yeni cihaz tanımlandı.', [
        {
          text: 'OK',
          onPress: () => {
            setFocusField('usta');
            scrollToSection('ustaSection', 15);
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Hata', 'Cihaz kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };








const handleSaveAttempt = async () => {
    if (!servis.device_id) return Alert.alert('Hata', 'Cihaz secilmedi!');
    if (!servis.ariza_notu.trim()) return Alert.alert('Hata', 'Arıza / sikayet detayı bos bırakılamaz.');

    setLoading(true);

    try {
      // MÜDÜR: ZEYNEP OLAYINI BİTİREN KISIM! İkisini de kendi borusundan yolluyoruz.
      const result = await createServiceRecord({
        device_id: Number(servis.device_id),
        customer_id: servis.customer_id, // Sadece bireyselse gider (Yoksa null)
        firm_id: servis.firm_id,         // Sadece firmaysa gider (Yoksa null)
        issue_text: servis.ariza_notu,
        atanan_usta: servis.usta,
        musteri_notu: servis.muster_notu,
      });

      setStatus({ visible: true, type: 'success', msg: 'Servis Kaydı Tamamlandı.', recordNo: result.servis_no });
    } catch (error) {
      setStatus({ visible: true, type: 'error', msg: 'Kayıt hatası!', recordNo: '' });
    } finally {
      setLoading(false);
    }
  };



  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    inputBg: isDarkMode ? '#1e1e1e' : '#f5f5f5',
    borderColor: isDarkMode ? '#333' : '#ddd',
    textColor: isDarkMode ? '#fff' : '#000',
    formBg: isDarkMode ? '#1A1A1A' : '#fcfcfc',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.textColor }]}>
                YENİ SERVİS KAYDI
              </Text>

              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={38} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{ paddingTop: 10, paddingBottom: 350 }}
              bounces={false}
            >
              <View onLayout={setSectionLayout('customerSection')}>
                <Text style={styles.label}>MÜSTERİ / FİRMA SECİMİ (*)</Text>

                <View style={styles.row}>
                  <View
                    style={[
                      styles.mainInput,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.borderColor,
                        flex: 1,
                      },
                    ]}
                  >



                      <TextInput
                      ref={rMusteriInput}
                      style={{ flex: 1, color: theme.textColor }}
                      placeholder="En az 3 harf girin..."
                      placeholderTextColor="#888"
                      value={searchText}
                      onChangeText={handleSearchChange}
                      onFocus={() => {
                        setFocusField('musteri');
                        scrollToSection('customerSection', 10);
                      }}
                      // EKLENEN KISIM: Klavyeye NEXT (İleri) tuşunu getirir
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        // Bir sonraki alan metin kutusu değil, buton olduğu için klavyeyi indirip yolu açıyoruz
                        Keyboard.dismiss();
                      }}
                    />



                    









                    {searchText.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setSearchText('');
                          setServis({ ...servis, customer_id: null, firm_id: null, cihaz_sahibi: '' });
                          setModalType(null);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="#888" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.sideIconBtn}
                    onPress={() => {
                      setModalType('musteri');
                      setSearchText('');
                    }}
                  >
                    <Ionicons name="person-add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View onLayout={setSectionLayout('deviceSection')}>
                <Text style={styles.label}>
                  CİHAZ SECİMİ (Eski Cihazı Sec veya + ile Yeni Ekle)
                </Text>

                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.mainInput,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.borderColor,
                        flex: 1,
                      },
                      focusField === 'cihaz_sec' && styles.focusedBorder,
                    ]}
                    onPress={() => {
                      if (!servis.customer_id && !servis.firm_id) {
                        Keyboard.dismiss();
                        return Alert.alert('Hata', 'Once Musteri veya Firma Sec!');
                      }
                      setFocusField('cihaz_sec');
                      setModalType('cihaz');
                      scrollToSection('deviceSection', 10);
                    }}
                  >
                    <Text style={{ color: theme.textColor }}>{servis.cihaz_bilgisi}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sideIconBtn,
                      { backgroundColor: showNewDeviceForm ? '#FF3B30' : '#333' },
                    ]}
                    onPress={() => {
                      if (!servis.customer_id && !servis.firm_id) {
                        return Alert.alert('Hata', 'Once Musteri veya Firma Sec!');
                      }
                      if (!showNewDeviceForm) {
                        setServis({
                          ...servis,
                          device_id: null,
                          cihaz_bilgisi: 'Yeni Cihaz Girisi...',
                          marka: '',
                          model: '',
                          seri_no: '',
                          muster_notu: '',
                        });
                      }
                      setShowNewDeviceForm(!showNewDeviceForm);
                      setFocusField('yeni_cihaz');
                      setTimeout(() => {
                        scrollToSection('newDeviceFormSection', 10);
                      }, 120);
                    }}
                  >
                    <Ionicons
                      name={showNewDeviceForm ? 'close' : 'add'}
                      size={28}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {showNewDeviceForm && (
                <View
                  onLayout={setSectionLayout('newDeviceFormSection')}
                  style={[styles.newDeviceForm, { backgroundColor: theme.formBg }]}
                >
                  <Text style={[styles.label, { color: theme.textColor }]}>CİHAZ TURU</Text>

                  <TouchableOpacity
                    style={[styles.innerSelect, { backgroundColor: theme.inputBg }]}
                    onPress={() => {
                      setFocusField('tur');
                      setModalType('tür');
                    }}
                  >
                    <Text style={{ color: theme.textColor }}>{servis.cihaz_turu}</Text>
                    <Ionicons name="chevron-down" size={20} color={theme.textColor} />
                  </TouchableOpacity>

                  <View style={[styles.row, { marginTop: 15 }]}>
                    <TextInput
                      maxLength={30}
                      ref={rMarka}
                      style={[
                        styles.innerInput,
                        { backgroundColor: theme.inputBg, color: theme.textColor },
                        focusField === 'marka' && styles.focusedBorder,
                      ]}
                      placeholder="Marka"
                      placeholderTextColor="#888"
                      onFocus={() => {
                        setFocusField('marka');
                        scrollToSection('newDeviceFormSection', 10);
                      }}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => rModel.current?.focus()}
                      onChangeText={(v) => setServis({ ...servis, marka: v })}
                      value={servis.marka}
                    />

                    <TextInput
                      maxLength={30}
                      ref={rModel}
                      style={[
                        styles.innerInput,
                        {
                          backgroundColor: theme.inputBg,
                          color: theme.textColor,
                          marginLeft: 10,
                        },
                        focusField === 'model' && styles.focusedBorder,
                      ]}
                      placeholder="Model"
                      placeholderTextColor="#888"
                      onFocus={() => {
                        setFocusField('model');
                        scrollToSection('newDeviceFormSection', 10);
                      }}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => rSeri.current?.focus()}
                      onChangeText={(v) => setServis({ ...servis, model: v })}
                      value={servis.model}
                    />
                  </View>

                  <TextInput
                    maxLength={50}
                    ref={rSeri}
                    style={[
                      styles.innerInput,
                      {
                        backgroundColor: theme.inputBg,
                        color: theme.textColor,
                        width: '100%',
                        marginTop: 10,
                      },
                      focusField === 'seri' && styles.focusedBorder,
                    ]}
                    placeholder="Seri Numarası"
                    placeholderTextColor="#888"
                    onFocus={() => {
                      setFocusField('seri');
                      scrollToSection('newDeviceFormSection', 10);
                    }}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                      setFocusField('garanti');
                      setModalType('garanti');
                    }}
                    onChangeText={(v) => setServis({ ...servis, seri_no: v })}
                    value={servis.seri_no}
                  />

                  <Text style={[styles.label, { marginTop: 15, color: theme.textColor }]}>
                    GARANTİ DURUMU
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.innerSelect,
                      { backgroundColor: theme.inputBg },
                      focusField === 'garanti' && styles.focusedBorder,
                    ]}
                    onPress={() => {
                      setFocusField('garanti');
                      setModalType('garanti');
                    }}
                  >
                    <Text style={{ color: theme.textColor }}>{servis.garanti}</Text>
                    <Ionicons name="shield-half" size={20} color={theme.textColor} />
                  </TouchableOpacity>

                  <View onLayout={setSectionLayout('musteriNotSection')}>
                    <Text style={[styles.label, { marginTop: 15, color: theme.textColor }]}>
                      MÜSTERİ NOTU / AKSESUAR (Max 100)
                    </Text>

                    <TextInput
                      maxLength={100}
                      ref={rMNot}
                      style={[
                        styles.innerInput,
                        {
                          backgroundColor: theme.inputBg,
                          color: theme.textColor,
                          width: '100%',
                        },
                        focusField === 'not' && styles.focusedBorder,
                      ]}
                      placeholder="Notlar..."
                      placeholderTextColor="#888"
                      onFocus={() => {
                        setFocusField('not');
                        scrollToSection('musteriNotSection', 15);
                      }}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        Keyboard.dismiss();
                        setFocusField('tanimla');
                      }}
                      onChangeText={(v) => setServis({ ...servis, muster_notu: v })}
                      value={servis.muster_notu}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.addBtn, focusField === 'tanimla' && styles.focusedBorder]}
                    onPress={handleCreateNewDevice}
                  >
                    <Text style={styles.addBtnText}>CİHAZI MÜSTERİYE TANIMLA</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 25 }} />

              <View onLayout={setSectionLayout('ustaSection')}>
                <Text style={styles.label}>ATANAN USTA</Text>

                <TouchableOpacity
                  style={[
                    styles.mainInput,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.borderColor,
                    },
                    focusField === 'usta' && styles.focusedBorder,
                  ]}
                  onPress={() => {
                    setFocusField('usta');
                    setModalType('usta');
                    scrollToSection('ustaSection', 15);
                  }}
                >
                  <Text style={{ color: theme.textColor }}>{servis.usta}</Text>
                  <Ionicons name="construct-outline" size={20} color={theme.textColor} />
                </TouchableOpacity>
              </View>

              <View onLayout={setSectionLayout('arizaSection')}>
                <Text style={styles.label}>ARIZA / SİKAYET DETAYI (* - Max 250)</Text>

                <TextInput
                  maxLength={250}
                  ref={rAriza}
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.borderColor,
                      color: theme.textColor,
                    },
                    focusField === 'ariza' && styles.focusedBorder,
                  ]}
                  onFocus={() => {
                    setFocusField('ariza');
                    scrollToSection('arizaSection', 15);
                  }}
                  multiline
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    setFocusField('kaydet');
                  }}
                  onChangeText={(v) => setServis({ ...servis, ariza_notu: v })}
                  placeholder="Cihazın sikayeti nedir?"
                  placeholderTextColor="#888"
                  value={servis.ariza_notu}
                />
              </View>


                {/* Yazıcı kaldırıldı, Kaydet butonu tam ekran yapıldı */}
              <View style={[styles.row, { marginTop: 30, marginBottom: 50 }]}>
                <TouchableOpacity 
                  style={[styles.saveBtn, { marginRight: 0 }]} 
                  onPress={handleSaveAttempt}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>KAYDET</Text>
                  )}
                </TouchableOpacity>
              </View>

              





            </ScrollView>

            <CustomSelect
              visible={modalType === 'musteri'}
              title="MÜSTERİ / FİRMA LİSTESİ"
              data={filteredContacts}
              isDarkMode={isDarkMode}
              onSelect={handleCustomerSelect}
              onClose={() => setModalType(null)}
            />

            <CustomSelect
              visible={modalType === 'cihaz'}
              title="KAYITLI CİHAZLAR"
              data={devices}
              isDarkMode={isDarkMode}
              onSelect={handleExistingDeviceSelect}
              onClose={() => setModalType(null)}
            />

            <CustomSelect
              visible={modalType === 'tür'}
              title="TÜR"
              data={['Cep Telefonu', 'Notebook', 'Masaüstü Bilgisayar', 'Yazıcı', 'Tablet']}
              isDarkMode={isDarkMode}
              onSelect={(v: string) => {
                setServis({ ...servis, cihaz_turu: v });
                setModalType(null);
                setTimeout(() => rMarka.current?.focus(), 300);
              }}
              onClose={() => setModalType(null)}
            />

            <CustomSelect
              visible={modalType === 'garanti'}
              title="GARANTİ"
              data={['Yok', 'Var (Resmi)', 'Var (Dükkan)']}
              isDarkMode={isDarkMode}
              onSelect={(v: string) => {
                setServis({ ...servis, garanti: v });
                setModalType(null);
                setTimeout(() => {
                  rMNot.current?.focus();
                  setTimeout(() => {
                    setFocusField('not');
                    scrollToSection('musteriNotSection', 15);
                  }, 120);
                }, 300);
              }}
              onClose={() => setModalType(null)}
            />

            <CustomSelect
              visible={modalType === 'usta'}
              title="USTA"
              data={['Usta 1', 'Usta 2', 'Usta 3']}
              isDarkMode={isDarkMode}
              onSelect={(v: string) => {
                setServis({ ...servis, usta: v });
                setModalType(null);
                setTimeout(() => rAriza.current?.focus(), 300);
              }}
              onClose={() => setModalType(null)}
            />

            <StatusModal
              visible={status.visible}
              type={status.type}
              message={status.msg}
              recordNo={status.recordNo}
              isDarkMode={isDarkMode}
              onConfirm={() => {
                if (status.type === 'success') {
                  onClose();
                  setServis(initialState);
                }
                setStatus({ ...status, visible: false });
              }}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}



const styles = StyleSheet.create({
  // paddingTop eklenerek yazının saatin altına girmesi engellendi
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
 



 
  headerTitle: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#888' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 15, alignItems: 'center' },
  mainInput: { height: 52, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 15, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' },
  sideIconBtn: { width: 52, height: 52, backgroundColor: '#1A1A1A', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  focusedBorder: { borderColor: '#FF3B30', borderWidth: 2.5 },
  newDeviceForm: { padding: 20, borderRadius: 15, marginBottom: 20, borderWidth: 1.5, borderColor: '#ddd' },
  innerSelect: { height: 48, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 },
  innerInput: { flex: 1, height: 48, borderRadius: 10, paddingHorizontal: 15, fontSize: 14, borderWidth: 1, borderColor: 'transparent' },
  addBtn: { backgroundColor: '#333', height: 50, borderRadius: 12, marginTop: 25, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  textArea: { height: 100, borderWidth: 1.5, borderRadius: 12, padding: 15, textAlignVertical: 'top' },
  saveBtn: { flex: 1, height: 60, backgroundColor: '#1A1A1A', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  printBtn: { width: 60, height: 60, backgroundColor: '#333', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  selectContent: { width: '85%', borderRadius: 20, padding: 20 },
  selectTitle: { fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 20, borderBottomWidth: 1, paddingBottom: 10 },
  selectItem: { paddingVertical: 15, borderBottomWidth: 0.5, borderColor: '#eee' },
  selectItemText: { fontSize: 15, fontWeight: '600' },
  miniStatusContent: { width: '80%', borderRadius: 15, padding: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusMainText: { fontSize: 16, fontWeight: '900' },
  statusSubText: { fontSize: 13 },
  miniConfirmBtn: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  recordNoBadge: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginVertical: 10, alignSelf: 'flex-start' },
  recordNoText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});