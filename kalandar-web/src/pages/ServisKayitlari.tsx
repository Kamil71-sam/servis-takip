import { useEffect, useState } from 'react';
import api from '../api'; // 🚨 MÜDÜR: Eski axios gitti, ana santralimiz geldi!

export default function ServisKayitlari() {
  const [servisler, setServisler] = useState<any[]>([]);
  const [arama, setArama] = useState('');
  const [loading, setLoading] = useState(true);

  // DÜZENLEME MODALI İÇİN STATELER
  const [showEditModal, setShowEditModal] = useState(false);
  const [seciliServis, setSeciliServis] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    atanan_usta: '',
    offer_price: '',
    issue_text: '',
    musteri_notu: ''
  });

  // 1. GETİRME MOTORU (Temizlendi)
  const verileriGetir = async () => {
    try {
      // 🚨 ZIRHLI HAMLE: Sadece rotayı yazıyoruz
      const res = await api.get('/services/all');
      setServisler(res.data);
    } catch (err) { 
      console.error("Servis listesi gelmedi:", err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { verileriGetir(); }, []);

  // 2. SİLME (ARŞİVE KALDIRMA) MOTORU (Temizlendi)
  const silmeIslemi = async (id: number, plaka: string) => {
    const onay = window.confirm(`${plaka} numaralı kaydı arşive kaldırmak istediğine emin misin müdür?`);
    if (!onay) return;

    try {
      // 🚨 ZIRHLI HAMLE
      await api.delete(`/services/${id}`);
      alert("Kayıt başarıyla arşive kaldırıldı.");
      verileriGetir(); 
    } catch (err: any) {
      alert("Silme işlemi başarısız: " + (err.response?.data?.error || err.message || err.error));
    }
  };

  const duzenleModalAc = (servis: any) => {
    setSeciliServis(servis);
    // Backend'e yollarken form keyleri İngilizce kalmalı, ama veriyi Türkçe keylerden (durum, usta vb) alıyoruz
    setEditForm({
      status: servis.durum || 'Yeni Kayıt',
      atanan_usta: servis.usta || '',
      offer_price: servis.offer_price || '',
      issue_text: servis.ariza || '',
      musteri_notu: servis.eklenen_notlar || ''
    });
    setShowEditModal(true);
  };

  // 3. GÜNCELLEME MOTORU (Temizlendi)
  const guncellemeIslemi = async () => {
    try {
      // 🚨 ZIRHLI HAMLE
      await api.put(`/services/${seciliServis.id}`, editForm);
      alert("Kayıt jilet gibi güncellendi!");
      setShowEditModal(false);
      verileriGetir(); 
    } catch (err: any) {
      alert("Güncelleme hatası: " + (err.response?.data?.error || err.message || err.error));
    }
  };

  const durumRenkleri: any = {
    'Yeni Kayıt': 'bg-red-600 text-white',
    'Onay Bekliyor': 'bg-transparent border border-white/30 text-white',
    'Onaylandı': 'bg-blue-600 text-white',
    'Tamirde': 'bg-blue-500 text-white',
    'Parça Bekliyor': 'bg-orange-500 text-white',
    'Hazır': 'bg-green-600 text-white',
    'Teslim Edildi': 'bg-gray-600 text-gray-300',
    'İptal Edildi': 'bg-red-900 text-gray-300'
  };

  return (
    <div className="bg-[#0F0F12] border border-white/10 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative mt-4">
      
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
        <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
          <span className="text-[#8E052C]">📋</span> Servis Arşivi
        </h2>
        <input 
          type="text" 
          placeholder="Kayıt No, Müşteri veya Seri No ara..." 
          className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white w-80 outline-none font-semibold focus:border-[#8E052C] transition-all"
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 font-bold uppercase tracking-widest">Kayıtlar Çekiliyor...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0F0F12] z-10">
              <tr className="border-b border-[#8E052C]/30 text-[10px] text-gray-500 uppercase tracking-widest font-black">
                <th className="p-3">Müşteri & Kayıt</th>
                <th className="p-3">Cihaz Bilgisi</th>
                <th className="p-3">Notlar & Şikayet</th>
                <th className="p-3">Operasyon</th>
                <th className="p-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {servisler
                .filter(s => {
                  const sNo = s.plaka || '';
                  const mAdi = s.musteri_adi || '';
                  const serNo = s.seri_no || '';
                  return sNo.includes(arama) || mAdi.toLowerCase().includes(arama.toLowerCase()) || serNo.includes(arama);
                })
                .map((s, index) => {
                  // MÜDÜRÜN BACKEND'İNDEN GELEN KESİN ŞİFRELER (Network Tablosuna Göre)
                  const sNo = s.plaka;
                  const mAdi = s.musteri_adi;
                  const tarih = s.tarih; // "09.04.2026 12:53" olarak zaten hazır geliyor
                  const cTuru = s.cihaz_tipi;
                  const markaModel = s.marka_model; 
                  const seriNo = s.seri_no;
                  const garanti = s.garanti;
                  const ariza = s.ariza;
                  const mNotu = s.eklenen_notlar;
                  const durum = s.durum || 'Yeni Kayıt';
                  const usta = s.usta;
                  const fiyat = s.offer_price;

                  return (
                    <tr key={index} className="hover:bg-white/[0.02] transition-all group align-top">
                      
                      <td className="p-4 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-lg font-black text-[#8E052C] tracking-tight">#{sNo}</span>
                          <span className="text-sm font-bold text-white leading-tight uppercase">{mAdi}</span>
                          <span className="text-[10px] text-gray-500 font-bold mt-1">
                            {tarih || 'Tarih Yok'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-black text-gray-300 uppercase tracking-wide">{cTuru || 'TÜR BELİRTİLMEDİ'}</div>
                          <div className="text-sm font-bold text-white">{markaModel || 'MARKA MODEL YOK'}</div>
                          <div className="text-[11px] text-gray-500 font-mono mt-1 border bg-white/5 border-white/10 px-2 py-0.5 rounded inline-block w-max">
                            SN: {seriNo || 'Belirtilmedi'}
                          </div>
                          <div className="text-[10px] font-bold mt-1 flex items-center gap-1">
                            <span className="text-gray-500">🛡️ Garanti:</span> 
                            <span className={garanti?.includes('Var') ? 'text-green-500' : 'text-red-500'}>
                              {garanti || 'Yok'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 py-5 w-1/3">
                        <div className="flex flex-col gap-3">
                          <div>
                            <span className="text-[9px] font-black text-[#8E052C] uppercase tracking-widest block mb-0.5">Müşteri Şikayeti</span>
                            <p className="text-xs text-white font-medium leading-relaxed break-words">
                              {ariza || 'Şikayet girilmemiş.'}
                            </p>
                          </div>
                          {mNotu && (
                            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-0.5">Ek Not / Aksesuar</span>
                              <p className="text-[11px] text-gray-300 font-medium leading-relaxed break-words">
                                {mNotu}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 py-5">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg ${durumRenkleri[durum] || 'bg-gray-700 text-white'}`}>
                            {durum}
                          </span>
                          <div className="flex items-center gap-1.5 mt-2 bg-black/30 px-2 py-1 rounded-md border border-white/5">
                            <span className="text-gray-500">🛠️</span>
                            <span className="text-[11px] font-bold text-gray-300">{usta || 'Atanmadı'}</span>
                          </div>
                          {parseFloat(fiyat) > 0 && (
                            <div className="text-[11px] font-black text-green-500 mt-1">
                              ₺{fiyat}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 py-5 text-right align-middle">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => duzenleModalAc(s)}
                            className="w-9 h-9 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 flex items-center justify-center transition-all"
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => silmeIslemi(s.id, sNo)}
                            className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center transition-all"
                            title="Sil (Arşive Kaldır)"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              
              {servisler.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center p-10 text-gray-500 font-bold uppercase">
                    Şantiyede kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 🚀 DÜZENLEME MODALI */}
      {showEditModal && seciliServis && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F12] border-2 border-[#8E052C]/30 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-white/5 bg-[#8E052C]/10 flex justify-between items-center">
              <div>
                <h3 className="font-black text-white uppercase text-base tracking-tighter">Kayıt Düzenle</h3>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                  #{seciliServis.plaka} - {seciliServis.musteri_adi}
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-hide">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-black uppercase ml-1 tracking-widest">Durum</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})} 
                    className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-bold outline-none focus:border-[#8E052C]"
                  >
                    {Object.keys(durumRenkleri).map(durum => (
                      <option key={durum} value={durum} className="bg-[#1A1A1E]">{durum}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-black uppercase ml-1 tracking-widest">Atanan Usta</label>
                  <select 
                    value={editForm.atanan_usta}
                    onChange={(e) => setEditForm({...editForm, atanan_usta: e.target.value})} 
                    className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-bold outline-none focus:border-[#8E052C]"
                  >
                    <option value="" className="bg-[#1A1A1E]">Usta Seç...</option>
                    <option value="Usta 1 (Kemal)" className="bg-[#1A1A1E]">Usta 1 (Kemal)</option>
                    <option value="Usta 2" className="bg-[#1A1A1E]">Usta 2</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-black uppercase ml-1 tracking-widest">Servis Ücreti (TL)</label>
                <input 
                  type="number" 
                  value={editForm.offer_price}
                  onChange={(e) => setEditForm({...editForm, offer_price: e.target.value})} 
                  placeholder="Örn: 1500" 
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-bold outline-none focus:border-[#8E052C]" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-black uppercase ml-1 tracking-widest">Arıza / Şikayet</label>
                <textarea 
                  value={editForm.issue_text}
                  onChange={(e) => setEditForm({...editForm, issue_text: e.target.value})} 
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white h-20 outline-none resize-none focus:border-[#8E052C]"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-black uppercase ml-1 tracking-widest">Ek Not / Aksesuar</label>
                <textarea 
                  value={editForm.musteri_notu}
                  onChange={(e) => setEditForm({...editForm, musteri_notu: e.target.value})} 
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white h-16 outline-none resize-none focus:border-[#8E052C]"
                ></textarea>
              </div>

            </div>

            <div className="p-4 border-t border-white/5 bg-black/40 flex justify-end gap-4 mt-auto">
               <button onClick={() => setShowEditModal(false)} className="text-gray-500 font-bold uppercase text-xs hover:text-white transition-all">VAZGEÇ</button>
               <button onClick={guncellemeIslemi} className="bg-[#8E052C] text-white px-6 py-2.5 rounded-lg font-black text-xs uppercase shadow-lg shadow-red-950/30 hover:scale-[1.02] transition-all">GÜNCELLE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}