import { useState, useEffect } from 'react';
import api from '../api';

const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(142,5,44,0.5); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(142,5,44,0.8); }
`;

export default function MaliDurum({ onSeeAll }: any) {
  const [loading, setLoading] = useState(true);
  
  const [ozet, setOzet] = useState({
    gunluk: { giris: 0, cikis: 0, net: 0 },
    genel: { giris: 0, cikis: 0, net: 0 }
  });

  const [sonIslemler, setSonIslemler] = useState<any[]>([]);

  const fetchKasaVerileri = async () => {
    setLoading(true);
    try {
      // 🚨 MÜDÜR: HORTUMU GERÇEK ADRESE BAĞLADIK! (/api/kasa/all)
      const res = await api.get('/api/kasa/all');
      
      if (res && res.data && res.data.success) {
        // Gelen gerçek özet bilgisi
        setOzet(res.data.ozet);
        
        // Backend listeyi 'data' içinde yolluyor, biz son 10 tanesini kesip alıyoruz
        if (res.data.data && Array.isArray(res.data.data)) {
          setSonIslemler(res.data.data.slice(0, 10));
        } else {
          setSonIslemler([]);
        }
      } else {
        // Hata olursa her şeyi SIFIRLA (Sahte veri yok artık!)
        setOzet({ gunluk: { giris: 0, cikis: 0, net: 0 }, genel: { giris: 0, cikis: 0, net: 0 } });
        setSonIslemler([]);
      }
    } catch (error) {
      console.error("Kasa verileri çekilemedi:", error);
      setOzet({ gunluk: { giris: 0, cikis: 0, net: 0 }, genel: { giris: 0, cikis: 0, net: 0 } });
      setSonIslemler([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKasaVerileri(); }, []);

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex-1 flex flex-col h-full overflow-hidden p-2 relative">
        
        {/* ÜST BİLGİ */}
        <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-4 mb-4 shadow-xl shrink-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-2">
              <span className="text-yellow-500">💰</span> KASA & MALİ DURUM
            </h2>
          </div>
          <button onClick={fetchKasaVerileri} className="bg-white/5 hover:bg-yellow-500/20 text-gray-300 hover:text-yellow-500 px-4 py-2 rounded-lg text-[10px] font-black transition-all border border-white/10 flex items-center gap-2">
            🔄 TAZELE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 nuke-scrollbar pb-6 flex flex-col gap-6">
          
          {loading ? (
             <div className="text-center py-20 font-black uppercase text-gray-500 animate-pulse text-xs">Gerçek Kasa Verileri Çekiliyor...</div>
          ) : (
            <>
              {/* ================= PENCERELER ================= */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* SOL PENCERE */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 blur-2xl rounded-full pointer-events-none"></div>
                  <h3 className="text-xs font-black text-sky-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                    <span>⏱️</span> BUGÜNKÜ KASA HAREKETİ
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 flex flex-col">
                      <span className="text-[9px] text-green-500/70 font-black uppercase tracking-widest mb-0.5">GÜNLÜK GİRİŞ</span>
                      <span className="text-lg font-black text-green-500 font-mono">₺{ozet.gunluk.giris.toLocaleString('tr-TR', {minimumFractionDigits:2})}</span>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex flex-col">
                      <span className="text-[9px] text-red-500/70 font-black uppercase tracking-widest mb-0.5">GÜNLÜK ÇIKIŞ</span>
                      <span className="text-lg font-black text-red-500 font-mono">₺{ozet.gunluk.cikis.toLocaleString('tr-TR', {minimumFractionDigits:2})}</span>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1E] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">NET KASA</span>
                    <span className={`text-xl font-black font-mono ${ozet.gunluk.net >= 0 ? 'text-sky-400' : 'text-red-500'}`}>
                      {ozet.gunluk.net >= 0 ? '+' : ''}₺{ozet.gunluk.net.toLocaleString('tr-TR', {minimumFractionDigits:2})}
                    </span>
                  </div>
                </div>

                {/* SAĞ PENCERE */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-500/10 blur-2xl rounded-full pointer-events-none"></div>
                  <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                    <span>🏦</span> GENEL KASA (TÜM ZAMANLAR)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 flex flex-col">
                      <span className="text-[9px] text-green-500/70 font-black uppercase tracking-widest mb-0.5">TOPLAM GİRİŞ</span>
                      <span className="text-base font-black text-green-500 font-mono">₺{ozet.genel.giris.toLocaleString('tr-TR', {minimumFractionDigits:2})}</span>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex flex-col">
                      <span className="text-[9px] text-red-500/70 font-black uppercase tracking-widest mb-0.5">TOPLAM ÇIKIŞ</span>
                      <span className="text-base font-black text-red-500 font-mono">₺{ozet.genel.cikis.toLocaleString('tr-TR', {minimumFractionDigits:2})}</span>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1E] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">NET PARA</span>
                    <span className={`text-xl font-black font-mono ${ozet.genel.net >= 0 ? 'text-yellow-400' : 'text-red-500'}`}>
                      {ozet.genel.net >= 0 ? '+' : ''}₺{ozet.genel.net.toLocaleString('tr-TR', {minimumFractionDigits:2})}
                    </span>
                  </div>
                </div>

              </div>

              {/* ================= SARI BUTONLU LİSTE BAŞLIĞI ================= */}
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 mt-2">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="text-[#8E052C]">⚡</span> SON 10 KASA HAREKETİ
                </h3>
                
                <button 
                  onClick={onSeeAll}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2.5 rounded-lg font-black uppercase text-[11px] tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all transform hover:scale-105 active:scale-95"
                >
                  TÜM LİSTEYİ GÖR
                </button>
              </div>
              
              {/* ================= DİKEY LİSTE ================= */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center px-4 py-2 bg-[#1A1A1E] border border-white/5 rounded-t-xl text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  <div className="w-24">TARİH</div>
                  <div className="w-20 text-center">YÖN</div>
                  <div className="flex-1">KATEGORİ / AÇIKLAMA</div>
                  <div className="w-24 text-center">İŞLEM YAPAN</div>
                  <div className="w-28 text-right">TUTAR (₺)</div>
                </div>

                {sonIslemler.length > 0 ? sonIslemler.map((islem, idx) => {
                  const isGiris = islem.islem_yonu === 'GİRİŞ';
                  // MÜDÜR: Senin backend tarihi "islem_tarihi" olarak atıyor
                  const d = new Date(islem.islem_tarihi || new Date());
                  const tarih = d.toLocaleDateString('tr-TR');
                  const saat = d.toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});

                  return (
                    <div key={idx} className="flex items-center px-4 py-3 bg-black/30 border border-white/5 hover:bg-white/5 transition-colors rounded-lg group">
                      
                      <div className="w-24">
                        <div className="text-[11px] font-bold text-white">{tarih}</div>
                        <div className="text-[9px] text-gray-500 font-mono">{saat}</div>
                      </div>
                      
                      <div className="w-20 text-center">
                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                          isGiris ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'
                        }`}>
                          {isGiris ? 'GİRİŞ' : 'ÇIKIŞ'}
                        </span>
                      </div>

                      <div className="flex-1 pr-4">
                        <div className="text-[11px] font-bold text-white uppercase tracking-wide">{islem.kategori || 'Belirtilmemiş'}</div>
                        <div className="text-[9px] text-gray-500 font-medium truncate mt-0.5">{islem.aciklama || '-'}</div>
                      </div>

                      <div className="w-24 text-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{islem.islem_yapan || 'Admin'}</span>
                      </div>

                      <div className={`w-28 text-right text-sm font-black font-mono tracking-tighter ${isGiris ? 'text-green-400' : 'text-red-400'}`}>
                        {isGiris ? '+' : '-'}₺{parseFloat(islem.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-gray-500 text-xs font-black uppercase tracking-widest w-full py-6 text-center bg-white/5 rounded-b-xl border border-white/5">
                    Kayıt bulunamadı.
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}