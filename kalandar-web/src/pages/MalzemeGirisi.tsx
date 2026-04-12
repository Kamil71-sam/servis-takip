import { useState } from 'react';
import api from '../api';

export default function MalzemeGirisi() {
  const [form, setForm] = useState({
    islem_turu: 'Stok Tamamlama',
    barkod: '',
    malzeme_adi: '',
    marka: '',
    uyumlu_cihaz: '',
    miktar: 1,
    alis_fiyati: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // MÜDÜRÜN BARKOD MOTORU: GLCK-XXXXXX-YYYY
  const handleBarkodUret = () => {
    const part1 = Math.floor(100000 + Math.random() * 900000); 
    const part2 = Math.floor(1000 + Math.random() * 9000);     
    setForm({ ...form, barkod: `GLCK-${part1}-${part2}` });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.barkod || !form.malzeme_adi || !form.alis_fiyati) {
      alert("Lütfen Barkod, Malzeme Adı ve Alış Fiyatı alanlarını doldurun!");
      return;
    }

    setLoading(true);
    try {
      // 🚨 MÜDÜR: BORU BAĞLANDI! İstek adresi tam olarak stok.js'in /add kapısına yönlendirildi!
      const res = await api.post('/api/stok/add', {
        islem_turu: form.islem_turu,
        barkod: form.barkod,
        malzeme_adi: form.malzeme_adi,
        marka: form.marka,
        uyumlu_cihaz: form.uyumlu_cihaz,
        miktar: Number(form.miktar),
        alis_fiyati: Number(form.alis_fiyati),
        fiyat_guncelle: true // stok.js'in beklediği şalteri de yolluyoruz
      });

      if (res.data.success) {
        alert("✅ STOK BAŞARIYLA EKLENDİ VE KASADAN DÜŞÜLDÜ!");
        setForm({
          islem_turu: 'Stok Tamamlama',
          barkod: '',
          malzeme_adi: '',
          marka: '',
          uyumlu_cihaz: '',
          miktar: 1,
          alis_fiyati: ''
        });
      }
    } catch (error: any) {
      alert("Hata: " + (error.response?.data?.error || error.message || "İşlem başarısız"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-6">
      <div className="bg-[#0F0F12] border border-white/10 rounded-[2rem] w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-[#8E052C]/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="border-b border-white/5 pb-5 mb-6 relative z-10">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-yellow-500 text-3xl">📦</span> MAL KABUL / STOK GİRİŞİ
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
            Depoya yeni malzeme veya yedek parça girişi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <span className="text-[#8E052C]">*</span> İşlem Türü
            </label>
            <select 
              name="islem_turu" 
              value={form.islem_turu} 
              onChange={handleChange}
              className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#8E052C] appearance-none cursor-pointer"
            >
              <option value="Stok Tamamlama">Stok Tamamlama</option>
              <option value="Yeni Ürün Girişi">Yeni Ürün Girişi</option>
              <option value="İade Girişi">Müşteri İadesi</option>
            </select>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <span className="text-[#8E052C]">*</span> Barkod / Seri No
            </label>
            <div className="flex gap-3">
              <input 
                type="text" 
                name="barkod" 
                value={form.barkod} 
                onChange={handleChange}
                placeholder="Okutun veya yazın..." 
                className="flex-1 bg-[#1A1A1E] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#8E052C] transition-all font-mono tracking-wider"
              />
              <button 
                type="button" 
                onClick={handleBarkodUret}
                className="bg-[#8E052C]/20 hover:bg-[#8E052C] border border-[#8E052C]/50 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <span>⚙️</span> ÜRET
              </button>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <span className="text-[#8E052C]">*</span> Malzeme Adı
              </label>
              <input 
                type="text" 
                name="malzeme_adi" 
                value={form.malzeme_adi} 
                onChange={handleChange}
                placeholder="Örn: iPhone 13 Ekran Paneli" 
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#8E052C]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Marka</label>
              <input 
                type="text" 
                name="marka" 
                value={form.marka} 
                onChange={handleChange}
                placeholder="Örn: Apple (Orijinal) / Yan Sanayi" 
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#8E052C]"
              />
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Uyumlu Cihaz</label>
              <input 
                type="text" 
                name="uyumlu_cihaz" 
                value={form.uyumlu_cihaz} 
                onChange={handleChange}
                placeholder="Tüm A Serisi vb." 
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#8E052C]"
              />
            </div>
            <div className="col-span-1 space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <span className="text-[#8E052C]">*</span> Miktar
              </label>
              <input 
                type="number" 
                min="1"
                name="miktar" 
                value={form.miktar} 
                onChange={handleChange}
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-3 px-4 text-sm text-center font-black text-white outline-none focus:border-[#8E052C]"
              />
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <span className="text-[#8E052C]">*</span> Alış Fiyatı (₺)
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                name="alis_fiyati" 
                value={form.alis_fiyati} 
                onChange={handleChange}
                placeholder="0.00" 
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-3 px-10 text-lg font-black text-white outline-none focus:border-[#8E052C]"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black text-lg">₺</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full mt-2 bg-[#8E052C] hover:bg-[#A30633] text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(142,5,44,0.3)] disabled:opacity-50"
          >
            {loading ? 'KAYDEDİLİYOR...' : 'STOK KAYDINI TAMAMLA'}
          </button>
        </form>

      </div>
    </div>
  );
}