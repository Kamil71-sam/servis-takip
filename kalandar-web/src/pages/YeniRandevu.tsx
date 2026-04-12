import { useState } from 'react';
import api from '../api';

// 🚨 MÜDÜRÜN KOMBİNE STİLİ: Takvim düzeltici + Scrollbar silici + BEYAZ KUTU (Autofill) KATİLİ
const customStyles = `
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
    opacity: 0.8;
  }
  input[type="date"]::-webkit-calendar-picker-indicator:hover,
  input[type="time"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
  .nuke-scrollbar::-webkit-scrollbar { display: none; }
  .nuke-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
  /* 🚨 CHROME'UN OTOMATİK BEYAZA BOYAMASINI ENGELLEYEN ZIRH 🚨 */
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active{
      -webkit-box-shadow: 0 0 0 30px #0F0F12 inset !important;
      -webkit-text-fill-color: white !important;
      transition: background-color 5000s ease-in-out 0s;
  }
`;

export default function YeniRandevu() {
  const [form, setForm] = useState({
    telefon: '',
    adres: '',
    cihaz_cesit: '',
    cihaz_marka: '',
    cihaz_model: '',
    tarih: '',
    saat: '',
    usta: 'Usta 1', 
    not: ''
  });

  const [loading, setLoading] = useState(false);
  const [rehberAcik, setRehberAcik] = useState(false);
  const [musteriler, setMusteriler] = useState<any[]>([]);
  const [arama, setArama] = useState('');
  const [seciliMusteri, setSeciliMusteri] = useState<any>(null);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const rehberiAc = async () => {
    try {
      const [resCust, resFirm] = await Promise.all([
        api.get(`/customers`),
        api.get(`/api/firm/all`)
      ]);

      const birlesik = [
        ...resCust.data.map((c: any) => ({ ...c, tip: 'B', gosterim: c.name, phone: c.phone, adres: c.address })),
        ...resFirm.data.map((f: any) => ({ ...f, tip: 'F', gosterim: f.firma_adi, phone: f.telefon, adres: f.adres }))
      ];

      setMusteriler(birlesik);
      setRehberAcik(true);
    } catch (error) {
      console.error("Rehber çekilemedi:", error);
      alert("Rehber verisi alınamadı.");
    }
  };

  const musteriSec = (musteri: any) => {
    setSeciliMusteri(musteri);
    setForm({
      ...form,
      telefon: musteri.phone || '',
      adres: musteri.adres || ''
    });
    setRehberAcik(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.telefon || !form.tarih || !form.saat || !seciliMusteri) {
      alert("Lütfen önce rehberden müşteri seçin!");
      return;
    }

    setLoading(true);
    try {
      const dbDate = form.tarih;
      const paketlenmisVeri = `📍 ADRES: ${form.adres}\n🔧 CİHAZ: ${form.cihaz_cesit} ${form.cihaz_marka} ${form.cihaz_model}\n📝 NOT: ${form.not}`;

      const conflictRes = await api.get(`/api/appointments/check-conflict?date=${dbDate}&time=${form.saat}`);

      if (conflictRes.data.isOccupied) {
        alert("🚨 Bu saatte başka bir randevu var!");
        setLoading(false);
        return;
      }

      const res = await api.post(`/api/appointments/ekle`, {
        customer_id: seciliMusteri.id,
        type: seciliMusteri.tip === 'F' ? 'firma' : 'bireysel',
        device_brand: form.cihaz_marka,
        device_model: form.cihaz_model,
        date: dbDate,
        time: form.saat,
        usta: form.usta, 
        issue: paketlenmisVeri
      });

      if (res.data.success) {
        alert(`✅ RANDEVU KAYDEDİLDİ! Servis No: ${res.data.servis_no || 'Atandı'}`);
        setForm({ telefon: '', adres: '', cihaz_cesit: '', cihaz_marka: '', cihaz_model: '', tarih: '', saat: '', usta: 'Usta 1', not: '' });
        setSeciliMusteri(null);
      }
    } catch (error: any) {
      alert("Hata: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filtrelenmisRehber = musteriler
    .filter(m =>
      (m.gosterim || '').toLowerCase().includes(arama.toLowerCase()) ||
      (m.phone || '').includes(arama)
    )
    .sort((a, b) => (a.gosterim || "").localeCompare(b.gosterim || "", 'tr'));

  return (
    <>
      <style>{customStyles}</style>

      <div className="flex-1 flex flex-col h-full p-2 overflow-hidden">
        
        {/* ÜST BİLGİ */}
        <div className="mb-3 px-2">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
            <span>🗓️</span> YENİ RANDEVU
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Saha Randevu Kayıt Formu.
          </p>
        </div>

        {/* SIKIŞTIRILMIŞ FORM ALANI */}
        <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-5 shadow-2xl flex-1 overflow-y-auto nuke-scrollbar relative">
          
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span>🗓️</span> YENİ RANDEVU OLUŞTURMA
            </h3>
            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
              SERVİS NO : <span className="text-white">OTOMATİK</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-[calc(100%-4rem)] justify-between">
            <div className="flex flex-col gap-5">
              
              {/* 1. SATIR: Müşteri Telefonu ve Atanan Usta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Müşteri Telefonu {seciliMusteri && <span className="text-green-500">({seciliMusteri.gosterim})</span>}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text" name="telefon" placeholder="05XX XXX XX XX"
                      className="flex-1 bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                      value={form.telefon} onChange={handleChange} readOnly={!!seciliMusteri}
                    />
                    {/* Rehber Butonu */}
                    <button type="button" onClick={rehberiAc} className="bg-[#8E052C] hover:bg-[#A00632] text-white px-4 rounded-xl flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Atanan Usta</label>
                  <select
                    name="usta"
                    className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                    value={form.usta} onChange={handleChange}
                  >
                    <option value="Usta 1">Usta 1 (Kemal)</option>
                    <option value="Usta 2">Usta 2</option>
                    <option value="Usta 3">Usta 3</option>
                  </select>
                </div>
              </div>

              {/* 2. SATIR: Cihaz Bilgileri */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Cihaz Bilgileri</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text" name="cihaz_cesit" placeholder="Çeşit"
                    className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                    value={form.cihaz_cesit} onChange={handleChange}
                  />
                  <input
                    type="text" name="cihaz_marka" placeholder="Marka"
                    className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                    value={form.cihaz_marka} onChange={handleChange}
                  />
                  <input
                    type="text" name="cihaz_model" placeholder="Model"
                    className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all"
                    value={form.cihaz_model} onChange={handleChange}
                  />
                </div>
              </div>

              {/* 3. SATIR: Randevu Tarihi ve Saati */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Randevu Tarihi</label>
                  <input
                    type="date" name="tarih"
                    className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-300 outline-none focus:border-[#8E052C]/50 transition-all"
                    value={form.tarih} onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Randevu Saati</label>
                  <input
                    type="time" name="saat"
                    className="bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-300 outline-none focus:border-[#8E052C]/50 transition-all"
                    value={form.saat} onChange={handleChange}
                  />
                </div>
              </div>

              {/* 4. SATIR: Şikayet Notu */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Şikayet Notu</label>
                <textarea
                  name="not" placeholder="Şikayet notu..."
                  className="bg-[#0F0F12] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all resize-none h-20"
                  value={form.not} onChange={handleChange}
                />
              </div>
            </div>

            {/* KAYDET BUTONU */}
            <button
              type="submit" disabled={loading}
              className="mt-4 w-full bg-[#8E052C] hover:bg-[#A00632] text-white font-black text-sm py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-[#8E052C]/20 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? 'KAYDEDİLİYOR...' : <><span>💾</span> RANDEVUYU KAYDET</>}
            </button>
          </form>

          {/* MÜŞTERİ REHBERİ MODALI */}
          {rehberAcik && (
            <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-[#1A1A1E] border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-full">
                <div className="p-3 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-white font-bold text-base flex items-center gap-2"><span className="text-[#8E052C]">👥</span> Müşteri Rehberi</h3>
                  <button onClick={() => setRehberAcik(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 w-7 h-7 rounded-full flex items-center justify-center">✕</button>
                </div>
                <div className="p-3 border-b border-white/5">
                  <input type="text" placeholder="İsim veya Telefon Ara..." value={arama} onChange={(e) => setArama(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-[#8E052C]" />
                </div>
                <div className="overflow-y-auto p-2 nuke-scrollbar flex-1">
                  {filtrelenmisRehber.map((m: any, i: number) => (
                    <button key={i} onClick={() => musteriSec(m)} className="w-full text-left p-2.5 hover:bg-white/5 rounded-xl transition-all border-b border-white/5 last:border-0 flex items-center gap-3 group">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-inner ${m.tip === 'F' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>{m.tip === 'F' ? '🏢' : '👤'}</div>
                      <div>
                        <div className="text-white font-bold text-xs group-hover:text-[#8E052C] transition-colors">{m.gosterim}</div>
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
    </>
  );
}