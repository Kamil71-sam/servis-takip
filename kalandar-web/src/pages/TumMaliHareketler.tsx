import { useState, useEffect } from 'react';
import api from '../api';

const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(142,5,44,0.5); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(142,5,44,0.8); }
  
  /* Tarih seçicinin içindeki ikonları karanlık temaya uydurmak için ufak bir dokunuş */
  ::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
`;

export default function TumMaliHareketler({ onBack }: any) {
  const [loading, setLoading] = useState(false);
  const [islemler, setIslemler] = useState<any[]>([]);
  
  // Filtre State'leri
  const [aktifSekme, setAktifSayfa] = useState<'TÜMÜ' | 'GİRİŞ' | 'ÇIKIŞ'>('TÜMÜ');
  const [arama, setArama] = useState('');
  const [kategoriFiltresi, setKategoriFiltresi] = useState('TÜMÜ');
  
  // 🚨 YENİ EKLENEN: TARİH FİLTRELERİ
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');

  const gelirKategorileri = ["Tamir Ücreti Tahsili", "Stok Satışı", "Randevu Geliri Tahsili", "Kasaya Nakit Girişi", "Peşinat"];
  const giderKategorileri = ["Genel Gider Çıkışı", "Stok Alımı", "Diğer Giderler"];

  const fetchGercekVeriler = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/kasa/all');
      if (res.data && res.data.success) {
        setIslemler(res.data.data || []);
      } else {
        setIslemler([]);
      }
    } catch (error) {
      console.error("Mali hareketler çekilemedi:", error);
      alert("Sunucudan veriler alınırken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGercekVeriler();
  }, []);

  const filtrelenmisIslemler = islemler.filter(islem => {
    // 1. Sekme Filtresi (GİRİŞ / ÇIKIŞ)
    if (aktifSekme !== 'TÜMÜ' && islem.islem_yonu !== aktifSekme) return false;
    
    // 2. Kategori Filtresi
    if (kategoriFiltresi !== 'TÜMÜ') {
      if (kategoriFiltresi === 'Stok Alımı') {
        if (islem.kategori !== 'Stok Alımı' && islem.kategori !== 'Mal Alımı') return false;
      } else {
        if (islem.kategori !== kategoriFiltresi) return false;
      }
    }

    // 3. Tarih Aralığı Filtresi 🚨 YENİ MOTOR BURADA ÇALIŞIYOR 🚨
    if (baslangicTarihi || bitisTarihi) {
      const islemTarihiObj = new Date(islem.islem_tarihi || new Date());
      islemTarihiObj.setHours(0, 0, 0, 0); // Sadece gün bazında kıyaslama yapmak için saatleri sıfırladık

      if (baslangicTarihi) {
        const baslangic = new Date(baslangicTarihi);
        baslangic.setHours(0, 0, 0, 0);
        if (islemTarihiObj < baslangic) return false;
      }

      if (bitisTarihi) {
        const bitis = new Date(bitisTarihi);
        bitis.setHours(23, 59, 59, 999); // Bitiş gününün son saniyesine kadar dahil et
        if (islemTarihiObj > bitis) return false;
      }
    }

    // 4. Metin Arama (Müşteri, Servis No, Kategori, Yapan Usta)
    const aramaKucuk = arama.toLowerCase();
    const musteriStr = islem.musteri_adi || '-';
    const servisNoStr = islem.servis_no || '-';
    const ustaStr = islem.islem_yapan || '';
    const aciklamaStr = islem.aciklama || '';
    
    const metin = `${musteriStr} ${servisNoStr} ${islem.kategori} ${aciklamaStr} ${ustaStr}`.toLowerCase();
    if (arama && !metin.includes(aramaKucuk)) return false;

    return true;
  });

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 relative">
        
        {/* ÜST BİLGİ VE GERİ BUTONU */}
        <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-5 mb-4 shadow-xl shrink-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-all shadow-md">
              ←
            </button>
            <div>
              <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
                <span className="text-yellow-500">📋</span> TÜM MALİ HAREKETLER
              </h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Geçmişe Yönelik Detaylı Kasa Dökümü</p>
            </div>
          </div>
          
          <button onClick={fetchGercekVeriler} className="bg-white/5 hover:bg-yellow-500/20 text-gray-300 hover:text-yellow-500 px-5 py-2.5 rounded-xl text-xs font-black transition-all border border-white/10 flex items-center gap-2">
            🔄 LİSTEYİ TAZELE
          </button>
        </div>

        {/* FİLTRELEME PANELİ */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-4 shrink-0 flex flex-col gap-4">
          
          {/* Üst Satır: Sekmeler ve Metin Arama */}
          <div className="flex gap-4">
            <div className="flex gap-2 bg-[#0F0F12] p-1.5 rounded-xl border border-white/5 w-max shrink-0">
              {['TÜMÜ', 'GİRİŞ', 'ÇIKIŞ'].map((sekme) => (
                <button 
                  key={sekme}
                  onClick={() => { setAktifSayfa(sekme as any); setKategoriFiltresi('TÜMÜ'); }}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    aktifSekme === sekme 
                      ? sekme === 'GİRİŞ' ? 'bg-green-500 text-black' : sekme === 'ÇIKIŞ' ? 'bg-red-500 text-black' : 'bg-white text-black'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {sekme === 'TÜMÜ' ? 'TÜM İŞLEMLER' : sekme === 'GİRİŞ' ? '↙ GELİR' : '↗ GİDER'}
                </button>
              ))}
            </div>

            <input 
              type="text" 
              placeholder="Müşteri, Servis No, Usta veya İşlem Ara..." 
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              className="flex-1 bg-[#1A1A1E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-yellow-500/50 transition-all"
            />
            
            <select 
              value={kategoriFiltresi}
              onChange={(e) => setKategoriFiltresi(e.target.value)}
              className="bg-[#1A1A1E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-bold uppercase tracking-widest shrink-0"
            >
              <option value="TÜMÜ">-- TÜM KATEGORİLER --</option>
              {aktifSekme !== 'ÇIKIŞ' && gelirKategorileri.map(k => <option key={k} value={k}>+{k}</option>)}
              {aktifSekme !== 'GİRİŞ' && giderKategorileri.map(k => <option key={k} value={k}>-{k}</option>)}
            </select>
          </div>

          {/* 🚨 Alt Satır: TARİH FİLTRELERİ 🚨 */}
          <div className="flex items-center gap-3 border-t border-white/5 pt-4">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
              📅 TARİH ARALIĞI:
            </span>
            
            <input 
              type="date" 
              value={baslangicTarihi}
              onChange={(e) => setBaslangicTarihi(e.target.value)}
              className="bg-[#1A1A1E] border border-white/10 hover:border-yellow-500/50 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none transition-all cursor-pointer"
              title="Başlangıç Tarihi"
            />
            
            <span className="text-gray-600 font-black">-</span>
            
            <input 
              type="date" 
              value={bitisTarihi}
              onChange={(e) => setBitisTarihi(e.target.value)}
              className="bg-[#1A1A1E] border border-white/10 hover:border-yellow-500/50 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none transition-all cursor-pointer"
              title="Bitiş Tarihi"
            />

            {(baslangicTarihi || bitisTarihi) && (
              <button 
                onClick={() => { setBaslangicTarihi(''); setBitisTarihi(''); }}
                className="ml-2 text-[10px] font-black text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg uppercase tracking-widest transition-all"
              >
                Temizle ✕
              </button>
            )}
          </div>
        </div>

        {/* LİSTE (TABLO GÖRÜNÜMÜ) */}
        <div className="flex-1 overflow-y-auto nuke-scrollbar pb-10">
          <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            {/* Tablo Başlıkları */}
            <div className="flex items-center px-6 py-3 bg-white/5 border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
              <div className="w-32">TARİH / SAAT</div>
              <div className="w-24 text-center">YÖN</div>
              <div className="flex-1">İŞLEM / KATEGORİ</div>
              <div className="w-40">MÜŞTERİ / SERVİS NO</div>
              <div className="w-32 text-right">TUTAR (₺)</div>
            </div>

            {/* Tablo İçeriği */}
            {loading ? (
              <div className="text-center py-10 font-bold text-gray-500 uppercase tracking-widest text-xs animate-pulse">Veritabanından Kayıtlar Çekiliyor...</div>
            ) : filtrelenmisIslemler.length > 0 ? (
              filtrelenmisIslemler.map((islem, idx) => {
                const isGiris = islem.islem_yonu === 'GİRİŞ';
                
                const d = new Date(islem.islem_tarihi || new Date());
                const tarih = d.toLocaleDateString('tr-TR');
                const saat = d.toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});

                return (
                  <div key={idx} className="flex items-center px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
                    
                    <div className="w-32">
                      <div className="text-xs font-bold text-white">{tarih}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{saat}</div>
                    </div>
                    
                    <div className="w-24 text-center">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                        isGiris ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}>
                        {isGiris ? 'GİRİŞ' : 'ÇIKIŞ'}
                      </span>
                    </div>

                    <div className="flex-1 pr-4">
                      <div className="text-xs font-bold text-white uppercase tracking-wide">{islem.kategori || 'Belirtilmemiş'}</div>
                      <div className="text-[10px] text-gray-500 font-medium truncate mt-0.5" title={islem.aciklama}>
                        👤 {islem.islem_yapan || 'Sistem'} {islem.aciklama ? `| 📝 ${islem.aciklama}` : ''}
                      </div>
                    </div>

                    <div className="w-40">
                      <div className="text-xs font-bold text-gray-300 truncate uppercase" title={islem.musteri_adi}>
                        {islem.musteri_adi || '-'}
                      </div>
                      <div className="text-[10px] text-sky-500 font-mono mt-0.5">
                        {islem.servis_no ? `#${islem.servis_no}` : '-'}
                      </div>
                    </div>

                    <div className={`w-32 text-right text-sm font-black font-mono tracking-tighter ${isGiris ? 'text-green-400' : 'text-red-400'}`}>
                      {isGiris ? '+' : '-'}₺{parseFloat(islem.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})}
                    </div>

                  </div>
                )
              })
            ) : (
              <div className="text-center py-10 font-bold text-gray-500 uppercase tracking-widest text-xs">
                Aradığınız kritere uygun kayıt bulunamadı.
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}