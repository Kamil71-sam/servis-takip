import { useState, useEffect } from 'react';
import api from '../api';
import html2pdf from 'html2pdf.js'; // 🚨 MÜDÜRÜN MATBAA MOTORU

// 🚨 MÜDÜRÜN NİHAİ MATBAA CSS'İ (Gereksiz @media çöpleri temizlendi, sadece scrollbar kaldı)
const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
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

  // 🚨 DİNAMİK FİRMA AYARLARI HAFIZASI
  const [firmaAyarlari, setFirmaAyarlari] = useState<any>({
    firma_adi: 'KALANDAR YAZILIM',
    firma_adres: 'Gölcük / Kocaeli',
    firma_vergi: 'Kurtdereli VD / 1234567890',
    firma_telefon: '0555 123 45 67',
    fatura_alt_bilgi: 'Bizi tercih ettiğiniz için teşekkür ederiz. Değişen parçalar 6 ay garantilidir.'
  });

  useEffect(() => {
    const kayitlilar = JSON.parse(localStorage.getItem('kalandar_ciktilar') || '[]');
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






const resKasa = await api.get('/api/kasa/all').catch(() => null);
      if (resKasa?.data?.data) {
        const stoklar = resKasa.data.data
          .filter((i: any) => i.kategori === 'Stok Satışı')
          .map((i: any) => {
            // 🚨 STOK SATIŞI TEMİZLEYİCİ MOTOR V3 🚨
            let temizAciklama = i.aciklama || '';
            let urunAdi = '';
            let barkodNo = '';

            if (temizAciklama.includes('Stok Satışı:')) {
                urunAdi = temizAciklama.match(/Stok Satışı:\s*([^|]+)/i)?.[1]?.trim() || '';
                barkodNo = temizAciklama.match(/Barkod:\s*([^|]+)/i)?.[1]?.trim() || '';
                
                if (urunAdi && barkodNo) {
                    temizAciklama = `${urunAdi.toUpperCase()} (${barkodNo})`;
                } else if (urunAdi) {
                    temizAciklama = urunAdi.toUpperCase();
                }
            }

            return {
              id: `stok_${i.id}`, tip: 'Stok Satışı', 
             
              

              // 🚨 ZIMPARACI MOTORU: Her zaman önce Ürün Adını yaz, bulamazsa Barkodu yaz!
              servis_no: (urunAdi || barkodNo || i.servis_no || i.plaka || '-').toUpperCase(),
              
              
              
              
              musteri_adi: i.musteri_adi || 'Genel Müşteri', tarih: i.islem_tarihi,
              tutar: i.tutar, durum: 'Teslim Edildi', aciklama: temizAciklama, raw: i 
            };
          });
        combinedData = [...combinedData, ...stoklar];
      }



  
       



      const resTamamlanan = await api.get('/services/tamamlanan').catch(() => null);
      const servisTamamlananListe = Array.isArray(resTamamlanan?.data?.data) ? resTamamlanan.data.data : (Array.isArray(resTamamlanan?.data) ? resTamamlanan.data : []);
      if (servisTamamlananListe.length > 0) {
        const servislerT = servisTamamlananListe.map((i: any) => ({
            id: `srv_t_${i.id}`, tip: 'Servis', 
            servis_no: i.servis_no || i.plaka,
            musteri_adi: getVal(i, ['musteri_adi', 'customer_name', 'name', 'firma_adi', 'musteri']) || 'Bilinmiyor', 
            tarih: i.updated_at || i.created_at || i.tarih, 
            tutar: i.offer_price || i.fiyat || 0, 
            durum: i.status || i.durum,
            cihaz_bilgisi: i.cihaz_tipi || i.marka_model || `${i.brand || ''} ${i.model || ''}`, 
            aciklama: i.issue_text || i.ariza || 'Tamir & Servis İşlemi', raw: i
          }));
        combinedData = [...combinedData, ...servislerT];
      }

      const resAktif = await api.get('/services/all').catch(() => null);
      const servisAktifListe = Array.isArray(resAktif?.data?.data) ? resAktif.data.data : (Array.isArray(resAktif?.data) ? resAktif.data : []);
      if (servisAktifListe.length > 0) {
        const servislerA = servisAktifListe.map((i: any) => ({
            id: `srv_a_${i.id}`, tip: 'Servis', 
            servis_no: i.servis_no || i.plaka,
            musteri_adi: getVal(i, ['musteri_adi', 'customer_name', 'name', 'firma_adi', 'musteri']) || 'Bilinmiyor', 
            tarih: i.created_at || i.tarih, 
            tutar: i.offer_price || i.fiyat || 0, 
            durum: i.status || i.durum, 
            cihaz_bilgisi: i.cihaz_tipi || i.marka_model || `${i.brand || ''} ${i.model || ''}`, 
            aciklama: i.issue_text || i.ariza || 'Tamir & Servis İşlemi', raw: i
          }));
        combinedData = [...combinedData, ...servislerA];
      }

      const fetchRandevular = async (endpoint: string) => {
          const res = await api.get(endpoint).catch(() => null);
          const liste = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
          return liste.map((i: any) => ({
              id: `rnd_${i.id}`, tip: 'Randevu', 
              servis_no: i.servis_no || i.plaka,
              musteri_adi: getVal(i, ['müşteri adı', 'musteri adi', 'customer_name', 'name', 'firma_adi', 'musteri']) || 'Bilinmiyor',
              tarih: i.appointment_date || i.created_at || i.tarih, 
              tutar: i.tahsil_edilen_tutar || i.offer_price || i.price || 0,
              durum: i.status || i.durum, 
              aciklama: i.issue_text || i.ariza || 'Randevu / Danışmanlık', raw: i
          }));
      };

      const randevularAktif = await fetchRandevular('/api/appointments/liste/aktif');
      const randevularGecmis = await fetchRandevular('/api/appointments/liste/gecmis'); 
      
      combinedData = [...combinedData, ...randevularAktif, ...randevularGecmis];
      const uniqueData = Array.from(new Map(combinedData.map(item => [item.id, item])).values());
      uniqueData.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
      setHamListe(uniqueData);
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
    
    let tarihUygun = true;
    if (aramaTarih && item.tarih) {
      const d = new Date(item.tarih);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        tarihUygun = `${y}-${m}-${day}` === aramaTarih;
      } else {
        tarihUygun = false;
      }
    } else if (aramaTarih && !item.tarih) {
      tarihUygun = false;
    }

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


// 🚨 MÜDÜRÜN KUSURSUZ PDF MOTORU (Hatasız ve Tek Sayfa Garantili)
  const handlePdfIndir = () => {
    if (!seciliKayit) return;
    const element = document.getElementById('ghost-print-area');
    
    const opt: any = {
      margin:       0, 
      filename:     `Fatura_${seciliKayit.servis_no}.pdf`,
      image:        { type: 'jpeg', quality: 1 }, 
      html2canvas:  { scale: 2, useCORS: true }, // Scale 2 yaparak taşma riskini sıfırladık
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if (!yazdirilanlar.includes(seciliKayit.id) && activeTab !== 'tamamlanan') {
            const onay = window.confirm("PDF başarıyla indirildi!\n\nEvet derseniz bu evrak 'Geçmiş Çıktılar' arşivine taşınacaktır.");
            if (onay) {
              const yeniYazdirilanlar = [...yazdirilanlar, seciliKayit.id];
              setYazdirilanlar(yeniYazdirilanlar);
              localStorage.setItem('kalandar_ciktilar', JSON.stringify(yeniYazdirilanlar));
              setSeciliKayit(null);
            }
          }
    });
  };


  // 🚨 İŞTE NÜKLEER SİLAH: SANAL ODADA (IFRAME) YAZDIRMA OPERASYONU 🚨
  const handlePrint = () => {
    if (!seciliKayit) return;
    
    // 1. Hayalet faturanın sadece İÇİNDEKİ HTML'i al (Dış çerçeveyi değil)
    const printElement = document.getElementById('ghost-print-area');
    if (!printElement) return;
    const printContent = printElement.innerHTML;

    // 2. Tertemiz, görünmez bir sanal pencere (Iframe) yarat
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // 3. Iframe'in içine faturayı ve sadece ona özel koruyucu zırh CSS'lerini bas
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fatura - ${seciliKayit.servis_no}</title>
          <style>
            /* Kâğıt ölçüsü ve kenar sıfırlama */
            @page { size: A4 portrait; margin: 0; }
            body { 
              margin: 0; 
              padding: 0;
              font-family: Arial, sans-serif; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              background: white;
            }
            /* Tabloların yarısının 2. sayfaya sarkmasını engelleyen kilit */
            table { border-collapse: collapse; page-break-inside: avoid; width: 100%; }
            tr { page-break-inside: avoid; }
            td, th { box-sizing: border-box; }
            
            /* İŞTE MÜDÜRÜN İSTEDİĞİ 4 CM AŞAĞI KAYDIRMA VE %100 YAYILMA! */
            .fatura-kapsayici {
              width: 100%;
              min-height: 297mm;
              position: relative;
              padding: 4cm 40px 40px 40px; 
              box-sizing: border-box;
            }
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

    // 4. Tarayıcı sanal pencereyi derlesin diye saliselik bir mola ve BAM!
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Yazdırma diyaloğu kapandıktan sonra temizlik ve arşiv sorusu
      setTimeout(() => {
        document.body.removeChild(iframe);
        if (!yazdirilanlar.includes(seciliKayit.id) && activeTab !== 'tamamlanan') {
          const onay = window.confirm("Yazdırma işlemi sorunsuz tamamlandı mı?\\n\\nEvet derseniz bu evrak 'Geçmiş Çıktılar' arşivine taşınacaktır.");
          if (onay) {
            const yeniYazdirilanlar = [...yazdirilanlar, seciliKayit.id];
            setYazdirilanlar(yeniYazdirilanlar);
            localStorage.setItem('kalandar_ciktilar', JSON.stringify(yeniYazdirilanlar));
            setSeciliKayit(null);
          }
        }
      }, 1000); // Diyalog kapanana kadar bekle
    }, 500); // HTML'in render olması için bekle
  };

  // 🚨 EKRAN BOŞKEN BİLE ÇÖKMEYİ ENGELLEYEN YEDEK VERİ
  const aktifKayit = seciliKayit || {
    servis_no: '------',
    tarih: new Date().toISOString(),
    musteri_adi: 'MÜŞTERİ BİLGİSİ YOK',
    tip: 'HİZMET',
    aciklama: 'Kayıt seçilmesi bekleniyor...',
    tutar: '0',
    raw: {}
  };

  const genelToplam = parseFloat(aktifKayit.tutar || 0);
  const araToplam = genelToplam / 1.20; 
  const kdvTutari = genelToplam - araToplam;

  return (
    <>
      <style>{scrollbarStyle}</style>

      {/* ================= 🚨 HAYALET A4 MATBAASI 🚨 ================= */}
      {/* Bu div sadece PDF motoru ve Iframe'e HTML kopyalamak için arka planda sessizce bekler */}
      <div className="absolute z-[-50] opacity-0 pointer-events-none left-0 top-0">
        {seciliKayit && (
          
          <div id="ghost-print-area" style={{ 
            width: '794px', /* PDF Motoru için 794px piksel kilidi */
            height: '1122px', /* 🚨 A4 BOYUTUNA TAM KİLİTLENDİ */
            overflow: 'hidden', /* 🚨 2. SAYFAYA TAŞAN 1 PİKSEL BİLE OLSA KESİP ATAR! */
            padding: '4cm 40px 40px 40px', /* PDF Motoru için 4cm boşluk */
            backgroundColor: 'white', 
            color: 'black', 
            fontFamily: 'Arial, sans-serif', 
            boxSizing: 'border-box' 
          }}>
            
            {/* BAŞLIK TABLOSU */}
            <table style={{ width: '100%', borderBottom: '4px solid #a61c24', marginBottom: '25px', paddingBottom: '15px' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top' }}>
                    <h1 style={{ fontSize: '42px', fontWeight: '900', margin: 0, letterSpacing: '-1px', textTransform: 'uppercase' }}>
                      <span style={{ color: '#a61c24' }}>{firmaAyarlari.firma_adi?.split(' ')[0] || 'FİRMA'}</span> <span style={{ color: '#666' }}>{firmaAyarlari.firma_adi?.split(' ').slice(1).join(' ') || 'ADI'}</span>
                    </h1>
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#a61c24', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                      {activeTab === 'servis' ? 'SERVİS FİŞİ' : 'TEKNİK SERVİS VE SATIŞ BELGESİ'}
                    </h2>
                    <table style={{ width: '240px', marginLeft: 'auto', fontSize: '14px', fontWeight: 'bold' }}>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: 'left', paddingBottom: '5px' }}>BELGE NO:</td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', paddingBottom: '5px' }}>{generateDateStamp(seciliKayit.tarih)}-{seciliKayit.servis_no}</td>
                        </tr>


                        <tr>
                        <td style={{ textAlign: 'left', fontWeight: 'bold', paddingRight: '15px', whiteSpace: 'nowrap' }}>TARİH:</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{new Date().toLocaleDateString('tr-TR')}</td>
                      </tr>
                       




                        
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 3'LÜ BİLGİ KOLONLARI (TABLE) */}
            <table style={{ width: '100%', marginBottom: '40px', fontSize: '14px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '20px' }}>
                    <p style={{ fontWeight: '900', color: '#888', borderBottom: '2px solid #ddd', paddingBottom: '8px', margin: '0 0 12px 0' }}>FİRMA BİLGİLERİ</p>
                    <div style={{ fontWeight: 'bold', lineHeight: '1.8' }}>
                      Adres: {firmaAyarlari.firma_adres}<br />
                      Vergi: {firmaAyarlari.firma_vergi}<br />
                      Tel: {firmaAyarlari.firma_telefon}
                    </div>
                  </td>


                 
                    <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '20px' }}>
                      <p style={{ fontWeight: '900', color: '#888', borderBottom: '2px solid #ddd', paddingBottom: '8px', margin: '0 0 12px 0' }}>MÜŞTERİ BİLGİLERİ</p>
                      <div style={{ fontWeight: 'bold', lineHeight: '1.8' }}>
                        SAYIN: <span style={{ textTransform: 'uppercase' }}>{aktifKayit.musteri_adi}</span><br />
                        Adres: {aktifKayit.raw?.customer_address || aktifKayit.raw?.adres || aktifKayit.raw?.address || '-'}<br />
                        GSM: {aktifKayit.raw?.customer_phone || aktifKayit.raw?.telefon || aktifKayit.raw?.phone || '-'}
                      </div>
                    </td>





                      <td style={{ width: '33.33%', verticalAlign: 'top' }}>
                        <p style={{ fontWeight: '900', color: '#888', borderBottom: '2px solid #ddd', paddingBottom: '8px', margin: '0 0 12px 0' }}>CİHAZ BİLGİSİ</p>
                        <div style={{ fontWeight: 'bold', lineHeight: '1.8' }}>
                          Ürün: {aktifKayit.tip === 'Stok Satışı' ? (aktifKayit.raw?.aciklama?.match(/Stok Satışı:\s*([^|]+)/i)?.[1]?.trim() || 'Stok Satışı') : (aktifKayit.cihaz_bilgisi || aktifKayit.tip)}<br />
                          Seri / Barkod: {aktifKayit.tip === 'Stok Satışı' ? (aktifKayit.raw?.aciklama?.match(/Barkod:\s*([^|]+)/i)?.[1]?.trim() || aktifKayit.raw?.barkod || '-') : (getVal(aktifKayit.raw, ['serial_number', 'serial', 'seri_no', 'barkod', 'barcode', 'cihaz_seri', 'imei', 'plaka']) || '-')}
                        </div>
                      </td>
                                            
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                  




                </tr>
              </tbody>
            </table>

            {/* ANA ÜRÜN TABLOSU (TABLE) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px', minHeight: '220px' }}>
              <thead>
                <tr style={{ backgroundColor: '#444', color: 'white', textAlign: 'left', fontSize: '14px' }}>
                  <th style={{ padding: '12px', border: '1px solid #444', width: '50px', textAlign: 'center' }}>NO</th>
                  <th style={{ padding: '12px', border: '1px solid #444' }}>HİZMET / ÜRÜN ADI</th>
                  <th style={{ padding: '12px', border: '1px solid #444', width: '90px', textAlign: 'center' }}>MİKTAR</th>
                  <th style={{ padding: '12px', border: '1px solid #444', width: '130px', textAlign: 'right' }}>BİRİM FİYAT</th>
                  <th style={{ padding: '12px', border: '1px solid #444', width: '70px', textAlign: 'center' }}>KDV</th>
                  <th style={{ padding: '12px', border: '1px solid #444', width: '140px', textAlign: 'right' }}>TOPLAM</th>
                </tr>
              </thead>
              <tbody>
                <tr>


                <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '20px', border: '1px solid #eee', color: '#666', fontWeight: 'bold', fontSize: '14px' }}>
                        1
                      </td>
                      <td style={{ padding: '20px 10px', border: '1px solid #eee', verticalAlign: 'top', fontWeight: 'bold', fontSize: '14px' }}>
                        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{aktifKayit.aciklama}</div>
                        {aktifKayit.tip !== 'Stok Satışı' && (
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                              (Kayıt No: {aktifKayit.servis_no}{aktifKayit.raw?.barkod ? `, Barkod: ${aktifKayit.raw.barkod}` : ''})
                            </div>
                        )}
                      </td>



                




                  <td style={{ padding: '20px 10px', border: '1px solid #eee', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', fontSize: '14px' }}>1</td>
                  <td style={{ padding: '20px 10px', border: '1px solid #eee', textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '15px' }}>{genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                  <td style={{ padding: '20px 10px', border: '1px solid #eee', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', color: '#666', fontSize: '14px' }}>%20</td>
                  <td style={{ padding: '20px 10px', border: '1px solid #eee', textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '15px' }}>{genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                </tr>
              </tbody>
            </table>

            {/* MATEMATİK VE BANKA BİLGİLERİ (TABLE) */}
            <table style={{ width: '100%', marginTop: 'auto' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'bottom', paddingRight: '20px' }}>
                    <div style={{ fontSize: '13px', borderLeft: '4px solid #888', paddingLeft: '12px', lineHeight: '1.8' }}>
                      <p style={{ fontWeight: '900', color: '#888', margin: '0 0 6px 0' }}>BANKA HESAP BİLGİLERİMİZ</p>
                      <table style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        <tbody>
                          <tr><td style={{ width: '100px', paddingBottom: '4px' }}>Ziraat Bankası:</td><td style={{ fontFamily: 'monospace', paddingBottom: '4px' }}>TR00 0000 0000 0000 0000 00</td></tr>
                          <tr><td>Garanti BBVA:</td><td style={{ fontFamily: 'monospace' }}>TR99 9999 9999 9999 9999 99</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                  <td style={{ width: '360px', verticalAlign: 'bottom' }}>
                    <table style={{ width: '100%', fontSize: '16px', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px 0', color: '#666', fontWeight: 'bold' }}>ARA TOPLAM:</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' }}>{araToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', color: '#666', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>İSKONTO / KDV:</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold', borderBottom: '2px solid #eee', fontFamily: 'monospace' }}>{kdvTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '16px 0', fontWeight: '900', color: '#a61c24', fontSize: '18px' }}>ÖDENECEK TUTAR:</td>
                          <td style={{ textAlign: 'right', fontWeight: '900', color: '#a61c24', fontSize: '26px', fontFamily: 'monospace', letterSpacing: '-1px' }}>{genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ALT BİLGİ */}
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#888', borderTop: '2px solid #eee', paddingTop: '20px', marginTop: '50px', whiteSpace: 'pre-line' }}>
              {firmaAyarlari.fatura_alt_bilgi}
            </div>

            {/* YAZDIRILDI DAMGASI */}
            {activeTab === 'tamamlanan' && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '130px', fontWeight: '900', color: 'rgba(255,0,0,0.05)', border: '20px solid rgba(255,0,0,0.05)', padding: '30px', pointerEvents: 'none', textTransform: 'uppercase' }}>
                YAZDIRILDI
              </div>
            )}
          </div>
        )}
      </div>
      {/* ================= HAYALET A4 BİTİŞ ================= */}


      <div className="flex flex-col h-full p-1 gap-3">
        
        {/* ÜST TAB MENÜ */}
        <div className="flex gap-2 p-1 bg-black/20 rounded-xl w-fit border border-white/5 relative z-10">
          <button onClick={() => setActiveTab('fatura')} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'fatura' ? 'bg-[#8E052C] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>📄 FATURA BEKLEYENLER</button>
          <button onClick={() => setActiveTab('tamamlanan')} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'tamamlanan' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>🗄️ GEÇMİŞ ÇIKTILAR</button>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          
          {/* ================= SOL: HAFİYE ================= */}
          <div className="w-[400px] flex flex-col bg-[#1A1A1E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shrink-0 relative z-10">
            <div className="p-3.5 border-b border-white/5 bg-black/40 flex flex-col gap-2.5">
              <select value={filtreTip} onChange={(e) => { setFiltreTip(e.target.value); setCurrentPage(1); }} className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 py-2 text-[11px] font-black text-white uppercase outline-none focus:border-[#8E052C]">
                <option value="Tümü">TÜM İŞLEMLER</option>
                <option value="Servis">SADECE SERVİS</option>
                <option value="Randevu">SADECE RANDEVU</option>
                <option value="Stok Satışı">STOK SATIŞI</option>
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
                let cardColorClass = '';
                if (item.tip === 'Servis') {
                  cardColorClass = seciliKayit?.id === item.id ? 'bg-orange-500/30 border-orange-500' : 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20';
                } else if (item.tip === 'Randevu') {
                  cardColorClass = seciliKayit?.id === item.id ? 'bg-blue-500/30 border-blue-500' : 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20';
                } else if (item.tip === 'Stok Satışı') {
                  cardColorClass = seciliKayit?.id === item.id ? 'bg-green-500/30 border-green-500' : 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20';
                } else {
                  cardColorClass = seciliKayit?.id === item.id ? 'bg-[#8E052C]/30 border-[#8E052C]' : 'bg-white/5 border-white/5 hover:bg-white/10';
                }

                return (
                  <div key={item.id} onClick={() => setSeciliKayit(item)} className={`p-3 rounded-xl border cursor-pointer transition-all ${cardColorClass}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[12px] font-black text-white bg-black/40 px-2.5 py-0.5 rounded-md border border-white/10 shadow-sm">
                        #{item.servis_no}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono font-bold mt-1">{item.tarih ? new Date(item.tarih).toLocaleDateString('tr-TR') : ''}</span>
                    </div>
                    <h4 className="text-[11px] font-black text-white uppercase truncate">{item.musteri_adi}</h4>
                    <div className="mt-1.5 flex justify-between items-end">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">{item.tip} • {item.durum}</span>
                      <span className="text-[11px] font-black text-green-400">{parseFloat(item.tutar).toLocaleString('tr-TR')} ₺</span>
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
                <h2 className="text-sm font-black text-white uppercase tracking-tighter">FATURA / FİŞ KONTROL PANELİ</h2>
                <p className="text-[10px] text-gray-500 uppercase font-black mt-1">Önizlemeyi kontrol edip kurumsal çıktı alın.</p>
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

            {/* YENİ BLURLU VE ORANTILI VİTRİN EKRANI */}
            <div className="flex-1 bg-gray-300 rounded-2xl overflow-y-auto nuke-scrollbar relative shadow-inner flex justify-center items-start p-4">
              
              <div style={{ width: '437px', height: '617px', position: 'relative' }} className="shrink-0 bg-white shadow-2xl rounded-sm overflow-hidden">
                
                <div style={{ width: '794px', height: '1122px', transform: 'scale(0.55)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, padding: '4cm 40px 40px 40px', backgroundColor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
                  
                  {/* BAŞLIK TABLOSU */}
                  <table style={{ width: '100%', borderBottom: '4px solid #a61c24', marginBottom: '25px', paddingBottom: '15px' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top' }}>
                          <h1 style={{ fontSize: '42px', fontWeight: '900', margin: 0, letterSpacing: '-1px', textTransform: 'uppercase' }}>
                            <span style={{ color: '#a61c24' }}>{firmaAyarlari.firma_adi?.split(' ')[0] || 'FİRMA'}</span> <span style={{ color: '#666' }}>{firmaAyarlari.firma_adi?.split(' ').slice(1).join(' ') || 'ADI'}</span>
                          </h1>
                        </td>
                        <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#a61c24', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {activeTab === 'servis' ? 'SERVİS FİŞİ' : 'TEKNİK SERVİS VE SATIŞ BELGESİ'}
                          </h2>
                          <table style={{ width: '240px', marginLeft: 'auto', fontSize: '14px', fontWeight: 'bold' }}>
                            <tbody>
                              <tr>
                                <td style={{ textAlign: 'left', paddingBottom: '5px' }}>BELGE NO:</td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace', paddingBottom: '5px' }}>{generateDateStamp(aktifKayit.tarih)}-{aktifKayit.servis_no}</td>
                              </tr>
                              


                              <tr>
                                <td style={{ textAlign: 'left', fontWeight: 'bold', paddingRight: '15px', whiteSpace: 'nowrap' }}>TARİH:</td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{new Date().toLocaleDateString('tr-TR')}</td>
                              </tr>





                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 3'LÜ BİLGİ KOLONLARI (TABLE) */}
                  <table style={{ width: '100%', marginBottom: '40px', fontSize: '14px' }}>
                    <tbody>
                      <tr>
                        
                        <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '20px' }}>
                          <p style={{ fontWeight: '900', color: '#888', borderBottom: '2px solid #ddd', paddingBottom: '8px', margin: '0 0 12px 0' }}>FİRMA BİLGİLERİ</p>
                          <div style={{ fontWeight: 'bold', lineHeight: '1.8' }}>
                            Adres: {firmaAyarlari.firma_adres}<br />
                            Vergi: {firmaAyarlari.firma_vergi}<br />
                            Tel: {firmaAyarlari.firma_telefon}
                          </div>
                        </td>                     
                      

                       <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '20px' }}>
                        <p style={{ fontWeight: '900', color: '#888', borderBottom: '2px solid #ddd', paddingBottom: '8px', margin: '0 0 12px 0' }}>MÜŞTERİ BİLGİLERİ</p>
                        <div style={{ fontWeight: 'bold', lineHeight: '1.8' }}>
                          SAYIN: <span style={{ textTransform: 'uppercase' }}>{aktifKayit.musteri_adi}</span><br />
                          Adres: {aktifKayit.raw?.customer_address || aktifKayit.raw?.adres || aktifKayit.raw?.address || '-'}<br />
                          GSM: {aktifKayit.raw?.customer_phone || aktifKayit.raw?.telefon || aktifKayit.raw?.phone || '-'}
                        </div>
                      </td>




                      <td style={{ width: '33.33%', verticalAlign: 'top' }}>
                        <p style={{ fontWeight: '900', color: '#888', borderBottom: '2px solid #ddd', paddingBottom: '8px', margin: '0 0 12px 0' }}>CİHAZ BİLGİSİ</p>
                        <div style={{ fontWeight: 'bold', lineHeight: '1.8' }}>
                          Ürün: {aktifKayit.tip === 'Stok Satışı' ? (aktifKayit.raw?.aciklama?.match(/Stok Satışı:\s*([^|]+)/i)?.[1]?.trim() || 'Stok Satışı') : (aktifKayit.cihaz_bilgisi || aktifKayit.tip)}<br />
                          Seri / Barkod: {aktifKayit.tip === 'Stok Satışı' ? (aktifKayit.raw?.aciklama?.match(/Barkod:\s*([^|]+)/i)?.[1]?.trim() || aktifKayit.raw?.barkod || '-') : (getVal(aktifKayit.raw, ['serial_number', 'serial', 'seri_no', 'barkod', 'barcode', 'cihaz_seri', 'imei', 'plaka']) || '-')}
                        </div>
                      </td>

                        

 



                      </tr>
                    </tbody>
                  </table>

                  {/* ANA ÜRÜN TABLOSU (TABLE) */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px', minHeight: '220px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#444', color: 'white', textAlign: 'left', fontSize: '14px' }}>
                        <th style={{ padding: '12px', border: '1px solid #444', width: '50px', textAlign: 'center' }}>NO</th>
                        <th style={{ padding: '12px', border: '1px solid #444' }}>HİZMET / ÜRÜN ADI</th>
                        <th style={{ padding: '12px', border: '1px solid #444', width: '90px', textAlign: 'center' }}>MİKTAR</th>
                        <th style={{ padding: '12px', border: '1px solid #444', width: '130px', textAlign: 'right' }}>BİRİM FİYAT</th>
                        <th style={{ padding: '12px', border: '1px solid #444', width: '70px', textAlign: 'center' }}>KDV</th>
                        <th style={{ padding: '12px', border: '1px solid #444', width: '140px', textAlign: 'right' }}>TOPLAM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>




                        <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '20px', border: '1px solid #eee', color: '#666', fontWeight: 'bold', fontSize: '14px' }}>
                              1
                            </td>
                            <td style={{ padding: '20px 10px', border: '1px solid #eee', verticalAlign: 'top', fontWeight: 'bold', fontSize: '14px' }}>
                              <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{aktifKayit.aciklama}</div>
                              {aktifKayit.tip !== 'Stok Satışı' && (
                                  <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                                    (Kayıt No: {aktifKayit.servis_no}{aktifKayit.raw?.barkod ? `, Barkod: ${aktifKayit.raw.barkod}` : ''})
                                  </div>
                              )}
                            </td>









                       

 
                        <td style={{ padding: '20px 10px', border: '1px solid #eee', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', fontSize: '14px' }}>1</td>
                        <td style={{ padding: '20px 10px', border: '1px solid #eee', textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '15px' }}>{genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        <td style={{ padding: '20px 10px', border: '1px solid #eee', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', color: '#666', fontSize: '14px' }}>%20</td>
                        <td style={{ padding: '20px 10px', border: '1px solid #eee', textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '15px' }}>{genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* MATEMATİK VE BANKA BİLGİLERİ (TABLE) */}
                  <table style={{ width: '100%', marginTop: 'auto' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'bottom', paddingRight: '20px' }}>
                          <div style={{ fontSize: '13px', borderLeft: '4px solid #888', paddingLeft: '12px', lineHeight: '1.8' }}>
                            <p style={{ fontWeight: '900', color: '#888', margin: '0 0 6px 0' }}>BANKA HESAP BİLGİLERİMİZ</p>
                            <table style={{ fontSize: '12px', fontWeight: 'bold' }}>
                              <tbody>
                                <tr><td style={{ width: '100px', paddingBottom: '4px' }}>Ziraat Bankası:</td><td style={{ fontFamily: 'monospace', paddingBottom: '4px' }}>TR00 0000 0000 0000 0000 00</td></tr>
                                <tr><td>Garanti BBVA:</td><td style={{ fontFamily: 'monospace' }}>TR99 9999 9999 9999 9999 99</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                        <td style={{ width: '360px', verticalAlign: 'bottom' }}>
                          <table style={{ width: '100%', fontSize: '16px', borderCollapse: 'collapse' }}>
                            <tbody>
                              <tr>
                                <td style={{ padding: '8px 0', color: '#666', fontWeight: 'bold' }}>ARA TOPLAM:</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' }}>{araToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '8px 0', color: '#666', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>İSKONTO / KDV:</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', borderBottom: '2px solid #eee', fontFamily: 'monospace' }}>{kdvTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '16px 0', fontWeight: '900', color: '#a61c24', fontSize: '18px' }}>ÖDENECEK TUTAR:</td>
                                <td style={{ textAlign: 'right', fontWeight: '900', color: '#a61c24', fontSize: '26px', fontFamily: 'monospace', letterSpacing: '-1px' }}>{genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* ALT BİLGİ */}
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#888', borderTop: '2px solid #eee', paddingTop: '20px', marginTop: '50px', whiteSpace: 'pre-line' }}>
                    {firmaAyarlari.fatura_alt_bilgi}
                  </div>

                  {/* YAZDIRILDI DAMGASI */}
                  {activeTab === 'tamamlanan' && seciliKayit && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '130px', fontWeight: '900', color: 'rgba(255,0,0,0.05)', border: '20px solid rgba(255,0,0,0.05)', padding: '30px', pointerEvents: 'none', textTransform: 'uppercase' }}>
                      YAZDIRILDI
                    </div>
                  )}
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