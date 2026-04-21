import React, { useEffect, useState, useMemo } from 'react';
import api from '../api'; // 🚨 MÜDÜR: Axios yerine kendi merkezimiz

export default function StokDurumu() {
 
 
 

const [envanter, setEnvanter] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState('');

  // 🚨 SAYFALAMA MOTORU HAFIZASI
  const [sayfa, setSayfa] = useState(1);
  const KAYIT_BASINA = 3; // Müdürün emri: Sayfa başı 2 kayıt

  // 🚨 Arama değişince şak diye 1. sayfaya zıplasın!
  useEffect(() => {
    setSayfa(1);
  }, [arama]);

  // Düzenleme Modalı State'leri



 /*
  const [envanter, setEnvanter] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState('');
*/







  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Fiyat Geçmişi Modalı State'leri
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 1. VERİLERİ GETİR (Santrale Bağlandı)
  const fetchEnvanter = async () => {
    setLoading(true);
    try {
      // 🚨 MÜDÜR: Çift motor güvenliği. Adres /stok/all veya /api/stok/all olabilir.
      const res = await api.get(`/stok/all`).catch(() => api.get(`/api/stok/all`));
      
      if (res.data && res.data.success) {
        setEnvanter(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        // Fallback: Backend belki de direkt array dönüyordur
        setEnvanter(res.data);
      }
    } catch (e) {
      console.error("Envanter çekilemedi:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvanter();
  }, []);

  // 2. SİLME İŞLEMİ (Santrale Bağlandı)
  const handleSil = async (id: number, malzeme_adi: string) => {
    if (window.confirm(`🛑 DİKKAT!\n\n"${malzeme_adi}" isimli ürünü envanterden KALICI olarak silmek istediğinize emin misiniz?`)) {
      try {
        const res = await api.delete(`/stok/delete/${id}`).catch(() => api.delete(`/api/stok/delete/${id}`));
        if (res.data && res.data.success !== false) {
          fetchEnvanter(); // Listeyi yenile
        }
      } catch (e) {
        alert("Silme işlemi başarısız.");
      }
    }
  };

  // 3. GÜNCELLEME İŞLEMİ (Santrale Bağlandı)
  const handleGuncelle = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!selectedItem) return;

    try {
      const payload = {
        malzeme_adi: selectedItem.malzeme_adi,
        marka: selectedItem.marka,
        uyumlu_cihaz: selectedItem.uyumlu_cihaz,
        miktar: parseInt(selectedItem.miktar) || 0,
        alis_fiyati: parseFloat(selectedItem.alis_fiyati) || 0,
        barkod: selectedItem.barkod
      };

      const res = await api.put(`/stok/update/${selectedItem.id}`, payload)
                           .catch(() => api.put(`/api/stok/update/${selectedItem.id}`, payload));

      if (res.data && res.data.success !== false) {
        setEditModalVisible(false);
        fetchEnvanter();
      }
    } catch (err) {
      alert("Güncelleme yapılamadı.");
    }
  };

  // FİYAT GEÇMİŞİNİ GETİR (Santrale Bağlandı)
  const handleHistory = async (item: any) => {
    setSelectedItem(item);
    setHistoryModalVisible(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/stok/history/${item.id}`).catch(() => api.get(`/api/stok/history/${item.id}`));
      
      if (res.data && res.data.success) {
        setPriceHistory(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setPriceHistory(res.data);
      }
    } catch (e) {
      console.error("Geçmiş çekilemedi:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 4. ARAMA MOTORU (🚨 Türkçe Kalkanı Eklendi)
  const filtrelenmisListe = useMemo(() => {
    return envanter.filter(i => {
      const aranan = String(arama || '').toLocaleLowerCase('tr-TR');
      const isimMatch = String(i.malzeme_adi || '').toLocaleLowerCase('tr-TR').includes(aranan);
      const barkodMatch = String(i.barkod || '').toLocaleLowerCase('tr-TR').includes(aranan);
      return isimMatch || barkodMatch;
    });
  }, [arama, envanter]);

 



// YENİ: MATEMATİK (GLCK ve DİĞER SAYILARI)
  const toplamKalem = filtrelenmisListe.length;
  const glckSayisi = filtrelenmisListe.filter(i => String(i.barkod || '').toUpperCase().startsWith('GLCK')).length;
  const digerSayisi = toplamKalem - glckSayisi;

  // 🚨 SAYFALAMA MATEMATİĞİ
  const toplamSayfa = Math.ceil(filtrelenmisListe.length / KAYIT_BASINA) || 1;
  const gosterilecekListe = filtrelenmisListe.slice((sayfa - 1) * KAYIT_BASINA, sayfa * KAYIT_BASINA);

  return (


/*
  const toplamKalem = filtrelenmisListe.length;
  const glckSayisi = filtrelenmisListe.filter(i => String(i.barkod || '').toUpperCase().startsWith('GLCK')).length;
  const digerSayisi = toplamKalem - glckSayisi;

  return (
*/


    <div className="bg-[#0F0F12] border border-white/10 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative mt-4">
      
      {/* ÜST BARA & ARAMA */}
      <div className="p-5 border-b border-white/5 bg-white/5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-[#8E052C] text-2xl">📦</span> Stok Durumu
          </h2>
          
          {/* İSTATİSTİK ÇUBUĞU */}
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-4">
            <div className="bg-black/30 border border-white/5 px-4 py-2 rounded-lg flex items-center gap-3 shadow-inner">
              <span>TOPLAM KALEM: <span className="text-white font-black">{toplamKalem}</span></span>
              <span className="text-gray-700">|</span>
              <span>GLCK: <span className="text-[#8E052C] font-black">{glckSayisi}</span></span>
              <span className="text-gray-700">|</span>
              <span>DİĞER: <span className="text-sky-500 font-black">{digerSayisi}</span></span>
            </div>
            <button onClick={fetchEnvanter} className="bg-black/30 border border-white/5 hover:bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer text-gray-400 hover:text-white">
              🔄 Yenile
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <input 
            type="text" 
            placeholder="Ara (İsim veya Barkod)..." 
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white flex-1 outline-none font-semibold focus:border-[#8E052C] transition-all shadow-inner"
          />
        </div>
      </div>

      {/* TABLO ALANI */}
      <div className="flex-1 overflow-auto scrollbar-hide p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 font-bold uppercase tracking-widest text-sm">Depo Taranıyor...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0F0F12] z-10">
              <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-widest font-black">
                <th className="p-3 w-[25%]">Barkod No</th>
                <th className="p-3 w-[35%]">Malzeme Detayları</th>
                <th className="p-3 text-center">Stok</th>
                <th className="p-3 text-right">Alış Fiyatı</th>
                <th className="p-3 text-right pr-6">İşlem</th>
              </tr>
            </thead>




          <tbody className="divide-y divide-white/5">
              {/* 🚨 filtrelenmisListe YERİNE gosterilecekListe KULLANIYORUZ */}
              {gosterilecekListe.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-all align-middle opacity-90 hover:opacity-100">
                  
                  {/* BARKOD */}
                  <td className="p-4 py-5">
                    <div className="text-[14px] font-black text-white tracking-widest bg-[#0a0a0c] border border-white/5 px-3 py-3 rounded-xl shadow-inner whitespace-nowrap w-max">
                      {item.barkod || 'BARKOD YOK'}
                    </div>
                  </td>

                  {/* DETAYLAR */}
                  <td className="p-4 py-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest w-28 shrink-0">CİHAZ CİNSİ:</span>
                        <span className="text-sm font-black text-white uppercase">{item.malzeme_adi || 'BİLİNMİYOR'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest w-28 shrink-0">MARKA:</span>
                        <span className="text-xs font-bold text-gray-400 uppercase">{item.marka || 'BELİRTİLMEDİ'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest w-28 shrink-0">UYUMLU CİHAZ:</span>
                        <span className="text-xs font-bold text-sky-400 bg-[#0a192f] border border-sky-900/50 px-2.5 py-1 rounded-md shadow-sm">{item.uyumlu_cihaz || 'Belirtilmedi'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Stok Miktarı */}
                  <td className="p-4 py-5 text-center">
                    <span className={`px-4 py-2 rounded-xl text-sm font-black shadow-sm inline-block ${item.miktar < 5 ? 'bg-red-900/40 text-red-400 border border-red-500/30' : 'bg-[#1A1A1E] text-green-500 border border-white/5'}`}>
                      {item.miktar}
                    </span>
                  </td>

                  {/* Alış Fiyatı */}
                  <td className="p-4 py-5 text-right">
                    <span className="text-lg font-black text-gray-300">
                      ₺{parseFloat(item.alis_fiyati || 0).toFixed(2)}
                    </span>
                  </td>

                  {/* Aksiyon Butonları */}
                  <td className="p-4 py-5 text-right pr-6">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleHistory(item)}
                        className="p-2.5 bg-[#0a192f] hover:bg-blue-900/50 text-blue-400 hover:text-white rounded-xl transition-all border border-blue-500/20 shadow-lg"
                        title="Fiyat Geçmişi"
                      >
                        🕒
                      </button>
                      <button 
                        onClick={() => { setSelectedItem(item); setEditModalVisible(true); }}
                        className="p-2.5 bg-[#1A1A1E] hover:bg-gray-700 text-gray-300 rounded-xl transition-all shadow-lg border border-white/5"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleSil(item.id, item.malzeme_adi)}
                        className="p-2.5 bg-[#8E052C]/20 hover:bg-[#8E052C]/40 text-red-400 hover:text-white rounded-xl transition-all border border-[#8E052C]/30 shadow-lg"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {filtrelenmisListe.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center p-10 text-gray-600 font-bold uppercase tracking-widest bg-white/5 rounded-2xl border border-white/5">
                    Envanterde eşleşen kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 🚨 SAYFALAMA KUMANDASI (OKLAR) EKLENDİ */}
      {!loading && filtrelenmisListe.length > 0 && (
        <div className="p-4 border-t border-white/5 bg-[#0F0F12] flex justify-between items-center shrink-0">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            Toplam {filtrelenmisListe.length} Kayıt
          </span>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSayfa(prev => Math.max(prev - 1, 1))}
              disabled={sayfa === 1}
              className="bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-black transition-all flex items-center gap-2"
            >
              <span>◀</span> ÖNCEKİ
            </button>
            
            <span className="text-[#8E052C] font-black text-sm">
              {sayfa} / {toplamSayfa}
            </span>
            
            <button 
              onClick={() => setSayfa(prev => Math.min(prev + 1, toplamSayfa))}
              disabled={sayfa === toplamSayfa}
              className="bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-black transition-all flex items-center gap-2"
            >
              SONRAKİ <span>▶</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 🚨 MODAL 1: DÜZENLEME MODALI 🚨 */}

           
      {/* ----------------------------------------------------------- */}
      {editModalVisible && selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 text-center">Kayıt Düzenle</h3>
            
            <form onSubmit={handleGuncelle} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cihaz Cinsi</label>
                <input required type="text" value={selectedItem.malzeme_adi} onChange={e => setSelectedItem({...selectedItem, malzeme_adi: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#8E052C]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Marka</label>
                  <input type="text" value={selectedItem.marka || ''} onChange={e => setSelectedItem({...selectedItem, marka: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#8E052C]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Miktar (Stok)</label>
                  <input required type="number" min="0" value={selectedItem.miktar} onChange={e => setSelectedItem({...selectedItem, miktar: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#8E052C]" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Barkod</label>
                <input type="text" value={selectedItem.barkod || ''} onChange={e => setSelectedItem({...selectedItem, barkod: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#8E052C]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Uyumlu Cihaz</label>
                  <input type="text" value={selectedItem.uyumlu_cihaz || ''} onChange={e => setSelectedItem({...selectedItem, uyumlu_cihaz: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#8E052C]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Alış Fiyatı (₺)</label>
                  <input required type="number" step="0.01" min="0" value={selectedItem.alis_fiyati} onChange={e => setSelectedItem({...selectedItem, alis_fiyati: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#8E052C]" />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setEditModalVisible(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs">İptal</button>
                <button type="submit" className="flex-1 bg-[#8E052C] hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs shadow-lg">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 🚨 MODAL 2: FİYAT GEÇMİŞİ (SAAT İKONU) MODALI 🚨 */}
      {/* ----------------------------------------------------------- */}
      {historyModalVisible && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1A1A1E] border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl flex flex-col max-h-[80vh]">
            
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <span>🕒</span> Fiyat Tarihçesi
                </h3>
                <p className="text-xs text-sky-400 font-bold mt-2 bg-sky-900/20 px-2 py-1 rounded inline-block">
                  {selectedItem?.malzeme_adi}
                </p>
              </div>
              <button onClick={() => setHistoryModalVisible(false)} className="w-8 h-8 bg-red-900/40 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors font-black">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 flex flex-col gap-3">
              {historyLoading ? (
                <div className="text-center text-gray-500 font-bold uppercase tracking-widest text-xs py-10">Kayıtlar Taranıyor...</div>
              ) : priceHistory.length > 0 ? (
                priceHistory.map((h, i) => {
                  const tarih = h.degisim_tarihi || h.created_at;
                  const formatliTarih = tarih ? new Date(tarih).toLocaleString('tr-TR') : 'Tarih Bilinmiyor';
                  

                  const eski = parseFloat(h.eski_alis_fiyati || h.eski_alis || 0).toFixed(2);
                  const yeni = parseFloat(h.yeni_alis_fiyati || h.yeni_alis || 0).toFixed(2);


                 // const eski = parseFloat(h.eski_fiyat || h.old_price || 0).toFixed(2);
                 // const yeni = parseFloat(h.yeni_fiyat || h.new_price || 0).toFixed(2);
                  const artisMi = parseFloat(yeni) > parseFloat(eski);

                  return (
                    <div key={i} className="bg-black/50 border border-white/5 p-4 rounded-xl flex flex-col gap-2 hover:bg-white/[0.02] transition-colors">
                      <span className="text-[10px] text-gray-500 font-bold">{formatliTarih}</span>
                      <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Alış Fiyatı Değişimi</div>
                      <div className="flex items-center gap-3 text-lg font-black">
                        <span className="text-red-500 flex items-center gap-1">🏷️ {eski} ₺</span>
                        <span className="text-gray-600">➔</span>
                        <span className={artisMi ? "text-red-500" : "text-green-500"}>{yeni} ₺</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-600 font-bold uppercase tracking-widest text-[10px] py-10 bg-white/5 rounded-xl border border-white/5">
                  Geçmiş fiyat değişimi bulunamadı.
                </div>
              )}
            </div>

            <button onClick={() => setHistoryModalVisible(false)} className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white font-black py-3 rounded-xl transition-colors uppercase tracking-widest text-xs">
              KAPAT
            </button>
          </div>
        </div>
      )}

    </div>
  );
}