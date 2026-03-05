import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Modal, 
  Platform, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StokGirisiFormu from './StokGirisiFormu';

export default function StokTakibiAnaEkran({ visible, onClose }: any) {
  const [entryVisible, setEntryVisible] = useState(false);

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        {/* BLUR HATASI ALMAMAK İÇİN ŞIK BİR ŞEFFAF ARKA PLAN */}
        <TouchableOpacity style={styles.absFill} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.modernCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>STOK YÖNETİMİ</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={36} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => setEntryVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, {backgroundColor: '#E8F5E9'}]}>
                <Ionicons name="arrow-down-circle" size={40} color="#4CD964" />
              </View>
              <Text style={styles.btnText}>STOK GİRİŞİ</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => alert('Stok Çıkışı Hazırlanıyor...')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, {backgroundColor: '#FFEBEE'}]}>
                <Ionicons name="arrow-up-circle" size={40} color="#FF3B30" />
              </View>
              <Text style={styles.btnText}>STOK ÇIKIŞI</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StokGirisiFormu visible={entryVisible} onClose={() => setEntryVisible(false)} />
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  closeBtn: { padding: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { width: '45%', alignItems: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  btnText: { fontSize: 14, fontWeight: '900', color: '#333' }
});