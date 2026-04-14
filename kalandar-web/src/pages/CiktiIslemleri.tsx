import { useState, useEffect } from 'react';
import api from '../api';

// 🚨 MÜDÜRÜN NİHAİ MATBAA CSS'İ (Printer’a Savaş İlanı!)
const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
  
  @media print {
    /* 1. KÂĞIT ÖLÇÜSÜNÜ KİLİTLE VE PRINTER’IN BOŞLUKLARINI SIFIRLA */
    @page { 
      size: A4 portrait; 
      margin: 0 !important; /* Tarayıcının marjlarını yok et */
    }
    
    body { 
      background: white !important; 
      margin: 0 !important; 
      padding: 0 !important; 
    }
    
    /* 2. SADECE FATURA ALANINI GÖSTER VE RENKLERİ ZORLA */
    body * { visibility: hidden; }
    #print-area, #print-area * { 
      visibility: visible !important; 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important;
      color: black;
    }
    
    #print-area { 
      position: absolute; 
      left: 0; 
      top: 0; 
      /* 🚨 NİHAİ A4 KİLİDİ (PRINTER BUNU SIKAMAZ!) */
      width: 21.0cm !important; /* Tam A4 Genişliği */
      height: 29.7cm !important; /* Tam A4 Yüksekliği */
      margin: 0 !important; 
      
      /* 🚨 MÜDÜRÜN EMRİ: Tepede tam 3 cm Antet Boşluğu */
      padding: 3.0cm 1.0cm 1.0cm 1.0cm !important; /* 3cm Tepeden, 1cm Kenarlardan */
      
      box-shadow: none !important; 
      border: none !important;
      box-sizing: border-box !important;
      background: white !important;
      display: block !important;
      overflow: hidden; /* Taşmayı kâğıt içinde yok et */
    }
    .no-print { display: none !important; }
    
    /* Zart diye arşivlemeyi prevent eden zırh */
    .print-group { break-inside: avoid; }
  }
`;

const getVal = (obj: any, keys: string[]) => {
  if (!obj) return null;
  const lowerObj: any = {};
  Object.keys(obj).forEach(k => { lowerObj[k.toLowerCase()] = obj[k]; });
  for (let k of keys) {
    if (lowerObj[k] !== undefined && lowerObj[k] !== null && lowerObj[k] !== '') {
      return String(lowerObj[k]);
    }
  }
  return null;
};

const generateDateStamp = (rawDate?: string) => {
  const d = rawDate ? new Date(rawDate) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().slice(2, 10).replace(/-/g, ''); 
  const year = d.getFullYear().toString().slice(2);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`; 
};

