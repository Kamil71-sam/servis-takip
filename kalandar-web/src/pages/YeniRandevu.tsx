import { useState } from 'react';
import axios from 'axios';

export default function YeniRandevu() {
  const [form, setForm] = useState({
    telefon: '',
    adres: '',
    cihaz_cesit: '',
    cihaz_marka: '',
    cihaz_model: '',
    tarih: '',
    saat: '',
    usta: '',
    not: ''
  });

  const [loading, setLoading] = useState(false);
  const [rehberAcik, setRehberAcik] = useState(false);
  const [musteriler, setMusteriler] = useState<any[]>([]);
  const [arama, setArama] = useState('');
  const [seciliMusteri, setSeciliMusteri] = useState<any>(null);

  const API_URL = "http://localhost:3000"; // Kendi portuna göre ayarla
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 1. VANA: REHBERİ BACKEND'DEN ÇEKME
  const rehberiAc = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers/all`, { headers });
      const data = res.data.data ? res.data.data : res.data;
      if (Array.isArray(data)) {
        setMusteriler(data);
      }
      setRehberAcik(true);
    } catch (error) {
      console.error("Rehber çekilemedi:", error);
      alert("Rehber verisi alınamadı. Bağlantıyı kontrol edin.");
    }
  };

  const musteriSec = (musteri: any) => {
    setSeciliMusteri(musteri);
    setForm({
      ...form,
      telefon: musteri.phone || '',
      adres: musteri.adres || musteri.address || ''
    });
    setRehberAcik(false);
  };

  // 2. VANA: GERÇEK KAYIT (DB'YE YAZMA)
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.telefon || !form.tarih || !form.saat || !seciliMusteri) {
      alert("Lütfen önce rehberden müşteri seçin ve tarih/saat girin!");
      return;
    }

    setLoading(true);
    try {
      // Tarih formatını DB'ye uygun hale getir (YYYY-MM-DD varsayımıyla, sende formattan geleni düzeltiyoruz)
      let dbDate = form.tarih;

      const paketlenmisVeri = `📍 ADRES: ${form.adres}\n🔧 CİHAZ: ${form.cihaz_cesit} ${form.cihaz_marka} ${form.cihaz_model}\n📝 NOT: ${form.not}`;

      // Önce Çakışma Kontrolü
      const conflictRes = await axios.get(`${API_URL}/api/appointments/check-conflict?date=${dbDate}&time=${form.saat}`, { headers });
      
      if (conflictRes.data.isOccupied) {
        alert("🚨 Bu tarih ve saatte başka bir randevu var! Lütfen saati değiştirin.");
        setLoading(false);
        return;
      }

      // Kaydı At
      const res = await axios.post(`${API_URL}/api/appointments/ekle`, {
        customer_id: seciliMusteri.id,
        type: seciliMusteri.tip || 'bireysel', 
        device_brand: form.cihaz_marka, 
        device_model: form.cihaz_model,
        date: dbDate, 
        time: form.saat,
        usta: form.usta, 
        issue: paketlenmisVeri 
      }, { headers });

      if (res.data.success) {
        alert(`✅ İŞLEM TAMAM! Kayıt No: ${res.data.servis_no || 'Atandı'}`);
        // Formu temizle
        setForm({telefon: '', adres: '', cihaz_cesit: '', cihaz_marka: '', cihaz_model: '', tarih: '', saat: '', usta: '', not: ''});
        setSeciliMusteri(null);
      } else {
        alert("Sunucudan ret yedik: " + (res.data.error || "Bilinmeyen Hata"));
      }
    } catch (error: any) {
      console.error("Kayıt Hatası:", error);
      alert("Kayıt Başarısız: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filtrelenmisRehber = musteriler.filter(m => 
    (m.name || '').toLowerCase().includes(arama.toLowerCase()) || 
    (m.phone || '').includes(arama)
  );

  return (
    // 🚨 MÜDÜR: max-w-4xl idi, max-w-2xl yaptık. Form daraldı, kibarlaştı!
    <div className="bg-[#0F0F12] border border-white/10 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative mt-4 max-w-2xl mx-auto w-full">
      
      {/* ÜST BAŞLIK (p-6 idi, p-5 yaptık daha kibar oldu) */}
      <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-[#8E052C]/20 blur-3xl rounded-full pointer-events-none"></div>
        <h2 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-3 relative z-10">
          <span className="text-[#8E052C] text-2xl">📅</span> Yeni Randevu Oluştur
        </h2>
        <div className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
          <span>KAYIT NO:</span>
          <span className="text-white bg-white/10 px-1.5 py-0.5 rounded border border-white/5 tracking-widest">OTOMATİK</span>
        </div>
      </div>

      {/* FORM ALANI (p-8 idi, p-6 yaptık) */}
      <div className="p-6 overflow-y-auto scrollbar-hide flex-1 relative">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* MÜŞTERİ SEÇİMİ (bg-black/20 p-5 idi, bg-black/30 p-4 yaptık) */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1.5">Müşteri Bilgileri</h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-gray-400">Müşteri Telefon No {seciliMusteri && <span className="text-green-500 ml-1.5">({seciliMusteri.name})</span>}</label>
                <input 
                  type="text" name="telefon" value={form.telefon} onChange={handleChange}
                  placeholder="05XX XXX XX XX" 
                  readOnly={!!seciliMusteri}
                  className={`w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C] transition-all ${seciliMusteri ? 'opacity-50' : ''}`}
                />
              </div>
              <button 
                type="button" 
                onClick={rehberiAc}
                className="bg-[#8E052C] hover:bg-red-800 text-white w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg transition-all border border-red-900/50 flex-shrink-0" 
                title="Rehberden Seç"
              >
                👤+
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Randevu Adresi</label>
              <input 
                type="text" name="adres" value={form.adres} onChange={handleChange}
                placeholder="Mahalle, Sokak, No..." 
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C] transition-all"
              />
            </div>
          </div>

          {/* CİHAZ BİLGİLERİ */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1.5">Cihaz Bilgileri</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">Çeşit</label>
                <input type="text" name="cihaz_cesit" value={form.cihaz_cesit} onChange={handleChange} placeholder="Örn: Kombi" className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#8E052C]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">Marka</label>
                <input type="text" name="cihaz_marka" value={form.cihaz_marka} onChange={handleChange} placeholder="Örn: Demirdöküm" className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#8E052C]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">Model</label>
                <input type="text" name="cihaz_model" value={form.cihaz_model} onChange={handleChange} placeholder="Örn: Nitromix" className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#8E052C]" />
              </div>
            </div>
          </div>

          {/* PLANLAMA & ATAMA */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1.5">Planlama & Görevlendirme</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">Tarih</label>
                <input type="date" name="tarih" value={form.tarih} onChange={handleChange} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none focus:border-[#8E052C]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">Saat</label>
                <input type="time" name="saat" value={form.saat} onChange={handleChange} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none focus:border-[#8E052C]" />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-bold text-gray-500">Atanan Usta</label>
              <select name="usta" value={form.usta} onChange={handleChange} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none focus:border-[#8E052C] cursor-pointer">
                <option value="">Usta Seçiniz...</option>
                <option value="Usta 1">Usta 1</option>
                <option value="Usta 2">Usta 2</option>
              </select>
            </div>
          </div>

          {/* NOTLAR */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400">Arıza / Randevu Notu</label>
            <textarea 
              name="not" value={form.not} onChange={handleChange}
              placeholder="Müşterinin şikayetini buraya yazın..." 
              className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-3 px-4 text-sm text-white h-20 outline-none resize-none focus:border-[#8E052C]"
            ></textarea>
          </div>

          {/* 🚨 GERÇEK KAYDET BUTONU (KIRMIZI-BEYAZ REVİZYON) */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#8E052C] text-white font-black uppercase tracking-widest py-3.5 rounded-xl mt-1 hover:bg-[#A30633] transition-all shadow-[0_5px_15px_rgba(142,5,44,0.4)] disabled:opacity-50 text-sm"
          >
            {loading ? 'KAYDEDİLİYOR...' : 'RANDEVUYU KAYDET'}
          </button>
        </form>

        {/* 🚨 REHBER MODALI (Daha kibar ölçüler) */}
        {rehberAcik && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 rounded-[2rem]">
            <div className="bg-[#1A1A1E] border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-full">
              <div className="p-3 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white font-bold text-base flex items-center gap-2"><span className="text-[#8E052C]">👥</span> Müşteri Rehberi</h3>
                <button onClick={() => setRehberAcik(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 w-7 h-7 rounded-full flex items-center justify-center">✕</button>
              </div>
              <div className="p-3 border-b border-white/5">
                <input 
                  type="text" placeholder="İsim veya Telefon Ara..." 
                  value={arama} onChange={(e) => setArama(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-[#8E052C]"
                />
              </div>
              <div className="overflow-y-auto p-2 scrollbar-hide flex-1">
                {filtrelenmisRehber.map((m: any, i: number) => (
                  <button 
                    key={i} onClick={() => musteriSec(m)}
                    className="w-full text-left p-2.5 hover:bg-white/5 rounded-xl transition-all border-b border-white/5 last:border-0 flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-gray-500 group-hover:text-[#8E052C] transition-colors text-sm">👤</div>
                    <div>
                      <div className="text-white font-bold text-xs">{m.name}</div>
                      <div className="text-gray-500 text-[10px] mt-0.5">{m.phone}</div>
                    </div>
                  </button>
                ))}
                {filtrelenmisRehber.length === 0 && <div className="text-center p-6 text-gray-500 text-sm">Müşteri bulunamadı.</div>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}