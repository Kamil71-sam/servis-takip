import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ParaGirisiFormu from './ParaGirisiFormu';
import ParaCikisiFormu from './ParaCikisiFormu'; // MÜDÜR: Yorum satırı kaldırıldı, asansör bağlandı!

export default function MaliIslemlerAnaEkran({ visible, onClose, isDarkMode }: any) {
  const [entryVisible, setEntryVisible] = useState(false);
  const [exitVisible, setExitVisible] = useState(false); 

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        {/* EKRAN DIŞINA BASILINCA KAPANMA ÖZELLİĞİ */}
        <TouchableOpacity style={styles.absFill} activeOpacity={1} onPress={onClose} />
        
        {/* GECE MODUNA GÖRE KARTIN RENGİ DEĞİŞİR */}
        <View style={[styles.modernCard, isDarkMode && styles.darkCard]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>MALİ İŞLEMLER</Text>
          </View>

          <View style={styles.buttonRow}>
            {/* PARA GİRİŞİ BUTONU - MÜDÜR: YEŞİL TAMAMEN SİLİNDİ, ANTRASİT NİZAMI GELDİ */}
            <TouchableOpacity style={styles.actionBtn} onPress={() => setEntryVisible(true)} activeOpacity={0.8}>
              <View style={[styles.iconBox, {backgroundColor: isDarkMode ? '#2c2c2c' : '#f2f2f2'}]}>
                <Ionicons name="cash" size={40} color={isDarkMode ? '#fff' : '#1A1A1A'} />
              </View>
              <Text style={[styles.btnText, isDarkMode && styles.darkText]}>PARA GİRİŞİ</Text>
            </TouchableOpacity>

            {/* PARA ÇIKIŞI BUTONU - MÜDÜR: BURASI ZATEN KIRMIZI/BEYAZ NİZAMINDA */}
            <TouchableOpacity style={styles.actionBtn} onPress={() => setExitVisible(true)} activeOpacity={0.8}>
              <View style={[styles.iconBox, {backgroundColor: isDarkMode ? '#331a1a' : '#FFEBEE'}]}>
                <Ionicons name="card" size={40} color="#FF3B30" />
              </View>
              <Text style={[styles.btnText, isDarkMode && styles.darkText]}>PARA ÇIKIŞI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORMLARA GECE MODU BİLGİSİ İLETİLİYOR */}
        <ParaGirisiFormu visible={entryVisible} onClose={() => setEntryVisible(false)} isDarkMode={isDarkMode} />
        {/* ÇIKIŞ FORMU ARTIK AKTİF */}
        <ParaCikisiFormu visible={exitVisible} onClose={() => setExitVisible(false)} isDarkMode={isDarkMode} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  absFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modernCard: { backgroundColor: '#fff', width: '85%', borderRadius: 30, padding: 25, elevation: 20 },
  darkCard: { backgroundColor: '#1e1e1e', shadowColor: '#fff', shadowOpacity: 0.1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  darkText: { color: '#fff' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { width: '45%', alignItems: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  btnText: { fontSize: 14, fontWeight: '900', color: '#333' }
});