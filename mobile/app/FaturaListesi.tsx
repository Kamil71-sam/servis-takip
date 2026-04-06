import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { pdfCiktiAl, wordCiktiAl, mailCiktiAl } from '../components/CiktiMotoru';

interface BekleyenFatura {
    id: string;
    musteri_adi: string;
    islem_tipi: string;
    cihaz: string;
    tutar: string | number;
}

const FaturaListesi = () => {
    const router = useRouter(); 
    const params = useLocalSearchParams(); 
    
    // 🚨 MÜDÜR: HEM FORMATI HEM GECE MODUNU YAKALAYAN GÖZ
    const isWordMode = params.format === 'word'; 
    const isMailMode = params.format === 'mail';
    const isDarkMode = params.theme === 'dark'; // Dashboard'dan gelen gece notu

    const [tumVeriler, setTumVeriler] = useState<BekleyenFatura[]>([]);
    const [filtreliVeriler, setFiltreliVeriler] = useState<BekleyenFatura[]>([]);
    const [aktifFiltre, setAktifFiltre] = useState('Hepsi');
    const [zamanFiltre, setZamanFiltre] = useState(1); 
    const [loading, setLoading] = useState(true);

    // 🚨 MÜDÜR: GECE MODU TEMA AYARLARI
    const theme = {
        bg: isDarkMode ? '#121212' : '#f4f4f4',
        card: isDarkMode ? '#1E1E1E' : '#fff',
        text: isDarkMode ? '#fff' : '#1a1a1a',
        subText: isDarkMode ? '#aaa' : '#666',
        border: isDarkMode ? '#333' : '#ddd',
        timeBg: isDarkMode ? '#2c2c2c' : '#e0e0e0',
        primary: '#D32F2F'
    };

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

    const faturaAtesle = async (id: string, islemTipi: string) => {
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/fatura/detay?servis_no=${id}&tip=${islemTipi}`);
            const json = await res.json();
            
            if (json.success) {
                if (isWordMode) {
                    wordCiktiAl(json.faturaVerisi);
                } else if (isMailMode) {
                    mailCiktiAl(json.faturaVerisi);
                } else {
                    pdfCiktiAl(json.faturaVerisi);
                }
            } else {
                Alert.alert("İşlem Durduruldu", json.message || "Detaylar alınamadı.");
            }
        } catch (e) {
            Alert.alert("Hata", "Fatura detayları çekilirken bir hata oluştu.");
        }
    };

    const filtreUygula = (tip: string) => {
        setAktifFiltre(tip);
        if (tip === 'Hepsi') setFiltreliVeriler(tumVeriler);
        else setFiltreliVeriler(tumVeriler.filter(item => item.islem_tipi === tip));
    };

    useEffect(() => { verileriGetir(zamanFiltre); }, []);

    const FilterButton = ({ title, type }: { title: string, type: string }) => (
        <TouchableOpacity onPress={() => filtreUygula(type)} 
            style={[
                styles.filterBtn, 
                { backgroundColor: theme.card, borderColor: theme.border },
                aktifFiltre === type && { backgroundColor: isDarkMode ? '#FF3B30' : '#333', borderColor: isDarkMode ? '#FF3B30' : '#333' }
            ]}>
            <Text style={[styles.filterBtnText, { color: theme.subText }, aktifFiltre === type && { color: '#fff' }]}>{title}</Text>
        </TouchableOpacity>
    );

    const ZamanButton = ({ label, value }: { label: string, value: number }) => (
        <TouchableOpacity onPress={() => { setZamanFiltre(value); verileriGetir(value); }} 
            style={[styles.timeBtn, zamanFiltre === value && { backgroundColor: theme.card, elevation: 3 }]}>
            <Text style={[styles.timeText, { color: theme.subText }, zamanFiltre === value && { color: theme.primary }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <View style={{ padding: 15, flex: 1 }}>
                
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}><Ionicons name="arrow-back" size={28} color={theme.text} /></TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Fatura Masası <Text style={{color: isWordMode ? '#007AFF' : theme.primary}}>{isWordMode ? '(WORD)' : '(PDF)'}</Text></Text>
                    <TouchableOpacity onPress={() => verileriGetir(zamanFiltre)} style={{ padding: 5 }}><Ionicons name="refresh" size={24} color={theme.primary} /></TouchableOpacity>
                </View>

                <View style={[styles.timeContainer, { backgroundColor: theme.timeBg }]}>
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

                {loading ? ( <ActivityIndicator size="large" color={theme.primary} style={{marginTop: 50}} />
                ) : filtreliVeriler.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="funnel-outline" size={60} color={isDarkMode ? "#333" : "#ccc"} />
                        <Text style={[styles.emptyText, { color: theme.subText }]}>{aktifFiltre} kategorisinde kayıt yok.</Text>
                    </View>
                ) : (
                    <FlatList data={filtreliVeriler} keyExtractor={(item, index) => index.toString()} showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                onPress={() => faturaAtesle(String(item.id), item.islem_tipi)} 
                                style={[styles.card, { backgroundColor: theme.card }]}
                            >
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={[styles.clientName, { color: theme.text }]} numberOfLines={1}>{item.musteri_adi}</Text>
                                        <View style={[styles.tag, {backgroundColor: item.islem_tipi === 'Tamir' ? '#007AFF' : item.islem_tipi === 'Randevu' ? '#5856D6' : '#FF9500'}]}><Text style={styles.tagText}>{item.islem_tipi}</Text></View>
                                    </View>
                                    <Text style={[styles.deviceInfo, { color: theme.subText }]} numberOfLines={2}>{item.cihaz}</Text>
                                    <Text style={[styles.idText, { color: theme.primary }]}>ID: {item.id}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end', minWidth: 75 }}>
                                    <Text style={styles.priceText}>{item.tutar} ₺</Text>
                                    <Ionicons name="document-text" size={20} color={isWordMode ? "#007AFF" : theme.primary} style={{marginTop: 5}} />
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
    headerTitle: { fontSize: 20, fontWeight: '900' },
    timeContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 15 },
    timeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    timeText: { fontSize: 12, fontWeight: 'bold' },
    filterContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, borderWidth: 1 },
    filterBtnText: { fontSize: 11, fontWeight: 'bold' },
    card: { padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
    clientName: { fontWeight: 'bold', fontSize: 14, marginRight: 5, flexShrink: 1 }, 
    tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    tagText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    deviceInfo: { fontSize: 12, marginTop: 4 },
    idText: { fontWeight: 'bold', fontSize: 10, marginTop: 2 },
    priceText: { fontWeight: '900', fontSize: 14, color: '#34C759' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -50 },
    emptyText: { fontSize: 16, marginTop: 10, fontWeight: 'bold' }
});

export default FaturaListesi;