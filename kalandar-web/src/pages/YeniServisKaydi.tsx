import { useState, useEffect } from 'react';
import api from '../api'; 

// 🚨 MÜDÜRÜN SCROLLBAR KATİLİ: O çirkin gri çubuğu ve titremeyi yok eder!
const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { display: none; }
  .nuke-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

export default function YeniServisKaydi() {
  // --- MÜDÜRÜN ORİJİNAL FORM STATE'LERİ ---
  const [selectedMusteri, setSelectedMusteri] = useState<any>(null);
  const [selectedCihaz, setSelectedCihaz] = useState<any>(null);
  const [cihazlar, setCihazlar] = useState<any[]>([]);
 
 
  const [arizaNotu, setArizaNotu] = useState('');
  const [atananUsta, setAtananUsta] = useState('Usta 1'); 
  const [isSaving, setIsSaving] = useState(false);
 
  
 
 
 
 
  const [showMusteriRehberi, setShowMusteriRehberi] = useState(false); 
  const [rehberArama, setRehberArama] = useState(''); 

  // --- YEDEK PARÇA (ENVANTER) STATE'LERİ 🚨 YENİ EKLENDİ 🚨 ---
  const [parcaArama, setParcaArama] = useState('');
  const [parcaListesi, setParcaListesi] = useState<any[]>([]);
  const [showParcaList, setShowParcaList] = useState(false);
  const [secilenParcalar, setSecilenParcalar] = useState<any[]>([]);

  // --- MODAL STATES ---
  const [showMusteriList, setShowMusteriList] = useState(false);
  const [showCihazEkleModal, setShowCihazEkleModal] = useState(false);
  const [musteriArama, setMusteriArama] = useState('');
  const [musteriListesi, setMusteriListesi] = useState<any[]>([]);

  // --- YENİ CİHAZ STATE ---
  const [yeniCihaz, setYeniCihaz] = useState({
    cihaz_turu: '', brand: '', model: '', serial_no: '', garanti_durumu: 'Yok', muster_notu: ''
  });

  // --- MÜŞTERİ FONKSİYONLARI ---
  const tumMusterileriGetir = async () => {
    try {
      const [resCust, resFirm] = await Promise.all([
        api.get(`/customers`),
        api.get(`/api/firm/all`) 
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

  useEffect(() => {
    if (musteriArama.length >= 3 && !selectedMusteri) {
      const aramaYap = async () => {
        try {
          const [resCust, resFirm] = await Promise.all([
            api.get(`/customers`),
            api.get(`/api/firm/all`)
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

  const handleMusteriSec = async (m: any) => {
    setSelectedMusteri(m);
    setMusteriArama(m.gosterim);
    setShowMusteriList(false);
    setSelectedCihaz(null); 
    try {
      const backendTipi = m.tip === 'B' ? 'bireysel' : 'kurumsal';
      const res = await api.get(`/devices/customer/${m.id}?type=${backendTipi}`);
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
      const res = await api.post(`/devices`, veri);
      const eklenenCihaz = { id: res.data.id, ...veri };
      setCihazlar([...cihazlar, eklenenCihaz]);
      setSelectedCihaz(eklenenCihaz);
      setShowCihazEkleModal(false);
      alert("Cihaz Kaydedildi.");
    } catch (err) { alert("Cihaz eklenemedi!"); }
  };

  // 🚨 YENİ: ENVANTER (PARÇA) ARAMA FONKSİYONU 🚨
  useEffect(() => {
    if (parcaArama.length >= 3) {
      const parcaAra = async () => {
        try {
          // Senin stok.js içindeki Usta Motorunu tetikliyoruz
          const res = await api.get(`/api/stok/search?malzeme_adi=${parcaArama}`);
          if (res.data && res.data.success && Array.isArray(res.data.data)) {
             setParcaListesi(res.data.data);
             setShowParcaList(true);
          } else {
             setShowParcaList(false);
          }
        } catch (err) {
          console.error("Parça arama hatası:", err);
        }
      };
      // Ufak bir gecikme (debounce) koyalım, her harfte sunucuyu yormasın
      const timeoutId = setTimeout(() => { parcaAra(); }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setShowParcaList(false);
    }
  }, [parcaArama]);

  // 🚨 YENİ: PARÇAYI LİSTEYE EKLEME FONKSİYONU 🚨
  const handleParcaEkle = (parca: any) => {
    // Parça zaten eklenmiş mi kontrol et
    const varMi = secilenParcalar.find(p => p.id === parca.id);
    if (varMi) {
      // Varsa miktarını artır
      setSecilenParcalar(secilenParcalar.map(p => p.id === parca.id ? { ...p, quantity: p.quantity + 1 } : p));
    } else {
      // Yoksa 1 adet olarak ekle
      setSecilenParcalar([...secilenParcalar, { ...parca, quantity: 1 }]);
    }
    setParcaArama(''); // Arama kutusunu temizle
    setShowParcaList(false); // Listeyi kapat
  };

  // 🚨 YENİ: LİSTEDEN PARÇA ÇIKARMA FONKSİYONU 🚨
  const handleParcaCikar = (id: number) => {
    setSecilenParcalar(secilenParcalar.filter(p => p.id !== id));
  };



  const handleSaveService = async () => {
    if (!selectedMusteri) return alert("Müşteri seçmeden iş emri açılamaz!");
    if (!selectedCihaz) return alert("Lütfen arızalı cihazı seçin!");
    if (!arizaNotu.trim()) return alert("Müşterinin şikayetini/arızayı yazmalısın müdür!");

    setIsSaving(true);
    try {
      // 1. ADIM: SADECE SERVİSİ KAYDET VE İÇERİDEN ID NUMARASINI AL
      const isEmriVerisi = {
        device_id: selectedCihaz.id,
        issue_text: arizaNotu,
        atanan_usta: atananUsta,
        musteri_notu: selectedCihaz.muster_notu || '',
        customer_id: selectedMusteri.tip === 'B' ? selectedMusteri.id : null,
        firm_id: selectedMusteri.tip === 'F' ? selectedMusteri.id : null
      };
      
      const res = await api.post(`/services`, isEmriVerisi);
      
      // Backend'den dönen yeni servisin ID'sini yakalıyoruz (Hayati önem taşıyor)
      const yeniServisId = res.data?.id || res.data?.data?.id; 

     
     
      // 2. ADIM: EĞER SEPETTE PARÇA VARSA, YENİ SERVİS ID'Sİ İLE ONLARI DEPOCUYA GÖNDER!
      if (secilenParcalar.length > 0 && yeniServisId) {
        // Bütün seçili parçaları material_requests (Yedek Parça) tablosuna seri ateşliyoruz
        await Promise.all(secilenParcalar.map(p => 
           api.post('/api/material-requests/add', {   // 🚨 ADRES DÜZELTİLDİ (/add eklendi)
              service_id: yeniServisId,
              usta_email: 'Servis Girişi (Patron)', // 🚨 Fotoğraftaki formata uyduruldu
              part_name: p.malzeme_adi,
              quantity: p.quantity,
              description: 'Cihaz kaydı açılırken sepete eklendi' // 🚨 Zorunluysa patlamasın diye not
           })
        ));
      }




      alert(`✅ Kapat Baretleri! İş Emri Açıldı.\nServis No: ${res.data.servis_no || 'Atandı'}`);
      
      // EKRANI SIFIRLAMA
      setSelectedMusteri(null);
      setMusteriArama('');
      setSelectedCihaz(null);
      setCihazlar([]);
      setArizaNotu('');
      setSecilenParcalar([]); // Parça sepetini boşalt
      setParcaArama('');

    } catch (err: any) {
      console.error("Servis Kayıt Hatası:", err);
      alert("Hata: " + (err.response?.data?.error || err.error || err.message || "Servis kaydedilemedi."));
    } finally {
      setIsSaving(false);
    }
  };



/*
  const handleSaveService = async () => {
    if (!selectedMusteri) return alert("Müşteri seçmeden iş emri açılamaz!");
    if (!selectedCihaz) return alert("Lütfen arızalı cihazı seçin!");
    if (!arizaNotu.trim()) return alert("Müşterinin şikayetini/arızayı yazmalısın müdür!");
    // Müdür notu: Şimdilik parça seçimi zorunlu değil, sadece arıza notuyla da iş emri açılabilir.
    // Eğer zorunlu istersen "if (secilenParcalar.length === 0) return alert('Parça seç');" eklersin.

    setIsSaving(true);
    try {
      const isEmriVerisi = {
        device_id: selectedCihaz.id,
        issue_text: arizaNotu,
        atanan_usta: atananUsta,
        musteri_notu: selectedCihaz.muster_notu || '',
        customer_id: selectedMusteri.tip === 'B' ? selectedMusteri.id : null,
        firm_id: selectedMusteri.tip === 'F' ? selectedMusteri.id : null,
        // Seçilen parçaları da backend'e yolluyoruz
        talep_edilen_parcalar: secilenParcalar.map(p => ({
            part_name: p.malzeme_adi,
            quantity: p.quantity,
            barkod: p.barkod
        }))
      };
      const res = await api.post(`/services`, isEmriVerisi);
      alert(`✅ Kapat Baretleri! İş Emri Açıldı.\nServis No: ${res.data.servis_no}`);
      setSelectedMusteri(null);
      setMusteriArama('');
      setSelectedCihaz(null);
      setCihazlar([]);
      setArizaNotu('');
      setSecilenParcalar([]); // Parça sepetini boşalt
    } catch (err: any) {
      console.error("Servis Kayıt Hatası:", err);
      alert("Hata: " + (err.response?.data?.error || err.error || err.message || "Servis kaydedilemedi."));
    } finally {
      setIsSaving(false);
    }
  };

*/









  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex-1 flex flex-col h-full p-2 overflow-hidden relative">
        
        {/* ÜST BİLGİ */}
        <div className="mb-3 px-2">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
            <span>📝</span> SERVİS GİRİŞİ
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Yeni Atölye Form Alanı
          </p>
        </div>

        {/* 🚨 SIKIŞTIRILMIŞ FORM ALANI - nuke-scrollbar eklendi! */}
        <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-5 shadow-2xl flex-1 overflow-y-auto nuke-scrollbar">
          
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              YENİ SERVİS KAYDI
            </h3>
            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
              SERVİS NO : <span className="text-white">OTOMATİK</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 h-[calc(100%-4rem)] justify-between">
            <div className="flex flex-col gap-5">
              
              {/* 1. SATIR: Müşteri Seçimi & Atanan Usta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* MÜŞTERİ SEÇİMİ */}
                <div className="relative flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Müşteri / Firma Seçimi (*)</label>
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
                      className="flex-1 bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none focus:border-[#8E052C]/50 transition-all" 
                    />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        tumMusterileriGetir();
                        setShowMusteriRehberi(true);
                      }}
                      className="bg-[#8E052C] hover:bg-[#A00632] text-white px-4 rounded-xl flex items-center justify-center transition-colors shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </button>
                  </div>

                  {showMusteriList && (
                    <div className="absolute top-full left-0 w-full bg-[#1A1A1E] border border-[#8E052C]/30 mt-1 rounded-xl z-50 shadow-2xl max-h-48 overflow-y-auto nuke-scrollbar">
                      {musteriListesi.map((m, i) => (
                        <button key={i} onMouseDown={() => handleMusteriSec(m)} className="w-full text-left p-3 hover:bg-[#8E052C]/20 text-sm text-white border-b border-white/5 font-semibold flex items-center gap-3">
                           <span className={m.tip === 'B' ? 'text-blue-500' : 'text-orange-500'}>{m.tip === 'B' ? '👤' : '🏢'}</span>
                           {m.gosterim}
                        </button>
                      ))}
                    </div>
                  )}
                </div>




                  {/* ATANAN USTA */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Atanan Usta</label>
                  <div className="relative">
                    <select 
                      value={atananUsta}
                      onChange={(e) => setAtananUsta(e.target.value)}
                      className="w-full bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none appearance-none cursor-pointer focus:border-[#8E052C]/50 transition-all"
                    >
                      {/* Sadece bu seçilebilir */}
                      <option value="Usta 1 " className="bg-[#0F0F12] text-white">Usta 1 </option>
                      
                      {/* Bunlar soluk ve tıklanamaz */}
                      <option value="Usta 2" disabled className="bg-[#0F0F12] text-[#444] italic">Usta 2</option>
                      <option value="Usta 3" disabled className="bg-[#0F0F12] text-[#444] italic">Usta 3</option>
                    </select>
                    
                    {/* Sağdaki aşağı ok ikonu */}
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>


                








              </div>

              {/* 2. SATIR: Cihaz Seçimi & Arıza Notu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* CİHAZ SEÇİMİ */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Cihaz Seçimi (Veya + İle Ekle)</label>
                  <div className="flex gap-2">
                    <select 
                      value={selectedCihaz?.id || ''}
                      onChange={(e) => setSelectedCihaz(cihazlar.find(c => c.id == e.target.value))}
                      className="flex-1 bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white outline-none appearance-none cursor-pointer focus:border-[#8E052C]/50 transition-all"
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
                    <button onClick={() => setShowCihazEkleModal(true)} className="bg-white/5 hover:bg-[#8E052C]/20 border border-white/10 px-4 rounded-xl text-white transition-all text-sm font-black flex items-center justify-center">＋</button>
                  </div>
                </div>

                {/* ARIZA NOTU */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Arıza / Şikayet Detayı (*)</label>
                  <textarea 
                    value={arizaNotu}
                    onChange={(e) => setArizaNotu(e.target.value)}
                    placeholder="Cihazın şikayeti nedir?" 
                    className="w-full bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white resize-none outline-none focus:border-[#8E052C]/50 transition-all h-10"
                  ></textarea>
                </div>

              </div>

              {/* 🚨 YENİ 3. SATIR: YEDEK PARÇA (ENVANTER) TALEBİ 🚨 */}
              <div className="border-t border-white/5 pt-4 mt-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block text-[#8E052C]">🔧 Kullanılacak Parçalar (Envanterden)</label>
                
                {/* Arama Kutusu */}
                <div className="relative mb-3">
                  <input 
                      type="text" 
                      value={parcaArama}
                      onChange={(e) => setParcaArama(e.target.value)}
                      onBlur={() => setTimeout(() => setShowParcaList(false), 200)}
                      placeholder="Envanterde parça ara (En az 3 harf)..." 
                      className="w-full bg-[#0F0F12] border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-sky-400 outline-none focus:border-[#8E052C]/50 transition-all" 
                  />
                  {/* Dropdown Sonuçlar */}
                  {showParcaList && parcaListesi.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-[#1A1A1E] border border-sky-500/30 mt-1 rounded-xl z-50 shadow-2xl max-h-48 overflow-y-auto nuke-scrollbar">
                      {parcaListesi.map((p, i) => (
                        <button 
                           key={i} 
                           onMouseDown={(e) => { e.preventDefault(); handleParcaEkle(p); }} 
                           className="w-full text-left p-3 hover:bg-sky-500/20 text-xs text-white border-b border-white/5 font-semibold flex justify-between items-center"
                        >
                           <div className="flex flex-col">
                             <span>{p.malzeme_adi}</span>
                             <span className="text-[9px] text-gray-500 mt-0.5">Barkod: {p.barkod} | Marka: {p.marka || '-'}</span>
                           </div>
                           <span className="text-sky-400 font-black bg-sky-500/10 px-2 py-1 rounded">Mevcut: {p.miktar}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seçilen Parçalar Sepeti */}
                {secilenParcalar.length > 0 && (
                  <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-3 space-y-2">
                     {secilenParcalar.map((p, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                           <div className="flex flex-col">
                              <span className="text-xs text-white font-bold">{p.malzeme_adi}</span>
                              <span className="text-[9px] text-gray-400 font-mono">{p.barkod}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-xs text-sky-400 font-black">ADET: {p.quantity}</span>
                              <button onClick={() => handleParcaCikar(p.id)} className="text-red-500 hover:text-red-400 font-black text-xs px-2 py-1 bg-red-500/10 rounded">X</button>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
              </div>

            </div>

            {/* KAYDET BUTONU */}
            <button 
              onClick={handleSaveService}
              disabled={isSaving}
              className="mt-4 w-full bg-[#8E052C] hover:bg-[#A00632] text-white font-black text-sm py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-[#8E052C]/20 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSaving ? "KAYDEDİLİYOR..." : <><span>💾</span> SERVİSİ KAYDET</>}
            </button>

          </div>
        </div>

        {/* 🚨 MODALLAR (AYNI KALDI) 🚨 */}
        
        {/* CİHAZ EKLEME MODALI */}
        {showCihazEkleModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-[#0F0F12] border border-[#8E052C]/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-[#8E052C]/10 flex justify-between items-center">
                <h3 className="font-black text-white uppercase text-sm tracking-tighter">YENİ CİHAZ GİRİŞİ</h3>
                <button onClick={() => setShowCihazEkleModal(false)} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-black uppercase ml-1 tracking-widest">Cihaz Türü</label>
                  <select 
                    onChange={(e) => setYeniCihaz({...yeniCihaz, cihaz_turu: e.target.value})} 
                    className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-bold outline-none focus:border-[#8E052C]/50 transition-all"
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
                  <input type="text" placeholder="Marka" onChange={(e) => setYeniCihaz({...yeniCihaz, brand: e.target.value})} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#8E052C]/50 transition-all" />
                  <input type="text" placeholder="Model" onChange={(e) => setYeniCihaz({...yeniCihaz, model: e.target.value})} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#8E052C]/50 transition-all" />
                </div>
                <input type="text" placeholder="Seri Numarası" onChange={(e) => setYeniCihaz({...yeniCihaz, serial_no: e.target.value})} className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#8E052C]/50 transition-all" />
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-black uppercase ml-1 tracking-widest">Garanti Durumu</label>
                  <select 
                    onChange={(e) => setYeniCihaz({...yeniCihaz, garanti_durumu: e.target.value})} 
                    className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-bold outline-none focus:border-[#8E052C]/50 transition-all"
                  >
                    <option value="Yok" className="bg-[#1A1A1E]">Yok</option>
                    <option value="Var (Dükkan)" className="bg-[#1A1A1E]">Var (Dükkan)</option>
                    <option value="Var (Resmi)" className="bg-[#1A1A1E]">Var (Resmi)</option>
                  </select>
                </div>
                <textarea 
                  placeholder="Müşteri Notu / Aksesuar" 
                  onChange={(e) => setYeniCihaz({...yeniCihaz, muster_notu: e.target.value})} 
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white h-20 outline-none resize-none focus:border-[#8E052C]/50 transition-all"
                ></textarea>
              </div>
              <div className="p-4 bg-black/40 flex justify-end gap-3 border-t border-white/5">
                 <button onClick={() => setShowCihazEkleModal(false)} className="text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all px-4">VAZGEÇ</button>
                 <button onClick={cihazKaydet} className="bg-[#8E052C] hover:bg-[#A00632] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg transition-colors">TANIMLA</button>
              </div>
            </div>
          </div>
        )}

        {/* REHBER MODALI */}
        {showMusteriRehberi && (
          <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-[#1A1A1E] border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-full">
              <div className="p-3 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[#8E052C]">👥</span>
                  <h3 className="font-bold text-white text-sm">Müşteri Rehberi</h3>
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
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-[#8E052C]/50 transition-all"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2 nuke-scrollbar">
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
    </>
  ); 
}