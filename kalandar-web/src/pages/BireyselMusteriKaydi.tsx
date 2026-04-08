import { useState } from 'react';
import axios from 'axios';

export default function BireyselMusteriKaydi({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    fax: '',
    email: '',
    address: ''
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

    if (!formData.name || !formData.phone || !formData.email) {
      setHata('Lütfen yıldızlı (*) zorunlu alanları doldurun!');
      return;
    }

    // MÜDÜRÜN NOTU: Cebimizdeki Yaka Kartını (Token) alıyoruz
    const token = localStorage.getItem('token'); 
    
    if (!token) {
      setHata('Güvenlik ihlali! Oturum kartınız (Token) bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    setYukleniyor(true);

    try {
      // DİKKAT: Adresi 3000 yaptık ve Bekçiye (headers) Yaka Kartını gösterdik!
      await axios.post('http://localhost:3000/api/customers', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setBasari('Müşteri başarıyla sisteme kaydedildi!');
      setFormData({ name: '', phone: '', fax: '', email: '', address: '' });
      setTimeout(() => setBasari(''), 3000);
      
    } catch (err: any) {
      // Backend'den dönen hatayı detaylı yakala
      const hataMesaji = err.response?.data?.message || err.response?.data?.error || err.message;
      setHata('Kayıt başarısız: ' + hataMesaji);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] flex-1 flex flex-col relative overflow-hidden shadow-2xl animate-fade-in max-h-full">
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#8E052C] opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Form Üst Bar */}
      <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8E052C]/20 text-[#8E052C] rounded-xl flex items-center justify-center text-xl shadow-inner">
            📇
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">MÜŞTERİ KARTI</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Yeni Bireysel Kayıt</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all text-lg">
          ×
        </button>
      </div>

      {/* Form İçeriği */}
      <div className="p-5 flex-1 overflow-y-auto scrollbar-hide relative flex flex-col justify-center">
        
        {hata && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse">
            <span>❌</span> {hata}
          </div>
        )}
        {basari && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-2 text-green-500 text-xs font-bold">
            <span>✅</span> {basari}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-lg p-2 mb-5 flex items-center justify-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">KİMLİK VE İLETİŞİM BİLGİLERİ</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto w-full">
          
          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">AD SOYAD / ÜNVAN <span className="text-[#8E052C] text-xs">*</span></label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8E052C] focus:ring-1 focus:ring-[#8E052C]/50 transition-all duration-300" 
              placeholder="Örn: Ahmet Yılmaz" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">TELEFON <span className="text-[#8E052C] text-xs">*</span></label>
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8E052C] focus:ring-1 focus:ring-[#8E052C]/50 transition-all duration-300" 
                placeholder="0555 555 55 55" 
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">FAKS</label>
              <input 
                type="tel" name="fax" value={formData.fax} onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8E052C] focus:ring-1 focus:ring-[#8E052C]/50 transition-all duration-300" 
                placeholder="0212 555 55 55" 
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">E-POSTA ADRESİ <span className="text-[#8E052C] text-xs">*</span></label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8E052C] focus:ring-1 focus:ring-[#8E052C]/50 transition-all duration-300" 
              placeholder="ahmet@ornek.com" 
            />
          </div>

          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">AÇIK ADRES</label>
            <textarea 
              name="address" value={formData.address} onChange={handleChange}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8E052C] focus:ring-1 focus:ring-[#8E052C]/50 transition-all duration-300 h-20 resize-none" 
              placeholder="Mahalle, sokak, bina no..."></textarea>
          </div>

        </div>
      </div>

      {/* Form Alt Bar */}
      <div className="p-4 border-t border-white/5 shrink-0 flex justify-end bg-black/20">
        <button 
          onClick={kaydetMotoru}
          disabled={yukleniyor}
          className="bg-gradient-to-r from-[#8E052C] to-[#5F041D] hover:from-[#A10632] hover:to-[#8E052C] text-white px-8 py-3 rounded-xl font-black tracking-widest uppercase text-xs shadow-[0_0_20px_rgba(142,5,44,0.3)] transition-all active:scale-95 disabled:opacity-50">
          {yukleniyor ? 'KAYDEDİLİYOR...' : 'KAYDI TAMAMLA'}
        </button>
      </div>
    </div>
  );
}