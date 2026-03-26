import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { getAllMaterialRequests, updateMaterialStatus } from '../services/api_material';

export default function BankoStokOnay() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const filterMode = params.filterMode; 

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // MÜDÜR: Çekmece (Modal) ve Kırmızı Kutu ayarları
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [checkingId, setCheckingId] = useState<number | null>(null);

  // --- MÜDÜR: IŞIKLI BUTON İÇİN ANİMASYON MOTORU ---
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Kırmızı butonun kalp gibi atmasını sağlayan döngü
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
      ])
    ).start();
  }, []);
  // -------------------------------------------------

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAllMaterialRequests();
      if (res.success) {
        // MÜDÜR: İŞTE MOLOZ TEMİZLİĞİ BURADA! 'Geldi' olanları listeden uçuruyoruz.
        const aktifTalepler = res.data.filter((item: any) => item.status !== 'Geldi');
        setRequests(aktifTalepler);
      }
    } catch (err) {
      Alert.alert("Hata", "Talepler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // MÜDÜR: İŞTE O MÜTHİŞ GRUPLAMA MOTORU (Aynı cihazın siparişlerini tek dosyada toplar)
  const getGroupedData = () => {
    const groups: any = {};
    requests.forEach(r => {
      // Eğer filterMode onlyStok ise ve durum Beklemede DEĞİLSE, gruba ekleme
      if (filterMode === 'onlyStok' && r.status !== 'Beklemede') return;

      if (!groups[r.servis_no]) {
        groups[r.servis_no] = {
          servis_no: r.servis_no,
          marka_model: r.marka_model,
          items: []
        };
      }
      groups[r.servis_no].items.push(r);
    });
    return Object.values(groups);
  };

  const groupedRequests = getGroupedData();

  // --- MÜDÜR: IŞIKLI BUTONA BASILINCA ÇALIŞACAK BANKO ONAY SİSTEMİ ---
  const handleStokOnayi = (part: any) => {
    Alert.alert(
      "Gelen Malzeme Kontrolü",
      `Malzeme: ${part.part_name}\nMiktar: ${part.quantity}\n\nKargodan çıkan malzeme doğru mu? Onaylıyor musunuz?`,
      [
        {
          text: "HAYIR (Hatalı)",
          style: "destructive",
          onPress: () => {
            // MÜDÜR: Hayır derse hiçbir şey değişmez, ışık yanmaya devam eder.
            Alert.alert("Bilgi", "İşlem reddedildi. Buton yanmaya devam edecek, lütfen işlemi loglayın veya ustayı uyarın.");
          }
        },
        {
          text: "EVET (Doğru)",
          onPress: async () => {
            try {
              // MÜDÜR: Statüyü 'Stokta' yapıyoruz ki o Işıklı Buton bir daha görünmesin, ama ana sarı buton işlemi devam etsin.
              await updateMaterialStatus(part.id, 'Stokta', "Banko");
              Alert.alert("Başarılı", "Parça onayı verildi, ışık söndürüldü. Ana butondan işleme devam edebilirsiniz.");
              fetchRequests(); // Ekranı tazele, ışık sönsün
            } catch (err) {
              Alert.alert("Hata", "Onay verilirken bir sorun oluştu.");
            }
          }
        }
      ]
    );
  };
  // -------------------------------------------------------------------

  // MÜDÜR: Modal içindeki boş kutuya tıklandığında çalışacak Akıllı Şalter
  const handleCheckItem = (item: any, totalItemsInGroup: number) => {
    if (checkingId) return; // Zaten bir şeye basıldıysa kilitle
    
    // 1. Kutuyu kırmızıya boya
    setCheckingId(item.id);

    // 2. Kullanıcı kırmızıyı görsün diye yarım saniye (500ms) bekle, sonra işlemi yap ve kapat
    setTimeout(async () => {
      try {
        await updateMaterialStatus(item.id, 'Geldi', "Kemal Müdür"); 
        
        setCheckingId(null);
        setDetailModalVisible(false); // Diğerlerini takip etmek için modalı otomatik kapat

        if (totalItemsInGroup === 1) {
          // Gruptaki SON parça onaylandıysa
          Alert.alert(
            "Tüm Parçalar Tamam!", 
            `Cihazın bekleyen SON parçası da geldi! Cihaz eksiksiz, durumu 'Tamirde' konumuna alındı.`
          );
        }
        
        fetchRequests(); // Listeyi tazele, 'Geldi' olan anında kaybolur.
      } catch (err) {
        setCheckingId(null);
        Alert.alert("Hata", "İşlem sırasında bir sorun oluştu.");
      }
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>Parça Sipariş Takibi</Text>
        <TouchableOpacity onPress={fetchRequests}><Ionicons name="refresh" size={24} color="#FF3B30" /></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#FF3B30" style={{marginTop:50}} /> : (
        <FlatList
          data={groupedRequests}
          keyExtractor={(item: any) => item.servis_no.toString()}
          
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 50}}>
              <Ionicons name="checkmark-done-circle" size={60} color="#34C759" opacity={0.5} />
              <Text style={{marginTop: 15, fontSize: 16, color: '#666', fontWeight: 'bold'}}>Bekleyen Sipariş Yok.</Text>
            </View>
          }

          renderItem={({ item }: { item: any }) => {
            // MÜDÜR: ONAY BEKLEYEN PARÇALARI BULUYORUZ (Işıklı Buton İçin)
            const onayiBekleyenler = item.items.filter((i: any) => i.status === 'Onay Bekliyor');

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.servisNo}>Kayıt No: #{item.servis_no}</Text>
                  <Text style={[styles.statusText, { color: '#FF9500' }]}>
                    BEKLEMEDE
                  </Text>
                </View>
                
                <Text style={styles.markaModel}>{item.marka_model}</Text>
                
                {/* MÜDÜR: İçindeki parçaların kısa özeti */}
                <Text style={styles.desc} numberOfLines={2}>
                  Bekleyenler: {item.items.map((i: any) => i.part_name).join(', ')}
                </Text>

                <View style={styles.btnRow}>
                  
                  {/* --- MÜDÜR: IŞIKLI BUTONLAR (Sadece stok girişi yapılmışsa görünür) --- */}
                  {onayiBekleyenler.length > 0 && onayiBekleyenler.map((part: any) => (
                    <Animated.View key={`pulse-${part.id}`} style={{ opacity: pulseAnim, marginBottom: 10 }}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: '#FF3B30' }]}
                        onPress={() => handleStokOnayi(part)}
                      >
                        <Ionicons name="alert-circle" size={20} color="#FFF" />
                        <Text style={[styles.btnText, { color: '#FFF' }]}>
                          🚨 STOK ONAYI BEKLİYOR
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                  {/* ------------------------------------------------------------------------ */}

                  {/* MÜDÜR: ESKİ SARI BUTON BURASI (Işık sönse bile bu hep burada) */}
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#FFCC00' }]}
                    onPress={() => {
                      setSelectedGroup(item);
                      setDetailModalVisible(true);
                    }}
                  >
                    <Ionicons name="cube" size={20} color="#333" />
                    <Text style={[styles.btnText, { color: '#333' }]}>
                      {item.items.length} PARÇA GELDİ
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>
            );
          }}
        />
      )}

      {/* MÜDÜR: DETAY (ÇEKMECE) MODALI */}
      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sipariş Detayı (#{selectedGroup?.servis_no})</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubTitle}>{selectedGroup?.marka_model}</Text>
            
            <ScrollView style={{ marginTop: 15 }} showsVerticalScrollIndicator={false}>
              {selectedGroup?.items.map((part: any, index: number) => (
                <View key={part.id} style={styles.partRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partName}>{part.quantity}x {part.part_name}</Text>
                    {part.description ? <Text style={styles.partDesc}>{part.description}</Text> : null}
                  </View>
                  
                  {/* MÜDÜR: KUTU VE KIRMIZI ONAY İŞLEMİ BURADA */}
                  <TouchableOpacity 
                    style={styles.checkBoxBtn}
                    onPress={() => handleCheckItem(part, selectedGroup.items.length)}
                  >
                    <Ionicons 
                      name={checkingId === part.id ? "checkbox" : "square-outline"} 
                      size={28} 
                      color={checkingId === part.id ? "#FF3B30" : "#AAA"} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF', alignItems: 'center', elevation: 2 },
  title: { fontSize: 18, fontWeight: '900' },
  card: { backgroundColor: '#FFF', margin: 10, padding: 15, borderRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  servisNo: { fontWeight: 'bold', color: '#FF3B30' },
  statusText: { fontSize: 12, fontWeight: '900' },
  markaModel: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  desc: { fontSize: 12, color: '#666', marginTop: 5, fontStyle: 'italic' },
  btnRow: { marginTop: 15, paddingTop: 10 },
  actionBtn: { flexDirection: 'row', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 1 },
  btnText: { fontWeight: '900', marginLeft: 8, fontSize: 15 },

  // Modal Stilleri
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '80%', minHeight: '40%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#333' },
  modalSubTitle: { fontSize: 14, color: '#666', fontWeight: 'bold', marginTop: 5 },
  partRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  partName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  partDesc: { fontSize: 12, color: '#888', marginTop: 4 },
  checkBoxBtn: { padding: 5, marginLeft: 10 }
});