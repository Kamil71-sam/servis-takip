import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; 
import { pdfCiktiAl } from '../components/CiktiMotoru'; 

interface BekleyenFatura {
    id: string;
    musteri_adi: string;
    islem_tipi: string;
    cihaz: string;
    tutar: string | number;
}

const FaturaListesi = () => {
    const router = useRouter(); 
    const [tumVeriler, setTumVeriler] = useState<BekleyenFatura[]>([]);
    const [filtreliVeriler, setFiltreliVeriler] = useState<BekleyenFatura[]>([]);
    const [aktifFiltre, setAktifFiltre] = useState('Hepsi');
    const [zamanFiltre, setZamanFiltre] = useState(1); 
    const [loading, setLoading] = useState(true);

    const verileriGetir = async (gun: number) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/fatura/bekleyenler?gun=${gun}`);
            const json = await response.json();
            if (json.success) {
                setTumVeriler(json.data);
                setFiltreliVeriler(json.data);
                setAktifFiltre('Hepsi');
            }
        } catch (e) {
            Alert.alert("Hata", "Sunucuya bağlanılamadı.");
        } finally { setLoading(false); }
    };





// 🚨 Kurye'ye "Tamir mi, Stok mu?" olduğunu söylüyoruz ve ALARM mesajlarını yakalıyoruz
    const faturaAtesle = async (id: string, islemTipi: string) => {
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/fatura/detay?servis_no=${id}&tip=${islemTipi}`);
            const json = await res.json();
            
            if (json.success) {
                pdfCiktiAl(json.faturaVerisi); 
            } else {
                // 🚨 EĞER İŞLEM ZARARINAYSA BURADA KOCAMAN ALARM ÇALACAK VE DURACAK!
                Alert.alert("İşlem Durduruldu", json.message || "Detaylar alınamadı.");
            }
        } catch (e) {
            Alert.alert("Hata", "Fatura detayları çekilirken bir hata oluştu.");
        }
    };






    /*
    // 🚨 Doğrudan Ateşleme: Menü yok, soru yok. Tıkla ve PDF gelsin.
    const faturaAtesle = async (id: string) => {
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/fatura/detay?servis_no=${id}`);
            const json = await res.json();
            
            if (json.success) {
                pdfCiktiAl(json.faturaVerisi); 
            } else {
                Alert.alert("Bilgi", json.message || "Detaylar alınamadı.");
            }
        } catch (e) {
            Alert.alert("Hata", "Fatura detayları çekilirken bir hata oluştu.");
        }
    };

    */





    const filtreUygula = (tip: string) => {
        setAktifFiltre(tip);
        if (tip === 'Hepsi') setFiltreliVeriler(tumVeriler);
        else setFiltreliVeriler(tumVeriler.filter(item => item.islem_tipi === tip));
    };

    useEffect(() => { verileriGetir(zamanFiltre); }, []);

    const FilterButton = ({ title, type }: { title: string, type: string }) => (
        <TouchableOpacity onPress={() => filtreUygula(type)} style={[styles.filterBtn, aktifFiltre === type && styles.filterBtnActive]}>
            <Text style={[styles.filterBtnText, aktifFiltre === type && styles.filterBtnTextActive]}>{title}</Text>
        </TouchableOpacity>
    );

    const ZamanButton = ({ label, value }: { label: string, value: number }) => (
        <TouchableOpacity onPress={() => { setZamanFiltre(value); verileriGetir(value); }} style={[styles.timeBtn, zamanFiltre === value && styles.timeBtnActive]}>
            <Text style={[styles.timeText, zamanFiltre === value && styles.timeTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
            <View style={{ padding: 15, flex: 1 }}>
                
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}><Ionicons name="arrow-back" size={28} color="#1a1a1a" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Fatura Masası</Text>
                    <TouchableOpacity onPress={() => verileriGetir(zamanFiltre)} style={{ padding: 5 }}><Ionicons name="refresh" size={24} color="#D32F2F" /></TouchableOpacity>
                </View>

                <View style={styles.timeContainer}>
                    <ZamanButton label="Bugün" value={1} />
                    <ZamanButton label="1 Hafta" value={7} />
                    <ZamanButton label="1 Ay" value={30} />
                    <ZamanButton label="1 Yıl" value={365} />
                </View>
                
                <View style={styles.filterContainer}>
                    <FilterButton title="Hepsi" type="Hepsi" />
                    <FilterButton title="Tamir" type="Tamir" />
                    <FilterButton title="Randevu" type="Randevu" />
                    <FilterButton title="Stok" type="Stok" />
                </View>

                {loading ? ( <ActivityIndicator size="large" color="#D32F2F" style={{marginTop: 50}} />
                ) : filtreliVeriler.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="funnel-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>{aktifFiltre} kategorisinde kayıt yok.</Text>
                    </View>
                ) : (
                    <FlatList data={filtreliVeriler} keyExtractor={(item, index) => index.toString()} showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                          
                          

                            <TouchableOpacity 
                                onPress={() => faturaAtesle(String(item.id), item.islem_tipi)} // 🚨 islem_tipi'ni fırlattık
                                style={styles.card}
                            >

                        
                           

                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={styles.clientName} numberOfLines={1}>{item.musteri_adi}</Text>
                                        <View style={[styles.tag, {backgroundColor: item.islem_tipi === 'Tamir' ? '#007AFF' : item.islem_tipi === 'Randevu' ? '#5856D6' : '#FF9500'}]}><Text style={styles.tagText}>{item.islem_tipi}</Text></View>
                                    </View>
                                    <Text style={styles.deviceInfo} numberOfLines={2}>{item.cihaz}</Text>
                                    <Text style={styles.idText}>ID: {item.id}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end', minWidth: 75 }}>
                                    <Text style={styles.priceText}>{item.tutar} ₺</Text>
                                    <Ionicons name="document-text" size={20} color="#D32F2F" style={{marginTop: 5}} />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a' },
    timeContainer: { flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 12, padding: 4, marginBottom: 15 },
    timeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    timeBtnActive: { backgroundColor: '#fff', elevation: 3 },
    timeText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
    timeTextActive: { color: '#D32F2F' },
    filterContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
    filterBtnActive: { backgroundColor: '#333', borderColor: '#333' },
    filterBtnText: { fontSize: 11, fontWeight: 'bold', color: '#666' },
    filterBtnTextActive: { color: '#fff' },
    card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
    clientName: { fontWeight: 'bold', fontSize: 14, marginRight: 5, flexShrink: 1 }, 
    tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    tagText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    deviceInfo: { color: '#666', fontSize: 12, marginTop: 4 },
    idText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 10, marginTop: 2 },
    priceText: { fontWeight: '900', fontSize: 14, color: '#34C759' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -50 },
    emptyText: { color: '#999', fontSize: 16, marginTop: 10, fontWeight: 'bold' }
});

export default FaturaListesi;