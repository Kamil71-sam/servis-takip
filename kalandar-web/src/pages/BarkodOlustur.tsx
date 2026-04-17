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
  const [manuelUrunAdi, setManuelUrunAdi] = useState('');
  const [manuelFiyat, setManuelFiyat] = useState('');

  useEffect(() => {
    fetchStoklar();
  }, []);

  const fetchStoklar = async () => {
    setLoading(true);
    try {
      let allItems: any[] = [];
      
      // 1. Kasadan Stokları Çek
      const resKasa = await api.get('/api/kasa/all').catch(() => null);
      const kasaData = Array.isArray(resKasa?.data?.data) ? resKasa.data.data : (Array.isArray(resKasa?.data) ? resKasa.data : []);
      allItems = [...allItems, ...kasaData];

      // 2. Servislerden Cihaz/Seri Numaralarını Çek
      const resServis = await api.get('/services/all').catch(() => null);
      const servisData = Array.isArray(resServis?.data?.data) ? resServis.data.data : (Array.isArray(resServis?.data) ? resServis.data : []);
      allItems = [...allItems, ...servisData];

      // Sadece barkodu veya takip no'su olanları süzgeçten geçir
      const barkodluUrunler = allItems.map(item => {
         const barkod = item.barkod || item.serial_number || item.raw?.barkod || item.servis_no || item.plaka || '';
         const isim = item.aciklama || item.urun_adi || item.cihaz_tipi || item.musteri_adi || 'Sistem Kaydı';
         const fiyat = item.tutar || item.fiyat || item.offer_price || 0;
         return { ...item, barkodNo: barkod, isim: isim, gecerliFiyat: fiyat };
      }).filter(item => item.barkodNo && item.barkodNo !== '-' && item.barkodNo !== '');

      // Benzersiz (Unique) olanları al
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

  const aktifBarkodNo = mod === 'otomatik' ? (seciliUrun?.barkodNo || '') : manuelBarkodNo;
  const aktifUrunAdi = mod === 'otomatik' ? (seciliUrun?.isim || 'Ürün Adı Yok') : (manuelUrunAdi || '');
  const aktifFiyat = mod === 'otomatik' ? (seciliUrun?.gecerliFiyat || 0) : manuelFiyat;

  // 🚨 PDF İNDİRME MOTORU (Termal Etiket Oranında)
  const handlePdfIndir = () => {
    if (!aktifBarkodNo) return;
    const element = document.getElementById('barcode-print-area');
    const opt: any = {
      margin:       0,
      filename:     `Barkod_${aktifBarkodNo}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 4, useCORS: true }, 
      jsPDF:        { unit: 'mm', format: [50, 30], orientation: 'landscape' } 
    };
    html2pdf().set(opt).from(element).save();
  };

  // 🚨 YAZICI MOTORU (Termal Ruloya Göre Kesin Ölçü)
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
          <title>Barkod - ${aktifBarkodNo}</title>
          <style>
            @page { size: 50mm 30mm landscape; margin: 0; }
            body { margin: 0; padding: 0; background: white; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .label-wrapper { width: 50mm; height: 30mm; box-sizing: border-box; padding: 2mm; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
          </style>
        </head>
        <body>
          <div class="label-wrapper">
            ${printElement.innerHTML}
          </div>
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

  return (
    <>
      <style>{scrollbarStyle}</style>

      <div className="flex flex-col h-full p-1 gap-3 text-white">
        
        {/* ÜST TAB MENÜ */}
        <div className="flex justify-between items-center bg-black/20 p-1.5 rounded-xl border border-white/5 relative z-10 w-fit gap-2">
          <button onClick={() => { setMod('otomatik'); setSeciliUrun(null); }} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mod === 'otomatik' ? 'bg-[#8E052C] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            📦 LİSTEDEN SEÇ
          </button>
          <button onClick={() => { setMod('manuel'); setSeciliUrun(null); }} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mod === 'manuel' ? 'bg-[#8E052C] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            ✍️ ELLE GİRİŞ YAP
          </button>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          
          {/* ================= SOL PANEL ================= */}
          <div className="w-[400px] flex flex-col bg-[#1A1A1E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shrink-0 relative z-10">
            
            {mod === 'otomatik' ? (
              <>
                <div className="p-3.5 border-b border-white/5 bg-black/40">
                  <input 
                    type="text" 
                    placeholder="Veritabanında Ara (Örn: Ekran, 869...)" 
                    value={aramaMetni} 
                    onChange={(e) => setAramaMetni(e.target.value)} 
                    className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-[#8E052C] transition-colors" 
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto nuke-scrollbar p-2.5 flex flex-col gap-2">
                  {loading ? <div className="text-center py-10 text-gray-500 text-[10px] font-black uppercase animate-pulse">Envanter Yükleniyor...</div> : 
                   filtrelenmisStoklar.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                        <div className="text-[10px] text-gray-500 font-black uppercase mb-3">Envanterde Bulunamadı</div>
                        {/* 🚨 SİHİRLİ BUTON: Bulamazsa tıkla hemen manuel'e geçsin 🚨 */}
                        {aramaMetni && (
                          <button 
                            onClick={() => {
                              setMod('manuel');
                              setManuelBarkodNo(aramaMetni);
                              setManuelUrunAdi('Yeni Kayıt');
                            }}
                            className="bg-[#8E052C]/20 hover:bg-[#8E052C] text-[#8E052C] hover:text-white border border-[#8E052C]/50 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                            Bunu Hızlı Barkod Yap
                          </button>
                        )}
                     </div>
                   ) :
                   filtrelenmisStoklar.map((item, index) => {
                     const isSelected = seciliUrun?.barkodNo === item.barkodNo;
                     return (
                       <div key={index} onClick={() => setSeciliUrun(item)} className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#8E052C]/30 border-[#8E052C]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
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
              </>
            ) : (
              <div className="flex-1 p-5 flex flex-col gap-4 bg-black/20">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Barkod Numarası (Zorunlu)</label>
                  <input type="text" placeholder="Örn: GLCK-546704-7568" value={manuelBarkodNo} onChange={(e) => setManuelBarkodNo(e.target.value)} className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-2.5 text-sm font-mono text-white outline-none focus:border-[#8E052C]" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Ürün Adı (Opsiyonel)</label>
                  <input type="text" placeholder="Örn: Kılıf" value={manuelUrunAdi} onChange={(e) => setManuelUrunAdi(e.target.value)} className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#8E052C]" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Fiyat (Opsiyonel)</label>
                  <input type="text" placeholder="Örn: 150" value={manuelFiyat} onChange={(e) => setManuelFiyat(e.target.value)} className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#8E052C]" />
                </div>
              </div>
            )}
          </div>

          {/* ================= SAĞ PANEL: ÖNİZLEME ================= */}
          <div className="flex-1 flex flex-col gap-3 relative">
            <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-4 shadow-2xl flex items-center justify-between shrink-0 relative z-10">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-tighter">BARKOD ÖNİZLEME VE ÇIKTI</h2>
                <p className="text-[10px] text-gray-500 uppercase font-black mt-1">Termal yazıcı (50x30mm) formatına uygun tasarım.</p>
              </div>
              
              <div className="flex gap-2.5">
                <button disabled={!aktifBarkodNo} onClick={handlePdfIndir} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 shadow-lg shadow-red-900/20 disabled:opacity-30">
                  <span>📄</span> PDF İNDİR
                </button>
                <button disabled={!aktifBarkodNo} onClick={handlePrint} className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 shadow-lg disabled:opacity-30">
                  <span>🖨️</span> YAZDIR
                </button>
              </div>
            </div>

            {/* VİTRİN */}
            <div className="flex-1 bg-gray-300 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center p-4">
              
              {aktifBarkodNo ? (
                <div className="bg-white shadow-2xl rounded-sm flex flex-col items-center justify-center p-4 transition-all" style={{ width: '400px', height: '240px' }}>
                  
                  <div id="barcode-print-area" className="flex flex-col items-center justify-center w-full h-full bg-white text-black">
                    {aktifUrunAdi && (
                      <h3 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 5px 0', textAlign: 'center', textTransform: 'uppercase', color: '#333' }}>
                        {aktifUrunAdi}
                      </h3>
                    )}
                    
                    <Barcode 
                      value={aktifBarkodNo} 
                      width={2.5} 
                      height={60} 
                      fontSize={16} 
                      margin={0} 
                      displayValue={true} 
                      background="#ffffff"
                      lineColor="#000000"
                    />

                    {aktifFiyat ? (
                      <p style={{ fontSize: '16px', fontWeight: '900', margin: '5px 0 0 0', textAlign: 'center' }}>
                        {aktifFiyat} ₺
                      </p>
                    ) : null}
                  </div>

                </div>
              ) : (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                  <span className="text-6xl mb-4 opacity-30">|||||||</span>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">LÜTFEN BİR BARKOD SEÇİN VEYA GİRİN</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}