import { useState, useEffect } from 'react';
import api from '../api';
import html2pdf from 'html2pdf.js'; // 🚨 MÜDÜRÜN MATBAA MOTORU

// 🚨 MÜDÜRÜN NİHAİ MATBAA CSS'İ
const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
`;

const getVal = (obj: any, keys: string[]) => {
  if (!obj) return '';
  const lowerObj: any = {};
  Object.keys(obj).forEach(k => { lowerObj[k.toLowerCase()] = obj[k]; });
  for (let k of keys) {
    if (lowerObj[k] !== undefined && lowerObj[k] !== null && lowerObj[k] !== '') {
      return String(lowerObj[k]);
    }
  }
  return '';
};

const generateDateStamp = (rawDate?: string) => {
  if (!rawDate) return '------';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return '------'; 
  const year = d.getFullYear().toString().slice(2);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`; 
};

export default function ServisFisi() {
  const [activeTab, setActiveTab] = useState<'bekleyen' | 'tamamlanan'>('bekleyen');
  
  const [hamListe, setHamListe] = useState<any[]>([]);
  const [seciliKayit, setSeciliKayit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [yazdirilanlar, setYazdirilanlar] = useState<string[]>([]);

  const [filtreTip, setFiltreTip] = useState('Tümü'); 
  const [aramaMetni, setAramaMetni] = useState('');
  const [aramaTarih, setAramaTarih] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // 🚨 MÜDÜRÜN DİNAMİK FİRMA AYARLARI HAFIZASI
  const [firmaAyarlari, setFirmaAyarlari] = useState<any>({
    firma_adi: 'KALANDAR YAZILIM',
    firma_adres: 'Gölcük / Kocaeli',
    firma_vergi: 'Kurtdereli VD / 1234567890',
    firma_telefon: '0555 123 45 67',
    fatura_alt_bilgi: '* Cihaz tesliminde bu fişin ibrazı zorunludur.\n* 30 gün içinde teslim alınmayan cihazlardan firmamız sorumlu değildir.\n* Arıza tespiti sonrası onay alınmadan işlem yapılmaz.'
  });

  useEffect(() => {
    // Servis fişleri için ayrı bir arşiv belleği kullanıyoruz
    const kayitlilar = JSON.parse(localStorage.getItem('kalandar_servis_fisleri') || '[]');
    setYazdirilanlar(kayitlilar);
    fetchData();

    // 🚨 VERİTABANINDAN FİRMA BİLGİLERİNİ ÇEK (Önbellek Kırıcı ile)
    api.get(`/api/settings?t=${new Date().getTime()}`).then(res => {
      if(res.data?.success && res.data?.data) {
        setFirmaAyarlari((prev: any) => ({...prev, ...res.data.data}));
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setFiltreTip('Tümü');
    setAramaMetni('');
    setAramaTarih('');
    setCurrentPage(1);
    setSeciliKayit(null);
  }, [activeTab]);

  useEffect(() => {
    setSeciliKayit((prevSecili) => {
      if (!prevSecili) return null;
      
      const tipUygun = filtreTip === 'Tümü' || prevSecili.tip === filtreTip;
      const aramaKucuk = aramaMetni.toLowerCase();
      const aramaUygun = !aramaMetni || 
        (prevSecili.servis_no && prevSecili.servis_no.toLowerCase().includes(aramaKucuk)) ||
        (prevSecili.musteri_adi && prevSecili.musteri_adi.toLowerCase().includes(aramaKucuk));
      
      let tarihUygun = true;
      if (aramaTarih && prevSecili.tarih) {
        const d = new Date(prevSecili.tarih);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          tarihUygun = `${y}-${m}-${day}` === aramaTarih;
        } else {
          tarihUygun = false;
        }
      } else if (aramaTarih && !prevSecili.tarih) {
        tarihUygun = false;
      }

      if (!tipUygun || !aramaUygun || !tarihUygun) return null; 
      return prevSecili;
    });
  }, [filtreTip, aramaMetni, aramaTarih]);


  const fetchData = async () => {
    setLoading(true);
    try {
      let combinedData: any[] = [];

      // 1. AKTİF SERVİSLERİ ÇEK VE SADECE "YENİ KAYIT" OLANLARI FİLTRELE
      const resAktif = await api.get('/services/all').catch(() => null);
      const servisAktifListe = Array.isArray(resAktif?.data?.data) ? resAktif.data.data : (Array.isArray(resAktif?.data) ? resAktif.data : []);
      
      const yeniKayıtServisler = servisAktifListe
        .filter((i: any) => (i.status === 'Yeni Kayıt' || i.durum === 'Yeni Kayıt'))
        .map((i: any) => ({
            id: `srv_${i.id}`, tip: 'Servis', 
            servis_no: i.servis_no || i.plaka || 'Bilinmiyor',
            musteri_adi: getVal(i, ['musteri_adi', 'customer_name', 'name', 'firma_adi', 'musteri']) || 'Bilinmiyor', 
            tarih: i.created_at || i.tarih, 
            tutar: i.offer_price || i.fiyat || 0, 
            durum: i.status || i.durum, 
            cihaz_bilgisi: i.cihaz_tipi || i.marka_model || `${i.brand || ''} ${i.model || ''}`, 
            aciklama: i.issue_text || i.ariza || 'Arıza tespiti yapılacak.', raw: i
          }));
      combinedData = [...combinedData, ...yeniKayıtServisler];

      // 2. RANDEVULARI ÇEK VE SADECE "BEKLEMEDE" OLANLARI FİLTRELE
      const fetchRandevular = async (endpoint: string) => {
          const res = await api.get(endpoint).catch(() => null);
          const liste = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
          return liste
            .filter((i: any) => (i.status === 'Beklemede' || i.durum === 'Beklemede'))
            .map((i: any) => ({
              id: `rnd_${i.id}`, tip: 'Randevu', 
              servis_no: i.servis_no || i.plaka || 'Bilinmiyor',
              musteri_adi: getVal(i, ['müşteri adı', 'musteri adi', 'customer_name', 'name', 'firma_adi', 'musteri']) || 'Bilinmiyor',
              tarih: i.appointment_date || i.created_at || i.tarih, 
              tutar: i.tahsil_edilen_tutar || i.offer_price || i.price || 0,
              durum: i.status || i.durum, 
              cihaz_bilgisi: 'Randevu Kaydı',
              aciklama: i.issue_text || i.ariza || 'Randevu ve Danışmanlık', raw: i
          }));
      };

      const randevularAktif = await fetchRandevular('/api/appointments/liste/aktif');
      
      combinedData = [...combinedData, ...randevularAktif];
      
      // Çift kayıt koruması ve tarihe göre sıralama
      const uniqueData = Array.from(new Map(combinedData.map(item => [item.id, item])).values());
      uniqueData.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
      setHamListe(uniqueData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtrelenmisListe = hamListe.filter(item => {
    const yazdirilmisMi = yazdirilanlar.includes(item.id);
    let sekmeUygun = activeTab === 'bekleyen' ? !yazdirilmisMi : yazdirilmisMi;
    if (!sekmeUygun) return false;

    const tipUygun = filtreTip === 'Tümü' || item.tip === filtreTip;
    const aramaKucuk = aramaMetni.toLowerCase();
    const aramaUygun = !aramaMetni || 
      (item.servis_no && item.servis_no.toLowerCase().includes(aramaKucuk)) ||
      (item.musteri_adi && item.musteri_adi.toLowerCase().includes(aramaKucuk));
    
    let tarihUygun = true;
    if (aramaTarih && item.tarih) {
      const d = new Date(item.tarih);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        tarihUygun = `${y}-${m}-${day}` === aramaTarih;
      } else { tarihUygun = false; }
    } else if (aramaTarih && !item.tarih) { tarihUygun = false; }

    return tipUygun && aramaUygun && tarihUygun;
  });

  const totalPages = Math.ceil(filtrelenmisListe.length / recordsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRecords = filtrelenmisListe.slice((safeCurrentPage - 1) * recordsPerPage, safeCurrentPage * recordsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // 🚨 2. SAYFA BOŞLUK VE KAYMA HATASI KESİN OLARAK ÇÖZÜLDÜ 🚨
  const handlePdfIndir = () => {
    if (!seciliKayit) return;
    const element = document.getElementById('ghost-print-area');
    const opt: any = {
      margin:       0, 
      filename:     `ServisFisi_${seciliKayit.servis_no}.pdf`,
      image:        { type: 'jpeg', quality: 1 }, 
      html2canvas:  { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 }, // 🚨 KAYMA VE BOŞLUK ENGELLENDİ
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' } // 🚨 TAM PİKSEL KİLİDİ 1 SAYFAYI GARANTİLER!
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if (!yazdirilanlar.includes(seciliKayit.id) && activeTab !== 'tamamlanan') {
            // 🚨 \n hatası düzeltildi!
            const onay = window.confirm("PDF başarıyla indirildi!\n\nEvet derseniz bu evrak 'Geçmiş Çıktılar' arşivine taşınacaktır.");
            if (onay) {
              const yeniYazdirilanlar = [...yazdirilanlar, seciliKayit.id];
              setYazdirilanlar(yeniYazdirilanlar);
              localStorage.setItem('kalandar_servis_fisleri', JSON.stringify(yeniYazdirilanlar));
              setSeciliKayit(null);
            }
          }
    });
  };

  // 🚨 1. FOTO İSTEĞİ: YAZICI MATBAASINA DOKUNULMADI, AYNEN ÇALIŞIYOR!
  const handlePrint = () => {
    if (!seciliKayit) return;
    const printElement = document.getElementById('ghost-print-area');
    if (!printElement) return;
    const printContent = printElement.innerHTML;

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
          <title>Servis Fişi - ${seciliKayit.servis_no}</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white; }
            table { border-collapse: collapse; page-break-inside: avoid; width: 100%; }
            tr { page-break-inside: avoid; }
            td, th { box-sizing: border-box; }
            .fatura-kapsayici { width: 100%; height: 297mm; position: relative; box-sizing: border-box; }
            .a5-nusha { width: 100%; height: 148.5mm; padding: 20px 40px; box-sizing: border-box; position: relative; }
            .kesik-cizgi { border-bottom: 2px dashed #999; }
          </style>
        </head>
        <body>
          <div class="fatura-kapsayici">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        if (!yazdirilanlar.includes(seciliKayit.id) && activeTab !== 'tamamlanan') {
          // 🚨 \n hatası düzeltildi!
          const onay = window.confirm("Yazdırma işlemi sorunsuz tamamlandı mı?\n\nEvet derseniz bu evrak 'Geçmiş Çıktılar' arşivine taşınacaktır.");
          if (onay) {
            const yeniYazdirilanlar = [...yazdirilanlar, seciliKayit.id];
            setYazdirilanlar(yeniYazdirilanlar);
            localStorage.setItem('kalandar_servis_fisleri', JSON.stringify(yeniYazdirilanlar));
            setSeciliKayit(null);
          }
        }
      }, 1000); 
    }, 500); 
  };

  // Ekranda gösterilecek veri (Boş veya Dolu)
  const gosterilecekData = seciliKayit || {
    musteri_adi: '', raw: { adres: '', telefon: '' }, cihaz_bilgisi: '',
    tip: '', servis_no: '', tarih: '', aciklama: '', tutar: 0
  };

  const genelToplam = parseFloat(gosterilecekData.tutar || 0);

  // A5 Nüsha Şablonu (Render Fonksiyonu)
  const renderA5Nusha = (nushaTipi: string, isTop: boolean) => (
    <div className={`a5-nusha relative w-full h-[561px] p-[20px_40px] box-border ${isTop ? 'border-b-2 border-dashed border-gray-400 kesik-cizgi' : ''}`}>
      
      {/* BAŞLIK TABLOSU */}
      <table style={{ width: '100%', borderBottom: '3px solid #a61c24', marginBottom: '15px', paddingBottom: '10px' }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'top' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-1px', textTransform: 'uppercase' }}>
                <span style={{ color: '#a61c24' }}>{firmaAyarlari.firma_adi?.split(' ')[0] || 'FİRMA'}</span> <span style={{ color: '#666' }}>{firmaAyarlari.firma_adi?.split(' ').slice(1).join(' ') || 'ADI'}</span>
              </h1>
              <span style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', letterSpacing: '1px' }}>{nushaTipi}</span>
            </td>
            <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#a61c24', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                CİHAZ TESLİM / SERVİS FİŞİ
              </h2>
              <table style={{ width: '180px', marginLeft: 'auto', fontSize: '11px', fontWeight: 'bold' }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left', paddingBottom: '3px', color: '#666' }}>KAYIT NO:</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{seciliKayit ? `${generateDateStamp(gosterilecekData.tarih)}-${gosterilecekData.servis_no}` : '----------------'}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left', color: '#666' }}>TARİH:</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{seciliKayit && gosterilecekData.tarih ? new Date(gosterilecekData.tarih).toLocaleDateString('tr-TR') : '----/----/----'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 3'LÜ BİLGİ KOLONLARI */}
      <table style={{ width: '100%', marginBottom: '20px', fontSize: '11px' }}>
        <tbody>
          <tr>
            <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '15px' }}>
              <p style={{ fontWeight: '900', color: '#888', borderBottom: '1px solid #ddd', paddingBottom: '4px', margin: '0 0 6px 0' }}>FİRMA BİLGİLERİ</p>
              <div style={{ fontWeight: 'bold', lineHeight: '1.6' }}>
                Adres: {firmaAyarlari.firma_adres}<br />Vergi: {firmaAyarlari.firma_vergi}<br />Tel: {firmaAyarlari.firma_telefon}
              </div>
            </td>
            <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '15px' }}>
              <p style={{ fontWeight: '900', color: '#888', borderBottom: '1px solid #ddd', paddingBottom: '4px', margin: '0 0 6px 0' }}>MÜŞTERİ BİLGİLERİ</p>
              <div style={{ fontWeight: 'bold', lineHeight: '1.6', minHeight: '40px' }}>
                SAYIN: <span style={{ textTransform: 'uppercase' }}>{gosterilecekData.musteri_adi}</span><br />
                Adres: {gosterilecekData.raw?.adres || ''}<br />
                GSM: {gosterilecekData.raw?.telefon || ''}
              </div>
            </td>
            <td style={{ width: '33.33%', verticalAlign: 'top' }}>
              <p style={{ fontWeight: '900', color: '#888', borderBottom: '1px solid #ddd', paddingBottom: '4px', margin: '0 0 6px 0' }}>CİHAZ BİLGİSİ</p>
              <div style={{ fontWeight: 'bold', lineHeight: '1.6', minHeight: '40px' }}>
                Ürün: {seciliKayit ? (gosterilecekData.cihaz_bilgisi || gosterilecekData.tip) : ''}<br />
                Seri/Barkod: {seciliKayit ? (getVal(gosterilecekData.raw, ['serial_number', 'serial', 'barkod']) || '-') : ''}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ANA TABLO */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', minHeight: '120px' }}>
        <thead>
          <tr style={{ backgroundColor: '#444', color: 'white', textAlign: 'left', fontSize: '11px' }}>
            <th style={{ padding: '8px', border: '1px solid #444', width: '40px', textAlign: 'center' }}>NO</th>
            <th style={{ padding: '8px', border: '1px solid #444' }}>ARIZA / ŞİKAYET BİLDİRİMİ</th>
            <th style={{ padding: '8px', border: '1px solid #444', width: '80px', textAlign: 'right' }}>TAHMİNİ FİYAT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '12px 8px', border: '1px solid #eee', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', color: '#888', fontSize: '11px' }}>1</td>
            <td style={{ padding: '12px 8px', border: '1px solid #eee', verticalAlign: 'top', fontWeight: 'bold', fontSize: '12px' }}>
              <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>{gosterilecekData.aciklama}</div>
            </td>
            <td style={{ padding: '12px 8px', border: '1px solid #eee', textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '12px' }}>
              {seciliKayit ? (genelToplam > 0 ? `${genelToplam.toLocaleString('tr-TR')} ₺` : 'Belirlenecek') : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* FOOTER & İMZA ALANI */}
      <table style={{ width: '100%', marginTop: 'auto', position: 'absolute', bottom: '20px', left: '40px', right: '40px' }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'bottom', width: '60%' }}>
              <div style={{ fontSize: '10px', color: '#666', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                <b>ÖNEMLİ NOT:</b><br/>
                {firmaAyarlari.fatura_alt_bilgi}
              </div>
            </td>
            <td style={{ width: '40%', verticalAlign: 'bottom', textAlign: 'center' }}>
              <div style={{ border: '1px dashed #ccc', padding: '20px 10px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 20px 0', fontSize: '10px', fontWeight: 'bold', color: '#888' }}>TESLİM EDEN MÜŞTERİ İMZA</p>
                <div style={{ width: '100%', height: '30px' }}></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* YAZDIRILDI DAMGASI */}
      {activeTab === 'tamamlanan' && seciliKayit && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '80px', fontWeight: '900', color: 'rgba(255,0,0,0.04)', border: '10px solid rgba(255,0,0,0.04)', padding: '15px', pointerEvents: 'none', textTransform: 'uppercase' }}>
          YAZDIRILDI
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{scrollbarStyle}</style>

      {/* ================= 🚨 HAYALET A4 MATBAASI (ÇİFT A5 YIRTMALI ŞABLON) 🚨 ================= */}
      <div className="absolute z-[-50] opacity-0 pointer-events-none left-0 top-0">
        <div id="ghost-print-area" style={{ width: '794px', height: '1122px', backgroundColor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
          {/* ÜST YARI (MÜŞTERİ NÜSHASI) */}
          {renderA5Nusha('MÜŞTERİ NÜSHASI', true)}
          {/* ALT YARI (İŞYERİ NÜSHASI) */}
          {renderA5Nusha('İŞYERİ NÜSHASI', false)}
        </div>
      </div>

      <div className="flex flex-col h-full p-1 gap-3">
        {/* ÜST TAB MENÜ */}
        <div className="flex gap-2 p-1 bg-black/20 rounded-xl w-fit border border-white/5 relative z-10">
          <button onClick={() => setActiveTab('bekleyen')} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'bekleyen' ? 'bg-[#8E052C] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>🛠️ FİŞ BEKLEYENLER</button>
          <button onClick={() => setActiveTab('tamamlanan')} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'tamamlanan' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>🗄️ GEÇMİŞ ÇIKTILAR</button>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* ================= SOL: HAFİYE ================= */}
          <div className="w-[400px] flex flex-col bg-[#1A1A1E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shrink-0 relative z-10">
            <div className="p-3.5 border-b border-white/5 bg-black/40 flex flex-col gap-2.5">
              <select value={filtreTip} onChange={(e) => { setFiltreTip(e.target.value); setCurrentPage(1); }} className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 py-2 text-[11px] font-black text-white uppercase outline-none focus:border-[#8E052C]">
                <option value="Tümü">TÜM İŞLEMLER</option>
                <option value="Servis">SADECE SERVİS (YENİ KAYIT)</option>
                <option value="Randevu">SADECE RANDEVU (BEKLEMEDE)</option>
              </select>
              <div className="flex gap-2.5">
                <input type="text" placeholder="İsim veya No..." value={aramaMetni} onChange={(e) => { setAramaMetni(e.target.value); setCurrentPage(1); }} className="flex-1 bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 py-2 text-[11px] text-white outline-none focus:border-[#8E052C]" />
                <input type="date" value={aramaTarih} onChange={(e) => { setAramaTarih(e.target.value); setCurrentPage(1); }} className="w-[115px] bg-[#0F0F12] border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white outline-none focus:border-[#8E052C] cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto nuke-scrollbar p-2.5 flex flex-col gap-2">
              {loading ? <div className="text-center py-10 text-gray-600 text-[11px] font-black uppercase animate-pulse">Yükleniyor...</div> : 
               currentRecords.length === 0 ? <div className="text-center py-10 text-gray-600 text-[11px] font-black uppercase">Kayıt Yok</div> :
               currentRecords.map((item) => {
                let cardColorClass = item.tip === 'Servis' ? 'bg-orange-500' : 'bg-blue-500';
                let isSelected = seciliKayit?.id === item.id;
                
                return (
                  <div key={item.id} onClick={() => setSeciliKayit(item)} className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? `${cardColorClass}/30 border-${cardColorClass.split('-')[1]}-500` : `${cardColorClass}/10 border-${cardColorClass.split('-')[1]}-500/20 hover:${cardColorClass}/20`}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[12px] font-black text-white bg-black/40 px-2.5 py-0.5 rounded-md border border-white/10 shadow-sm">
                        #{item.servis_no}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono font-bold mt-1">{item.tarih ? new Date(item.tarih).toLocaleDateString('tr-TR') : ''}</span>
                    </div>
                    <h4 className="text-[11px] font-black text-white uppercase truncate">{item.musteri_adi}</h4>
                    <div className="mt-1.5 flex justify-between items-end">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">{item.tip} • {item.durum}</span>
                    </div>
                  </div>
                );
               })}
            </div>
            
            <div className="p-3 border-t border-white/5 bg-black/40 flex justify-center items-center gap-1.5">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} className="w-6 h-6 rounded border border-white/10 flex items-center justify-center text-[10px] text-white disabled:opacity-30 hover:bg-white/10 transition-colors">◀</button>
              {getPageNumbers().map((p, i) => (
                p === '...' ? (
                  <span key={`dots-${i}`} className="text-gray-500 text-[10px] px-1 font-black">...</span>
                ) : (
                  <button key={`page-${p}`} onClick={() => setCurrentPage(p as number)} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${safeCurrentPage === p ? 'bg-[#8E052C] text-white' : 'text-gray-500 hover:text-white border border-white/5 hover:bg-white/10'}`}>{p}</button>
                )
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} className="w-6 h-6 rounded border border-white/10 flex items-center justify-center text-[10px] text-white disabled:opacity-30 hover:bg-white/10 transition-colors">▶</button>
            </div>
          </div>

          {/* ================= SAĞ: MÜDÜRÜN MİNİ VİTRİN FATURASI ================= */}
          <div className="flex-1 flex flex-col gap-3 relative">
            <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl p-4 shadow-2xl flex items-center justify-between shrink-0 relative z-10">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-tighter">CİHAZ TESLİM FİŞİ PANELİ</h2>
                <p className="text-[10px] text-gray-500 uppercase font-black mt-1">A4 kağıdında perforeli çift A5 (Müşteri & İşyeri) şablonu.</p>
              </div>
              <div className="flex gap-2.5">
                <button disabled={!seciliKayit} onClick={handlePdfIndir} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 shadow-lg shadow-red-900/20 disabled:opacity-30">
                  <span>📄</span> PDF İNDİR
                </button>
                <button disabled={!seciliKayit} onClick={handlePrint} className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 shadow-lg disabled:opacity-30">
                  <span>🖨️</span> HIZLI YAZDIR
                </button>
              </div>
            </div>

            {/* 🚨 MİNİ VİTRİN EKRANI */}
            <div className="flex-1 bg-gray-300 rounded-2xl overflow-hidden relative shadow-inner flex justify-center p-4">
              <div className="w-full max-w-[450px] bg-white text-[#2a2a2a] font-sans nuke-scrollbar overflow-y-auto overflow-x-hidden shadow-2xl relative box-border aspect-[1/1.414]">
                
                <div style={{ width: '794px', minHeight: '1123px', transform: 'scale(0.56)', transformOrigin: 'top left' }}>
                   {renderA5Nusha('MÜŞTERİ NÜSHASI', true)}
                   {renderA5Nusha('İŞYERİ NÜSHASI', false)}
                </div>
                
                {!seciliKayit && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                     <span className="text-5xl mb-3">📄</span>
                     <p className="text-[12px] font-black uppercase tracking-[0.2em]">BİLGİLERİ DOLDURMAK İÇİN KAYIT SEÇİN</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}