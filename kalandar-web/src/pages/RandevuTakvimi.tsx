import { useEffect, useState } from 'react';
import api from '../api'; // 🚨 MÜDÜR: Ana santralimizi çağırdık, axios'a gerek kalmadı

export default function RandevuTakvimi() {
  const [randevular, setRandevular] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [arama, setArama] = useState(''); 

  // 🚨 MÜDÜR: İPTAL MODALI İÇİN GEREKLİ STATELER
  const [statusModalAcik, setStatusModalAcik] = useState(false);
  const [seciliRandevu, setSeciliRandevu] = useState<any>(null);
  const [islemde, setIslemde] = useState(false);

  // 1. VERİ ÇEKME MOTORU (Temizlendi)
  const verileriGetir = async () => {
    try {
      // 🚨 ZIRHLI HAMLE: Uzun URL ve headers yok! api.ts hallediyor.
      const res = await api.get('/appointments/liste/aktif');

      const data = res.data.data ? res.data.data : res.data;
      if(Array.isArray(data)) {
        setRandevular(data);
      }
    } catch (err) { 
      console.error("Randevular çekilemedi:", err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { verileriGetir(); }, []);

  const durumRenkleri: any = {
    'Beklemede': 'bg-yellow-900/80 text-yellow-100 border border-yellow-500/30 hover:border-yellow-500',
    'Mali Onay Bekliyor': 'bg-blue-900/80 text-blue-100 border-blue-500/30 hover:border-blue-500'
  };

  // 2. İPTAL MOTORU (Temizlendi)
  const handleMüdürİptal = async () => {
    if (!seciliRandevu) return;
    if (!window.confirm("Bu randevu iptal edilecek ve listeden düşecektir. Emin misiniz?")) return;

    setIslemde(true);
    try {
      // 🚨 ZIRHLI HAMLE: Sadece hedefi yazıyoruz, gerisini api.ts hallediyor!
      const res = await api.put(`/appointments/iptal/${seciliRandevu.id}`);
      if (res.data.success) {
        await verileriGetir(); // Listeyi tazele
        setStatusModalAcik(false);
        setSeciliRandevu(null);
      }
    } catch (error) {
      alert("İptal işlemi sırasında bir hata oluştu.");
      console.error(error);
    } finally {
      setIslemde(false);
    }
  };

  // 🚨 MÜDÜR: FİLTRE MOTORU SADECE "BEKLEMEDE" VE "MALİ ONAY" OLANLARI ALIR
  const filtrelenmisRandevular = randevular.filter(r => {
    const durum = (r.status || r['Durum'] || r.durum || 'Beklemede').toLowerCase();
    const aktifMi = durum === 'beklemede' || durum === 'mali onay bekliyor';

    const musteri = r.musteri_adi || r['Müşteri Adı'] || r.musteri || r.name || r.customer_name || r.firma_adi || '';
    const kayitNo = r.servis_no || r['Kayıt No'] || '';
    const metinUyuyor = kayitNo.includes(arama) || musteri.toLowerCase().includes(arama.toLowerCase());

    return aktifMi && metinUyuyor;
  });

  return (
    <div className="bg-[#0F0F12] border border-white/10 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative mt-4">
      
      {/* ÜST BARA */}
      <div className="p-5 border-b border-white/5 bg-white/5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-[#8E052C] text-2xl">🗓️</span> Randevu Kayıtları
          </h2>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Bekleyen: <span className="text-white">{filtrelenmisRandevular.length}</span> Randevu
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <input 
            type="text" 
            placeholder="Kayıt No veya Müşteri Ara..." 
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white w-full outline-none font-semibold focus:border-[#8E052C] transition-all shadow-inner"
          />
        </div>
      </div>

      {/* TABLO */}
      <div className="flex-1 overflow-auto scrollbar-hide p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 font-bold uppercase tracking-widest">Takvim Çekiliyor...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtrelenmisRandevular.map((r, index) => {
              
              const kayitNo = r.servis_no || r['Kayıt No'] || r.kayit_no || 'Belirsiz';
              const musteri = r.musteri_adi || r['Müşteri Adı'] || r.musteri || r.name || r.customer_name || r.firma_adi || 'İsimsiz';
              const usta = r.assigned_usta || r['Atanan Usta'] || r.usta || 'Atanmadı';
              const durum = r.status || r['Durum'] || r.durum || 'Beklemede';
              
              // Ham veriler
              let finalAdres = r.Adres || r.adres || r.address || 'Adres belirtilmemiş';
              let finalCihaz = r['Cihaz Bilgisi'] || r.cihaz_bilgisi || r.cihaz || r.device || 'Cihaz bilgisi yok';
              let finalNot = r['Arıza ve Randevu Notu'] || r.ariza_ve_randevu_notu || r.issue_text || r.not || 'Not girilmemiş';

              // ÇUVAL BOŞALTMA MOTORU
              if (finalNot.includes('📍 ADRES:')) {
                const adresParcasi = finalNot.split('🔧 CİHAZ:')[0].replace('📍 ADRES:', '').trim();
                const kalan = finalNot.split('🔧 CİHAZ:')[1] || '';
                const cihazParcasi = kalan.includes('📝 NOT:') ? kalan.split('📝 NOT:')[0].trim() : kalan.split('📝')[0].trim();
                const notParcasi = finalNot.includes('📝 NOT:') ? finalNot.split('📝 NOT:')[1].trim() : (finalNot.includes('📝') ? finalNot.split('📝')[1].trim() : 'Not yok');

                finalAdres = adresParcasi || finalAdres;
                finalCihaz = cihazParcasi || finalCihaz;
                finalNot = notParcasi || 'Not girilmemiş';
              }
              
              // TARİH & SAAT DÜZENLEME
              const rTarihiRaw = r.appointment_date || r['Randevu Tarihi'] || r.tarih || '';
              const rSaatiRaw = r.appointment_time || r['Randevu Saati'] || r.saat || '';
              
              let formatliTarih = 'Tarih Yok';
              let randevuTarihiObj = null;

              if (rTarihiRaw) {
                const d = new Date(rTarihiRaw);
                formatliTarih = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                randevuTarihiObj = d;
              }

              const formatliSaat = rSaatiRaw ? rSaatiRaw.substring(0, 5) : 'Saat Yok';

              let yarinMi = false;
              if (randevuTarihiObj) {
                const bugun = new Date();
                bugun.setHours(0, 0, 0, 0);
                randevuTarihiObj.setHours(0, 0, 0, 0);
                const farkZaman = randevuTarihiObj.getTime() - bugun.getTime();
                const farkGun = Math.ceil(farkZaman / (1000 * 60 * 60 * 24));
                if (farkGun === 1) yarinMi = true; 
              }

              return (
                <div key={index} className={`bg-black/40 border ${yarinMi ? 'border-red-900/50 shadow-[0_0_15px_rgba(142,5,44,0.1)]' : 'border-white/5'} rounded-2xl p-5 hover:border-[#8E052C]/50 transition-all flex items-start gap-6 group relative overflow-hidden`}>
                  
                  {yarinMi && (
                    <div className="absolute top-0 right-0 bg-[#8E052C] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg animate-pulse">
                      ⚠️ YARIN: TEYİT ARAMASI YAP!
                    </div>
                  )}

                  <div className="bg-[#1A1A1E] border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center min-w-[120px] shrink-0 group-hover:bg-[#8E052C]/10 group-hover:border-[#8E052C]/30 transition-all">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">RANDEVU</span>
                    <span className="text-lg font-black text-white leading-none">{formatliTarih}</span>
                    <span className="text-sm font-bold text-[#8E052C] mt-2 bg-black/50 px-2 py-1 rounded-md mb-2">{formatliSaat}</span>
                    <div className="w-full border-t border-white/5 pt-2 text-center mt-1">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block leading-tight">Kayıt No</span>
                      <span className="text-xs font-bold text-gray-400">#{kayitNo}</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 mt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-white uppercase tracking-tight">{musteri}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1"><span className="text-[#8E052C]">📍</span> Adres</span>
                        <span className="text-xs text-gray-300 font-medium leading-relaxed">{finalAdres}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1"><span className="text-gray-400">🔧</span> Cihaz Bilgisi</span>
                        <span className="text-xs text-gray-300 font-medium leading-relaxed">{finalCihaz}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 mt-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1 flex items-center gap-1"><span className="text-gray-400">📝</span> Arıza & Randevu Notu</span>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">{finalNot}</p>
                    </div>
                  </div>

                  {/* SAĞ: DURUM & USTA */}
                  <div className="flex flex-col items-end gap-3 min-w-[140px] shrink-0 mt-1">
                    <button 
                      onClick={() => { setSeciliRandevu(r); setStatusModalAcik(true); }}
                      className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm text-center w-full transition-all cursor-pointer ${durumRenkleri[durum] || 'bg-yellow-900/80 text-yellow-100 border border-yellow-500/30'}`}>
                      {durum}
                    </button>
                    
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-2.5 rounded-xl border border-white/5 w-full justify-center mt-1">
                      <span className="text-gray-500">🛠️</span>
                      <span className="text-xs font-bold text-gray-300 truncate">{usta}</span>
                    </div>
                  </div>

                </div>
              );
            })}

            {filtrelenmisRandevular.length === 0 && !loading && (
              <div className="text-center p-10 text-gray-600 font-bold uppercase tracking-widest bg-white/5 rounded-2xl border border-white/5">
                Şu an ufukta bekleyen bir randevu yok, şantiye rahat!
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🚨 MÜDÜR: İPTAL PANELİ (SADECE MÜDAHALE ODAKLI) */}
      {statusModalAcik && seciliRandevu && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1E] border border-white/10 rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E052C]/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-black text-white uppercase tracking-tight">İşlemi Durdur</h3>
               <button onClick={() => setStatusModalAcik(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-6">
               <div className="text-[10px] font-black text-[#8E052C] uppercase tracking-widest mb-1">Müşteri</div>
               <div className="text-sm font-bold text-white uppercase">{seciliRandevu.musteri_adi || seciliRandevu.customer_name}</div>
               <div className="text-[10px] font-bold text-gray-500 mt-2">Kayıt No: #{seciliRandevu.servis_no}</div>
            </div>

            <button 
              disabled={islemde}
              onClick={handleMüdürİptal}
              className="w-full bg-red-900/20 hover:bg-red-600 border border-red-900/50 hover:border-red-500 text-red-500 hover:text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3">
              {islemde ? "İşleniyor..." : "🚫 Randevuyu İptal Et"}
            </button>

            <p className="text-[9px] text-gray-600 text-center mt-4 font-bold uppercase tracking-widest leading-relaxed">
              İptal edilen işler mali işlemlere yansımaz,<br/>direkt arşive gönderilir.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}