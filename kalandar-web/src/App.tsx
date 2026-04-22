import { useState } from 'react';
import axios from 'axios';
import logo from './assets/logo.png';
import Dashboard from './Dashboard';

function App() {
  const [email, setEmail] = useState('admin@kalandar.com');
  const [password, setPassword] = useState('123456');
  
  // Ustanın Not Defteri: Adam sisteme daha önce girmiş mi?
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // 🚨 SORGULAMA İÇİN USTANIN YENİ NOT DEFTERLERİ (STATES) 🚨
  const [isSorgulamaMode, setIsSorgulamaMode] = useState(false); // Hangi ekrandayız?
  const [sorguServisNo, setSorguServisNo] = useState('');
  const [sorguTelefon, setSorguTelefon] = useState('');
  const [sorguSonucu, setSorguSonucu] = useState<any>(null);
  const [isSorgulaniyor, setIsSorgulaniyor] = useState(false);

  const girisYap = async () => {
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: email,
        password: password
      });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      setIsLoggedIn(true);

    } catch (hata: any) {
      const hataMesaji = hata.response?.data?.error || hata.response?.data?.message || "Bağlantı kurulamadı!";
      alert("❌ HATA: " + hataMesaji);
    }
  };

  const cikisYap = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); 
    // 🚨 EKRAN TEMİZLİĞİ (Usta not defterini yırtıp atıyor)
    setEmail(''); 
    setPassword('');
    setIsSorgulamaMode(false);
    setSorguServisNo('');
    setSorguTelefon('');
    setSorguSonucu(null);
  };

  // 🚨 AKILLI SORGULAMA MOTORU (GERÇEK BAĞLANTI) 🚨
  const handleSorgula = async () => {
    if (!sorguServisNo.trim() || !sorguTelefon.trim()) {
      return alert("Lütfen Kayıt/Servis Numarasını ve Telefonunuzun son 4 hanesini giriniz.");
    }
    
    setIsSorgulaniyor(true);
    setSorguSonucu(null); // Eski sonucu temizle

    try {
      // ⚠️ GERÇEK VANA AÇILDI! Doğrudan Backend'e gidiyoruz
     
     
     const response = await axios.post('http://localhost:3000/auth/sorgula', {
      //const response = await axios.post('http://localhost:3000/services/sorgula', {
        servisNo: sorguServisNo,
        telefonSon4: sorguTelefon
      });
      
      // Backend'den gelen cevaba göre ekrana basıyoruz
      if (response.data && response.data.success) {
         setSorguSonucu(response.data.data);
      } else {
         setSorguSonucu({ error: response.data.message || 'Kayıt bulunamadı veya bilgiler eşleşmiyor.' });
      }

    } catch (error: any) {
       console.error("Sorgulama hatası:", error);
       setSorguSonucu({ error: error.response?.data?.message || 'Sunucu bağlantı hatası, lütfen daha sonra tekrar deneyin.' });
    } finally {
       setIsSorgulaniyor(false);
    }
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={cikisYap} />;
  }

  return (
    <div className="min-h-screen bg-[#0F0F12] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#8E052C] opacity-40 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#8E052C] opacity-20 rounded-full blur-[120px]"></div>

      <div className="flex items-center gap-4 mb-12 z-10">
        <img src={logo} alt="Kalandar Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(142,5,44,0.6)]" />
        <div>
          <h1 className="text-3xl font-black text-[#FFFFFF] tracking-tighter leading-none text-shadow-none">
            KALANDAR <span className="text-[#8E052C]">YAZILIM</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Komuta Merkezi v1.0</p>
        </div>
      </div>

      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2rem] shadow-2xl z-10 relative transition-all duration-500">
        
        {/* ============================================================================================== */}
        {/* ============================= 1. YETKİLİ GİRİŞ (LOGIN) EKRANI ================================ */}
        {/* ============================================================================================== */}
        {!isSorgulamaMode && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-3 block">E-Posta Adresi</label>
              <input 
                type="email" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8E052C]/50 focus:ring-1 focus:ring-[#8E052C]/50 transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-3 block">Güvenlik Şifresi</label>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8E052C]/50 focus:ring-1 focus:ring-[#8E052C]/50 transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              onClick={girisYap} 
              className="w-full bg-gradient-to-r from-[#8E052C] to-[#5F041D] hover:from-[#A10632] hover:to-[#8E052C] text-white font-black py-5 rounded-2xl shadow-lg shadow-red-950/30 active:scale-95 transition-all duration-300 tracking-widest text-sm text-shadow-none">
              SİSTEME BAĞLAN
            </button>
            
            <div className="pt-4 border-t border-white/5 text-center">
               <button 
                  onClick={() => { 
                    setIsSorgulamaMode(true); 
                    setSorguSonucu(null);
                    setSorguServisNo(''); // Kutuyu boşalt
                    setSorguTelefon('');  // Kutuyu boşalt
                    setPassword('');      // Arkada şifre kalmasın
                  }}
                  className="text-[11px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2 w-full"
               >
                  <span>🔍</span> İŞ DURUMU SORGULA (CİHAZ / RANDEVU)
               </button>
            </div>
          </div>
        )}

        {/* ============================================================================================== */}
        {/* ============================= 2. MÜŞTERİ SORGULAMA EKRANI ==================================== */}
        {/* ============================================================================================== */}
        {isSorgulamaMode && (
          <div className="space-y-6 animate-fade-in">
             
             <div className="text-center mb-6">
                <h2 className="text-white font-black text-lg uppercase tracking-widest">DURUM SORGULAMA</h2>
                <p className="text-gray-500 text-[10px] font-bold mt-1">Saha veya Atölye işinizin durumunu öğrenin</p>
             </div>

             <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Kayıt / Servis Numarası</label>
                <input 
                  type="text" 
                  placeholder="Örn: 26040405"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-all duration-300"
                  value={sorguServisNo}
                  onChange={(e) => setSorguServisNo(e.target.value)}
                />
             </div>
             <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Telefon (Son 4 Hane)</label>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="Örn: 5678"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-all duration-300 tracking-widest font-mono"
                  value={sorguTelefon}
                  onChange={(e) => setSorguTelefon(e.target.value.replace(/\D/g, ''))} 
                />
             </div>

             <button 
                onClick={handleSorgula}
                disabled={isSorgulaniyor}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all duration-300 tracking-widest text-xs disabled:opacity-50 border border-white/5 hover:border-white/20">
                {isSorgulaniyor ? "SORGULANIYOR..." : "SORGULA"}
             </button>

             {/* 🚨 AKILLI SORGULAMA SONUCU KUTUSU 🚨 */}
             {sorguSonucu && (
                <div className="mt-6 bg-[#0F0F12] border border-white/10 rounded-xl p-4 shadow-inner">
                   {sorguSonucu.error ? (
                      <p className="text-red-500 font-bold text-xs text-center">{sorguSonucu.error}</p>
                   ) : (
                      <div className="space-y-3">
                         
                         {/* ORTAK ALANLAR */}
                         <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                               {sorguSonucu.tip === 'Randevu' ? 'Saha Hizmeti' : 'Cihaz'}
                            </span>
                            <span className="text-xs font-bold text-white text-right w-2/3 truncate" title={sorguSonucu.cihaz}>{sorguSonucu.cihaz}</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Durum</span>
                            <span className="text-[11px] font-black text-[#8E052C] bg-[#8E052C]/10 px-2 py-1 rounded-md text-right">{sorguSonucu.durum}</span>
                         </div>

                         {/* TİPE GÖRE DEĞİŞEN ALANLAR (RANDEVU VS SERVİS) */}
                         {sorguSonucu.tip === 'Randevu' ? (
                            <>
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                 <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Randevu Tarihi</span>
                                 <span className="text-xs font-bold text-sky-400">{sorguSonucu.tarih}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Tahmini Saat</span>
                                 <span className="text-xs font-bold text-sky-400">{sorguSonucu.saat}</span>
                              </div>
                            </>
                         ) : (
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Giriş Tarihi</span>
                               <span className="text-xs font-bold text-gray-300">{sorguSonucu.tarih}</span>
                            </div>
                         )}

                      </div>
                   )}
                </div>
             )}

             <div className="pt-2 text-center">
               <button 
                  onClick={() => { 
                    setIsSorgulamaMode(false); 
                    setSorguSonucu(null);
                    setSorguServisNo(''); // Temizle
                    setSorguTelefon('');  // Temizle
                  }}
                  className="text-[10px] font-black text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors"
               >
                  ← YETKİLİ GİRİŞİNE DÖN
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;