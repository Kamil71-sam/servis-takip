import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUzmanDashboardData } from '../services/api_uzman';

interface Task {
  id: string;
  servis_no?: string;
  status: string;
  issue: string;
  customer?: string; 
  device?: string;
  priority?: string;
}

export default function DashboardUzman() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    atanan: 0,
    aktif: 0,
    parcaBekleyen: 0,
    randevu: 0
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  const ustaEmail = 'Usta_1';

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getUzmanDashboardData(ustaEmail);
      if (res && res.success) {
        setStats({
          atanan: res.data.atanananIslerSayisi || 0,
          aktif: res.data.aktifIslerSayisi || 0,
          parcaBekleyen: res.data.parcaBekleyenSayisi || 0,
          randevu: res.data.randevuSayisi || 0
        });
        setRecentTasks(res.data.sonIsler || []);
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    Alert.alert("Çıkış", "Sistemden çıkış yapmak istiyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış", onPress: () => router.replace('/'), style: "destructive" }
    ]);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && darkStyles.container]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, isDarkMode && darkStyles.header]}>
        <View>
          <Text style={[styles.welcomeText, isDarkMode && darkStyles.textSub]}>Hoş Geldin,</Text>
          <Text style={[styles.uzmanName, isDarkMode && darkStyles.textMain]}>Uzman 1</Text>
        </View>
        <View style={styles.headerRight}>
           <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color={isDarkMode ? "#FFD700" : "#555"} />
           </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
              <Ionicons name="exit-outline" size={28} color="#FF3B30" />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, isDarkMode && darkStyles.statBox]}>
            <Ionicons name="briefcase-outline" size={18} color={isDarkMode ? "#AAA" : "#000"} />
            <Text style={[styles.statNumber, isDarkMode && darkStyles.textMain]}>
                {loading ? ".." : stats.atanan}
            </Text> 
            <Text style={[styles.statLabel, isDarkMode && darkStyles.textSub]}>Atanan İş/Cihaz Sayısı</Text>
          </View>
          
          <View style={[styles.statBox, isDarkMode && darkStyles.statBox]}>
            <Ionicons name="hardware-chip-outline" size={18} color={isDarkMode ? "#AAA" : "#000"} />
            <Text style={[styles.statNumber, isDarkMode && darkStyles.textMain]}>
                {loading ? ".." : stats.aktif}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && darkStyles.textSub]}>Aktif İşler</Text>
          </View>

          <View style={[styles.statBox, isDarkMode && darkStyles.statBox]}>
            <Ionicons name="cube-outline" size={18} color={isDarkMode ? "#AAA" : "#000"} />
            <Text style={[styles.statNumber, isDarkMode && darkStyles.textMain]}>
                {loading ? ".." : stats.parcaBekleyen}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && darkStyles.textSub]}>Parça Bekleyen</Text>
          </View>

          <View style={[styles.statBox, isDarkMode && darkStyles.statBox]}>
            <Ionicons name="calendar-outline" size={18} color={isDarkMode ? "#AAA" : "#000"} />
            <Text style={[styles.statNumber, isDarkMode && darkStyles.textMain]}>
                {loading ? ".." : stats.randevu}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && darkStyles.textSub]}>Randevular</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, isDarkMode && darkStyles.actionBtn]} 
            onPress={() => router.push('/isler_uzman' as any)}
          >
            <Text style={styles.actionBtnText}>Onarım Listesi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isDarkMode && darkStyles.actionBtn]}><Text style={styles.actionBtnText}>Yedek Parça </Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isDarkMode && darkStyles.actionBtn]}><Text style={styles.actionBtnText}>Randevu</Text></TouchableOpacity>
        </View>

        {/* MÜDÜR: Başlık "Sıradaki İşler" olarak güncellendi */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDarkMode && darkStyles.textMain]}>SIRADAKİ İŞLER</Text>
          <Text style={[styles.sectionSubtitle, isDarkMode && darkStyles.textSub]}>Takip listesi</Text>
        </View>

        <View style={styles.cardsContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#FF3B30" style={{marginTop: 20}} />
          ) : recentTasks.length > 0 ? (
            recentTasks.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.card, isDarkMode && darkStyles.card]} 
                activeOpacity={0.7}
                onPress={() => router.push('/isler_uzman' as any)} // MÜDÜR: Buradan da listeye gitsin
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.deviceText, isDarkMode && darkStyles.textMain]}>İş No: {item.servis_no || item.id}</Text>
                  <View style={[styles.statusBadge, isDarkMode && darkStyles.statusBadge]}>
                    <Text style={[styles.statusText, isDarkMode && darkStyles.statusText]}>
                      {item.status || 'Beklemede'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.issueRow}>
                  <Ionicons name="build-outline" size={14} color={isDarkMode ? "#AAA" : "#666"} />
                  <Text style={[styles.issueText, isDarkMode && darkStyles.textSub]} numberOfLines={1}>{item.issue}</Text>
                </View>

                {/* MÜDÜR: Detay yazısı kalktı, Müşteri ismi geldi */}
                <View style={[styles.cardFooter, isDarkMode && darkStyles.cardFooter]}>
                    <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                      <Ionicons name="person-outline" size={14} color={isDarkMode ? "#AAA" : "#888"} />
                      <Text style={[styles.customerText, isDarkMode && darkStyles.textSub]}>
                        {item.customer || 'DETAY'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={isDarkMode ? "#777" : "#ccc"} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{textAlign:'center', color:'#888', marginTop: 20, fontSize: 13}}>Henüz atanmış aktif iş bulunmuyor.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10, paddingTop: Platform.OS === 'android' ? 35 : 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  welcomeText: { fontSize: 13, color: '#888', fontWeight: '600' },
  uzmanName: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
  mainContent: { flex: 1, paddingHorizontal: 15, paddingTop: 10, paddingBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 }, 
  statBox: { width: '48%', padding: 10, borderRadius: 14, borderWidth: 1, marginBottom: 8, alignItems: 'flex-start', elevation: 1, backgroundColor: '#EEEEEE', borderColor: '#DDDDDD' },
  statNumber: { fontSize: 22, fontWeight: '900', color: '#FF3B30', marginVertical: 2 },
  statLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, 
  actionBtn: { flex: 1, backgroundColor: '#1A1A1A', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  actionBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
  sectionHeader: { marginTop: 35, marginBottom: 10 }, 
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' },
  sectionSubtitle: { fontSize: 12, color: '#888', marginTop: 1 },
  cardsContainer: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#eee', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  deviceText: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
  statusBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
  issueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  issueText: { fontSize: 13, color: '#444', flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f1f1' },
  customerText: { fontSize: 12, color: '#888', fontWeight: '500' },
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#121212' }, 
  header: { backgroundColor: '#1A1A1A', borderBottomColor: '#2C2C2C' },
  textMain: { color: '#F8F9FA' },
  textSub: { color: '#9BA4B5' },
  statBox: { backgroundColor: '#2C2C2C', borderColor: '#3A3A3A' }, 
  actionBtn: { backgroundColor: '#2C2C2C' }, 
  card: { backgroundColor: '#2C2C2C', borderColor: '#3A3A3A' }, 
  cardFooter: { borderTopColor: '#3A3A3A' },
  statusBadge: { backgroundColor: '#3A3A3A' },
  statusText: { color: '#E2E8F0' },
});