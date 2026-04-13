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

  // 🧠 RANDEVU ÇUVALINI YIRTIP CİHAZI ÇIKARAN PARSER (TEMBELLİK İPTAL!)
  const randevuDatasiniDagit = (islem: any) => {
    const islemMusteriAdi = islem.customer_name || islem.name || islem.musteri_adi || islem.firma_adi || islem.musteri;
    let musteriAdi = 'Bilinmiyor';
    if (islemMusteriAdi) {
        musteriAdi = islemMusteriAdi.trim().split(' ').map((name: string) => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
    }

    const issueText = islem.issue_text || '';
    let cihazMarkaModel = 'Cihaz Belirtilmemiş';

    // 🚨 Çuvalın içindeki 🔧 CİHAZ ile 📝 NOT arasını cımbızla çekiyoruz!
    if (issueText) {
      if (issueText.includes('🔧 CİHAZ:')) {
        let parca = issueText.split('🔧 CİHAZ:')[1];
        if (parca.includes('📝 NOT:')) {
          parca = parca.split('📝 NOT:')[0];
        }
        cihazMarkaModel = parca.trim();
      } else {
        // Eğer ikon falan yoksa düz metinse ilk birkaç kelimeyi al
        cihazMarkaModel = issueText.split(' ').slice(0, 4).join(' ');
      }
    }

    const ustaTeklifi = parseFloat(islem.offer_price || islem.price || islem.tahsil_edilen_tutar || 0);
    return { musteriAdi, cihazMarkaModel, ustaTeklifi };
  };

  const servisDatasiniAl = (islem: any) => {
    const musteriAdi = islem.musteri_adi || islem.musteri || islem.customer_name || 'Bilinmiyor';
    const cihazAdi = `${islem.cihaz_tipi || ''} ${islem.marka_model || ''}`.trim();
    return {
        musteriAdi,
        cihazMarkaModel: cihazAdi.length > 0 ? cihazAdi : 'Cihaz Belirtilmemiş',
        ustaTeklifi: parseFloat(islem.offer_price || islem.price || 0)
    };
  };

  const fetchBekleyenIsler = async () => {
    setLoading(true);
    try {
      const resServis = await api.get('/services/all').catch(() => null);
      let servisListesi = resServis?.data?.data || resServis?.data || [];
      servisListesi = servisListesi
        .filter((i: any) => (i.status || i.durum || '').toLowerCase() === 'hazır')
        .map((i: any) => ({ ...i, islemTipi: 'SERVİS', servis_no: i.servis_no || i.plaka }));

      const resRandevu = await api.get('/api/appointments/liste/aktif').catch(() => null);
      let randevuListesi = resRandevu?.data?.data || resRandevu?.data || [];
      randevuListesi = randevuListesi
        .filter((i: any) => (i.status || i.durum || '').toLowerCase() === 'mali onay bekliyor')
        .map((i: any) => ({ ...i, islemTipi: 'RANDEVU' }));

      setBekleyenIsler([...servisListesi, ...randevuListesi]);
    } catch (error) {
      console.error("Bekleyen işler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBekleyenIsler();
  }, []);

  const handleIslemSec = (islem: any) => {
    setSeciliIslem(islem);
    setIskonto(0);
    setManuelTutar('');
    setBarkodNo('');
    
    const kayitNo = islem.servis_no || 'Numarasız';
    setAciklama(`${kayitNo} nolu işlem tahsilatı.`);

    if (islem.islemTipi === 'SERVİS') {
      setIslemTuru('Tamir Ücreti Tahsili');
    } else if (islem.islemTipi === 'RANDEVU') {
      setIslemTuru('Randevu Geliri Tahsili');
    }
  };

  const handleIslemTuruDegistir = (e: any) => {
    const secilen = e.target.value;
    setIslemTuru(secilen);
    setSeciliIslem(null);
    setIskonto(0);
    setAciklama('');
    setManuelTutar('');
    setBarkodNo(''); 
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
        if (!seciliIslem) {
          alert("Lütfen sol taraftan tahsilatı yapılacak bir iş seçin!");
          setIsSubmitting(false); return;
        }

        const payload = {
          id: seciliIslem.id,
          servis_no: seciliIslem.servis_no,
          kategori: islemTuru,
          tutar: netTahsilatTutari,
          aciklama: aciklama,
          islem_yapan: 'Banko',
          new_status: 'Teslim Edildi'
        };

        const endpoint = seciliIslem.islemTipi === 'RANDEVU' ? '/api/kasa/banko-tahsilat' : '/api/kasa/process';
        const res = await api.post(endpoint, payload);
        
        if (res.data.success) {
          alert(`✅ Tahsilat başarıyla yapıldı. ${seciliIslem.islemTipi} kaydı 'Teslim Edildi' yapıldı.`);
          setSeciliIslem(null);
          setIslemTuru('Seçiniz...');
          fetchBekleyenIsler(); 
        }
      } 
      else if (islemTuru === 'Kasaya Nakit Girişi') {
        if (!manuelTutar || parseFloat(manuelTutar) <= 0) {
          alert("Geçerli bir tutar girmelisiniz!");
          setIsSubmitting(false); return;
        }
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
          setManuelTutar(''); setAciklama(''); setIslemTuru('Seçiniz...');
        }
      }
      else if (islemTuru === 'Stoktan Ürün Satışı') {
        alert("Müdürüm, Stoktan Satış rotası hazır olduğunda burası çalışacak!");
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else { alert("İşlem sırasında bir hata oluştu."); }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCihazliIslem = islemTuru === 'Tamir Ücreti Tahsili' || islemTuru === 'Randevu Geliri Tahsili';
  const isStokIslem = islemTuru === 'Stoktan Ürün Satışı';
  const isNakitIslem = islemTuru === 'Kasaya Nakit Girişi';

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex-1 flex gap-6 h-full overflow-hidden p-2 relative">
        
        {/* ================= SOL BÖLÜM ================= */}
        <div className="w-[500px] flex flex-col bg-black/40 border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E052C]/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="p-5 border-b border-white/5 z-10 flex justify-between items-center bg-[#1A1A1E]">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span className="text-[#8E052C]">↙</span> TAHSİLAT BEKLEYENLER
              </h3>
              <p className="text-[9px] text-gray-500 uppercase font-black mt-1">Hazır Servisler & Onay Bekleyen Randevular</p>
            </div>
            <button onClick={fetchBekleyenIsler} className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 font-bold uppercase transition-all">
              Tazele
            </button>
          </div>

          {(isStokIslem || isNakitIslem) ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/60 backdrop-blur-sm z-20">
               <div className="text-4xl mb-4">🚫</div>
               <div className="text-sm font-black text-white uppercase tracking-widest mb-2">LİSTE KİLİTLİ</div>
               <div className="text-[10px] text-gray-400 font-bold uppercase">
                 "{islemTuru}" işlemi için listeden cihaz seçimi yapılmasına gerek yoktur. Lütfen sağ taraftaki formu doldurun.
               </div>
             </div>
          ) : (
            <div className="flex-1 overflow-y-auto nuke-scrollbar p-3 flex flex-col gap-2">
              {loading ? (
                <div className="text-center py-10 font-bold text-gray-500 uppercase tracking-widest text-xs animate-pulse">Kayıtlar Taranıyor...</div>
              ) : bekleyenIsler.length > 0 ? (
                bekleyenIsler.map((islem, idx) => {
                    const { musteriAdi, cihazMarkaModel } = islem.islemTipi === 'RANDEVU' ? randevuDatasiniDagit(islem) : servisDatasiniAl(islem);
                    return (
                        <div 
                          key={idx} 
                          onClick={() => handleIslemSec(islem)}
                          className={`p-4 rounded-xl cursor-pointer transition-all border ${seciliIslem?.id === islem.id ? 'bg-[#8E052C]/10 border-[#8E052C]/50 shadow-[0_0_15px_rgba(142,5,44,0.1)]' : 'bg-[#1A1A1E] border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs font-black text-white uppercase truncate pr-4">{musteriAdi}</div>
                            
                            {islem.islemTipi === 'RANDEVU' ? (
                              <div className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-black tracking-widest uppercase">RANDEVU</div>
                            ) : (
                              <div className="text-[9px] bg-[#8E052C]/10 text-[#8E052C] border border-[#8E052C]/30 px-2 py-0.5 rounded font-black tracking-widest uppercase shadow-md">SERVİS</div>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-end mt-3">
                            <div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">SERVİS NO</div>
                              <div className="text-xs text-[#8E052C]/70 font-mono font-bold">{islem.servis_no ? `#${islem.servis_no}` : 'Yok'}</div>
                            </div>
                            <div className="text-right">
                              {/* 🚨 BUSTED: İŞLEM lafı kalktı, aslanlar gibi CİHAZ yazıyor! */}
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">CİHAZ</div>
                              <div className="text-xs text-gray-300 font-bold truncate max-w-[150px]">
                                {cihazMarkaModel}
                              </div>
                            </div>
                          </div>
                        </div>
                    )
                })
              ) : (
                <div className="text-center py-10 font-bold text-gray-500 uppercase tracking-widest text-xs">Tahsilat bekleyen cihaz yok.</div>
              )}
            </div>
          )}
        </div>

        {/* ================= SAĞ BÖLÜM ================= */}
        <div className="flex-1 bg-[#1A1A1E] border border-white/5 flex flex-col rounded-2xl shadow-2xl overflow-hidden relative">
          
          <div className="bg-black/20 p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <span className="text-[#8E052C] text-2xl leading-none">←</span> KASA İŞLEMLERİ V2
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto nuke-scrollbar p-8 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">İŞLEM TÜRÜ</label>
              <select 
                value={islemTuru}
                onChange={handleIslemTuruDegistir}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none font-bold focus:border-[#8E052C] transition-all appearance-none"
              >
                <option value="Seçiniz...">-- Seçiniz --</option>
                <option value="Kasaya Nakit Girişi">Kasaya Nakit Girişi</option>
                <option value="Tamir Ücreti Tahsili">Tamir Ücreti Tahsili</option>
                <option value="Randevu Geliri Tahsili">Randevu Geliri Tahsili</option>
                <option value="Stoktan Ürün Satışı">Stoktan Ürün Satışı</option>
              </select>
            </div>

            {isCihazliIslem && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-[#8E052C] uppercase tracking-widest">HAZIR CİHAZ NUMARASI GİRİN (*)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly
                      value={seciliIslem?.servis_no || ''}
                      placeholder="Soldan bir iş seçin..."
                      className="flex-1 bg-black/50 border border-[#8E052C]/50 rounded-xl px-4 py-3 text-sm text-white outline-none font-bold"
                    />
                    <button className="bg-[#8E052C] hover:bg-[#8E052C]/80 w-12 rounded-xl flex items-center justify-center text-white text-lg transition-all shadow-md">
                      🔍
                    </button>
                  </div>
                </div>

                <div className="border border-white/10 bg-black/20 rounded-2xl p-5 relative mt-2">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1A1A1E] border border-white/10 px-3 py-0.5 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest shadow-sm">
                    {seciliIslem?.islemTipi === 'RANDEVU' ? 'RANDEVU VE MÜŞTERİ BİLGİLERİ' : 'CİHAZ VE MÜŞTERİ BİLGİLERİ'}
                  </div>
                  
                  <div className="flex justify-between items-center mb-3 mt-2">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Müşteri:</span>
                    <span className="text-sm font-black text-white">{seciliIslem ? (seciliIslem.islemTipi === 'RANDEVU' ? randevuDatasiniDagit(seciliIslem).musteriAdi : servisDatasiniAl(seciliIslem).musteriAdi) : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Cihaz:</span>
                    {/* 🚨 Form içinde de aslanlar gibi CİHAZ bilgisi çekiliyor */}
                    <span className="text-sm font-black text-gray-300">{seciliIslem ? (seciliIslem.islemTipi === 'RANDEVU' ? randevuDatasiniDagit(seciliIslem).cihazMarkaModel : servisDatasiniAl(seciliIslem).cihazMarkaModel) : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Usta Teklifi:</span>
                    <span className="text-sm font-black text-[#8E052C]">{ustaTeklifi.toFixed(2)} ₺</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">KÂR İSKONTOSU (%)</label>
                    <input 
                      type="text" 
                      value={iskonto === 0 ? '' : iskonto}
                      onChange={(e) => {
                        let val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                        if (isNaN(val)) val = 0;
                        if (val > 100) val = 100;
                        setIskonto(val);
                      }}
                      disabled={!seciliIslem}
                      placeholder="0"
                      className="w-full bg-black/50 border border-yellow-500/30 hover:border-yellow-500/50 rounded-xl px-4 py-2.5 text-center text-sm text-yellow-500 outline-none font-black focus:ring-2 focus:ring-yellow-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">TAHSİLAT TUTARI (KÂR+KDV DAHİL)</label>
                  <div className="bg-black/50 border border-white/5 rounded-xl p-4 text-center">
                    <span className="text-3xl font-black text-[#8E052C] font-mono tracking-tighter">
                      {netTahsilatTutari.toFixed(2)} ₺
                    </span>
                  </div>
                </div>
              </>
            )}

            {isStokIslem && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-[#8E052C] uppercase tracking-widest">BARKOD OKUT VEYA YAZ (*)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={barkodNo}
                      onChange={(e) => setBarkodNo(e.target.value)}
                      placeholder="Barkod..."
                      className="flex-1 bg-black/50 border border-[#8E052C]/50 rounded-xl px-4 py-3 text-sm text-white outline-none font-bold focus:border-[#8E052C]"
                    />
                    <button className="bg-[#8E052C] hover:bg-[#8E052C]/80 w-14 rounded-xl flex items-center justify-center text-white text-lg transition-all shadow-md">
                      🔍
                    </button>
                    <button className="bg-gray-800 hover:bg-gray-700 w-14 rounded-xl flex items-center justify-center text-white text-lg transition-all border border-white/10">
                      📷
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SATIŞ TUTARI (₺)</label>
                  <input 
                    type="text" 
                    value={manuelTutar}
                    onChange={(e) => setManuelTutar(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="0.00"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl text-[#8E052C] font-mono outline-none font-black focus:border-[#8E052C] transition-all"
                  />
                </div>
              </>
            )}

            {isNakitIslem && (
              <div className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">GİRİLECEK TUTAR (₺)</label>
                  <input 
                    type="text"
                    value={manuelTutar}
                    onChange={(e) => setManuelTutar(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="0.00"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-6 text-center text-4xl text-[#8E052C] font-mono outline-none font-black focus:border-[#8E052C] transition-all shadow-inner"
                  />
                </div>
              </div>
            )}

            {islemTuru !== 'Seçiniz...' && (
              <div className="flex flex-col gap-2 mt-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">İŞLEM AÇIKLAMASI (*)</label>
                <textarea 
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                  disabled={isCihazliIslem && !seciliIslem}
                  rows={isNakitIslem ? 4 : 3}
                  placeholder={isNakitIslem ? "Örn: Bozuk para tümleme, dışarıdan gelen nakit vb." : "Detay yazınız..."}
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none font-medium focus:border-[#8E052C]/50 transition-all resize-none disabled:opacity-50"
                />
              </div>
            )}

          </div>

          <div className="p-6 bg-black/20 border-t border-white/5">
            <button 
              onClick={handleKaydet}
              disabled={islemTuru === 'Seçiniz...' || (isCihazliIslem && !seciliIslem) || isSubmitting}
              className="w-full bg-[#1A1A1E] hover:bg-[#8E052C] border border-[#8E052C]/50 text-[#8E052C] hover:text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'İşleniyor...' : 'İŞLEMİ ONAYLA VE KAYDET'}
            </button>
          </div>

        </div>

      </div>
    </>
  );
}