import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TamamlananRandevular() {
  const [randevular, setRandevular] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [durumFiltresi, setDurumFiltresi] = useState('Tümü'); 
  const [arama, setArama] = useState(''); 

  const API_URL = "http://localhost:3000"; 
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const verileriGetir = async () => {
    try {
      // 🚨 MÜDÜR: Vana artık direkt yeni çektiğimiz /liste/gecmis borusuna bağlı!
      const res = await axios.get(`${API_URL}/api/appointments/liste/gecmis`, { headers });
      const data = res.data.data ? res.data.data : res.data;
      if(Array.isArray(data)) {
        setRandevular(data);
      }
    } catch (err) { 
      console.error("Tamamlanan randevular çekilemedi:", err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { verileriGetir(); }, []);

  // 🚨 TERTEMİZ FİLTRE: Backend zaten sadece İptal ve Teslim yolladığı için kod çok sadeleşti.
  const filtrelenmisRandevular = randevular.filter(r => {
    const durum = String(r.status || r['Durum'] || r.durum || '').toUpperCase();
    
    // Açılır Menü Filtresi
    let durumUyuyor = false;
    if (durumFiltresi === 'Tümü') {
      durumUyuyor = true;
    } else if (durumFiltresi === 'Teslim Edildi' && durum.includes('TESLİM')) {
      durumUyuyor = true;
    } else if (durumFiltresi === 'İptal' && (durum.includes('İPTAL') || durum.includes('IPTAL'))) {
      durumUyuyor = true;
    }

    // Arama Çubuğu
    const musteri = String(r.customer_name || r.name || r.musteri_adi || '').toUpperCase();
    const kayitNo = String(r.servis_no || '').toUpperCase();
    const aramaBuyuk = arama.toUpperCase();

    const metinUyuyor = kayitNo.includes(aramaBuyuk) || musteri.includes(aramaBuyuk);

    return durumUyuyor && metinUyuyor;
  });

  return (
    <div className="bg-[#0F0F12] border border-white/10 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative mt-4">
      
      <div className="p-5 border-b border-white/5 bg-white/5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-[#8E052C] text-2xl">🗄️</span> Tamamlanan Randevular
          </h2>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Kayıt Sayısı: <span className="text-white">{filtrelenmisRandevular.length}</span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <select 
            value={durumFiltresi}
            onChange={(e) => setDurumFiltresi(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none focus:border-[#8E052C] transition-all cursor-pointer"
          >
            <option value="Tümü" className="bg-[#0F0F12]">Tümü</option>
            <option value="Teslim Edildi" className="bg-[#0F0F12]">📦 Teslim Edilenler</option>
            <option value="İptal" className="bg-[#0F0F12]">❌ İptal Edilenler</option>
          </select>

          <input 
            type="text" 
            placeholder="Kayıt No veya Müşteri Ara..." 
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white flex-1 outline-none font-semibold focus:border-[#8E052C] transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 font-bold uppercase tracking-widest text-sm">Veriler Getiriliyor...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtrelenmisRandevular.map((r, index) => {
              
              const kayitNo = r.servis_no || 'Belirsiz';
              const musteri = r.customer_name || r.musteri_adi || 'İsimsiz';
              const usta = r.assigned_usta || 'Atanmadı';
              
              const durumOrijinal = r.status || 'Bilinmiyor';
              const iptalMi = String(durumOrijinal).toUpperCase().includes('İPTAL') || String(durumOrijinal).toUpperCase().includes('IPTAL');
              
              // Backend parçalamayı zaten yapıyor, direkt kullanıyoruz!
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

              return (
                <div key={index} className={`bg-black/20 border ${iptalMi ? 'border-red-900/40 shadow-[0_0_15px_rgba(142,5,44,0.1)]' : 'border-white/5'} rounded-2xl p-5 hover:bg-white/[0.02] transition-all flex items-start gap-6 group relative opacity-90 hover:opacity-100`}>
                  
                  <div className="bg-[#1A1A1E] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center min-w-[120px] shrink-0">
                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 leading-tight ${iptalMi ? 'text-red-500' : 'text-gray-600'}`}>
                      {iptalMi ? 'İPTAL EDİLDİ' : 'TAMAMLANDI'}
                    </span>
                    <span className="text-lg font-black text-gray-400 leading-none">{formatliTarih}</span>
                    <span className="text-sm font-bold text-gray-500 mt-2 bg-black/50 px-2 py-1 rounded-md mb-2">{formatliSaat}</span>
                    <div className="w-full border-t border-white/5 pt-2 text-center mt-1">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block leading-tight">Kayıt No</span>
                      <span className="text-xs font-bold text-gray-500">#{kayitNo}</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 mt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-gray-300 uppercase tracking-tight">{musteri}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">📍 Adres</span>
                        <span className="text-xs text-gray-400 font-medium leading-relaxed">{finalAdres}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">🔧 Cihaz Bilgisi</span>
                        <span className="text-xs text-gray-400 font-medium leading-relaxed">{finalCihaz}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 mt-1">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-1">📝 Arıza & Randevu Notu</span>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{finalNot}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[140px] shrink-0 mt-1">
                    <span className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm text-center w-full ${iptalMi ? 'bg-[#8E052C] text-white border border-red-500/50' : 'bg-gray-800/80 text-gray-300 border border-gray-500/30'}`}>
                      {durumOrijinal}
                    </span>
                    
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-2.5 rounded-xl border border-white/5 w-full justify-center mt-1">
                      <span className="text-gray-600">🛠️</span>
                      <span className="text-xs font-bold text-gray-500 truncate">{usta}</span>
                    </div>
                  </div>

                </div>
              );
            })}

            {filtrelenmisRandevular.length === 0 && !loading && (
              <div className="text-center p-10 text-gray-600 font-bold uppercase tracking-widest bg-white/5 rounded-2xl border border-white/5">
                Arşivde eşleşen kayıt bulunamadı.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}