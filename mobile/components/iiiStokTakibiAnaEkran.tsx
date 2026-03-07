import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Modal, 
  Platform, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StokGirisiFormu from './StokGirisiFormu';
import StokCikisiFormu from './StokCikisiFormu'; 

// isDarkMode parametresini ekledik
export default function StokTakibiAnaEkran({ visible, onClose, isDarkMode }: any) {
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
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>STOK YÖNETİMİ</Text>
          </View>

          <View style={styles.buttonRow}>
            {/* STOK GİRİŞİ BUTONU */}
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => setEntryVisible(true)}
              activeOpacity={0.8}
            >
              {/* GECE MODUNDA İKON KUTUSUNUN RENGİ KOYULAŞIR */}
              <View style={[styles.iconBox, {backgroundColor: isDarkMode ? '#1a3320' : '#E8F5E9'}]}>
                <Ionicons name="arrow-down-circle" size={40} color="#4CD964" />
              </View>
              <Text style={[styles.btnText, isDarkMode && styles.darkText]}>STOK GİRİŞİ</Text>
            </TouchableOpacity>

            {/* STOK ÇIKIŞI BUTONU */}
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => setExitVisible(true)}
              activeOpacity={0.8}
            >
              {/* GECE MODUNDA İKON KUTUSUNUN RENGİ KOYULAŞIR */}
              <View style={[styles.iconBox, {backgroundColor: isDarkMode ? '#331a1a' : '#FFEBEE'}]}>
                <Ionicons name="arrow-up-circle" size={40} color="#FF3B30" />
              </View>
              <Text style={[styles.btnText, isDarkMode && styles.darkText]}>STOK ÇIKIŞI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORMLARA GECE MODU BİLGİSİ İLETİLİYOR */}
        <StokGirisiFormu visible={entryVisible} onClose={() => setEntryVisible(false)} isDarkMode={isDarkMode} />
        <StokCikisiFormu visible={exitVisible} onClose={() => setExitVisible(false)} isDarkMode={isDarkMode} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  absFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modernCard: { 
    backgroundColor: '#fff', 
    width: '85%', 
    borderRadius: 30, 
    padding: 25, 
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20
  },
  // GECE MODU İÇİN KART STİLİ
  darkCard: {
    backgroundColor: '#1e1e1e',
    shadowColor: '#fff',
    shadowOpacity: 0.1,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  // GECE MODU İÇİN YAZI STİLİ
  darkText: {
    color: '#fff',
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { width: '45%', alignItems: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  btnText: { fontSize: 14, fontWeight: '900', color: '#333' }
});