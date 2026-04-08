import { useState } from 'react';
import axios from 'axios';
import logo from './assets/logo.png';
import Dashboard from './Dashboard';

function App() {
  const [email, setEmail] = useState('admin@kalandar.com');
  const [password, setPassword] = useState('123456');
  
  // Eğer hafızada token varsa, sistemi açık başlat (Adam sayfayı yenileyince dışarı atılmasın)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const girisYap = async () => {
    try {
      // DİKKAT: Login olurken de 3000 portuna gidiyoruz ve cevabı (response) yakalıyoruz
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: email,
        password: password
      });

      // MÜDÜRÜN NOTU: Backend'den gelen Token'ı alıp cebimize (localStorage) koyuyoruz
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      setIsLoggedIn(true);


    } catch (hata: any) {
      // MÜDÜRÜN NOTU: Backend 'error' yolluyor, onu da yakalıyoruz!
      const hataMesaji = hata.response?.data?.error || hata.response?.data?.message || "Bağlantı kurulamadı!";
      alert("❌ HATA: " + hataMesaji);
    }

    
  };

  const cikisYap = () => {
    // Çıkış yaparken cebimizdeki kartı (Token'ı) yırtıp atıyoruz!
    localStorage.removeItem('token');
    setIsLoggedIn(false); 
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

      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2rem] shadow-2xl z-10 relative">
        <div className="space-y-8">
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
        </div>
      </div>
    </div>
  );
}

export default App;