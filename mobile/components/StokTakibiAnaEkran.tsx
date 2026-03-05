import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Modal, 
  SafeAreaView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StokGirisiFormu from './StokGirisiFormu'; // Stok Girişi asansörü

export default function StokTakibiAnaEkran({ visible, onClose }: any) {
  const [entryVisible, setEntryVisible] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <SafeAreaView style={styles.fullContainer}>
        
        {/* P2 STANDART BAŞLIK */}
        <View style={styles.header}>
          <View style={styles.titleBadge}>
            <Text style={styles.title}>STOK HAREKETLERİ</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={42} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* SEÇİM KARTLARI */}
        <View style={styles.menuContent}>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => setEntryVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="arrow-down-circle" size={50} color="#4CD964" />
            </View>
            <Text style={styles.cardText}>STOK GİRİŞİ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => alert('Stok Çıkışı Yakında!')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="arrow-up-circle" size={50} color="#FF3B30" />
            </View>
            <Text style={styles.cardText}>STOK ÇIKIŞI</Text>
          </TouchableOpacity>
        </View>

        {/* STOK GİRİŞİ FORMU ASANSÖRÜ */}
        <StokGirisiFormu 
          visible={entryVisible} 
          onClose={() => setEntryVisible(false)} 
        />

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 52 : 32, marginBottom: 40 },
  titleBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  closeBtn: { padding: 5 },
  menuContent: { flexDirection: 'row', justifyContent: 'space-between' },
  actionCard: { backgroundColor: '#f9f9f9', width: '47%', height: 180, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', elevation: 4 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardText: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' }
});