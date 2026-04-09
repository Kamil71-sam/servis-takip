import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TamamlananIsler() {
  const [islemler, setIslemler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // FİLTRE STATELERİ
  const [durumFiltresi, setDurumFiltresi] = useState('Tümü'); // Tümü, Teslim Edildi, İptal Edildi
  const [arama, setArama] = useState(''); // Plaka veya Müşteri
  const [tarihArama, setTarihArama] = useState(''); // Örn: 04.2026

  const API_URL = "http://localhost:3000";
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const verileriGetir = async () => {
    try {
      // MÜDÜR DİKKAT: Biten işleri çeken backend rotasını buraya yazmalısın. 
      // Şimdilik '/services/tamamlanan' olarak varsaydım.
      const res = await axios.get(`${API_URL}/services/tamamlanan`, { headers });
      setIslemler(res.data);
    } catch (err) { 
      console.error("Tamamlanan işler çekilemedi:", err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { verileriGetir(); }, []);

  // Rozet Renkleri (Sadece biten işler için)
  const durumRenkleri: any = {
    'Teslim Edildi': 'bg-gray-600 text-gray-100 border border-gray-400/30',
    'İptal Edildi': 'bg-red-900/80 text-red-100 border border-red-500/30'
  };

  // FİLTRELEME MOTORU
  const filtrelenmisIslemler = islemler.filter(islem => {
    // 1. Durum Filtresi (Açılır Kutu)
    const durum = islem.durum || '';
    const durumUyuyor = durumFiltresi === 'Tümü' || durum === durumFiltresi;

    // 2. Metin Araması (Müşteri veya Kayıt No)
    const plaka = islem.plaka || '';
    const musteri = islem.musteri_adi || '';
    const metinUyuyor = plaka.includes(arama) || musteri.toLowerCase().includes(arama.toLowerCase());

    // 3. Tarih Araması (Örn: 04.2026)
    const tarih = islem.tarih || ''; // Backend'den "09.04.2026 12:53" gibi geldiğini varsayıyoruz
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
          {/* AÇILIR KUTU (Durum Filtresi) */}
          <select 
            value={durumFiltresi}
            onChange={(e) => setDurumFiltresi(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none focus:border-green-500 transition-all cursor-pointer"
          >
            <option value="Tümü" className="bg-[#0F0F12]">Tüm Biten İşler</option>
            <option value="Teslim Edildi" className="bg-[#0F0F12]">📦 Sadece Teslim Edilenler</option>
            <option value="İptal Edildi" className="bg-[#0F0F12]">❌ Sadece İptal Edilenler</option>
          </select>

          {/* TARİH FİLTRESİ */}
          <input 
            type="text" 
            placeholder="Tarih / Ay Ara (Örn: 04.2026)" 
            value={tarihArama}
            onChange={(e) => setTarihArama(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white w-56 outline-none font-semibold focus:border-green-500 transition-all"
          />

          {/* GENEL ARAMA */}
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
              {filtrelenmisIslemler.map((s, index) => {
                const sNo = s.plaka;
                const mAdi = s.musteri_adi;
                const tarih = s.tarih; 
                const cTuru = s.cihaz_tipi;
                const markaModel = s.marka_model; 
                const seriNo = s.seri_no;
                const ariza = s.ariza;
                const mNotu = s.eklenen_notlar;
                const durum = s.durum || 'Bilinmiyor';
                const usta = s.usta;
                const fiyat = s.offer_price;

                return (
                  <tr key={index} className="hover:bg-white/[0.02] transition-all group align-top opacity-80 hover:opacity-100">
                    
                    {/* 1. KOLON: KAYIT NO VE MÜŞTERİ */}
                    <td className="p-4 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-lg font-black text-gray-400 tracking-tight">#{sNo}</span>
                        <span className="text-sm font-bold text-white leading-tight uppercase">{mAdi}</span>
                        <span className="text-[10px] text-gray-500 font-bold mt-1">
                          📅 {tarih || 'Tarih Yok'}
                        </span>
                      </div>
                    </td>

                    {/* 2. KOLON: CİHAZ BİLGİSİ */}
                    <td className="p-4 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-black text-gray-400 uppercase tracking-wide">{cTuru || 'TÜR BELİRTİLMEDİ'}</div>
                        <div className="text-sm font-bold text-gray-300">{markaModel || 'MARKA MODEL YOK'}</div>
                        <div className="text-[11px] text-gray-600 font-mono mt-1 border bg-white/5 border-white/5 px-2 py-0.5 rounded inline-block w-max">
                          SN: {seriNo || 'Belirtilmedi'}
                        </div>
                      </div>
                    </td>

                    {/* 3. KOLON: NOTLAR */}
                    <td className="p-4 py-5 w-1/3">
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

                    {/* 4. KOLON: SONUÇ (Durum ve Fiyat) */}
                    <td className="p-4 py-5">
                      <div className="flex flex-col items-start gap-2">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${durumRenkleri[durum] || 'bg-gray-800 text-gray-400'}`}>
                          {durum}
                        </span>
                        <div className="flex items-center gap-1.5 mt-2 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                          <span className="text-gray-600">🛠️</span>
                          <span className="text-[11px] font-bold text-gray-400">{usta || 'Atanmadı'}</span>
                        </div>
                        {parseFloat(fiyat) > 0 && durum === 'Teslim Edildi' && (
                          <div className="text-xs font-black text-green-600/80 mt-1 flex items-center gap-1">
                            <span>Tahsil Edildi:</span>
                            <span className="text-green-500 text-sm">₺{fiyat}</span>
                          </div>
                        )}
                      </div>
                    </td>

                  </tr>
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