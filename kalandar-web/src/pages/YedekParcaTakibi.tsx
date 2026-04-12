import { useState, useEffect } from 'react';
import api from '../api';

export default function YedekParcaTakibi() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState('');

  const fetchTalepler = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/material-requests/all');
      if (res.data && res.data.success) {
        const rawData = Array.isArray(res.data.data) ? res.data.data : [];
        
        // 🚨 MÜDÜRÜN GRUPLAMA MOTORU (MİLLİ VE YERLİ)
        const gruplanmis = rawData.reduce((acc: any, item: any) => {
          // Senin F12 görüntüsünde gördüğümüz gerçek kolon: 'service_id'
          const key = item.service_id; 
          
          if (!acc[key]) {
            acc[key] = {
              service_id: key,
              description: item.description || 'Not Yok',
              parcalar: [],
              toplam_maliyet: 0,
              durum: item.status || 'BEKLEMEDE'
            };
          }
          
          acc[key].parcalar.push(item);

          // Fiyat verisi 'price' veya 'alis_fiyati' olarak geliyorsa ekle
          const fiyat = parseFloat(item.price || item.alis_fiyati || 0);
          const miktar = parseInt(item.quantity || 1);
          acc[key].toplam_maliyet += fiyat * miktar;
          
          return acc;
        }, {});
        
        setTalepler(Object.values(gruplanmis));
      }
    } catch (error) {
      console.error("Talepler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTalepler(); }, []);

  const filtrelenmis = talepler.filter(t => 
    String(t.service_id).includes(arama) || 
    (t.description || '').toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
      
      {/* ÜST PANEL */}
      <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-5 mb-6 shadow-2xl shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-[#8E052C]">📦</span> SERVİS PARÇA LİSTESİ
          </h2>
          <button onClick={fetchTalepler} className="bg-white/5 hover:bg-[#8E052C]/20 px-4 py-2 rounded-xl text-xs font-black transition-all border border-white/10">
            🔄 YENİLE
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Servis ID Ara..." 
          className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#8E052C]/50"
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      {/* GRUPLANMIŞ KARTLAR */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
        {loading ? (
          <div className="text-center py-20 font-black uppercase text-gray-500 animate-pulse">Paketler Açılıyor...</div>
        ) : filtrelenmis.map((servis, i) => {
          const isFinished = (servis.durum || '').toLowerCase() === 'geldi';

          return (
            <div key={i} className={`rounded-3xl border transition-all overflow-hidden ${isFinished ? 'bg-black/20 border-white/5 opacity-70' : 'bg-[#1A1A1E] border-white/10 shadow-xl'}`}>
              
              {/* KART BAŞLIĞI: SERVİS ID VE MALİYET */}
              <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-black">SERVİS NO</span>
                    <span className="text-2xl font-black text-[#8E052C]">#{servis.service_id}</span>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">CİHAZ / NOT</span>
                    <span className="text-xs font-bold text-gray-300 uppercase italic truncate max-w-[200px]">{servis.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <span className="text-[10px] text-gray-500 font-black block">TOPLAM TUTAR</span>
                      <span className="text-xl font-black text-green-500">
                        {servis.toplam_maliyet > 0 ? `₺${servis.toplam_maliyet.toFixed(2)}` : '₺0.00'}
                      </span>
                   </div>
                   <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${isFinished ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-[#8E052C]'}`}>
                     {servis.durum}
                   </div>
                </div>
              </div>

              {/* PARÇALAR */}
              <div className="p-4 bg-black/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {servis.parcalar.map((p: any, pi: number) => (
                    <div key={pi} className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-[#8E052C]/20 text-[#8E052C] rounded-full flex items-center justify-center text-[10px] font-black">{pi + 1}</div>
                        <div>
                          <div className="text-xs font-black text-white uppercase">{p.part_name}</div>
                          <div className="text-[9px] text-gray-500 font-black">ADET: {p.quantity}</div>
                        </div>
                      </div>
                      <div className="text-xs font-black text-gray-400">
                        {p.price ? `₺${(p.price * p.quantity).toFixed(2)}` : '---'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}