import { useState } from 'react';
import axios from 'axios';

// MÜDÜR: Takvim ve Saat ikonlarını beyaza boyayan stil bloğu
const calendarStyle = `
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
    usta: '',
    not: ''
  });

  const [loading, setLoading] = useState(false);
  const [rehberAcik, setRehberAcik] = useState(false);
  const [musteriler, setMusteriler] = useState<any[]>([]);
  const [arama, setArama] = useState('');
  const [seciliMusteri, setSeciliMusteri] = useState<any>(null);

  const API_URL = "http://localhost:3000"; 
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const rehberiAc = async () => {
    try {
      const [resCust, resFirm] = await Promise.all([
        axios.get(`${API_URL}/customers`, { headers }),
        axios.get(`${API_URL}/api/firm/all`, { headers })
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

      const conflictRes = await axios.get(`${API_URL}/api/appointments/check-conflict?date=${dbDate}&time=${form.saat}`, { headers });
      
      if (conflictRes.data.isOccupied) {
        alert("🚨 Bu saatte başka bir randevu var!");
        setLoading(false);
        return;
      }

      const res = await axios.post(`${API_URL}/api/appointments/ekle`, {
        customer_id: seciliMusteri.id,
        type: seciliMusteri.tip === 'F' ? 'kurumsal' : 'bireysel', 
        device_brand: form.cihaz_marka, 
        device_model: form.cihaz_model,
        date: dbDate, 
        time: form.saat,
        usta: form.usta, 
        issue: paketlenmisVeri 
      }, { headers });

      if (res.data.success) {
        alert(`✅ RANDEVU KAYDEDİLDİ!`);
        setForm({telefon: '', adres: '', cihaz_cesit: '', cihaz_marka: '', cihaz_model: '', tarih: '', saat: '', usta: '', not: ''});
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
      {/* MÜDÜR: CSS'i buraya stil etiketi olarak bastık */}
      <style>{calendarStyle}</style>

      <div className="bg-[#0F0F12] border border-white/10 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative mt-4 max-w-2xl mx-auto w-full">
        
        <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center relative overflow-hidden">
          <h2 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-3 relative z-10">
            <span className="text-[#8E052C] text-2xl">📅</span> Yeni Randevu Oluştur
          </h2>
          <div className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-400">
            KAYIT NO: <span className="text-white">OTOMATİK</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-hide flex-1 relative">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1.5">Müşteri Bilgileri</h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-gray-400">Telefon {seciliMusteri && <span className="text-green-500">({seciliMusteri.gosterim})</span>}</label>
                  <input 
                    type="text" name="telefon" value={form.telefon} onChange={handleChange}
                    placeholder="05XX XXX XX XX" 
                    readOnly={!!seciliMusteri}
                    className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none focus:border-[#8E052C]"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={rehberiAc}
                  className="bg-[#8E052C] hover:bg-red-800 text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-all border border-red-900/50"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" y1="8" x2="19" y2="14"></line>
                    <line x1="22" y1="11" x2="16" y2="11"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1.5">Cihaz Bilgileri</h3>
              <div className="grid grid-cols-3 gap-3">
                <input type="text" name="cihaz_cesit" value={form.cihaz_cesit} onChange={handleChange} placeholder="Çeşit" className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none" />
                <input type="text" name="cihaz_marka" value={form.cihaz_marka} onChange={handleChange} placeholder="Marka" className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none" />
                <input type="text" name="cihaz_model" value={form.cihaz_model} onChange={handleChange} placeholder="Model" className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none" />
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <input type="date" name="tarih" value={form.tarih} onChange={handleChange} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none" />
                <input type="time" name="saat" value={form.saat} onChange={handleChange} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none" />
              </div>
            </div>

            <textarea 
              name="not" value={form.not} onChange={handleChange}
              placeholder="Şikayet notu..." 
              className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-3 px-4 text-sm text-white h-20 outline-none"
            ></textarea>

            <button type="submit" disabled={loading} className="w-full bg-[#8E052C] text-white font-black py-3.5 rounded-xl hover:bg-[#A30633] transition-all">
              {loading ? 'KAYDEDİLİYOR...' : 'RANDEVUYU KAYDET'}
            </button>
          </form>

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
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-inner 
                        ${m.tip === 'F' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        {m.tip === 'F' ? '🏢' : '👤'}
                      </div>
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