import { useEffect, useState } from 'react';
import api from '../api'; 

export default function TamamlananRandevular() {
  const [randevular, setRandevular] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [durumFiltresi, setDurumFiltresi] = useState('Tümü'); 
  const [arama, setArama] = useState(''); 
  const [tarihArama, setTarihArama] = useState(''); 

  const verileriGetir = async () => {
    try {
      const res = await api.get(`/appointments/liste/gecmis`).catch(() => api.get(`/api/appointments/liste/gecmis`));
      const data = res.data?.data ? res.data.data : res.data;
      if(Array.isArray(data)) {
        setRandevular(data);
      }
    } catch (err) { 
      console.error("Tamamlanan randevular çekilemedi:", err); 
    } finally {
      setLoading(false);
    }
  };

  const hizliNotKaydet = async (id: number, yeniNot: string) => {
    if (!id) return;
    try {
      await api.put(`/appointments/${id}/hizli-not`, { yonetici_notu: yeniNot })
                 .catch(() => api.put(`/api/appointments/${id}/hizli-not`, { yonetici_notu: yeniNot }));
    } catch (err) {
      console.error("🚨 Not kaydedilirken hata oluştu:", err);
    }
  };

  useEffect(() => { verileriGetir(); }, []);

  const filtrelenmisRandevular = randevular.filter(r => {
    const durum = String(r.status || r['Durum'] || r.durum || '').toLocaleUpperCase('tr-TR');
    
    let durumUyuyor = false;
    if (durumFiltresi === 'Tümü') {
      durumUyuyor = true;
    } else if (durumFiltresi === 'Teslim Edildi' && (durum.includes('TESLİM') || durum.includes('TESLIM'))) {
      durumUyuyor = true;
    } else if (durumFiltresi === 'İptal' && (durum.includes('İPTAL') || durum.includes('IPTAL'))) {
      durumUyuyor = true;
    }

    let formatliTarih = '';
    if (r.appointment_date) {
      const d = new Date(r.appointment_date);
      formatliTarih = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    const tarihUyuyor = formatliTarih.includes(tarihArama);

    const musteri = String(r.customer_name || r.name || r.musteri_adi || '').toLocaleUpperCase('tr-TR');
    const kayitNo = String(r.servis_no || '').toLocaleUpperCase('tr-TR');
    const aramaBuyuk = String(arama || '').toLocaleUpperCase('tr-TR');

    return durumUyuyor && (kayitNo.includes(aramaBuyuk) || musteri.includes(aramaBuyuk)) && tarihUyuyor;
  });

  return (
    <div className="bg-[#0F0F12] border border-white/10 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative mt-4">
      
      <div className="p-5 border-b border-white/5 bg-white/5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-[#8E052C] text-2xl">🗄️</span> Tamamlanan Randevular
          </h2>
          <div className="text-xs font-black text-gray-500 uppercase tracking-widest">
            Kayıt Sayısı: <span className="text-white">{filtrelenmisRandevular.length}</span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <select 
            value={durumFiltresi}
            onChange={(e) => setDurumFiltresi(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-black outline-none focus:border-[#8E052C] transition-all cursor-pointer"
          >
            <option value="Tümü" className="bg-[#0F0F12]">Tüm Randevular</option>
            <option value="Teslim Edildi" className="bg-[#0F0F12]">📦 Teslim Edilenler</option>
            <option value="İptal" className="bg-[#0F0F12]">❌ İptal Edilenler</option>
          </select>

          <input 
            type="text" 
            placeholder="Tarih / Ay Ara (Örn: 04.2026)" 
            value={tarihArama}
            onChange={(e) => setTarihArama(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white w-56 outline-none font-black focus:border-[#8E052C] transition-all shadow-inner"
          />

          <input 
            type="text" 
            placeholder="Kayıt No veya Müşteri Ara..." 
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white flex-1 outline-none font-black focus:border-[#8E052C] transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 font-black uppercase tracking-widest text-sm">Veriler Getiriliyor...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtrelenmisRandevular.map((r) => {
              
              const kayitNo = r.servis_no || 'Belirsiz';
              const musteri = r.customer_name || r.musteri_adi || 'İsimsiz';
              const usta = r.assigned_usta || 'Atanmadı';
              
              const durumOrijinal = r.status || 'Bilinmiyor';
              const iptalMi = String(durumOrijinal).toLocaleUpperCase('tr-TR').includes('İPTAL') || String(durumOrijinal).toLocaleUpperCase('tr-TR').includes('IPTAL');
              
              const finalAdres = r.parca_adres || r.adres || 'Adres belirtilmemiş';
              const finalCihaz = r.parca_cihaz || r.cihaz || 'Cihaz bilgisi yok';
              const finalNot = r.parca_not || r.issue_text || 'Not girilmemiş';
              
              const rTarihiRaw = r.appointment_date || '';
              const rSaatiRaw = r.appointment_time || '';
              
              let formatliTarih = 'Tarih Yok';
              if (rTarihiRaw) {
                const d = new Date(rTarihiRaw);
                formatliTarih = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
              }
              const formatliSaat = rSaatiRaw ? String(rSaatiRaw).substring(0, 5) : 'Saat Yok';

              const bitisTarihi = formatliTarih;
              
              // 🚨 MÜDÜRÜN PARASI: Backend'den gelen 'usta_fiyati' veya 'price'ı yakaladık
              const fiyat = r.usta_fiyati || r.price || 0;

              return (
                <div key={r.id} className={`bg-black/20 border ${iptalMi ? 'border-red-900/40 shadow-[0_0_15px_rgba(142,5,44,0.1)]' : 'border-white/5'} rounded-2xl p-5 hover:bg-white/[0.02] transition-all flex items-start gap-6 group relative opacity-90 hover:opacity-100`}>
                  
                  <div className="bg-[#1A1A1E] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center min-w-[120px] shrink-0">
                    <span className="text-lg font-black text-gray-400 leading-none mt-1">{formatliTarih}</span>
                    <span className="text-sm font-black text-gray-500 mt-2 bg-black/50 px-2 py-1 rounded-md mb-2">{formatliSaat}</span>
                    <div className="w-full border-t border-white/5 pt-2 text-center mt-1">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block leading-tight">Kayıt No</span>
                      <span className="text-xs font-black text-gray-500">#{kayitNo}</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 mt-1">
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-xl font-black text-gray-300 uppercase tracking-tight whitespace-nowrap">
                        {musteri}
                      </span>
                      <div className="flex-1 ml-4 pr-4">
                        <input 
                          type="text" 
                          placeholder="Yönetici Notu (Enter'a bas veya tıklayıp çık kaydetsin)..."
                          defaultValue={r.yonetici_notu || ''} 
                          onBlur={(e) => hizliNotKaydet(r.id, e.target.value)} 
                          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                          className="w-full bg-[#0F0F12]/80 border border-sky-900/30 rounded-lg px-4 py-2 text-sm text-sky-400 font-black outline-none focus:border-sky-500/80 focus:bg-black/60 transition-all placeholder:text-gray-700 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">📍 Adres</span>
                        <span className="text-xs text-gray-400 font-black leading-relaxed">{finalAdres}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">🔧 Cihaz Bilgisi</span>
                        <span className="text-xs text-gray-400 font-black leading-relaxed">{finalCihaz}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 mt-1">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-1">📝 Arıza & Randevu Notu</span>
                      <p className="text-xs text-gray-500 font-black leading-relaxed">{finalNot}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[140px] shrink-0 mt-1">
                    <span className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm text-center w-full ${iptalMi ? 'bg-[#8E052C] text-white border border-red-500/50' : 'bg-gray-800/80 text-gray-300 border border-gray-500/30'}`}>
                      {durumOrijinal}
                    </span>
                    
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-2.5 rounded-xl border border-white/5 w-full justify-center mt-1">
                      <span className="text-gray-600">🛠️</span>
                      <span className="text-xs font-black text-gray-500 truncate">{usta}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#8E052C]/10 px-2 py-1.5 rounded-md border border-[#8E052C]/20 w-full justify-center">
                      <span className="text-[#8E052C]">🏁</span>
                      <span className="text-[10px] font-black text-gray-400">Tarih: {bitisTarihi}</span>
                    </div>

                    {/* 🚨 YENİ EKLENEN TAHSİLAT KISMI (İptal edilmemiş ve parası olan işler için) */}
                    {!iptalMi && parseFloat(fiyat) > 0 && (
                     
                     
                     <div className="text-[11px] font-black text-green-500 mt-1">
                        Tahsil Edildi: {parseFloat(fiyat || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </div>
                                          


                     






                    )}
                  </div>

                </div>
              );
            })}

            {filtrelenmisRandevular.length === 0 && !loading && (
              <div className="text-center p-10 text-gray-600 font-black uppercase tracking-widest bg-white/5 rounded-2xl border border-white/5">
                Arşivde eşleşen kayıt bulunamadı.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}