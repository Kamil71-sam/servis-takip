import { useState, useEffect } from 'react';
import axios from 'axios';

export default function YeniServisKaydi() {
  const API_URL = "http://localhost:3000";
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // --- FORM STATE ---
  const [selectedMusteri, setSelectedMusteri] = useState<any>(null);
  const [selectedCihaz, setSelectedCihaz] = useState<any>(null);
  const [cihazlar, setCihazlar] = useState<any[]>([]);
  const [arizaNotu, setArizaNotu] = useState('');
  const [atananUsta] = useState('Usta 1 (Kemal)'); 
  const [isSaving, setIsSaving] = useState(false);
  const [showMusteriRehberi, setShowMusteriRehberi] = useState(false); 
  const [rehberArama, setRehberArama] = useState(''); 

  // --- MODAL & REHBER STATES ---
  const [showMusteriList, setShowMusteriList] = useState(false);
  const [showCihazEkleModal, setShowCihazEkleModal] = useState(false);
  const [musteriArama, setMusteriArama] = useState('');
  const [musteriListesi, setMusteriListesi] = useState<any[]>([]);

  // --- YENİ CİHAZ STATE ---
  const [yeniCihaz, setYeniCihaz] = useState({
    cihaz_turu: '', brand: '', model: '', serial_no: '', garanti_durumu: 'Yok', muster_notu: ''
  });

  // MÜDÜR: Rehber açıldığında tüm listeyi çeken fonksiyon
  const tumMusterileriGetir = async () => {
    try {
      const [resCust, resFirm] = await Promise.all([
        axios.get(`${API_URL}/customers`, { headers }),
        axios.get(`${API_URL}/api/firm/all`, { headers })
      ]);
      const birlesik = [
        ...resCust.data.map((c: any) => ({ ...c, tip: 'B', gosterim: c.name, phone: c.phone })),
        ...resFirm.data.map((f: any) => ({ ...f, tip: 'F', gosterim: f.firma_adi, phone: f.telefon }))
      ];
      setMusteriListesi(birlesik);
    } catch (err) {
      console.error("Rehber yükleme hatası:", err);
    }
  };

  // Müşteri Arama (Giriş kutusu için)
  useEffect(() => {
    if (musteriArama.length >= 3 && !selectedMusteri) {
      const aramaYap = async () => {
        try {
          const [resCust, resFirm] = await Promise.all([
            axios.get(`${API_URL}/customers`, { headers }),
            axios.get(`${API_URL}/api/firm/all`, { headers })
          ]);
          const birlesik = [
            ...resCust.data.map((c: any) => ({ ...c, tip: 'B', gosterim: c.name })),
            ...resFirm.data.map((f: any) => ({ ...f, tip: 'F', gosterim: f.firma_adi }))
          ];
          const filtrelenmis = birlesik.filter(m => m.gosterim.toLowerCase().includes(musteriArama.toLowerCase()));
          setMusteriListesi(filtrelenmis);
          setShowMusteriList(filtrelenmis.length > 0);
        } catch (err) { console.error("Hata:", err); }
      };
      aramaYap();
    } else {
      setShowMusteriList(false);
    }
  }, [musteriArama, selectedMusteri]);

  // Müşteri Seçilince Cihazlarını Getir
  const handleMusteriSec = async (m: any) => {
    setSelectedMusteri(m);
    setMusteriArama(m.gosterim);
    setShowMusteriList(false);
    setSelectedCihaz(null); 
    try {
      const backendTipi = m.tip === 'B' ? 'bireysel' : 'kurumsal';
      const res = await axios.get(`${API_URL}/devices/customer/${m.id}?type=${backendTipi}`, { headers });
      setCihazlar(res.data);
    } catch (err) { 
      console.error("Cihaz çekme hatası:", err);
      setCihazlar([]); 
    }
  };

  const cihazKaydet = async () => {
    if (!selectedMusteri) return alert("Önce müşteri seçilmeli!");
    try {
      const veri = { 
        ...yeniCihaz, 
        customer_id: selectedMusteri.tip === 'B' ? selectedMusteri.id : null,
        firm_id: selectedMusteri.tip === 'F' ? selectedMusteri.id : null,
        customer_type: selectedMusteri.tip === 'B' ? 'bireysel' : 'kurumsal'
      };
      const res = await axios.post(`${API_URL}/devices`, veri, { headers });
      const eklenenCihaz = { id: res.data.id, ...veri };
      setCihazlar([...cihazlar, eklenenCihaz]);
      setSelectedCihaz(eklenenCihaz);
      setShowCihazEkleModal(false);
      alert("Cihaz Kaydedildi.");
    } catch (err) { alert("Cihaz eklenemedi!"); }
  };

  const handleSaveService = async () => {
    if (!selectedMusteri) return alert("Müşteri seçmeden iş emri açılamaz!");
    if (!selectedCihaz) return alert("Lütfen arızalı cihazı seçin!");
    if (!arizaNotu.trim()) return alert("Müşterinin şikayetini/arızayı yazmalısın müdür!");

    setIsSaving(true);
    try {
      const isEmriVerisi = {
        device_id: selectedCihaz.id,
        issue_text: arizaNotu,
        atanan_usta: atananUsta,
        musteri_notu: selectedCihaz.muster_notu || '',
        customer_id: selectedMusteri.tip === 'B' ? selectedMusteri.id : null,
        firm_id: selectedMusteri.tip === 'F' ? selectedMusteri.id : null
      };
      const res = await axios.post(`${API_URL}/services`, isEmriVerisi, { headers });
      alert(`✅ Kapat Baretleri! İş Emri Açıldı.\nServis No: ${res.data.servis_no}`);
      setSelectedMusteri(null);
      setMusteriArama('');
      setSelectedCihaz(null);
      setCihazlar([]);
      setArizaNotu('');
    } catch (err: any) {
      console.error("Servis Kayıt Hatası:", err);
      alert("Hata: " + (err.response?.data?.error || "Servis kaydedilemedi."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-4 px-4 pb-8">
      <div className="bg-[#0F0F12] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden p-5 flex flex-col gap-4 relative">
        
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Yeni Servis Kaydı</h2>
          <span className="bg-[#8E052C] text-white text-[9px] px-2.5 py-1 rounded-full font-black uppercase">Adım 1/2</span>
        </div>

        {/* 1. MÜŞTERİ SEÇİMİ */}
        <div className="relative space-y-1">
          <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Müşteri / Firma Seçimi (*)</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={musteriArama}
              onChange={(e) => {
                setMusteriArama(e.target.value);
                if (selectedMusteri) {
                  setSelectedMusteri(null); 
                  setCihazlar([]); 
                }
              }}
              onBlur={() => setTimeout(() => setShowMusteriList(false), 200)}
              placeholder="En az 3 harf girin..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-semibold outline-none focus:border-[#8E052C] transition-all" 
            />
            <button 
              onClick={(e) => {
                e.preventDefault();
                tumMusterileriGetir();
                setShowMusteriRehberi(true);
              }}
              className="bg-[#8E052C] hover:bg-red-800 border border-white/10 px-4 rounded-xl text-white transition-all flex items-center justify-center shadow-lg shadow-red-950/30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
            </button>
          </div>

          {showMusteriList && (
            <div className="absolute top-full left-0 w-full bg-[#1A1A1E] border border-[#8E052C]/30 mt-1 rounded-xl z-50 shadow-2xl max-h-48 overflow-y-auto">
              {musteriListesi.map((m, i) => (
                <button key={i} onMouseDown={() => handleMusteriSec(m)} className="w-full text-left p-3 hover:bg-[#8E052C]/20 text-sm text-white border-b border-white/5 font-semibold flex items-center gap-3">
                   <span className={m.tip === 'B' ? 'text-blue-500' : 'text-orange-500'}>{m.tip === 'B' ? '👤' : '🏢'}</span>
                   {m.gosterim}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. CİHAZ SEÇİMİ */}
        <div className="space-y-1">
          <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Cihaz Seçimi (Veya + İle Ekle)</label>
          <div className="flex gap-2">
            <select 
              value={selectedCihaz?.id || ''}
              onChange={(e) => setSelectedCihaz(cihazlar.find(c => c.id == e.target.value))}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-semibold outline-none appearance-none cursor-pointer focus:border-[#8E052C]"
            >
              <option value="" className="bg-[#0F0F12]">
                {selectedMusteri ? (cihazlar.length > 0 ? 'Cihaz Seçiniz...' : 'Kayıtlı Cihaz Yok') : 'Önce Müşteri Seçin'}
              </option>
              {cihazlar.map((c, i) => (
                <option key={i} value={c.id} className="bg-[#0F0F12] text-white">
                  {c.cihaz_turu} - {c.brand} {c.model}
                </option>
              ))}
            </select>
            <button onClick={() => setShowCihazEkleModal(true)} className="bg-white/5 hover:bg-[#8E052C] border border-white/10 px-4 rounded-xl text-white transition-all text-lg flex items-center justify-center">＋</button>
          </div>
        </div>

        {/* 3. USTA */}
        <div className="space-y-1">
          <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Atanan Usta</label>
          <div className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-semibold flex items-center justify-between opacity-80">
            <span>{atananUsta}</span>
            <span>🛠️</span>
          </div>
        </div>

        {/* 4. ARIZA NOTU */}
        <div className="space-y-1">
          <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Arıza / Şikayet Detayı (*)</label>
          <textarea 
            value={arizaNotu}
            onChange={(e) => setArizaNotu(e.target.value)}
            placeholder="Cihazın şikayeti nedir?" 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-semibold h-16 resize-none outline-none focus:border-[#8E052C] transition-all"
          ></textarea>
        </div>

        <button 
          onClick={handleSaveService}
          disabled={isSaving}
          className="w-full bg-[#8E052C] text-white py-3 rounded-xl font-black uppercase text-sm shadow-lg shadow-red-950/30 hover:scale-[1.01] active:scale-95 transition-all mt-1 disabled:opacity-50">
          {isSaving ? "KAYDEDİLİYOR..." : "KAYDET"}
        </button>
      </div>

      {/* CİHAZ EKLEME MODALI */}
      {showCihazEkleModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F12] border-2 border-[#8E052C]/30 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-white/5 bg-[#8E052C]/10 flex justify-between items-center">
              <h3 className="font-black text-white uppercase text-base tracking-tighter">YENİ CİHAZ GİRİŞİ</h3>
              <button onClick={() => setShowCihazEkleModal(false)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="text-[8px] text-gray-500 font-black uppercase ml-1 tracking-widest">Cihaz Türü</label>
                <select 
                  onChange={(e) => setYeniCihaz({...yeniCihaz, cihaz_turu: e.target.value})} 
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2 px-3 text-sm text-white font-bold outline-none focus:border-[#8E052C]"
                >
                  <option value="" className="bg-[#1A1A1E]">Cihaz Türü Seçiniz...</option>
                  <option value="Cep Telefonu" className="bg-[#1A1A1E]">Cep Telefonu</option>
                  <option value="Notebook" className="bg-[#1A1A1E]">Notebook</option>
                  <option value="Masaüstü Bilgisayar" className="bg-[#1A1A1E]">Masaüstü Bilgisayar</option>
                  <option value="Yazıcı" className="bg-[#1A1A1E]">Yazıcı</option>
                  <option value="Tablet" className="bg-[#1A1A1E]">Tablet</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Marka" onChange={(e) => setYeniCihaz({...yeniCihaz, brand: e.target.value})} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none" />
                <input type="text" placeholder="Model" onChange={(e) => setYeniCihaz({...yeniCihaz, model: e.target.value})} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none" />
              </div>
              <input type="text" placeholder="Seri Numarası" onChange={(e) => setYeniCihaz({...yeniCihaz, serial_no: e.target.value})} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none" />
              <div className="space-y-1">
                <label className="text-[8px] text-gray-500 font-black uppercase ml-1 tracking-widest">Garanti Durumu</label>
                <select 
                  onChange={(e) => setYeniCihaz({...yeniCihaz, garanti_durumu: e.target.value})} 
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2 px-3 text-sm text-white font-bold outline-none"
                >
                  <option value="Yok" className="bg-[#1A1A1E]">Yok</option>
                  <option value="Var (Dükkan)" className="bg-[#1A1A1E]">Var (Dükkan)</option>
                  <option value="Var (Resmi)" className="bg-[#1A1A1E]">Var (Resmi)</option>
                </select>
              </div>
              <textarea 
                placeholder="Müşteri Notu / Aksesuar" 
                onChange={(e) => setYeniCihaz({...yeniCihaz, muster_notu: e.target.value})} 
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2 px-3 text-xs text-white h-16 outline-none resize-none"
              ></textarea>
            </div>
            <div className="p-4 bg-black/40 flex justify-end gap-4">
               <button onClick={() => setShowCihazEkleModal(false)} className="text-gray-500 font-bold uppercase text-xs hover:text-white transition-all">VAZGEÇ</button>
               <button onClick={cihazKaydet} className="bg-[#8E052C] text-white px-6 py-2.5 rounded-lg font-black text-xs uppercase shadow-lg shadow-red-950/30">TANIMLA</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 MÜDÜR: REHBER MODALI (RANDAVU SİSTİMİNE BENZETİLDİ & A-Z SIRALANDI) */}
      {showMusteriRehberi && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 rounded-[2rem]">
          <div className="bg-[#1A1A1E] border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-full">
            <div className="p-3 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[#8E052C]">👥</span>
                <h3 className="font-bold text-white text-base">Müşteri Rehberi</h3>
              </div>
              <button onClick={() => setShowMusteriRehberi(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 w-7 h-7 rounded-full flex items-center justify-center">✕</button>
            </div>
            <div className="p-3 border-b border-white/5">
              <input 
                type="text" 
                placeholder="İsim veya Telefon Ara..." 
                autoFocus
                value={rehberArama}
                onChange={(e) => setRehberArama(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-[#8E052C] transition-all"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
              {musteriListesi
                .filter(m => m.gosterim.toLowerCase().includes(rehberArama.toLowerCase()))
                .sort((a, b) => (a.gosterim || "").localeCompare(b.gosterim || "", 'tr'))
                .map((m, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    handleMusteriSec(m);
                    setShowMusteriRehberi(false);
                  }}
                  className="w-full text-left p-2.5 hover:bg-white/5 rounded-xl transition-all border-b border-white/5 last:border-0 flex items-center gap-3 group"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-inner ${m.tip === 'B' ? 'bg-blue-500/20 text-blue-500' : 'bg-orange-500/20 text-orange-500'}`}>
                    {m.tip === 'B' ? '👤' : '🏢'}
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-bold text-xs group-hover:text-[#8E052C] transition-colors">{m.gosterim}</div>
                    <div className="text-gray-500 text-[10px] mt-0.5">{m.phone || 'Telefon Yok'}</div>
                  </div>
                </button>
              ))}
              {musteriListesi.length === 0 && (
                <div className="text-center py-10 text-gray-600 font-bold uppercase text-xs tracking-widest">
                  Müşteri Bulunamadı...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}