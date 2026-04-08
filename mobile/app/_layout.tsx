

import { Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Yaka kartı cebi

// =====================================================================
// 🚨 MÜDÜRÜN ANA ŞALTERİ VE İSPİYONCUSU (GLOBAL FETCH HACK) 🚨
// Dükkandan dışarı çıkan her kurye (fetch) mecburen bu gümrükten geçecek!
// =====================================================================
const orijinalFetch = global.fetch;

global.fetch = async (url, options = {}) => {
  // Sadece kendi sunucumuza (/api/ geçen) giden isteklere müdahale et
  if (typeof url === 'string' && url.includes('/api/')) {
    
    // 1. Kuryenin cebindeki yaka kartını (Token) al
    const token = await AsyncStorage.getItem('userToken');
    
    if (token) {
      // 🚨 İSPİYONCU KAMERA KAYITTA: Terminale (siyah ekrana) log atacak
      console.log(`🕵️‍♂️ ŞALTER DEVREDE: ${url} adresine yaka kartı (Token) ile giriliyor!`);
      
      // 2. Kartı mektubun üzerine zımbala
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    } else {
       // Kart yoksa da siyah ekranda bizi uyarsın
       console.log(`🚨 EYVAH: ${url} adresine gidiliyor ama cepte KART YOK!`);
    }
  }
  
  // 3. Mektubu orijinal kuryeye ver, yola çıksın
  return orijinalFetch(url, options);
};
// =====================================================================


export default function RootLayout() {
  // Senin orijinal kodun, dükkanın iskeleti. Hiç dokunmadık.
  return <Stack screenOptions={{ headerShown: false }} />;
}


/*
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

*/