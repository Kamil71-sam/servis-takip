import { useState, useEffect } from 'react';
import api from '../api';

export default function YedekParcaTakibi() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState('');

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
              service_id: key, 
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

  const filtrelenmis = talepler.filter(t => 
    String(t.service_id).includes(arama) || 
    t.parcalar.some((p: any) => (p.description || '').toLowerCase().includes(arama.toLowerCase()) || (p.part_name || '').toLowerCase().includes(arama.toLowerCase()) || (p.barkod || '').toLowerCase().includes(arama.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
      
      {/* ÜST PANEL - KİBAR BOYUT */}
      <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-5 mb-6 shadow-2xl shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-[#8E052C]">📦</span> SERVİS PARÇA LİSTESİ
          </h2>
          <button onClick={fetchTalepler} className="bg-white/5 hover:bg-[#8E052C]/20 px-4 py-2 rounded-xl text-xs font-black transition-all border border-white/10">
            🔄 YENİLE
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Servis ID, Parça veya Barkod Ara..." 
          className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#8E052C]/50"
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
        {loading ? (
          <div className="text-center py-20 font-black uppercase text-gray-500 animate-pulse">Sistem Taranıyor...</div>
        ) : filtrelenmis.map((servis, i) => {
          const isFinished = (servis.durum || '').toLowerCase() === 'geldi';

          return (
            <div key={i} className={`rounded-3xl border transition-all overflow-hidden ${isFinished ? 'bg-black/20 border-white/5 opacity-70' : 'bg-[#1A1A1E] border-white/10 shadow-xl'}`}>
              
              {/* BAŞLIK - ESKİ STANDART BOYUT */}
              <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-black">SERVİS NO</span>
                  <span className="text-2xl font-black text-[#8E052C]">#{servis.service_id}</span>
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

              {/* PARÇALAR LİSTESİ */}
              <div className="p-4 bg-black/10">
                <div className="grid grid-cols-1 gap-3">
                  {servis.parcalar.map((p: any, pi: number) => (
                    <div key={pi} className="flex flex-col bg-black/40 p-4 rounded-2xl border border-white/5">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-[#8E052C]/20 text-[#8E052C] rounded-xl flex items-center justify-center text-xs font-black">{pi + 1}</div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-white uppercase tracking-wider">{p.part_name}</span>
                              
                              {/* 🚨 BARKOD BİR TIK KÜÇÜLTÜLDÜ (text-xs) VE KİBARLAŞTIRILDI 🚨 */}
                              {p.barkod && (
                                <div className="bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono text-sky-400 tracking-wider flex items-center gap-1.5">
                                  <span className="text-xs">🎫</span> {p.barkod}
                                </div>
                              )}
                            </div>
                            <div className="text-[9px] text-gray-500 font-black mt-0.5 uppercase">ADET: {p.quantity}</div>
                          </div>
                        </div>
                        <div className="text-sm font-black text-gray-400">
                          {p.price ? `₺${(p.price * p.quantity).toFixed(2)}` : '---'}
                        </div>
                      </div>

                      {p.description && p.description.trim() !== '' && (
                        <div className="mt-3 ml-12 bg-black/30 border-l-2 border-[#8E052C]/50 pl-3 py-1.5 rounded-r-lg">
                          <span className="text-[10px] text-[#8E052C] font-black uppercase tracking-widest mr-2">NOT:</span>
                          <span className="text-xs text-gray-300 italic">{p.description}</span>
                        </div>
                      )}

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