export default function CiktiIslemleri({ defaultTab = 'fatura' }: { defaultTab?: 'fatura' | 'servis' | 'tamamlanan' }) {
  const [activeTab, setActiveTab] = useState<'fatura' | 'servis' | 'tamamlanan'>(defaultTab);
  
  const [hamListe, setHamListe] = useState<any[]>([]);
  const [seciliKayit, setSeciliKayit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [yazdirilanlar, setYazdirilanlar] = useState<string[]>([]);

  const [filtreTip, setFiltreTip] = useState('Tümü'); 
  const [aramaMetni, setAramaMetni] = useState('');
  const [aramaTarih, setAramaTarih] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    const kayitlilar = JSON.parse(localStorage.getItem('kalandar_ciktilar') || '[]');
    setYazdirilanlar(kayitlilar);
    fetchData();
  }, []);

  useEffect(() => {
    setFiltreTip('Tümü');
    setAramaMetni('');
    setAramaTarih('');
    setCurrentPage(1);
    setSeciliKayit(null);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let combinedData: any[] = [];

      const resKasa = await api.get('/api/kasa/all').catch(() => null);
      if (resKasa?.data?.data) {
        const stoklar = resKasa.data.data
          .filter((i: any) => i.kategori === 'Stok Satışı')
          .map((i: any) => ({
            id: `stok_${i.id}`, tip: 'Stok Satışı', servis_no: i.servis_no || '-',
            musteri_adi: i.musteri_adi || 'Genel Müşteri', tarih: i.islem_tarihi,
            tutar: i.tutar, durum: 'Teslim Edildi', aciklama: i.aciklama, raw: i 
          }));
        combinedData = [...combinedData, ...stoklar];
      }

      const resTamamlanan = await api.get('/services/tamamlanan').catch(() => null);
      if (resTamamlanan?.data) {
        const servislerT = resTamamlanan.data.map((i: any) => ({
            id: `srv_t_${i.id}`, tip: 'Servis', servis_no: i.servis_no,
            musteri_adi: getVal(i, ['musteri_adi', 'customer_name', 'name', 'firma_adi']) || 'Bilinmiyor', 
            tarih: i.updated_at || i.created_at, tutar: i.offer_price || 0, durum: i.status, 
            cihaz_bilgisi: `${i.brand} ${i.model}`, aciklama: i.issue_text || 'Tamir & Servis İşlemi', raw: i
          }));
        combinedData = [...combinedData, ...servislerT];
      }

      const resAktif = await api.get('/services/all').catch(() => null);
      if (resAktif?.data) {
        const servislerA = resAktif.data.map((i: any) => ({
            id: `srv_a_${i.id}`, tip: 'Servis', servis_no: i.servis_no,
            musteri_adi: getVal(i, ['musteri_adi', 'customer_name', 'name', 'firma_adi']) || 'Bilinmiyor', 
            tarih: i.created_at, tutar: i.offer_price || 0, durum: i.status, 
            cihaz_bilgisi: `${i.brand} ${i.model}`, aciklama: i.issue_text || 'Tamir & Servis İşlemi', raw: i
          }));
        combinedData = [...combinedData, ...servislerA];
      }

      const resRandevu = await api.get('/api/appointments/liste/aktif').catch(() => null);
      if (resRandevu?.data?.data) {
        const randevular = resRandevu.data.data.map((i: any) => ({
            id: `rnd_${i.id}`, tip: 'Randevu', servis_no: i.servis_no,
            musteri_adi: getVal(i, ['müşteri adı', 'musteri adi', 'name', 'firma_adi']) || 'Bilinmiyor',
            tarih: i.appointment_date || i.created_at, tutar: i.tahsil_edilen_tutar || i.offer_price || 0,
            durum: i.status || i.durum, aciklama: i.issue_text || 'Randevu / Danışmanlık', raw: i
          }));
        combinedData = [...combinedData, ...randevular];
      }

      combinedData.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
      setHamListe(combinedData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtrelenmisListe = hamListe.filter(item => {
    let sekmeUygun = false;
    const yazdirilmisMi = yazdirilanlar.includes(item.id);

    if (activeTab === 'fatura') {
      sekmeUygun = item.durum === 'Teslim Edildi' && !yazdirilmisMi;
    } else if (activeTab === 'servis') {
      sekmeUygun = ((item.tip === 'Servis' && item.durum === 'Hazır') || 
                    (item.tip === 'Randevu' && item.durum === 'Beklemede')) && !yazdirilmisMi;
    } else if (activeTab === 'tamamlanan') {
      sekmeUygun = yazdirilmisMi;
    }

    if (!sekmeUygun) return false;

    const tipUygun = filtreTip === 'Tümü' || item.tip === filtreTip;
    const aramaKucuk = aramaMetni.toLowerCase();
    const aramaUygun = !aramaMetni || 
      (item.servis_no && item.servis_no.toLowerCase().includes(aramaKucuk)) ||
      (item.musteri_adi && item.musteri_adi.toLowerCase().includes(aramaKucuk));
    
    const trTarih = item.tarih ? new Date(item.tarih).toLocaleDateString('tr-TR') : '';
    const tarihUygun = !aramaTarih || trTarih.includes(aramaTarih);

    return tipUygun && aramaUygun && tarihUygun;
  });

  const totalPages = Math.ceil(filtrelenmisListe.length / recordsPerPage) || 1;
  const currentRecords = filtrelenmisListe.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handlePrint = () => {
    if (!seciliKayit) return;
    window.print();
    setTimeout(() => {
      if (!yazdirilanlar.includes(seciliKayit.id) && activeTab !== 'tamamlanan') {
        const onay = window.confirm("Yazdırma işlemi sorunsuz tamamlandı mı?\n\nEvet derseniz bu evrak 'Geçmiş Çıktılar' arşivine taşınacaktır.");
        if (onay) {
          const yeniYazdirilanlar = [...yazdirilanlar, seciliKayit.id];
          setYazdirilanlar(yeniYazdirilanlar);
          localStorage.setItem('kalandar_ciktilar', JSON.stringify(yeniYazdirilanlar));
          setSeciliKayit(null);
        }
      }
    }, 1000); 
  };

  const genelToplam = seciliKayit ? parseFloat(seciliKayit.tutar || 0) : 0;
  const araToplam = genelToplam / 1.20; 
  const kdvTutari = genelToplam - araToplam;

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex flex-col h-full p-1 gap-3">
        
        {/* ÜST TAB MENÜ */}
        <div className="flex gap-2 p-1 bg-black/20 rounded-xl w-fit border border-white/5 no-print relative z-10">
          <button onClick={() => setActiveTab('fatura')} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'fatura' ? 'bg-[#8E052C] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>📄 FATURA BEKLEYENLER</button>
          <button onClick={() => setActiveTab('servis')} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'servis' ? 'bg-[#8E052C] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>🛠️ FİŞ BEKLEYENLER</button>
          <button onClick={() => setActiveTab('tamamlanan')} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'tamamlanan' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>🗄️ GEÇMİŞ ÇIKTILAR</button>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          
          {/* ================= SOL: HAFİYE (Sizing Up) ================= */}
          <div className="w-[320px] flex flex-col bg-[#1A1A1E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shrink-0 no-print relative z-10">
            <div className="p-3.5 border-b border-white/5 bg-black/40 flex flex-col gap-2.5">
              <select value={filtreTip} onChange={(e) => setFiltreTip(e.target.value)} className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 py-2 text-[11px] font-black text-white uppercase outline-none focus:border-[#8E052C]">
                <option value="Tümü">TÜM İŞLEMLER</option>
                <option value="Servis">SADECE SERVİS</option>
                <option value="Randevu">SADECE RANDEVU</option>
                <option value="Stok Satışı">STOK SATIŞI</option>
              </select>
              <div className="flex gap-2.5">
                <input type="text" placeholder="İsim veya No..." value={aramaMetni} onChange={(e) => setAramaMetni(e.target.value)} className="flex-1 bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 py-2 text-[11px] text-white outline-none focus:border-[#8E052C]" />
                <input type="text" placeholder="Tarih" value={aramaTarih} onChange={(e) => setAramaTarih(e.target.value)} className="w-20 bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 py-2 text-[11px] text-white outline-none focus:border-[#8E052C] text-center" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto nuke-scrollbar p-2.5 flex flex-col gap-2">
              {loading ? <div className="text-center py-10 text-gray-600 text-[11px] font-black uppercase animate-pulse">Yükleniyor...</div> : 
               currentRecords.length === 0 ? <div className="text-center py-10 text-gray-600 text-[11px] font-black uppercase">Kayıt Yok</div> :
               currentRecords.map((item) => (
                <div key={item.id} onClick={() => setSeciliKayit(item)} className={`p-3 rounded-xl border cursor-pointer transition-all ${seciliKayit?.id === item.id ? 'bg-[#8E052C]/10 border-[#8E052C]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-black text-[#8E052C] bg-[#8E052C]/10 px-2 rounded">#{item.servis_no}</span>
                    <span className="text-[9px] text-gray-500 font-mono font-bold">{item.tarih ? new Date(item.tarih).toLocaleDateString('tr-TR') : ''}</span>
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase truncate">{item.musteri_adi}</h4>
                  <div className="mt-1.5 flex justify-between items-end">
                    <span className="text-[9px] text-gray-400 uppercase font-bold">{item.tip} • {item.durum}</span>
                    <span className="text-[11px] font-black text-green-500">{parseFloat(item.tutar).toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/5 bg-black/40 flex justify-center items-center gap-1.5">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-6 h-6 rounded border border-white/10 flex items-center justify-center text-[10px] text-white disabled:opacity-30">◀</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#8E052C] text-white' : 'text-gray-500 hover:text-white border border-white/5'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-6 h-6 rounded border border-white/10 flex items-center justify-center text-[10px] text-white disabled:opacity-30">▶</button>
            </div>
          </div>

          {/* ================= SAĞ: MÜDÜRÜN MATBAA FATURASI ================= */}
          <div className="flex-1 flex flex-col gap-3 relative">
            
            <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-4 shadow-2xl flex items-center justify-between shrink-0 no-print relative z-10">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-tighter">FATURA / FİŞ KONTROL PANELİ</h2>
                <p className="text-[10px] text-gray-500 uppercase font-black mt-1">Önizlemeyi kontrol edip kurumsal çıktı alın.</p>
              </div>
              <div className="flex gap-2.5">
                <button disabled={!seciliKayit} onClick={() => alert("Word modülü entegre edilecek.")} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 disabled:opacity-30">
                  <span>📁</span> WORD
                </button>
                <button disabled={!seciliKayit} onClick={() => window.print()} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 disabled:opacity-30">
                  <span>📄</span> PDF İNDİR
                </button>
                <button disabled={!seciliKayit} onClick={handlePrint} className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 shadow-lg disabled:opacity-30">
                  <span>🖨️</span> YAZDIR / ARŞİVLE
                </button>
              </div>
            </div>

            {/* A4 KAĞIT ALANI */}
            <div className="flex-1 bg-gray-300 rounded-2xl overflow-hidden relative shadow-inner flex justify-center p-4">
              {seciliKayit ? (
                // 🚨 PRINT-AREA: Burada fontları pt (punto) ve standart classlara çektim ki ezilmesin!
                // 🚨 Ekrandaki preview için max-width 750px yaptım, yazdırırken kâğıda göre genişleyecek.
                <div id="print-area" className="w-full max-w-[750px] print:w-full print:max-w-none bg-white text-[#2a2a2a] font-sans nuke-scrollbar overflow-y-auto shadow-2xl flex flex-col p-10 print:p-0 relative box-border aspect-[1/1.414]">
                  
                  {/* BAŞLIK */}
                  <div className="flex justify-between items-start border-b-2 border-[#a61c24] pb-4 mb-6 shrink-0 print-group">
                    <div>
                      <h1 className="text-4xl print:text-2xl font-black tracking-tighter">
                        <span className="text-[#a61c24]">KALANDAR</span> <span className="text-gray-600">YAZILIM</span>
                      </h1>
                    </div>
                    {/* 🚨 BELGE NO VE TARİH AYNI HİZADA (MÜHÜRLÜ) */}
                    <div className="text-right">
                      <h2 className="text-2xl print:text-sm font-black text-[#a61c24] uppercase tracking-widest mb-3">
                        {activeTab === 'servis' ? 'SERVİS FİŞİ' : 'TEKNİK SERVİS VE SATIŞ BELGESİ'}
                      </h2>
                      <div className="flex flex-col items-end gap-1.5 text-[14px] print:text-[10px] font-bold">
                         <div className="flex justify-between w-48"><span>BELGE NO:</span> <span className="font-mono text-black">{generateDateStamp(seciliKayit.tarih)}-{seciliKayit.servis_no}</span></div>
                         <div className="flex justify-between w-48"><span>TARİH:</span> <span className="font-mono text-black">{seciliKayit.tarih ? new Date(seciliKayit.tarih).toLocaleDateString('tr-TR') : '-'}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* 3'LÜ BİLGİ KOLONLARI (Text Sizing Up) */}
                  <div className="flex justify-between gap-4 text-[14px] print:text-[11px] mb-8 shrink-0 print-group">
                    {/* Firma */}
                    <div className="flex-1">
                      <p className="font-black text-gray-500 border-b border-gray-300 pb-1 mb-2">FİRMA BİLGİLERİ</p>
                      <div className="font-bold leading-relaxed text-black">
                        <p>Adres: Gölcük / Kocaeli</p>
                        <p>Vergi: Kurtdereli VD / 1234567890</p>
                        <p>Tel: 0555 123 45 67</p>
                      </div>
                    </div>
                    {/* Müşteri */}
                    <div className="flex-1">
                      <p className="font-black text-gray-500 border-b border-gray-300 pb-1 mb-2">MÜŞTERİ BİLGİLERİ</p>
                      <div className="font-bold leading-relaxed text-black">
                        <p>SAYIN: <span className="uppercase">{seciliKayit.musteri_adi}</span></p>
                        <p>Adres: {seciliKayit.raw?.adres || '-'}</p>
                        <p>GSM: {seciliKayit.raw?.telefon || '-'}</p>
                        <p>Vergi No: -</p>
                      </div>
                    </div>
                    {/* Cihaz */}
                    <div className="flex-1">
                      <p className="font-black text-gray-500 border-b border-gray-300 pb-1 mb-2">CİHAZ BİLGİSİ</p>
                      <div className="font-bold leading-relaxed text-black">
                        <p>Ürün: {seciliKayit.tip === 'Servis' ? (seciliKayit.cihaz_bilgisi || `${seciliKayit.raw?.brand || ''} ${seciliKayit.raw?.model || ''}`) : seciliKayit.tip}</p>
                        <p>Seri / Barkod: {getVal(seciliKayit.raw, ['serial_number', 'serial']) || seciliKayit.raw?.barkod || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* TABLO (Ana İçerik - Sizing Up) */}
                  <div className="flex-1 mb-8 border-b-2 border-gray-300 min-h-[150px]">
                    <table className="w-full text-[14px] print:text-[11px] border-collapse" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                      <thead>
                        <tr className="bg-[#444] text-white">
                          <th className="p-3 text-center w-12 font-bold">NO</th>
                          <th className="p-3 text-left font-bold">HİZMET / ÜRÜN ADI</th>
                          <th className="p-3 text-center w-16 font-bold">MİKTAR</th>
                          <th className="p-3 text-right w-32 font-bold">BİRİM FİYAT</th>
                          <th className="p-2 text-center w-12 font-bold">KDV</th>
                          <th className="p-3 text-right w-32 font-bold">TOPLAM</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-4 text-center align-top font-bold text-gray-500">1</td>
                          <td className="p-4 align-top font-semibold whitespace-pre-line text-black">
                            {/* 🚨 ZIRHLI DETAY: Hizmet adının sonuna (Kayıt No, Barkod) eklendi */}
                            {seciliKayit.aciklama}
                            <span className="text-[12px] print:text-[10px] text-gray-500 font-bold block mt-1.5">
                              (Kayıt No: {seciliKayit.servis_no}{seciliKayit.raw?.barkod ? `, Barkod: ${seciliKayit.raw.barkod}` : ''})
                            </span>
                          </td>
                          <td className="p-4 text-center align-top font-bold text-black">1</td>
                          <td className="p-4 text-right align-top font-mono font-bold text-black whitespace-nowrap">{genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                          <td className="p-3 text-center align-top font-bold text-gray-600">%20</td>
                          <td className="p-4 text-right align-top font-mono font-bold text-black whitespace-nowrap">{genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 🚨 MATEMATİK VE BANKA BİLGİLERİ (Beton gibi sabitlendi, Sizing Up) */}
                  <div className="flex justify-between items-end mb-12 shrink-0 print-group text-black">
                    <div className="text-[12px] print:text-[9px] border-l-2 border-gray-800 pl-3 leading-relaxed">
                      <p className="font-black text-gray-500 mb-1">BANKA HESAP BİLGİLERİMİZ</p>
                      <div className="flex gap-4 font-bold">
                        <span className="w-20">Ziraat Bankası:</span>
                        <span className="font-mono">TR00 0000 0000 0000 0000 00</span>
                      </div>
                      <div className="flex gap-4 font-bold">
                        <span className="w-20">Garanti BBVA:</span>
                        <span className="font-mono">TR99 9999 9999 9999 9999 99</span>
                      </div>
                    </div>

                    <div className="w-64 text-[14px] print:text-xs leading-relaxed">
                      <div className="flex justify-between py-1.5">
                        <span className="font-bold text-gray-600 uppercase">ARA TOPLAM:</span>
                        <span className="font-mono font-bold whitespace-nowrap">{araToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b-2 border-gray-300">
                        <span className="font-bold text-gray-600 uppercase">İSKONTO / KDV:</span>
                        <span className="font-mono font-bold whitespace-nowrap">{kdvTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                      </div>
                      <div className="flex justify-between py-2 text-[#a61c24] border-b-2 border-[#a61c24] mt-1">
                        <span className="font-black text-base print:text-sm uppercase">ÖDENECEK TUTAR:</span>
                        <span className="font-mono font-black text-lg print:text-base whitespace-nowrap">{genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                      </div>
                    </div>
                  </div>

                  {/* ALT BİLGİ */}
                  <div className="mt-auto text-[10px] print:text-[8px] text-gray-500 text-center pt-4 pb-2 border-t border-gray-200 shrink-0 print-group">
                    Bizi tercih ettiğiniz için teşekkür ederiz. Değişen parçalar 6 ay garantilidir.
                  </div>

                  {/* YAZDIRILDI DAMGASI */}
                  {activeTab === 'tamamlanan' && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/10 text-9xl print:text-7xl font-black -rotate-45 pointer-events-none border-[12px] border-red-500/10 p-6 uppercase print:opacity-20">YAZDIRILDI</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 no-print relative z-10">
                   <span className="text-5xl mb-3 opacity-30">🖨️</span>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Önizleme İçin Kayıt Seçin</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}