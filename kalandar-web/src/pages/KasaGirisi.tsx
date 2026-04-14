import { useState, useEffect } from 'react';
import api from '../api';

const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(142,5,44,0.5); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(142,5,44,0.8); }
`;

export default function KasaGirisi() {
  const [loading, setLoading] = useState(true);
  const [bekleyenIsler, setBekleyenIsler] = useState<any[]>([]);
  const [seciliIslem, setSeciliIslem] = useState<any>(null);

  const [islemTuru, setIslemTuru] = useState('Seçiniz...');
  const [iskonto, setIskonto] = useState<number>(0);
  const [aciklama, setAciklama] = useState('');
  const [manuelTutar, setManuelTutar] = useState<string>(''); 
  const [barkodNo, setBarkodNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [arananMalzeme, setArananMalzeme] = useState<any>(null);
  const [malzemeLoading, setMalzemeLoading] = useState(false);
  const [satisAdedi, setSatisAdedi] = useState<number>(1); 

  const [gecmisAcik, setGecmisAcik] = useState(false);
  const [gecmisVeri, setGecmisVeri] = useState<any[]>([]);
  const [gecmisLoading, setGecmisLoading] = useState(false);

  const randevuDatasiniDagit = (islem: any) => {
    const islemMusteriAdi = islem.customer_name || islem.name || islem.musteri_adi || islem.firma_adi || islem.musteri;
    let musteriAdi = 'Bilinmiyor';
    if (islemMusteriAdi) {
        musteriAdi = islemMusteriAdi.trim().split(' ').map((name: string) => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
    }

    const issueText = islem.issue_text || '';
    let cihazMarkaModel = 'Cihaz Belirtilmemiş';

    if (issueText) {
      if (issueText.includes('🔧 CİHAZ:')) {
        let parca = issueText.split('🔧 CİHAZ:')[1];
        if (parca.includes('📝 NOT:')) parca = parca.split('📝 NOT:')[0];
        cihazMarkaModel = parca.trim();
      } else {
        cihazMarkaModel = issueText.split(' ').slice(0, 4).join(' ');
      }
    }

    const ustaTeklifi = parseFloat(islem.offer_price || islem.price || islem.tahsil_edilen_tutar || 0);
    return { musteriAdi, cihazMarkaModel, ustaTeklifi };
  };

  const servisDatasiniAl = (islem: any) => {
    const musteriAdi = islem.musteri_adi || islem.musteri || islem.customer_name || 'Bilinmiyor';
    const cihazAdi = `${islem.cihaz_tipi || ''} ${islem.marka_model || ''}`.trim();
    return { musteriAdi, cihazMarkaModel: cihazAdi.length > 0 ? cihazAdi : 'Cihaz Belirtilmemiş', ustaTeklifi: parseFloat(islem.offer_price || islem.price || 0) };
  };

  const fetchBekleyenIsler = async () => {
    setLoading(true);
    try {
      const resServis = await api.get('/services/all').catch(() => null);
      let servisListesi = resServis?.data?.data || resServis?.data || [];
      servisListesi = servisListesi.filter((i: any) => (i.status || i.durum || '').toLowerCase() === 'hazır').map((i: any) => ({ ...i, islemTipi: 'SERVİS', servis_no: i.servis_no || i.plaka }));

      const resRandevu = await api.get('/api/appointments/liste/aktif').catch(() => null);
      let randevuListesi = resRandevu?.data?.data || resRandevu?.data || [];
      randevuListesi = randevuListesi.filter((i: any) => (i.status || i.durum || '').toLowerCase() === 'mali onay bekliyor').map((i: any) => ({ ...i, islemTipi: 'RANDEVU' }));

      setBekleyenIsler([...servisListesi, ...randevuListesi]);
    } catch (error) { console.error("Bekleyen işler çekilemedi:", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBekleyenIsler(); }, []);

  const handleBarkodAra = async () => {
    if(!barkodNo) return;
    setMalzemeLoading(true);
    setSatisAdedi(1); 
    try {
      const res = await api.get(`/api/stok/search?barkod=${barkodNo}`);
      if(res.data && res.data.success && res.data.data) {
        setArananMalzeme(res.data.data);
      } else {
        alert("Malzeme bulunamadı!");
        setArananMalzeme(null);
      }
    } catch (e) { 
      console.error(e);
      alert("Sorgulama sırasında bir hata oluştu!"); 
    } finally { 
      setMalzemeLoading(false); 
    }
  };

  const handleGecmisAc = async () => {
    if(!arananMalzeme) return;
    setGecmisAcik(true);
    setGecmisLoading(true);
    try {
      const res = await api.get(`/api/stok/history/${arananMalzeme.id}`);
      if(res.data && res.data.success) {
        setGecmisVeri(res.data.data);
      }
    } catch (error) {
      console.error("Geçmiş çekilemedi", error);
    } finally {
      setGecmisLoading(false);
    }
  };

  const calculateStokBirimFiyati = () => {
    if(!arananMalzeme) return 0;
    const alis = parseFloat(arananMalzeme.alis_fiyati || 0);
    const hamKar = alis * 0.25; 
    const indirim = hamKar * (iskonto / 100); 
    const netKar = hamKar - indirim;
    const araToplam = alis + netKar;
    return araToplam * 1.20; 
  };

  const calculateStokToplamFiyati = () => {
    return calculateStokBirimFiyati() * satisAdedi;
  };

  const handleIslemSec = (islem: any) => {
    setSeciliIslem(islem); setIskonto(0); setManuelTutar(''); setBarkodNo(''); setArananMalzeme(null); setSatisAdedi(1);
    const kayitNo = islem.servis_no || 'Numarasız';
    setAciklama(`${kayitNo} nolu işlem tahsilatı.`);
    if (islem.islemTipi === 'SERVİS') setIslemTuru('Tamir Ücreti Tahsili');
    else if (islem.islemTipi === 'RANDEVU') setIslemTuru('Randevu Geliri Tahsili');
  };

  const handleIslemTuruDegistir = (e: any) => {
    setIslemTuru(e.target.value); setSeciliIslem(null); setIskonto(0); setAciklama(''); setManuelTutar(''); setBarkodNo(''); setArananMalzeme(null); setSatisAdedi(1);
  };

  const { ustaTeklifi } = seciliIslem && (islemTuru === 'Tamir Ücreti Tahsili' || islemTuru === 'Randevu Geliri Tahsili') ? 
                          (seciliIslem.islemTipi === 'RANDEVU' ? randevuDatasiniDagit(seciliIslem) : servisDatasiniAl(seciliIslem)) : 
                          { ustaTeklifi: 0 };
  
  const hamTahsilat = ustaTeklifi * 1.5; 
  const indirimMiktari = hamTahsilat * (iskonto / 100);
  const netTahsilatTutari = hamTahsilat - indirimMiktari;








const handleKaydet = async () => {
    setIsSubmitting(true);
    try {
      if (islemTuru === 'Tamir Ücreti Tahsili' || islemTuru === 'Randevu Geliri Tahsili') {
        if (!seciliIslem) { alert("Lütfen sol taraftan tahsilatı yapılacak bir iş seçin!"); setIsSubmitting(false); return; }
        
        // 🚨 MÜDÜRÜN KASA.JS'SİNE UYGUN ZIRHLI VERİ PAKETİ 🚨
        const payload = { 
          islem_yonu: 'GİRİŞ', // Kasa.js bunu bekliyor
          kategori: islemTuru, 
          tutar: netTahsilatTutari, 
          aciklama: aciklama || `${seciliIslem.servis_no} nolu işlem tahsilatı.`, 
          islem_yapan: 'Banko', 
          baglanti_id: seciliIslem.id, // Kasa.js bunu bekliyor
          servis_no: seciliIslem.servis_no // Kasa.js bunu görünce işi otomatik 'Teslim Edildi' yapacak!
        };
        
        // Tüm tahsilatları tek bir güçlü kapıdan (/add) yolluyoruz
        const res = await api.post('/api/kasa/add', payload);
        
        if (res.data.success) { 
          alert(`✅ Tahsilat başarıyla yapıldı. Kayıt 'Teslim Edildi' yapıldı.`); 
          setSeciliIslem(null); 
          setIslemTuru('Seçiniz...'); 
          fetchBekleyenIsler(); 
        }
      } 
      else if (islemTuru === 'Kasaya Nakit Girişi') {
        if (!manuelTutar || parseFloat(manuelTutar) <= 0) { alert("Geçerli bir tutar girmelisiniz!"); setIsSubmitting(false); return; }
        
        const payload = { 
          islem_yonu: 'GİRİŞ', 
          kategori: 'Kasaya Nakit Girişi', 
          tutar: parseFloat(manuelTutar), 
          aciklama: aciklama || 'Dışarıdan Kasaya Nakit Eklendi', 
          islem_yapan: 'Banko' 
        };
        
        const res = await api.post('/api/kasa/add', payload);
        if (res.data.success) { 
          alert("✅ Kasaya başarıyla manuel para girişi yapıldı."); 
          setManuelTutar(''); 
          setAciklama(''); 
          setIslemTuru('Seçiniz...'); 
        }
      }
      else if (islemTuru === 'Stoktan Ürün Satışı') {
        if (!arananMalzeme) { alert("Lütfen önce barkod okutarak bir malzeme bulunuz!"); setIsSubmitting(false); return; }
        const payload = {
          islem_yonu: 'GİRİŞ',
          kategori: 'Stoktan Ürün Satışı',
          tutar: calculateStokToplamFiyati(), 
          aciklama: aciklama || `${arananMalzeme.malzeme_adi} satışı yapıldı. (${satisAdedi} Adet)`,
          islem_yapan: 'Banko',
          id: arananMalzeme.id, 
          barkod: barkodNo,
          cikan_adet: satisAdedi, 
          manual_discount: iskonto,
          satis_fiyati: calculateStokBirimFiyati() 
        };
        const res = await api.post('/api/stok/sell', payload);
        if (res.data.success) {
          alert(`✅ ${satisAdedi} adet stok satışı başarıyla kasaya işlendi ve stoktan düşüldü.`);
          setBarkodNo(''); setArananMalzeme(null); setAciklama(''); setIskonto(0); setSatisAdedi(1); setIslemTuru('Seçiniz...');
        }
      }
    } catch (error: any) {
      // 🚨 EĞER KASA.JS 'ZARARINA İŞLEM KALKANI'NI ÇALIŞTIRIRSA BURAYA DÜŞER:
      if (error.response && error.response.data && error.response.data.error) { 
        alert(error.response.data.error); 
      } 
      else { alert("İşlem sırasında bir hata oluştu."); }
    } finally { setIsSubmitting(false); }
  };









  const isCihazliIslem = islemTuru === 'Tamir Ücreti Tahsili' || islemTuru === 'Randevu Geliri Tahsili';
  const isStokIslem = islemTuru === 'Stoktan Ürün Satışı';
  const isNakitIslem = islemTuru === 'Kasaya Nakit Girişi';

  return (
    <>
      <style>{scrollbarStyle}</style>
      
      {/* 📊 GEÇMİŞ VE SARFİYAT MODALI */}
      {gecmisAcik && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-[#1A1A1E] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 rounded-t-2xl">
              <div>
                <h2 className="text-white font-black uppercase text-lg flex items-center gap-2">
                  <span className="text-[#8E052C]">📊</span> {arananMalzeme?.malzeme_adi}
                </h2>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Fiyat Değişim ve Kullanım Geçmişi</p>
              </div>
              <button onClick={() => setGecmisAcik(false)} className="w-8 h-8 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold flex items-center justify-center transition-all">✕</button>
            </div>
            
            <div className="p-4 overflow-y-auto nuke-scrollbar flex flex-col gap-4">
              {gecmisLoading ? (
                <div className="text-center py-8 font-black text-gray-500 uppercase tracking-widest text-xs animate-pulse">Kayıtlar Çekiliyor...</div>
              ) : gecmisVeri.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[9px] text-gray-500 uppercase tracking-widest">
                      <th className="pb-2">Tarih</th>
                      <th className="pb-2">Eski Alış</th>
                      <th className="pb-2 text-white">Yeni Alış</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gecmisVeri.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 text-xs text-gray-300 font-medium hover:bg-white/5">
                        <td className="py-2">{new Date(row.degisim_tarihi).toLocaleDateString('tr-TR')}</td>
                        <td className="py-2 text-red-400 font-mono">{parseFloat(row.eski_alis).toFixed(2)} ₺</td>
                        <td className="py-2 text-green-400 font-mono font-black">{parseFloat(row.yeni_alis).toFixed(2)} ₺</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs font-black uppercase tracking-widest">
                  Bu malzemeye ait fiyat değişim kaydı bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🚨 DİYET YAPMIŞ ANA KAPSAYICI (gap-4, p-2) */}
      <div className="flex-1 flex flex-wrap gap-4 h-full overflow-y-auto nuke-scrollbar p-2 relative">
        
        {/* ================= SOL BÖLÜM ================= */}
        <div className="flex-1 min-w-[400px] flex flex-col bg-black/40 border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E052C]/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="p-4 border-b border-white/5 z-10 flex justify-between items-center bg-[#1A1A1E]">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span className="text-[#8E052C]">↙</span> {isStokIslem ? 'MALZEME BİLGİLERİ' : 'TAHSİLAT BEKLEYENLER'}
              </h3>
              <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">
                {isStokIslem ? 'Barkod ile bulunan güncel depo verileri' : 'Hazır Servisler & Onay Bekleyen Randevular'}
              </p>
            </div>
            {!isStokIslem && (
              <button onClick={fetchBekleyenIsler} className="text-[9px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 font-bold uppercase transition-all">Tazele</button>
            )}
          </div>

          {isStokIslem ? (
             arananMalzeme ? (
               <div className="flex-1 overflow-y-auto nuke-scrollbar p-4 flex flex-col gap-4">
                 <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-5 relative shadow-lg">
                   
                   <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-3">
                     <div>
                       <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">MALZEME ADI</p>
                       <h4 className="text-base font-black text-white">{arananMalzeme.malzeme_adi}</h4>
                     </div>
                     <div className="text-right">
                       <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">STOK</p>
                       <span className={`px-2 py-1 rounded-md text-[10px] font-black border ${arananMalzeme.miktar > 0 ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                         {arananMalzeme.miktar} ADET
                       </span>
                     </div>
                   </div>

                   <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                     <div>
                       <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">BİRİM ALIŞ FİYATI</p>
                       <p className="text-xs font-mono font-bold text-gray-300">{parseFloat(arananMalzeme.alis_fiyati || 0).toFixed(2)} ₺</p>
                     </div>
                     
                     <div className="text-right flex flex-col items-end">
                       <p className="text-[9px] text-[#8E052C] font-black uppercase tracking-widest mb-1">TAVSİYE SATIŞ (İSKONTOSUZ)</p>
                       <div className="flex items-center gap-2">
                         <p className="text-base font-mono font-black text-[#8E052C]">
                           {((parseFloat(arananMalzeme.alis_fiyati || 0) + (parseFloat(arananMalzeme.alis_fiyati || 0) * 0.25)) * 1.20).toFixed(2)} ₺
                         </p>
                         <button onClick={handleGecmisAc} className="w-7 h-7 bg-[#8E052C]/20 hover:bg-[#8E052C] border border-[#8E052C]/50 rounded flex items-center justify-center text-white transition-all shadow-md" title="Geçmiş Fiyat ve Sarfiyat Raporu">📊</button>
                       </div>
                     </div>
                   </div>

                   <div className="mt-3">
                     <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">UYUMLU CİHAZLAR</p>
                     <p className="text-[10px] text-gray-400 font-medium italic">{arananMalzeme.uyumlu_cihaz || 'Tüm cihazlar veya belirtilmemiş'}</p>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-sm z-20">
                 <div className="text-4xl mb-3 opacity-50">📦</div>
                 <div className="text-xs font-black text-white uppercase tracking-widest mb-1">MALZEME BEKLENİYOR</div>
                 <div className="text-[9px] text-gray-400 font-bold uppercase">Lütfen sağ taraftaki formdan barkod okutun.</div>
               </div>
             )
          ) : isNakitIslem ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-sm z-20">
               <div className="text-3xl mb-3">🚫</div>
               <div className="text-xs font-black text-white uppercase tracking-widest mb-1">LİSTE KİLİTLİ</div>
               <div className="text-[9px] text-gray-400 font-bold uppercase">"{islemTuru}" işlemi için listeden cihaz seçimi yapılmasına gerek yoktur.</div>
             </div>
          ) : (
            <div className="flex-1 overflow-y-auto nuke-scrollbar p-2 flex flex-col gap-2">
              {loading ? (
                <div className="text-center py-8 font-bold text-gray-500 uppercase tracking-widest text-xs animate-pulse">Kayıtlar Taranıyor...</div>
              ) : bekleyenIsler.length > 0 ? (
                bekleyenIsler.map((islem, idx) => {
                    const { musteriAdi, cihazMarkaModel } = islem.islemTipi === 'RANDEVU' ? randevuDatasiniDagit(islem) : servisDatasiniAl(islem);
                    return (
                        <div key={idx} onClick={() => handleIslemSec(islem)} className={`p-3 rounded-xl cursor-pointer transition-all border ${seciliIslem?.id === islem.id ? 'bg-[#8E052C]/10 border-[#8E052C]/50 shadow-[0_0_15px_rgba(142,5,44,0.1)]' : 'bg-[#1A1A1E] border-white/5 hover:border-white/20 hover:bg-white/5'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs font-black text-white uppercase truncate pr-3">{musteriAdi}</div>
                            {islem.islemTipi === 'RANDEVU' ? (
                              <div className="text-[8px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-black tracking-widest uppercase">RANDEVU</div>
                            ) : (
                              <div className="text-[8px] bg-[#8E052C]/10 text-[#8E052C] border border-[#8E052C]/30 px-2 py-0.5 rounded font-black tracking-widest uppercase shadow-md">SERVİS</div>
                            )}
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <div><div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">SERVİS NO</div><div className="text-[10px] text-[#8E052C]/70 font-mono font-bold">{islem.servis_no ? `#${islem.servis_no}` : 'Yok'}</div></div>
                            <div className="text-right"><div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">CİHAZ</div><div className="text-[10px] text-gray-300 font-bold truncate max-w-[130px]">{cihazMarkaModel}</div></div>
                          </div>
                        </div>
                    )
                })
              ) : (
                <div className="text-center py-8 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Tahsilat bekleyen cihaz yok.</div>
              )}
            </div>
          )}
        </div>

        {/* ================= SAĞ BÖLÜM (DİYETLİ FORM) ================= */}
        <div className="flex-1 min-w-[400px] bg-[#1A1A1E] border border-white/5 flex flex-col rounded-2xl shadow-2xl overflow-hidden relative shrink-0">
          <div className="bg-black/20 p-4 border-b border-white/5 flex items-center justify-between"><h2 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2"><span className="text-[#8E052C] text-xl leading-none">←</span> KASA İŞLEMLERİ V2</h2></div>

          <div className="flex-1 overflow-y-auto nuke-scrollbar p-5 flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">İŞLEM TÜRÜ</label>
              <select value={islemTuru} onChange={handleIslemTuruDegistir} className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold focus:border-[#8E052C] transition-all appearance-none">
                <option value="Seçiniz...">-- Seçiniz --</option>
                <option value="Kasaya Nakit Girişi">Kasaya Nakit Girişi</option>
                <option value="Tamir Ücreti Tahsili">Tamir Ücreti Tahsili</option>
                <option value="Randevu Geliri Tahsili">Randevu Geliri Tahsili</option>
                <option value="Stoktan Ürün Satışı">Stoktan Ürün Satışı</option>
              </select>
            </div>

            {isCihazliIslem && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-[#8E052C] uppercase tracking-widest">HAZIR CİHAZ NUMARASI GİRİN (*)</label>
                  <div className="flex gap-2">
                    <input type="text" readOnly value={seciliIslem?.servis_no || ''} placeholder="Soldan bir iş seçin..." className="flex-1 bg-black/50 border border-[#8E052C]/50 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold" />
                    <button className="bg-[#8E052C] hover:bg-[#8E052C]/80 w-10 rounded-xl flex items-center justify-center text-white text-sm transition-all shadow-md">🔍</button>
                  </div>
                </div>

                <div className="border border-white/10 bg-black/20 rounded-xl p-4 relative mt-1">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#1A1A1E] border border-white/10 px-2 py-0.5 rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest shadow-sm">{seciliIslem?.islemTipi === 'RANDEVU' ? 'RANDEVU VE MÜŞTERİ' : 'CİHAZ VE MÜŞTERİ'}</div>
                  <div className="flex justify-between items-center mb-2 mt-1"><span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Müşteri:</span><span className="text-xs font-black text-white">{seciliIslem ? (seciliIslem.islemTipi === 'RANDEVU' ? randevuDatasiniDagit(seciliIslem).musteriAdi : servisDatasiniAl(seciliIslem).musteriAdi) : '-'}</span></div>
                  <div className="flex justify-between items-center mb-2"><span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cihaz:</span><span className="text-xs font-black text-gray-300">{seciliIslem ? (seciliIslem.islemTipi === 'RANDEVU' ? randevuDatasiniDagit(seciliIslem).cihazMarkaModel : servisDatasiniAl(seciliIslem).cihazMarkaModel) : '-'}</span></div>
                  <div className="flex justify-between items-center mb-4"><span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Usta Teklifi:</span><span className="text-xs font-black text-[#8E052C]">{ustaTeklifi.toFixed(2)} ₺</span></div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">KÂR İSKONTOSU (%)</label>
                    <input type="text" value={iskonto === 0 ? '' : iskonto} onChange={(e) => { let val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10); setIskonto(val > 100 ? 100 : (isNaN(val) ? 0 : val)); }} disabled={!seciliIslem} placeholder="0" className="w-full bg-black/50 border border-yellow-500/30 hover:border-yellow-500/50 rounded-lg px-3 py-2 text-center text-xs text-yellow-500 outline-none font-black focus:ring-1 focus:ring-yellow-500/20 transition-all disabled:opacity-50" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">TAHSİLAT TUTARI (KÂR+KDV DAHİL)</label>
                  <div className="bg-black/50 border border-white/5 rounded-xl p-3 text-center"><span className="text-2xl font-black text-[#8E052C] font-mono tracking-tighter">{netTahsilatTutari.toFixed(2)} ₺</span></div>
                </div>
              </>
            )}

            {isStokIslem && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-[#8E052C] uppercase tracking-widest">BARKOD OKUT VEYA YAZ (*)</label>
                  <div className="flex gap-2">
                    <input type="text" value={barkodNo} onChange={(e) => setBarkodNo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleBarkodAra(); }} placeholder="Barkod..." className="flex-1 bg-black/50 border border-[#8E052C]/50 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold focus:border-[#8E052C]" />
                    <button onClick={handleBarkodAra} className="bg-[#8E052C] hover:bg-[#8E052C]/80 w-10 rounded-xl flex items-center justify-center text-white text-sm transition-all shadow-md">{malzemeLoading ? '⌛' : '🔍'}</button>
                  </div>
                </div>

                {arananMalzeme && (
                  <div className="border border-white/10 bg-black/20 rounded-xl p-4 relative mt-2 animate-in fade-in slide-in-from-top-2">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#1A1A1E] border border-white/10 px-2 py-0.5 rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest shadow-sm">SATIŞ HESABI</div>
                    
                    <div className="flex gap-3 mt-3">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">KÂR İSKONTOSU (%)</label>
                        <input type="text" value={iskonto === 0 ? '' : iskonto} onChange={(e) => { let val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10); setIskonto(val > 100 ? 100 : (isNaN(val) ? 0 : val)); }} placeholder="0" className="w-full bg-black/50 border border-yellow-500/30 rounded-lg px-3 py-2 text-center text-sm text-yellow-500 outline-none font-black transition-all" />
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-sky-500 uppercase tracking-widest text-center">SATIŞ ADEDİ</label>
                        <div className="flex items-center justify-between bg-black/50 border border-sky-500/30 rounded-lg px-1.5 py-0.5">
                          <button onClick={() => setSatisAdedi(Math.max(1, satisAdedi - 1))} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white font-black text-base transition-all">-</button>
                          <input type="text" value={satisAdedi} onChange={(e) => { let val = parseInt(e.target.value.replace(/[^0-9]/g, '') || '1', 10); setSatisAdedi(Math.min(arananMalzeme.miktar, Math.max(1, val))); }} className="w-10 bg-transparent text-center text-sm text-sky-400 font-black outline-none" />
                          <button onClick={() => setSatisAdedi(Math.min(arananMalzeme.miktar, satisAdedi + 1))} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white font-black text-base transition-all">+</button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-[8px] text-gray-500 italic mt-2 text-center border-b border-white/5 pb-2">İskonto %25'lik kâr marjından düşülür. Zarar edilemez.</p>

                    <div className="flex flex-col gap-1.5 mt-3">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center flex justify-center items-center gap-2">
                        SATIŞ TUTARI <span className="text-[7px] bg-white/5 px-1.5 py-0.5 rounded">Birim: {calculateStokBirimFiyati().toFixed(2)} ₺ x {satisAdedi}</span>
                      </label>
                      <div className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-center text-3xl text-[#8E052C] font-mono font-black shadow-inner">
                        {calculateStokToplamFiyati().toFixed(2)} <span className="text-lg">₺</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {isNakitIslem && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">GİRİLECEK TUTAR (₺)</label>
                  <input type="text" value={manuelTutar} onChange={(e) => setManuelTutar(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-4 text-center text-3xl text-[#8E052C] font-mono outline-none font-black focus:border-[#8E052C] transition-all shadow-inner" />
                </div>
              </div>
            )}

            {islemTuru !== 'Seçiniz...' && (
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">İŞLEM AÇIKLAMASI (*)</label>
                <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} disabled={isCihazliIslem && !seciliIslem} rows={2} placeholder={isNakitIslem ? "Örn: Bozuk para tümleme, vb." : "Detay yazınız..."} className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none font-medium focus:border-[#8E052C]/50 transition-all resize-none disabled:opacity-50" />
              </div>
            )}

          </div>

          <div className="p-4 bg-black/20 border-t border-white/5">
            <button onClick={handleKaydet} disabled={islemTuru === 'Seçiniz...' || (isCihazliIslem && !seciliIslem) || (isStokIslem && !arananMalzeme) || isSubmitting} className="w-full bg-[#1A1A1E] hover:bg-[#8E052C] border border-[#8E052C]/50 text-[#8E052C] hover:text-white py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'İşleniyor...' : 'İŞLEMİ ONAYLA VE KAYDET'}
            </button>
          </div>

        </div>

      </div>
    </>
  );
}