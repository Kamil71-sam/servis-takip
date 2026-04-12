import React, { useEffect, useState } from 'react';
import api from '../api'; 

export default function TamamlananIsler() {
  const [islemler, setIslemler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // FİLTRE STATELERİ
  const [durumFiltresi, setDurumFiltresi] = useState('Tümü'); 
  const [arama, setArama] = useState(''); 
  const [tarihArama, setTarihArama] = useState(''); 

  const verileriGetir = async () => {
    try {
      const res = await api.get('/services/tamamlanan');
      setIslemler(res.data);
    } catch (err) { 
      console.error("Tamamlanan işler çekilemedi:", err); 
    } finally {
      setLoading(false);
    }
  };

  const hizliNotKaydet = async (id: number, yeniNot: string) => {
    if (!id) return;
    try {
      await api.put(`/services/${id}/hizli-not`, { 
        yonetici_notu: yeniNot 
      });
      console.log(`✅ Servis Notu başarıyla kaydedildi (ID: ${id}): ${yeniNot}`);
    } catch (err) {
      console.error("🚨 Not kaydedilirken hata oluştu:", err);
    }
  };

  useEffect(() => { verileriGetir(); }, []);

  const durumRenkleri: any = {
    'Teslim Edildi': 'bg-gray-600 text-gray-100 border border-gray-400/30',
    'İptal Edildi': 'bg-red-900/80 text-red-100 border border-red-500/30'
  };

  // 🚨 MÜDÜRÜN FİLTRELEME MOTORU (Çökme Hatası Düzeltildi!)
  const filtrelenmisIslemler = islemler.filter(islem => {
    const durum = islem.durum || '';
    const durumUyuyor = durumFiltresi === 'Tümü' || durum === durumFiltresi;

    // 🛡️ İŞTE DÜZELTİLEN YER: Rakamları önce zorla metne (String) çeviriyoruz ki çökmesin!
    const plaka = String(islem.plaka || '');
    const musteri = String(islem.musteri_adi || '');
    const aramaKucuk = String(arama).toLocaleLowerCase('tr-TR');
    
    const metinUyuyor = 
      plaka.toLocaleLowerCase('tr-TR').includes(aramaKucuk) || 
      musteri.toLocaleLowerCase('tr-TR').includes(aramaKucuk);

    const tarih = String(islem.tarih || ''); 
    const tarihUyuyor = tarih.includes(tarihArama);

    return durumUyuyor && metinUyuyor && tarihUyuyor;
  });

  return (
    <div className="bg-[#0F0F12] border border-white/10 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative mt-4">
      
      {/* ÜST BARA & FİLTRELER */}
      <div className="p-5 border-b border-white/5 bg-white/5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-green-500">✅</span> Tamamlanan İşler
          </h2>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Toplam: <span className="text-white">{filtrelenmisIslemler.length}</span> Kayıt
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <select 
            value={durumFiltresi}
            onChange={(e) => setDurumFiltresi(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none focus:border-green-500 transition-all cursor-pointer"
          >
            <option value="Tümü" className="bg-[#0F0F12]">Tüm Biten İşler</option>
            <option value="Teslim Edildi" className="bg-[#0F0F12]">📦 Sadece Teslim Edilenler</option>
            <option value="İptal Edildi" className="bg-[#0F0F12]">❌ Sadece İptal Edilenler</option>
          </select>

          <input 
            type="text" 
            placeholder="Tarih / Ay Ara (Örn: 04.2026)" 
            value={tarihArama}
            onChange={(e) => setTarihArama(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white w-56 outline-none font-semibold focus:border-green-500 transition-all"
          />

          <input 
            type="text" 
            placeholder="Kayıt No veya Müşteri Adı..." 
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white flex-1 outline-none font-semibold focus:border-green-500 transition-all"
          />
        </div>
      </div>

      {/* TABLO ALANI */}
      <div className="flex-1 overflow-auto scrollbar-hide p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 font-bold uppercase tracking-widest">Arşiv Taranıyor...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0F0F12] z-10">
              <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-widest font-black">
                <th className="p-3">Müşteri & Kayıt</th>
                <th className="p-3">Cihaz Bilgisi</th>
                <th className="p-3">Yapılan İşlem / Not</th>
                <th className="p-3">Sonuç & Maliyet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">

              {filtrelenmisIslemler.map((s) => {
                const sNo = s.plaka;
                const mAdi = s.musteri_adi;
                const kayitTarihi = s.tarih; 
                const cTuru = s.cihaz_tipi;
                const markaModel = s.marka_model; 
                const seriNo = s.seri_no;
                const ariza = s.ariza;
                const mNotu = s.eklenen_notlar;
                const durum = s.durum || 'Bilinmiyor';
                const usta = s.usta;
                const fiyat = s.offer_price;
                
                const bitisTarihi = s.updated_at 
                  ? new Date(s.updated_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                  : 'Bilinmiyor';

                return (
                  <React.Fragment key={s.id}>
                    <tr className="hover:bg-white/[0.02] transition-all group align-top opacity-80 hover:opacity-100">
                      
                      <td className="p-4 py-5 w-[30%]">
                        <div className="flex flex-col gap-1.5 w-full">
                          <span className="text-lg font-black text-gray-400 tracking-tight">#{sNo}</span>
                          <span className="text-sm font-bold text-white leading-tight uppercase">{mAdi}</span>
                          <span className="text-[10px] text-gray-500 font-bold mt-1">
                            Geliş: {kayitTarihi || 'Tarih Yok'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-black text-gray-400 uppercase tracking-wide">{cTuru || 'TÜR BELİRTİLMEDİ'}</div>
                          <div className="text-sm font-bold text-gray-300">{markaModel || 'MARKA MODEL YOK'}</div>
                          <div className="text-[11px] text-gray-600 font-mono mt-1 border bg-white/5 border-white/5 px-2 py-0.5 rounded inline-block w-max">
                            SN: {seriNo || 'Belirtilmedi'}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 py-5 w-[30%]">
                        <div className="flex flex-col gap-3">
                          <div>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-0.5">Müşteri Şikayeti</span>
                            <p className="text-xs text-gray-300 font-medium leading-relaxed break-words">
                              {ariza || 'Şikayet girilmemiş.'}
                            </p>
                          </div>
                          {mNotu && (
                            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-0.5">Ek Not / Aksesuar</span>
                              <p className="text-[11px] text-gray-400 font-medium leading-relaxed break-words">
                                {mNotu}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 py-5">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${durumRenkleri[durum] || 'bg-gray-800 text-gray-400'}`}>
                            {durum}
                          </span>
                          
                          <div className="flex items-center gap-1.5 mt-2 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                            <span className="text-gray-600">🛠️</span>
                            <span className="text-[10px] font-bold text-gray-400">{usta || 'Atanmadı'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 bg-[#8E052C]/10 px-2 py-1 rounded-md border border-[#8E052C]/20">
                            <span className="text-[#8E052C]">🏁</span>
                            <span className="text-[10px] font-bold text-gray-300">Bitiş: {bitisTarihi}</span>
                          </div>

                          {parseFloat(fiyat) > 0 && durum === 'Teslim Edildi' && (
                            
                            
                         <div className="text-[11px] font-black text-green-500 mt-1">
                            Tahsil Edildi: {parseFloat(fiyat || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                          </div>




                            
                            



                          )}
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-all opacity-90 hover:opacity-100">
                      <td colSpan={4} className="px-4 pb-5 pt-0">
                        <div className="flex items-center gap-3 w-full bg-black/20 p-2 rounded-lg border border-white/5">
                          <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest shrink-0 pl-1">
                            ↳ Yönetici Notu:
                          </span>
                          <input 
                            type="text" 
                            placeholder="Buraya not girin..." 
                            defaultValue={s.yonetici_notu || ''} 
                            onBlur={(e) => hizliNotKaydet(s.id, e.target.value)} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur(); 
                              }
                            }}
                            className="flex-1 w-full bg-[#0F0F12]/80 border border-sky-900/40 rounded-md px-3 py-1.5 text-xs text-sky-400 font-bold outline-none focus:border-sky-500 focus:bg-black/80 transition-all placeholder:text-gray-700 shadow-inner"
                          />
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
              
              {filtrelenmisIslemler.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="text-center p-10 text-gray-600 font-bold uppercase">
                    Bu kriterlere uygun tamamlanmış iş bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}