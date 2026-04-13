import { useState, useEffect } from 'react';
import api from '../api';

const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { display: none; }
  .nuke-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

export default function YedekParcaTakibi() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState('');

  const [showEkleModal, setShowEkleModal] = useState(false);
  const [showDuzenleModal, setShowDuzenleModal] = useState(false);
  
  const [showTeklifModal, setShowTeklifModal] = useState(false);
  const [aktifServisForTeklif, setAktifServisForTeklif] = useState<any>(null);
  
  // 🚨 MÜDÜR: State'i string yapıp içini BOŞ bıraktık. O gıcık sıfır artık yok!
  const [yeniTeklifMiktari, setYeniTeklifMiktari] = useState<number | string>('');
  
  const [musteriOnayTik, setMusteriOnayTik] = useState(false);

  const [aktifServisId, setAktifServisId] = useState<number | null>(null);
  const [aktifParca, setAktifParca] = useState<any>(null);

  const [parcaArama, setParcaArama] = useState('');
  const [parcaListesi, setParcaListesi] = useState<any[]>([]);
  const [secilenYeniParca, setSecilenYeniParca] = useState<any>(null);
  const [yeniAdet, setYeniAdet] = useState(1);
  const [yeniNot, setYeniNot] = useState('');

  const [duzenleAdet, setDuzenleAdet] = useState(1);
  const [duzenleFiyat, setDuzenleFiyat] = useState(0);
  const [duzenleNot, setDuzenleNot] = useState('');
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);

  const fetchTalepler = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/material-requests/takip-listesi');
      if (res.data && res.data.success) {
        const rawData = Array.isArray(res.data.data) ? res.data.data : [];
        const gruplanmis = rawData.reduce((acc: any, item: any) => {
          const key = item.gercek_servis_no || item.service_id; 
          if (!acc[key]) {
            acc[key] = {
              gosterim_no: key, 
              db_service_id: item.service_id, 
              teklif: item.teklif_fiyati || 0,
              parcalar: [],
              toplam_maliyet: 0,
              durum: item.status || 'BEKLEMEDE',
              orijinal_id: item.id
            };
          }
          acc[key].parcalar.push(item);
          const fiyat = parseFloat(item.price || 0);
          const miktar = parseInt(item.quantity || 1);
          acc[key].toplam_maliyet += fiyat * miktar;
          return acc;
        }, {});
        const gruplarArray = Object.values(gruplanmis) as any[];
        gruplarArray.sort((a, b) => b.orijinal_id - a.orijinal_id);
        setTalepler(gruplarArray);
      }
    } catch (error) {
      console.error("Talepler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTalepler(); }, []);

  useEffect(() => {
    if (parcaArama.length >= 3) {
      const aramaYap = async () => {
        try {
          const res = await api.get(`/api/stok/search?malzeme_adi=${parcaArama}`);
          if (res.data && res.data.success && Array.isArray(res.data.data)) {
            setParcaListesi(res.data.data);
          } else {
            setParcaListesi([]);
          }
        } catch (err) { console.error("Arama hatası", err); }
      };
      const timeoutId = setTimeout(() => { aramaYap(); }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setParcaListesi([]);
    }
  }, [parcaArama]);

  const openTeklifModal = (servis: any) => {
    setAktifServisForTeklif(servis);
    // 🚨 MÜDÜR: Ekranı açarken kutuyu tertemiz yapıyoruz.
    setYeniTeklifMiktari(''); 
    setMusteriOnayTik(false);
    setShowTeklifModal(true);
  };

  const handleTeklifYukselt = async () => {
    const eskiTeklif = parseFloat(aktifServisForTeklif.teklif) || 0;
    const girilenTeklif = parseFloat(String(yeniTeklifMiktari)) || 0;
    
    if (girilenTeklif <= eskiTeklif) {
      return alert(`Müdürüm, racona ters! Yeni teklif (${girilenTeklif} ₺) eskisi olan ${eskiTeklif} ₺'den BÜYÜK olmalı.`);
    }

    if (!musteriOnayTik) {
      return alert("Müşteriye bilgi verilmeden kilit açılamaz!");
    }

    setIslemYapiliyor(true);
    try {
      await api.put('/api/appointments/update-teklif', {
        servis_no: aktifServisForTeklif.gosterim_no,
        yeni_teklif: girilenTeklif
      });
      
      alert("🚀 TEKLİF GÜNCELLENDİ! Kilitler Açıldı, Işıklar Yandı!");
      setShowTeklifModal(false);
      fetchTalepler(); 
    } catch (err) {
      alert("Hata oluştu, kilit açılamadı.");
    } finally {
      setIslemYapiliyor(false);
    }
  };

  const handleParcaIlaveEt = async () => {
    if (!secilenYeniParca || !aktifServisId) return alert("Parça seçilmedi!");
    setIslemYapiliyor(true);
    try {
      await api.post('/api/material-requests/add', {
        service_id: aktifServisId,
        usta_email: 'Merkez (Patron)', 
        part_name: secilenYeniParca.malzeme_adi,
        quantity: yeniAdet,
        description: yeniNot
      });
      alert("✅ Parça servise başarıyla ilave edildi!");
      setShowEkleModal(false);
      setSecilenYeniParca(null);
      setParcaArama('');
      setYeniAdet(1);
      setYeniNot('');
      fetchTalepler(); 
    } catch (err) {
      alert("Hata oluştu, parça eklenemedi.");
    } finally {
      setIslemYapiliyor(false);
    }
  };

  const handleParcaGuncelle = async () => {
    if (!aktifParca) return;
    setIslemYapiliyor(true);
    try {
      await api.put(`/api/material-requests/guncelle/${aktifParca.id}`, {
        quantity: duzenleAdet,
        price: duzenleFiyat,
        description: duzenleNot,
        part_name: aktifParca.part_name 
      });
      alert("💾 Parça bilgileri güncellendi!");
      setShowDuzenleModal(false);
      fetchTalepler();
    } catch (err) {
      alert("Hata: Parça güncellenemedi.");
    } finally {
      setIslemYapiliyor(false);
    }
  };

  const handleParcaSil = async () => {
    if (!aktifParca) return;
    const onay = window.confirm(`DİKKAT! "${aktifParca.part_name}" parçasını bu servisten tamamen silmek istediğinize emin misiniz?`);
    if (!onay) return;
    
    setIslemYapiliyor(true);
    try {
      await api.delete(`/api/material-requests/sil/${aktifParca.id}`);
      alert("🗑️ Parça listeden silindi.");
      setShowDuzenleModal(false);
      fetchTalepler();
    } catch (err) {
      alert("Hata: Parça silinemedi.");
    } finally {
      setIslemYapiliyor(false);
    }
  };

  const openDuzenleModal = (parca: any) => {
    setAktifParca(parca);
    setDuzenleAdet(parca.quantity || 1);
    setDuzenleFiyat(parca.price || 0);
    setDuzenleNot(parca.description || '');
    setShowDuzenleModal(true);
  };

  const filtrelenmis = talepler.filter(t => 
    String(t.gosterim_no).includes(arama) || 
    t.parcalar.some((p: any) => (p.description || '').toLowerCase().includes(arama.toLowerCase()) || (p.part_name || '').toLowerCase().includes(arama.toLowerCase()) || (p.barkod || '').toLowerCase().includes(arama.toLowerCase()))
  );

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 relative">
        
        <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-5 mb-6 shadow-2xl shrink-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
              <span className="text-[#8E052C]">📦</span> PATRON PARÇA YÖNETİMİ
            </h2>
            <button onClick={fetchTalepler} className="bg-white/5 hover:bg-[#8E052C]/20 px-4 py-2 rounded-xl text-xs font-black transition-all border border-white/10">
              🔄 LİSTEYİ TAZELE
            </button>
          </div>
          <input 
            type="text" 
            placeholder="Servis ID, Parça veya Barkod Ara..." 
            className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#8E052C]/50"
            onChange={(e) => setArama(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 nuke-scrollbar pb-20">
          {loading ? (
            <div className="text-center py-20 font-black uppercase text-gray-500 animate-pulse">Kayıtlar Çekiliyor...</div>
          ) : filtrelenmis.map((servis, i) => {
            const isFinished = (servis.durum || '').toLowerCase() === 'geldi';

            return (
              <div key={i} className={`rounded-3xl border transition-all overflow-hidden ${isFinished ? 'bg-black/20 border-white/5 opacity-80' : 'bg-[#1A1A1E] border-white/10 shadow-xl'}`}>
                
                <div className="bg-white/5 px-6 py-5 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-black tracking-widest">KAYITLI SERVİS NO</span>
                      <span className="text-2xl font-black text-[#8E052C]">#{servis.gosterim_no}</span>
                    </div>
                    <div className="h-10 w-px bg-white/10 mx-2"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-black tracking-widest block">DEPO MALİYETİ</span>
                      <span className="text-xl font-black text-green-500 font-mono">
                        {servis.toplam_maliyet > 0 ? `₺${servis.toplam_maliyet.toFixed(2)}` : '₺0.00'}
                      </span>
                    </div>
                    <div className="h-10 w-px bg-white/10 mx-2"></div>
                    
                    <div className="flex flex-col group cursor-pointer" onClick={() => openTeklifModal(servis)}>
                      <span className="text-[10px] text-sky-500 font-black tracking-widest block flex items-center gap-1 group-hover:text-yellow-400 transition-colors">
                        USTA TEKLİFİ <span className="text-xs opacity-0 group-hover:opacity-100">✏️</span>
                      </span>
                      <span className="text-xl font-black text-white font-mono group-hover:text-yellow-400 transition-colors border-b-2 border-dashed border-transparent group-hover:border-yellow-400/50">
                        {servis.teklif > 0 ? `₺${parseFloat(servis.teklif).toFixed(2)}` : <span className="text-gray-500 text-sm">FİYAT GİRİLMEDİ</span>}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setAktifServisId(servis.db_service_id); setShowEkleModal(true); }}
                      className="bg-sky-500/10 hover:bg-sky-500 border border-sky-500/30 hover:border-sky-500 text-sky-500 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg"
                    >
                      <span className="text-sm">+</span> PARÇA İLAVE ET
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2.5 flex items-start sm:items-center gap-3">
                  <span className="text-yellow-500 text-sm mt-0.5 sm:mt-0">⚠️</span>
                  <p className="text-[9px] text-yellow-500/80 font-black uppercase tracking-widest leading-relaxed m-0">
                    <strong className="text-yellow-500 mr-1">ÖNEMLİ BİLGİ:</strong> 
                    Bu ekrandan yapılan parça İlave veya İptal işlemleri fiziksel stok sayısını DEĞİŞTİRMEZ. Stok artış veya azalışlarını lütfen Mobil Uygulamadaki <span className="text-white border-b border-white/20 pb-0.5">Envanter İşlemleri ➔ Stok Giriş / Çıkış</span> menüsünden yapınız.
                  </p>
                </div>

                <div className="p-5 bg-black/10">
                  <div className="grid grid-cols-1 gap-3">
                    {servis.parcalar.map((p: any, pi: number) => {
                      const parcaGeldimi = (p.status || '').toLowerCase() === 'geldi';
                      return (
                        <div key={pi} className="flex flex-col bg-[#0F0F12] p-4 rounded-2xl border border-white/5 relative group">
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-xs font-black text-gray-400">{pi + 1}</div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm font-black uppercase tracking-wider ${parcaGeldimi ? 'text-green-500' : 'text-white'}`}>
                                    {p.part_name}
                                  </span>
                                  {parcaGeldimi && <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-green-500/20">✅ GELDİ</span>}
                                  {!parcaGeldimi && <span className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-orange-500/20">⏳ BEKLİYOR</span>}
                                  
                                  {p.barkod && (
                                    <div className="bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded text-xs font-bold font-mono text-sky-400 flex items-center gap-1.5 ml-2">
                                      <span className="text-xs">🎫</span> {p.barkod}
                                    </div>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-500 font-black mt-1 uppercase tracking-widest">MİKTAR: <span className="text-gray-300">{p.quantity} ADET</span></div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-sm font-black text-gray-300 font-mono">
                                {p.price ? `B.Fiyat: ₺${parseFloat(p.price).toFixed(2)}` : 'Fiyat Yok'}
                              </div>
                              <button 
                                onClick={() => openDuzenleModal(p)}
                                className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2"
                              >
                                ⚙️ DÜZENLE
                              </button>
                            </div>
                          </div>

                          {p.description && p.description.trim() !== '' && (
                            <div className="mt-3 ml-12 bg-black/30 border-l-2 border-[#8E052C]/50 pl-3 py-1.5 rounded-r-lg inline-block">
                              <span className="text-[10px] text-[#8E052C] font-black uppercase tracking-widest mr-2">NOT:</span>
                              <span className="text-xs text-gray-300 italic">{p.description}</span>
                            </div>
                          )}

                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showTeklifModal && aktifServisForTeklif && (
          <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1A1A1E] border-2 border-yellow-500/30 w-full max-w-sm rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.15)] overflow-hidden flex flex-col relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
              
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-yellow-500/5">
                <h3 className="font-black text-white uppercase text-sm tracking-widest flex items-center gap-2">
                  <span className="text-yellow-500 text-lg">💰</span> TEKLİF GÜNCELLE
                </h3>
                <button onClick={() => setShowTeklifModal(false)} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center bg-black/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-500 font-black tracking-widest">MEVCUT TEKLİF:</span>
                  <span className="text-sm font-black text-gray-400 font-mono line-through decoration-red-500">
                    ₺{parseFloat(aktifServisForTeklif.teklif).toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] text-yellow-500 font-black uppercase tracking-widest ml-1 mb-2 block">YENİ YÜKSEK TEKLİF (₺)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={yeniTeklifMiktari} 
                    onChange={(e) => setYeniTeklifMiktari(e.target.value)} 
                    placeholder="Yeni teklifi girin..."
                    className="w-full bg-[#0F0F12] border-2 border-yellow-500/30 rounded-xl py-4 px-4 text-2xl text-white outline-none font-black text-center focus:border-yellow-500 transition-colors shadow-inner" 
                  />
                  {(parseFloat(String(yeniTeklifMiktari)) || 0) <= parseFloat(aktifServisForTeklif.teklif) && yeniTeklifMiktari !== '' && (
                    <p className="text-[9px] text-red-500 font-black mt-2 text-center uppercase tracking-widest">
                      * Yeni teklif eskisi ile aynı veya daha düşük olamaz!
                    </p>
                  )}
                </div>

                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${musteriOnayTik ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  onClick={() => setMusteriOnayTik(!musteriOnayTik)}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${musteriOnayTik ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                    {musteriOnayTik && <span className="text-white text-xs font-black">✓</span>}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${musteriOnayTik ? 'text-green-500' : 'text-gray-400'}`}>
                    MÜŞTERİYE BİLGİ VERİLDİ VE YENİ FİYAT ONAYI ALINDI
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-black/40 flex justify-between gap-3 border-t border-white/5">
                <button onClick={() => setShowTeklifModal(false)} className="text-gray-500 font-bold uppercase text-[10px] hover:text-white px-4">İPTAL</button>
                <button 
                  onClick={handleTeklifYukselt} 
                  disabled={islemYapiliyor || !musteriOnayTik || (parseFloat(String(yeniTeklifMiktari)) || 0) <= parseFloat(aktifServisForTeklif.teklif)} 
                  className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {islemYapiliyor ? 'KAYDEDİLİYOR...' : '🔓 KİLİDİ AÇ VE KAYDET'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showEkleModal && (
          <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1A1A1E] border border-sky-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5 bg-sky-500/10 flex justify-between items-center">
                <h3 className="font-black text-white uppercase text-sm tracking-widest flex items-center gap-2"><span className="text-sky-500">+</span> PARÇA İLAVE ET</h3>
                <button onClick={() => {setShowEkleModal(false); setSecilenYeniParca(null);}} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
              <div className="p-5 space-y-4">
                <div className="relative">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-1 block">Depodan Parça Ara (3 Harf)</label>
                  <input 
                    type="text" value={parcaArama} onChange={(e) => setParcaArama(e.target.value)}
                    placeholder="Örn: EKR, BAT..." 
                    className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:border-sky-500/50 transition-all"
                  />
                  {parcaListesi.length > 0 && !secilenYeniParca && (
                    <div className="absolute top-full left-0 w-full bg-[#27272A] border border-sky-500/30 mt-1 rounded-xl z-50 max-h-40 overflow-y-auto nuke-scrollbar shadow-2xl">
                      {parcaListesi.map((p, i) => (
                        <button key={i} onClick={() => setSecilenYeniParca(p)} className="w-full text-left p-3 hover:bg-sky-500/20 text-xs text-white border-b border-white/5 font-bold flex justify-between">
                          <span>{p.malzeme_adi}</span>
                          <span className="text-sky-400">Stok: {p.miktar}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {secilenYeniParca && (
                  <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl">
                    <div className="text-sky-400 font-black text-sm uppercase">{secilenYeniParca.malzeme_adi}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-1">Barkod: {secilenYeniParca.barkod || 'Yok'}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-1 block">Eklenecek Adet</label>
                    <input type="number" min="1" value={yeniAdet} onChange={(e) => setYeniAdet(Number(e.target.value))} className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none font-black text-center" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-1 block">Patron Notu (İsteğe Bağlı)</label>
                  <textarea value={yeniNot} onChange={(e) => setYeniNot(e.target.value)} className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none resize-none h-16" placeholder="Örn: Müşteri onayı alındı..."></textarea>
                </div>
              </div>
              <div className="p-4 bg-black/40 flex justify-end gap-3 border-t border-white/5">
                <button onClick={() => setShowEkleModal(false)} className="text-gray-500 font-bold uppercase text-[10px] hover:text-white px-4">VAZGEÇ</button>
                <button onClick={handleParcaIlaveEt} disabled={!secilenYeniParca || islemYapiliyor} className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase disabled:opacity-50">LİSTEYE EKLE</button>
              </div>
            </div>
          </div>
        )}

        {showDuzenleModal && aktifParca && (
          <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1A1A1E] border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-black text-white uppercase text-sm tracking-widest flex items-center gap-2">⚙️ PARÇA YÖNETİMİ</h3>
                <button onClick={() => setShowDuzenleModal(false)} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <div className="text-white font-black text-base uppercase">{aktifParca.part_name}</div>
                  {aktifParca.barkod && <div className="text-[10px] text-gray-500 font-mono mt-1">{aktifParca.barkod}</div>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-1 block">Adet</label>
                    <input type="number" min="1" value={duzenleAdet} onChange={(e) => setDuzenleAdet(Number(e.target.value))} className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none font-black text-center focus:border-[#8E052C]/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-1 flex justify-between">
                      <span>Birim Fiyat (₺)</span>
                    </label>
                    <input type="number" step="0.01" value={duzenleFiyat} onChange={(e) => setDuzenleFiyat(Number(e.target.value))} className="w-full bg-[#0F0F12] border border-[#8E052C]/30 rounded-xl py-2.5 px-3 text-sm text-white outline-none font-black text-center focus:border-[#8E052C]" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-1 block">Not / Açıklama</label>
                  <textarea value={duzenleNot} onChange={(e) => setDuzenleNot(e.target.value)} className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none resize-none h-16 focus:border-[#8E052C]/50"></textarea>
                </div>
              </div>
              
              <div className="p-4 bg-black/40 flex justify-between items-center border-t border-white/5">
                <button onClick={handleParcaSil} disabled={islemYapiliyor} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                  🗑️ İPTAL ET
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setShowDuzenleModal(false)} className="text-gray-500 font-bold uppercase text-[10px] hover:text-white px-3">VAZGEÇ</button>
                  <button onClick={handleParcaGuncelle} disabled={islemYapiliyor} className="bg-[#8E052C] hover:bg-[#A00632] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">💾 KAYDET</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}