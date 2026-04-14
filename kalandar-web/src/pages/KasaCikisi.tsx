import { useState } from 'react';
import api from '../api';

const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(142,5,44,0.5); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(142,5,44,0.8); }
`;

// 🚨 MÜDÜRÜN MİMARİSİ: TypeScript'e bu kablonun (onYönlendir) var olduğunu ve ne işe yaradığını RESMİ olarak tanıtıyoruz!
export default function KasaCikisi({ onYönlendir }: { onYönlendir?: (sayfa: string) => void }) {
  
  const [islemTuru, setIslemTuru] = useState('Seçiniz...');
  const [barkodNo, setBarkodNo] = useState('');
  const [arananMalzeme, setArananMalzeme] = useState<any>(null);
  
  const [manuelTutar, setManuelTutar] = useState<string>(''); 
  const [aciklama, setAciklama] = useState('');
  
  const [alimAdedi, setAlimAdedi] = useState<number>(1); 
  const [guncelAlisFiyati, setGuncelAlisFiyati] = useState<string>(''); 

  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBarkodAra = async () => {
    if (!barkodNo) {
      alert("Lütfen aranacak barkodu girin!");
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/api/stok/search?barkod=${barkodNo}`);
      
      if (res.data && res.data.success && res.data.found) {
        const mal = res.data.data;
        setArananMalzeme(mal);
        setGuncelAlisFiyati(mal.alis_fiyati || '0');
        setAlimAdedi(1);
      } else {
        setArananMalzeme(null);
        alert("🚨 MALZEME KAYITLI DEĞİL!\n\nSistemde bu barkoda ait bir ürün bulunamadı. Sizi yeni kart açmanız için 'Malzeme Girişi' sayfasına yönlendiriyorum.");
        
        // 🚨 AKILLI YÖNLENDİRME BURADA ÇALIŞIYOR
        if (onYönlendir) {
          onYönlendir('MalzemeGirisi');
        } else {
          alert("Yönlendirme kablosu (onYönlendir) Dashboard'dan bağlanmamış!");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Sorgulama sırasında bir hata oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleIslemTuruDegistir = (e: any) => {
    setIslemTuru(e.target.value);
    setArananMalzeme(null);
    setBarkodNo('');
    setManuelTutar('');
    setAciklama('');
    setAlimAdedi(1);
  };

  const handleKaydet = async () => {
    setIsSubmitting(true);
    try {
      if (islemTuru === 'Stok Alımı') {
        if (!arananMalzeme) {
          alert("Lütfen önce barkod okutarak bir malzeme bulunuz!");
          setIsSubmitting(false); return;
        }

        const payload = {
          barkod: arananMalzeme.barkod,
          malzeme_adi: arananMalzeme.malzeme_adi,
          marka: arananMalzeme.marka,
          uyumlu_cihaz: arananMalzeme.uyumlu_cihaz,
          miktar: alimAdedi,
          alis_fiyati: parseFloat(guncelAlisFiyati || '0'),
          fiyat_guncelle: true, 
        };

        const res = await api.post('/api/stok/add', payload);
        
        if (res.data.success) {
          alert(`✅ ${alimAdedi} adet malzeme stoğa eklendi ve tutar kasadan düşüldü.`);
          handleIslemTuruDegistir({ target: { value: 'Seçiniz...' } }); 
        }
      } 
      else {
        if (!manuelTutar || parseFloat(manuelTutar) <= 0) {
          alert("Lütfen geçerli bir çıkış tutarı giriniz!");
          setIsSubmitting(false); return;
        }
        if (!aciklama) {
          alert("Lütfen bu para çıkışı için bir açıklama yazınız!");
          setIsSubmitting(false); return;
        }

        const payload = {
          islem_yonu: 'ÇIKIŞ', 
          kategori: islemTuru,
          tutar: parseFloat(manuelTutar),
          aciklama: aciklama,
          islem_yapan: 'Banko'
        };

        const res = await api.post('/api/kasa/add', payload);
        if (res.data.success) {
          alert(`✅ ${islemTuru} işlemi kasaya başarıyla işlendi.`);
          handleIslemTuruDegistir({ target: { value: 'Seçiniz...' } }); 
        }
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("İşlem sırasında bir hata oluştu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStokIslem = islemTuru === 'Stok Alımı';
  const isSadeIslem = islemTuru === 'Genel Gider Çıkışı' || islemTuru === 'Diğer Giderler' || islemTuru === 'İade / Geri Ödeme';

  return (
    <>
      <style>{scrollbarStyle}</style>
      
      <div className="flex-1 flex flex-wrap gap-4 h-full overflow-y-auto nuke-scrollbar p-2 relative">
        
        {/* ================= SOL BÖLÜM: BİLGİ PANELİ ================= */}
        <div className="flex-1 min-w-[400px] flex flex-col bg-black/40 border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="p-4 border-b border-white/5 z-10 flex justify-between items-center bg-[#1A1A1E]">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span className="text-red-500">↗</span> KASA ÇIKIŞ DETAYLARI
              </h3>
              <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">
                {isStokIslem ? 'Malzeme Stok Girişi ve Maliyeti' : 'Gider ve Para Çıkışı Bilgileri'}
              </p>
            </div>
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
                       <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">MEVCUT STOK</p>
                       <span className="px-2 py-1 rounded-md text-[10px] font-black border bg-sky-500/10 text-sky-400 border-sky-500/30">
                         {arananMalzeme.miktar} ADET
                       </span>
                     </div>
                   </div>

                   <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                     <div>
                       <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">ESKİ BİRİM ALIŞ</p>
                       <p className="text-xs font-mono font-bold text-gray-400">{parseFloat(arananMalzeme.alis_fiyati || 0).toFixed(2)} ₺</p>
                     </div>
                     
                     <div className="text-right">
                       <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mb-1">KASADAN ÇIKACAK TOPLAM</p>
                       <p className="text-lg font-mono font-black text-red-500">
                         {(parseFloat(guncelAlisFiyati || '0') * alimAdedi).toFixed(2)} ₺
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-sm z-20">
                 <div className="text-4xl mb-3 opacity-50">📦</div>
                 <div className="text-xs font-black text-white uppercase tracking-widest mb-1">BARKOD BEKLENİYOR</div>
                 <div className="text-[9px] text-gray-400 font-bold uppercase">Lütfen sağ taraftaki formdan barkod okutun veya yazın.</div>
               </div>
             )
          ) : isSadeIslem ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-sm z-20">
               <div className="text-4xl mb-3 opacity-50">💸</div>
               <div className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">DİREKT NAKİT ÇIKIŞI</div>
               <div className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed max-w-[250px]">
                 Bu işlem envanteri etkilemez. Doğrudan kasadan para çıkışı sağlar. Lütfen sağ taraftan tutar ve açıklama giriniz.
               </div>
             </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-sm z-20">
               <div className="text-3xl mb-3 opacity-30">⚙️</div>
               <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">İŞLEM SEÇİNİZ</div>
             </div>
          )}
        </div>

        {/* ================= SAĞ BÖLÜM: FORM PANELİ ================= */}
        <div className="flex-1 min-w-[400px] bg-[#1A1A1E] border border-white/5 flex flex-col rounded-2xl shadow-2xl overflow-hidden relative shrink-0">
          <div className="bg-black/20 p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <span className="text-red-500 text-xl leading-none">↗</span> KASA ÇIKIŞI İŞLEMLERİ
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto nuke-scrollbar p-5 flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">İŞLEM TÜRÜ</label>
              <select 
                value={islemTuru} 
                onChange={handleIslemTuruDegistir} 
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold focus:border-red-500/50 transition-all appearance-none"
              >
                <option value="Seçiniz...">-- Seçiniz --</option>
                <option value="Genel Gider Çıkışı">Genel Gider Çıkışı</option>
                <option value="Stok Alımı">Stok Alımı</option>
                <option value="Diğer Giderler">Diğer Giderler</option>
                <option value="İade / Geri Ödeme">İade / Geri Ödeme</option>
              </select>
            </div>

            {/* STOK ALIMI FORMU */}
            {isStokIslem && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-red-400 uppercase tracking-widest">BARKOD OKUT VEYA YAZ (*)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={barkodNo} 
                      onChange={(e) => setBarkodNo(e.target.value)} 
                      onKeyDown={(e) => { if (e.key === 'Enter') handleBarkodAra(); }} 
                      placeholder="Barkod..." 
                      className="flex-1 bg-black/50 border border-red-500/30 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold focus:border-red-500 transition-all" 
                    />
                    <button onClick={handleBarkodAra} className="bg-red-500/20 hover:bg-red-500 border border-red-500/50 w-10 rounded-xl flex items-center justify-center text-white text-sm transition-all shadow-md">
                      {isSearching ? '⌛' : '🔍'}
                    </button>
                  </div>
                </div>

                {arananMalzeme && (
                  <div className="border border-white/10 bg-black/20 rounded-xl p-4 relative mt-2 animate-in fade-in slide-in-from-top-2">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#1A1A1E] border border-white/10 px-2 py-0.5 rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest shadow-sm">ALIM DETAYLARI</div>
                    
                    <div className="flex gap-3 mt-3">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">GÜNCEL BİRİM FİYAT (₺)</label>
                        <input 
                          type="text" 
                          value={guncelAlisFiyati} 
                          onChange={(e) => setGuncelAlisFiyati(e.target.value.replace(/[^0-9.]/g, ''))} 
                          placeholder="0.00" 
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-center text-sm text-yellow-500 outline-none font-black transition-all" 
                        />
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-sky-500 uppercase tracking-widest text-center">ALINAN ADET</label>
                        <div className="flex items-center justify-between bg-black/50 border border-sky-500/30 rounded-lg px-1.5 py-0.5">
                          <button onClick={() => setAlimAdedi(Math.max(1, alimAdedi - 1))} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white font-black text-base transition-all">-</button>
                          <input type="text" value={alimAdedi} onChange={(e) => { let val = parseInt(e.target.value.replace(/[^0-9]/g, '') || '1', 10); setAlimAdedi(Math.max(1, val)); }} className="w-10 bg-transparent text-center text-sm text-sky-400 font-black outline-none" />
                          <button onClick={() => setAlimAdedi(alimAdedi + 1)} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white font-black text-base transition-all">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SADE FORMLAR (Giderler ve İade) */}
            {isSadeIslem && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">ÇIKACAK TUTAR (₺)</label>
                  <input 
                    type="text" 
                    value={manuelTutar} 
                    onChange={(e) => setManuelTutar(e.target.value.replace(/[^0-9.]/g, ''))} 
                    placeholder="0.00" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-4 text-center text-3xl text-red-500 font-mono outline-none font-black focus:border-red-500 transition-all shadow-inner" 
                  />
                </div>
              </div>
            )}

            {/* AÇIKLAMA (Hepsi için geçerli) */}
            {islemTuru !== 'Seçiniz...' && (
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">İŞLEM AÇIKLAMASI (*)</label>
                <textarea 
                  value={aciklama} 
                  onChange={(e) => setAciklama(e.target.value)} 
                  rows={2} 
                  placeholder={isStokIslem ? "Örn: Toptancıdan mal alımı vb." : "Gider veya iade detayı yazınız..."} 
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none font-medium focus:border-red-500/50 transition-all resize-none" 
                />
              </div>
            )}

          </div>

          <div className="p-4 bg-black/20 border-t border-white/5">
            <button 
              onClick={handleKaydet} 
              disabled={islemTuru === 'Seçiniz...' || (isStokIslem && !arananMalzeme) || isSubmitting} 
              className="w-full bg-[#1A1A1E] hover:bg-red-600 border border-red-500/50 text-red-500 hover:text-white py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'İşleniyor...' : 'KASADAN ÇIKIŞ YAP'}
            </button>
          </div>

        </div>

      </div>
    </>
  );
}