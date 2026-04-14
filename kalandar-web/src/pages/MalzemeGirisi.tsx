import { useState } from 'react';
import api from '../api';

export default function MalzemeGirisi() {
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false); 
  
  const [arananMalzeme, setArananMalzeme] = useState<any>(null);

  const [form, setForm] = useState({
    islem_turu: 'Stok Tamamlama',
    barkod: '',
    malzeme_adi: '',
    marka: '',
    uyumlu_cihaz: '',
    miktar: 1,
    alis_fiyati: ''
  });

  const handleBarkodUret = () => {
    const rnd = Math.floor(100000 + Math.random() * 900000);
    const rnd2 = Math.floor(1000 + Math.random() * 9000);
    setForm({ ...form, barkod: `GLCK-${rnd}-${rnd2}` });
  };

  const handleBarkodAra = async () => {
    if (!form.barkod) {
      alert("Lütfen aranacak barkodu girin veya okutun!");
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/api/stok/search?barkod=${form.barkod}`);
      
      if (res.data && res.data.success && res.data.found) {
        const mal = res.data.data;
        
        setArananMalzeme(mal); 

        setForm({
          ...form,
          malzeme_adi: mal.malzeme_adi || '',
          marka: mal.marka || '',
          uyumlu_cihaz: mal.uyumlu_cihaz || '',
          alis_fiyati: mal.alis_fiyati || ''
        });
      } else {
        alert("📦 Bu barkoda ait kayıt bulunamadı. Yeni malzeme olarak bilgilerini doldurabilirsiniz.");
        setArananMalzeme(null);
        setForm({
          ...form,
          malzeme_adi: '',
          marka: '',
          uyumlu_cihaz: '',
          alis_fiyati: ''
        });
      }
    } catch (error) {
      console.error(error);
      alert("Sorgulama sırasında bir hata oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.barkod || !form.malzeme_adi || !form.alis_fiyati) {
      alert("Lütfen Barkod, Malzeme Adı ve Alış Fiyatı alanlarını doldurun!");
      return;
    }
    
    setLoading(true);
    
    try {
      // 🚨 İADE (STOK SATIŞI) BYPASS OPERASYONU
      if (form.islem_turu === 'İade (Stok Satışı)') {
        
        if (!arananMalzeme) {
          alert("İade işlemi için lütfen önce Büyüteç butonuna basarak ürünü depodan buldurun!");
          setLoading(false); return;
        }

        // 1. ADIM: Sadece Stoğu Güncelle (Artır)
        const yeniMiktar = Number(arananMalzeme.miktar) + Number(form.miktar);
        await api.put(`/api/stok/update/${arananMalzeme.id}`, {
          malzeme_adi: form.malzeme_adi,
          marka: form.marka,
          uyumlu_cihaz: form.uyumlu_cihaz,
          miktar: yeniMiktar,
          alis_fiyati: Number(form.alis_fiyati),
          barkod: form.barkod
        });

        // 2. ADIM: Kasaya Özel Etiketle Çıkış Yap
        const toplamTutar = Number(form.miktar) * Number(form.alis_fiyati);
        await api.post('/api/kasa/add', {
          islem_yonu: 'ÇIKIŞ',
          kategori: form.islem_turu, 
          tutar: toplamTutar,
          aciklama: `${form.islem_turu}: ${form.malzeme_adi} | Adet: ${form.miktar} | İade Alış: ${form.alis_fiyati} ₺`,
          islem_yapan: 'Banko Stok İade'
        });

        alert(`✅ İADE BAŞARIYLA ALINDI! Kasa kaydı "${form.islem_turu}" olarak işlendi.`);

      } 
      // EĞER İADE DEĞİLSE NORMAL STOK ALIMINA DEVAM ET
      else {
        const res = await api.post('/api/stok/add', {
          islem_turu: form.islem_turu,
          barkod: form.barkod,
          malzeme_adi: form.malzeme_adi,
          marka: form.marka,
          uyumlu_cihaz: form.uyumlu_cihaz,
          miktar: Number(form.miktar),
          alis_fiyati: Number(form.alis_fiyati),
          fiyat_guncelle: true 
        });

        if (res.data.success) {
          alert("✅ STOK BAŞARIYLA EKLENDİ VE KASADAN DÜŞÜLDÜ!");
        }
      }

      // İŞLEM BİTİNCE FORMU TEMİZLE
      setArananMalzeme(null);
      setForm({
        islem_turu: 'Stok Tamamlama',
        barkod: '',
        malzeme_adi: '',
        marka: '',
        uyumlu_cihaz: '',
        miktar: 1,
        alis_fiyati: ''
      });

    } catch (error: any) {
      alert("Hata: " + (error.response?.data?.error || error.message || "İşlem başarısız"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full p-2 overflow-hidden">
      
      {/* ÜST BİLGİ */}
      <div className="mb-3 px-2">
        <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
          <span>📦</span> MAL KABUL / STOK GİRİŞİ
        </h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
          Depoya Yeni Malzeme Veya Yedek Parça Girişi
        </p>
      </div>

      <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-5 shadow-2xl flex-1 overflow-y-auto scrollbar-hide">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full justify-between">
          
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <span className="text-[#8E052C]">*</span> İşlem Türü
                </label>
                <select
                  className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                  value={form.islem_turu} onChange={(e) => setForm({...form, islem_turu: e.target.value})}
                >
                  {/* 🚨 SADELEŞTİRİLMİŞ AÇILIR MENÜ */}
                  <option value="Stok Tamamlama">Stok Tamamlama</option>
                  <option value="Usta Siparişi Geldi">Usta Siparişi Geldi</option>
                  <option value="İade (Stok Satışı)">İade (Stok Satışı)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <span className="text-[#8E052C]">*</span> Barkod / Seri No
                </label>
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Okutun veya yazın..."
                    className="flex-1 bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                    value={form.barkod} 
                    onChange={(e) => setForm({...form, barkod: e.target.value})}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarkodAra(); } }}
                  />
                  <button 
                    type="button" 
                    onClick={handleBarkodAra}
                    className="bg-[#8E052C] hover:bg-[#A00632] border border-[#8E052C]/50 text-white px-3.5 rounded-xl text-sm transition-colors shadow-md"
                    title="Depoda Ara"
                  >
                    {isSearching ? '⌛' : '🔍'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleBarkodUret} 
                    className="bg-white/5 hover:bg-[#8E052C]/20 border border-white/10 text-white px-4 rounded-xl text-[10px] font-black uppercase transition-colors"
                  >
                    ⚙️ Üret
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <span className="text-[#8E052C]">*</span> Malzeme Adı
                </label>
                <input
                  type="text" placeholder="Örn: iPhone 13 Ekran Paneli"
                  className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                  value={form.malzeme_adi} onChange={(e) => setForm({...form, malzeme_adi: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marka</label>
                <input
                  type="text" placeholder="Örn: Apple (Orijinal) / Yan Sanayi"
                  className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                  value={form.marka} onChange={(e) => setForm({...form, marka: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-1 md:col-span-6 flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Uyumlu Cihaz</label>
                <input
                  type="text" placeholder="Tüm A Serisi vb."
                  className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                  value={form.uyumlu_cihaz} onChange={(e) => setForm({...form, uyumlu_cihaz: e.target.value})}
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <span className="text-[#8E052C]">*</span> Miktar
                </label>
                <input
                  type="number" min="1"
                  className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs text-center font-black text-sky-500 outline-none focus:border-[#8E052C]/50 transition-all"
                  value={form.miktar} onChange={(e) => setForm({...form, miktar: Number(e.target.value)})}
                />
              </div>

              <div className="col-span-1 md:col-span-4 flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <span className="text-[#8E052C]">*</span> Alış Fiyatı (₺)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-black">₺</span>
                  <input
                    type="number" step="0.01" placeholder="0.00"
                    className="w-full bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 pl-8 pr-3 text-xs font-black text-green-500 outline-none focus:border-[#8E052C]/50 transition-all"
                    value={form.alis_fiyati} onChange={(e) => setForm({...form, alis_fiyati: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-4 w-full bg-[#8E052C] hover:bg-[#A00632] text-white font-black text-sm py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-[#8E052C]/20 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? 'KAYDEDİLİYOR...' : <><span>💾</span> KAYDET VE KASADAN DÜŞ</>}
          </button>

        </form>
      </div>
    </div>
  );
}