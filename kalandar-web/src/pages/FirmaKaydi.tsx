// src/pages/FirmaKaydi.tsx
import { useState } from 'react';
import api from '../api'; 

export default function FirmaKaydi({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    firma_adi: '',
    yetkili_ad_soyad: '',
    telefon: '',
    eposta: '',
    adres: '',
    vergi_no: '' 
  });

  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const kaydetMotoru = async () => {
    setHata('');
    setBasari('');

    if (!formData.firma_adi || !formData.yetkili_ad_soyad || !formData.telefon || !formData.adres) {
      setHata('Lütfen Ünvan, Yetkili, Telefon ve Tebligat Adresi alanlarını doldurun!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setHata('Oturum kartınız bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    setYukleniyor(true);

    try {
      // 🚨 MÜDÜR: İŞTE BURASI! Backend rotan "/api/firm/add" olduğu için "/api" takısını geri koyduk.
      await api.post('/api/firm/add', formData);
      
      setBasari('Firma kaydı başarıyla oluşturuldu!');
      setFormData({ firma_adi: '', yetkili_ad_soyad: '', telefon: '', eposta: '', adres: '', vergi_no: '' });
      setTimeout(() => setBasari(''), 3000);
      
    } catch (err: any) {
      const hataMesaji = err.response?.data?.error || err.response?.data?.message || err.message;
      setHata('Kayıt başarısız: ' + hataMesaji);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] flex-1 flex flex-col relative overflow-hidden shadow-2xl animate-fade-in max-h-full">
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#8E052C] opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Üst Bar */}
      <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8E052C]/20 text-[#8E052C] rounded-xl flex items-center justify-center text-xl shadow-inner">🏢</div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">KURUMSAL FİRMA KAYDI</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Yeni Cari Tanımlama</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all text-lg">×</button>
      </div>

      {/* Form Alanı */}
      <div className="p-5 flex-1 overflow-y-auto scrollbar-hide relative flex flex-col justify-center">
        {hata && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold animate-pulse">❌ {hata}</div>}
        {basari && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-500 text-xs font-bold">✅ {basari}</div>}

        <div className="bg-white/5 border border-white/10 rounded-lg p-2 mb-5 flex items-center justify-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">FİRMA VE YETKİLİ BİLGİLERİ</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">FİRMA ÜNVANI <span className="text-[#8E052C] text-xs">*</span></label>
              <input type="text" name="firma_adi" value={formData.firma_adi} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8E052C] transition-all" placeholder="Örn: Kalandar Yazılım Ltd. Şti." />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">VERGİ NUMARASI</label>
              <input type="text" name="vergi_no" value={formData.vergi_no} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8E052C] transition-all" placeholder="10 Haneli Vergi No" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">YETKİLİ ADI SOYADI <span className="text-[#8E052C] text-xs">*</span></label>
              <input type="text" name="yetkili_ad_soyad" value={formData.yetkili_ad_soyad} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8E052C] transition-all" placeholder="Örn: Kemal Bey" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">FİRMA TELEFON <span className="text-[#8E052C] text-xs">*</span></label>
              <input type="tel" name="telefon" value={formData.telefon} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8E052C] transition-all" placeholder="0212 XXX XX XX" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">E-POSTA ADRESİ</label>
            <input type="email" name="eposta" value={formData.eposta} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8E052C] transition-all" placeholder="info@firma.com" />
          </div>

          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">TEBLİGAT ADRESİ <span className="text-[#8E052C] text-xs">*</span></label>
            <textarea name="adres" value={formData.adres} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8E052C] h-16 resize-none transition-all" placeholder="Resmi tebligat adresi..."></textarea>
          </div>
        </div>
      </div>

      {/* Alt Bar */}
      <div className="p-4 border-t border-white/5 shrink-0 flex justify-end bg-black/20">
        <button onClick={kaydetMotoru} disabled={yukleniyor} className="bg-gradient-to-r from-[#8E052C] to-[#5F041D] hover:from-[#A10632] hover:to-[#8E052C] text-white px-8 py-3 rounded-xl font-black tracking-widest uppercase text-xs shadow-[0_0_20px_rgba(142,5,44,0.3)] transition-all active:scale-95 disabled:opacity-50">
          {yukleniyor ? 'İŞLENİYOR...' : 'FİRMAYI KAYDET'}
        </button>
      </div>
    </div>
  );
}