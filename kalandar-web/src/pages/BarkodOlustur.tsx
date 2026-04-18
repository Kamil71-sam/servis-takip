import { useState, useEffect } from 'react';
import api from '../api';
import html2pdf from 'html2pdf.js';
import Barcode from 'react-barcode';

const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
`;

export default function BarkodOlustur() {
  const [mod, setMod] = useState<'otomatik' | 'manuel'>('otomatik');
  const [stokListesi, setStokListesi] = useState<any[]>([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [seciliUrun, setSeciliUrun] = useState<any>(null);
  const [manuelBarkodNo, setManuelBarkodNo] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  const [baskiAdedi, setBaskiAdedi] = useState(2); 

  useEffect(() => {
    fetchStoklar();
  }, []);

  const fetchStoklar = async () => {
    setLoading(true);
    try {
      const resStok = await api.get('/api/stok/all').catch(() => null);
      const stokData = Array.isArray(resStok?.data?.data) ? resStok.data.data : [];

      const barkodluUrunler = stokData.map(item => {
         return { 
             ...item, 
             barkodNo: item.barkod, 
             isim: item.malzeme_adi || item.marka || 'İsimsiz Ürün', 
             gecerliFiyat: item.satis_fiyati || item.alis_fiyati || 0 
         };
      }).filter(item => item.barkodNo && item.barkodNo.trim() !== '' && item.barkodNo !== '-');

      const uniqueUrunler = Array.from(new Map(barkodluUrunler.map((item: any) => [item.barkodNo, item])).values());
      setStokListesi(uniqueUrunler);
    } catch (error) {
      console.error("Veriler çekilemedi", error);
    } finally {
      setLoading(false);
    }
  };

  const filtrelenmisStoklar = stokListesi.filter(item => {
    if (!aramaMetni) return true;
    const aramaKucuk = aramaMetni.toLowerCase();
    return (
      (item.isim && item.isim.toLowerCase().includes(aramaKucuk)) ||
      (item.barkodNo && item.barkodNo.toLowerCase().includes(aramaKucuk))
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [aramaMetni]);

  const totalPages = Math.ceil(filtrelenmisStoklar.length / itemsPerPage);
  const currentItems = filtrelenmisStoklar.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const aktifBarkodNo = mod === 'otomatik' ? (seciliUrun?.barkodNo || '') : manuelBarkodNo;
  const aktifUrunAdi = mod === 'otomatik' ? (seciliUrun?.isim || '') : '';
  const aktifFiyat = mod === 'otomatik' ? (seciliUrun?.gecerliFiyat || 0) : 0;

  const handlePdfIndir = () => {
    if (!aktifBarkodNo) return;
    const element = document.getElementById('barcode-print-area');
    const opt: any = {
      margin:       0,
      filename:     `Barkod_A4_${aktifBarkodNo}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true }, 
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    if (!aktifBarkodNo) return;
    const printElement = document.getElementById('barcode-print-area');
    if (!printElement) return;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barkod - A4 Çıktı</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { 
                margin: 0; padding: 0; background: white; font-family: Arial, sans-serif; 
                -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; 
            }
          </style>
        </head>
        <body>
          ${printElement.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  const EtiketKutusu = ({ keyIdx }: { keyIdx: number }) => (
    <div key={keyIdx} className="flex flex-col items-center justify-center border-2 border-gray-800 border-dashed rounded-lg" style={{ width: '85mm', height: '45mm', padding: '4mm', boxSizing: 'border-box' }}>
      {aktifUrunAdi && (
        <h3 style={{ fontSize: '13px', fontWeight: '900', margin: '0 0 6px 0', textAlign: 'center', textTransform: 'uppercase', color: '#000', fontFamily: 'Arial, sans-serif' }}>
          {aktifUrunAdi}
        </h3>
      )}
      <Barcode 
        value={aktifBarkodNo} 
        width={1.6} 
        height={45} 
        fontSize={13} 
        margin={0} 
        displayValue={true} 
        background="#ffffff"
        lineColor="#000000"
      />
      {aktifFiyat > 0 ? (
        <p style={{ fontSize: '15px', fontWeight: '900', margin: '6px 0 0 0', textAlign: 'center', fontFamily: 'Arial, sans-serif', color: '#000' }}>
          {aktifFiyat} ₺
        </p>
      ) : null}
    </div>
  );

  return (
    <>
      <style>{scrollbarStyle}</style>

      <div className="flex flex-col h-full p-1 gap-3 text-white">
        
        {/* ÜST TAB MENÜ */}
        <div className="flex justify-between items-center bg-black/20 p-1.5 rounded-xl border border-white/5 relative z-10 w-fit gap-2">
          <button onClick={() => { setMod('otomatik'); setSeciliUrun(null); }} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mod === 'otomatik' ? 'bg-[#8E052C] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            📦 LİSTEDEN SEÇ
          </button>
          <button onClick={() => { setMod('manuel'); setSeciliUrun(null); setManuelBarkodNo(''); }} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mod === 'manuel' ? 'bg-[#8E052C] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            ✍️ ELLE GİRİŞ YAP
          </button>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
          
          {/* ================= SOL PANEL ================= */}
          <div className="w-[420px] flex flex-col bg-[#1A1A1E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shrink-0 relative z-10">
            {mod === 'otomatik' ? (
              <>
                <div className="p-3.5 border-b border-white/5 bg-black/40 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Toplam: {stokListesi.length} Kalem</span>
                     <button onClick={fetchStoklar} className="bg-white/5 hover:bg-white/10 text-white px-2 py-1 rounded text-[10px] transition-colors" title="Listeyi Yenile">🔄 YENİLE</button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Tüm Depoda Ara (İsim veya Barkod...)" 
                    value={aramaMetni} 
                    onChange={(e) => setAramaMetni(e.target.value)} 
                    className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#8E052C] transition-colors" 
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="overflow-y-auto nuke-scrollbar p-2.5 flex flex-col gap-2 h-full">
                    {loading ? <div className="text-center py-10 text-gray-500 text-[10px] font-black uppercase animate-pulse">Depo Taranıyor...</div> : 
                    filtrelenmisStoklar.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                            <div className="text-[10px] text-gray-500 font-black uppercase mb-3">Aramaya Uygun Ürün Bulunamadı</div>
                        </div>
                    ) :
                    currentItems.map((item, index) => {
                        const isSelected = seciliUrun?.barkodNo === item.barkodNo;
                        return (
                        <div key={index} onClick={() => setSeciliUrun(item)} className={`p-3 rounded-xl border cursor-pointer transition-all shrink-0 ${isSelected ? 'bg-[#8E052C]/30 border-[#8E052C]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                            <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-black text-white uppercase truncate pr-2">{item.isim}</h4>
                            {item.gecerliFiyat > 0 && <span className="text-[10px] font-black text-green-400 whitespace-nowrap">{parseFloat(item.gecerliFiyat).toLocaleString('tr-TR')} ₺</span>}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono font-bold flex items-center gap-1">
                            <span className="text-[#8E052C]">|||||||</span> {item.barkodNo}
                            </div>
                        </div>
                        )
                    })
                    }
                    </div>

                    {totalPages > 1 && (
                        <div className="p-3 border-t border-white/5 bg-black/40 flex justify-center items-center gap-2 shrink-0">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="bg-white/5 hover:bg-white/10 disabled:opacity-30 px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                            >
                                ◀
                            </button>
                            <span className="text-[10px] font-bold text-gray-400 tracking-widest">
                                SAYFA {currentPage} / {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="bg-white/5 hover:bg-white/10 disabled:opacity-30 px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                            >
                                ▶
                            </button>
                        </div>
                    )}
                </div>
              </>
            ) : (
              <div className="flex-1 p-5 flex flex-col gap-4 bg-black/20">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Barkod Numarası (Kopyala / Yapıştır)</label>
                  <input 
                    type="text" 
                    placeholder="Örn: GLCK-546704-7568" 
                    value={manuelBarkodNo} 
                    onChange={(e) => setManuelBarkodNo(e.target.value)} 
                    className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-4 text-sm font-mono text-white outline-none focus:border-[#8E052C]" 
                  />
                  <p className="text-[9px] text-gray-500 mt-2 italic">Not: Bu alan sadece serbest barkod çıktısı almak içindir. Ürün adı ve fiyat eklenmez.</p>
                </div>
              </div>
            )}
          </div>

          {/* ================= SAĞ PANEL: A4 ÖNİZLEME ================= */}
          <div className="flex-1 flex flex-col gap-3 relative min-h-0">
            <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-4 shadow-2xl flex items-center justify-between shrink-0 relative z-10">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-tighter">A4 BARKOD ÇIKTISI</h2>
                <p className="text-[10px] text-gray-500 uppercase font-black mt-1">Standart A4 kağıdına seçilen adette etiket basar.</p>
              </div>
              
              <div className="flex gap-4 items-center">
                <div className="flex flex-col items-end">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Baskı Adedi (1-10)</label>
                    <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-lg p-1">
                        <button onClick={() => setBaskiAdedi(Math.max(1, baskiAdedi - 1))} className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center font-black">-</button>
                        <input type="number" min="1" max="10" value={baskiAdedi} onChange={(e) => { let val = parseInt(e.target.value) || 1; setBaskiAdedi(Math.min(10, Math.max(1, val))); }} className="w-8 bg-transparent text-center text-xs font-black outline-none" />
                        <button onClick={() => setBaskiAdedi(Math.min(10, baskiAdedi + 1))} className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center font-black">+</button>
                    </div>
                </div>

                <div className="h-8 w-px bg-white/10"></div>

                <div className="flex gap-2">
                    <button disabled={!aktifBarkodNo} onClick={handlePdfIndir} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 shadow-lg shadow-red-900/20 disabled:opacity-30">
                    <span>📄</span> PDF İNDİR
                    </button>
                    <button disabled={!aktifBarkodNo} onClick={handlePrint} className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 shadow-lg disabled:opacity-30">
                    <span>🖨️</span> YAZDIR
                    </button>
                </div>
              </div>
            </div>

            {/* 🚨 DÜZELTİLEN YER: Ekran scroll'u yok, A4 büyüdü, sadece bu gri alan kendi içinde kayar */}
            <div className="flex-1 bg-gray-600 rounded-2xl overflow-y-auto nuke-scrollbar relative shadow-inner flex flex-col items-center p-6">
              
              {aktifBarkodNo ? (
                <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', transition: 'all 0.3s' }}>
                  <div 
                    id="barcode-print-area" 
                    className="bg-white shadow-2xl" 
                    style={{ width: '210mm', height: '296mm', padding: '15mm', boxSizing: 'border-box', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10mm', alignContent: 'start' }}>
                        {Array.from({ length: baskiAdedi }).map((_, i) => (
                            <EtiketKutusu keyIdx={i} key={i} />
                        ))}
                    </div>
                    
                    <div style={{ marginTop: '20mm', textAlign: 'center', color: '#999', fontFamily: 'Arial', fontSize: '10px' }}>
                      Makasla kesim kolaylığı için etiketler çerçeveli basılır. Toplam {baskiAdedi} adet.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 rounded-2xl">
                  <span className="text-6xl mb-4 opacity-30">📄</span>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">ÖNİZLEME İÇİN BARKOD SEÇİN</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}