import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// 🚨 İŞTE KURTULUŞ REÇETESİ: Ana kapıdan değil, Legacy (Arka Kapı) üzerinden giriyoruz!
import * as FileSystem from 'expo-file-system/legacy'; 
import * as MailComposer from 'expo-mail-composer'; // 🚨 MAİL PAKETİ EKLENDİ
import { Alert } from 'react-native';

// --- ORTAK PARA FORMATLAYICI ---
const formatPara = (miktar: any) => {
  return Number(miktar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ---------------------------------------------------------
// 1. PDF ÇIKTI MOTORU (MEVCUT JİLET SİSTEM - HİÇ DOKUNULMADI)
// ---------------------------------------------------------
export const pdfCiktiAl = async (gelenVeri: any = {}) => {
  const firma = gelenVeri.firma || {
    unvan: "KALANDAR YAZILIM", adres: "Ege Mah. 210 Sok. No: 12 İç Kapı No: 1 Altıeylül / Balıkesir",
    vergiDairesi: "Kurtdereli VD", vergiNo: "1234567890", telefon: "0555 123 45 67",
    iban1Banka: "Ziraat Bankası", iban1: "TR00 0000 0000 0000 0000 0000 00",
    iban2Banka: "Garanti BBVA", iban2: "TR99 9999 9999 9999 9999 9999 99"
  };
  const musteri = gelenVeri.musteri || { adi: "Bilinmiyor", adres: "-", telefon: "-", vergiNo: "" };
  const tarih = gelenVeri.tarih || new Date().toLocaleDateString('tr-TR');
  const cihaz = gelenVeri.cihaz || { markaModel: "Bilinmiyor", seriNo: "Barkodsuz" };
  const belgeNo = gelenVeri.belgeNo || `KY-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
  const kalemler: any[] = gelenVeri.kalemler || [];
  const toplamlar = gelenVeri.toplamlar || { araToplam: 0, iskonto: 0, kdvToplam: 0, genelToplam: 0 };
  const notlar = gelenVeri.notlar || ""; 

  try {
    const kalemlerHTML = kalemler.map((kalem: any, index: number) => `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${kalem.ad}</td>
        <td class="center">${kalem.miktar || 1}</td>
        <td class="center">${formatPara(kalem.fiyat)} ₺</td>
        <td class="center">%${kalem.kdv || 20}</td>
        <td class="right"><b>${formatPara(kalem.toplam)} ₺</b></td>
      </tr>
    `).join('');

    const htmlIcerik = `
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Roboto', 'Segoe UI', Arial, sans-serif; text-rendering: optimizeLegibility; margin: 0; padding: 40px; color: #1a1a1a; font-size: 13px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; border-bottom: 2px solid #D32F2F; padding-bottom: 20px;}
            .header-table td { vertical-align: bottom; }
            .brand-title { font-size: 38px; font-weight: 900; letter-spacing: -1px; margin: 0; color: #1a1a1a; }
            .brand-title span { color: #D32F2F; }
            .invoice-title { font-size: 22px; font-weight: 900; color: #D32F2F; text-align: right; letter-spacing: 1px;}
            .doc-info { text-align: right; font-size: 12px; color: #666; margin-top: 8px; font-weight: bold;}
            .doc-info span { color: #1a1a1a; margin-left: 5px;}
            .info-container { width: 100%; margin-bottom: 40px; border-collapse: collapse; }
            .info-container td { vertical-align: top; width: 31%; background-color: #f9f9f9; padding: 18px; border-radius: 10px; border-top: 4px solid #D32F2F; }
            .info-container td.spacer { width: 3.5%; background: transparent; border: none; padding: 0; }
            .box-title { font-size: 11px; font-weight: 900; color: #888; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;}
            .box-content { font-size: 13px; line-height: 1.6; color: #333; }
            .box-content strong { color: #1a1a1a; }
            .item-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .item-table th { background-color: #1a1a1a; color: white; padding: 14px 10px; font-size: 12px; text-align: left; font-weight: bold; }
            .item-table th.center { text-align: center; }
            .item-table th.right { text-align: right; }
            .item-table td { padding: 14px 10px; border-bottom: 1px solid #eaeaea; font-size: 13px; color: #333;}
            .item-table td.center { text-align: center; }
            .item-table td.right { text-align: right; }
            .totals-container { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .totals-table { width: 300px; border-collapse: collapse; margin-left: auto; }
            .totals-table td { padding: 8px 0; font-size: 14px; color: #555; text-align: right; }
            .totals-table td.val { width: 130px; font-weight: bold; color: #1a1a1a; }
            .grand-row td { border-top: 2px solid #D32F2F; padding-top: 15px; margin-top: 5px; font-size: 18px; font-weight: 900; color: #D32F2F; }
            .grand-row td.val { color: #D32F2F; }
            .bank-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #eee; }
            .bank-strip { width: 100%; background-color: #f9f9f9; padding: 15px; border-radius: 10px; border-left: 5px solid #1a1a1a; font-size: 11px; color: #333; }
            .bank-row { display: flex; justify-content: flex-start; align-items: center; margin-bottom: 5px; }
            .bank-row b { color: #1a1a1a; margin-right: 10px; width: 100px; display: inline-block; }
            .bank-row span { letter-spacing: 0.5px; }
            .footer { margin-top: 20px; text-align: center; font-size: 11px; color: #888; line-height: 1.5;}
            .notlar { font-size: 11px; color: #D32F2F; font-weight: bold; margin-bottom: 10px; font-style: italic; text-align: center; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 50%; padding-bottom: 15px;">
                <h1 class="brand-title"><span>${firma.unvan.split(' ')[0]}</span> ${firma.unvan.substring(firma.unvan.indexOf(' ') + 1)}</h1>
              </td>
              <td style="width: 50%; padding-bottom: 15px;">
                <div class="invoice-title">TEKNİK SERVİS VE SATIŞ BELGESİ</div>
                <div class="doc-info">BELGE NO: <span>${belgeNo}</span></div>
                <div class="doc-info">TARİH: <span>${tarih}</span></div>
              </td>
            </tr>
          </table>
          <table class="info-container">
            <tr>
              <td>
                <div class="box-title">FİRMA BİLGİLERİ</div>
                <div class="box-content">
                  <strong>Adres:</strong> ${firma.adres}<br><strong>Vergi:</strong> ${firma.vergiDairesi} / ${firma.vergiNo}<br><strong>Tel:</strong> ${firma.telefon}
                </div>
              </td>
              <td class="spacer"></td>
              <td>
                <div class="box-title">MÜŞTERİ BİLGİLERİ</div>
                <div class="box-content">
                  <strong>SAYIN:</strong> ${musteri.adi}<br><strong>Adres:</strong> ${musteri.adres || 'Belirtilmemiş'}<br><strong>GSM:</strong> ${musteri.telefon || '-'}<br>${musteri.vergiNo ? `<strong>Vergi No:</strong> ${musteri.vergiNo}` : ''}
                </div>
              </td>
              <td class="spacer"></td>
              <td>
                <div class="box-title">CİHAZ BİLGİSİ</div>
                <div class="box-content">
                  <strong>Ürün:</strong> ${cihaz.markaModel}<br><strong>Seri / Barkod:</strong> ${cihaz.seriNo}
                </div>
              </td>
            </tr>
          </table>
          <table class="item-table">
            <thead>
              <tr><th width="5%" class="center">NO</th><th width="40%">HİZMET / ÜRÜN ADI</th><th width="10%" class="center">MİKTAR</th><th width="15%" class="center">BİRİM FİYAT</th><th width="10%" class="center">KDV</th><th width="20%" class="right">TOPLAM</th></tr>
            </thead>
            <tbody>${kalemlerHTML}</tbody>
          </table>
          <table class="totals-container">
            <tr>
              <td>
                <table class="totals-table">
                  <tr><td>ARA TOPLAM:</td><td class="val">${formatPara(toplamlar?.araToplam)} ₺</td></tr>
                  <tr><td>İSKONTO:</td><td class="val">-${formatPara(toplamlar?.iskonto)} ₺</td></tr>
                  <tr><td>KDV TOPLAMI:</td><td class="val">${formatPara(toplamlar?.kdvToplam)} ₺</td></tr>
                  <tr class="grand-row"><td>ÖDENECEK TUTAR:</td><td class="val">${formatPara(toplamlar?.genelToplam)} ₺</td></tr>
                </table>
              </td>
            </tr>
          </table>
          <div class="bank-footer">
            ${notlar ? `<div class="notlar">${notlar}</div>` : ''}
            <div class="bank-strip">
              <div style="font-weight: 900; font-size: 10px; color: #888; margin-bottom: 10px; text-transform: uppercase;">Banka Hesap Bilgilerimiz</div>
              <div class="bank-row"><b>${firma.iban1Banka}:</b> <span>${firma.iban1}</span></div>
              <div class="bank-row"><b>${firma.iban2Banka}:</b> <span>${firma.iban2}</span></div>
            </div>
            <div class="footer">Bizi tercih ettiğiniz için teşekkür ederiz. Değişen parçalar 6 ay garantilidir.</div>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlIcerik });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Faturayı Görüntüle' });

  } catch (error) {
    Alert.alert("Hata", "PDF oluşturulurken bir sorun çıktı.");
    console.error(error);
  }
};

// ---------------------------------------------------------
// 2. YENİ WORD ÇIKTI MOTORU 🚀 (LEGACY KAPISIYLA)
// ---------------------------------------------------------
export const wordCiktiAl = async (gelenVeri: any = {}) => {
  const firma = gelenVeri.firma || {
    unvan: "KALANDAR YAZILIM", adres: "Ege Mah. 210 Sok. No: 12 İç Kapı No: 1 Altıeylül / Balıkesir",
    vergiDairesi: "Kurtdereli VD", vergiNo: "1234567890", telefon: "0555 123 45 67",
    iban1Banka: "Ziraat Bankası", iban1: "TR00 0000 0000 0000 0000 0000 00",
    iban2Banka: "Garanti BBVA", iban2: "TR99 9999 9999 9999 9999 9999 99"
  };
  const musteri = gelenVeri.musteri || { adi: "Bilinmiyor", adres: "-", telefon: "-", vergiNo: "" };
  const tarih = gelenVeri.tarih || new Date().toLocaleDateString('tr-TR');
  const cihaz = gelenVeri.cihaz || { markaModel: "Bilinmiyor", seriNo: "Barkodsuz" };
  const belgeNo = gelenVeri.belgeNo || `KY-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
  const kalemler: any[] = gelenVeri.kalemler || [];
  const toplamlar = gelenVeri.toplamlar || { araToplam: 0, iskonto: 0, kdvToplam: 0, genelToplam: 0 };
  const notlar = gelenVeri.notlar || ""; 

  try {
    const kalemlerHTML = kalemler.map((kalem: any, index: number) => `
      <tr>
        <td align="center" style="border: 1px solid #ccc; padding: 8px;">${index + 1}</td>
        <td style="border: 1px solid #ccc; padding: 8px;">${kalem.ad}</td>
        <td align="center" style="border: 1px solid #ccc; padding: 8px;">${kalem.miktar || 1}</td>
        <td align="center" style="border: 1px solid #ccc; padding: 8px;">${formatPara(kalem.fiyat)} ₺</td>
        <td align="center" style="border: 1px solid #ccc; padding: 8px;">%${kalem.kdv || 20}</td>
        <td align="right" style="border: 1px solid #ccc; padding: 8px;"><b>${formatPara(kalem.toplam)} ₺</b></td>
      </tr>
    `).join('');

    const wordIcerik = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; color: #1a1a1a; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            td, th { padding: 8px; text-align: left; vertical-align: top; }
            .brand-title { font-size: 28px; font-weight: bold; color: #1a1a1a; margin:0; }
            .brand-title span { color: #D32F2F; }
            .info-box { border: 1px solid #ccc; background-color: #f9f9f9; }
            .grand-row td { border-top: 2px solid #D32F2F; font-size: 16px; font-weight: bold; color: #D32F2F; }
          </style>
        </head>
        <body>
          
          <table>
            <tr>
              <td width="50%">
                <h1 class="brand-title"><span>${firma.unvan.split(' ')[0]}</span> ${firma.unvan.substring(firma.unvan.indexOf(' ') + 1)}</h1>
              </td>
              <td width="50%" align="right">
                <div style="font-size: 18px; font-weight: bold; color: #D32F2F;">TEKNİK SERVİS BELGESİ</div>
                <div>BELGE NO: <b>${belgeNo}</b></div>
                <div>TARİH: <b>${tarih}</b></div>
              </td>
            </tr>
          </table>

          <table>
            <tr>
              <td width="33%" class="info-box">
                <b style="color:#888;">FİRMA BİLGİLERİ</b><br><br>
                Adres: ${firma.adres}<br>
                Vergi: ${firma.vergiDairesi} / ${firma.vergiNo}<br>
                Tel: ${firma.telefon}
              </td>
              <td width="33%" class="info-box">
                <b style="color:#888;">MÜŞTERİ BİLGİLERİ</b><br><br>
                SAYIN: ${musteri.adi}<br>
                Adres: ${musteri.adres || '-'}<br>
                GSM: ${musteri.telefon || '-'}<br>
                ${musteri.vergiNo ? `Vergi No: ${musteri.vergiNo}` : ''}
              </td>
              <td width="33%" class="info-box">
                <b style="color:#888;">CİHAZ BİLGİSİ</b><br><br>
                Ürün: ${cihaz.markaModel}<br>
                Seri / Barkod: ${cihaz.seriNo}
              </td>
            </tr>
          </table>

          <table>
            <thead>
              <tr style="background-color: #1a1a1a; color: white;">
                <th align="center" style="border: 1px solid #1a1a1a;">NO</th>
                <th style="border: 1px solid #1a1a1a;">HİZMET / ÜRÜN ADI</th>
                <th align="center" style="border: 1px solid #1a1a1a;">MİKTAR</th>
                <th align="center" style="border: 1px solid #1a1a1a;">BİRİM FİYAT</th>
                <th align="center" style="border: 1px solid #1a1a1a;">KDV</th>
                <th align="right" style="border: 1px solid #1a1a1a;">TOPLAM</th>
              </tr>
            </thead>
            <tbody>${kalemlerHTML}</tbody>
          </table>

          <table>
            <tr>
              <td width="50%" class="info-box">
                <b style="color:#888;">BANKA HESAP BİLGİLERİMİZ</b><br><br>
                <b>${firma.iban1Banka}:</b><br>${firma.iban1}<br><br>
                <b>${firma.iban2Banka}:</b><br>${firma.iban2}
              </td>
              <td width="50%">
                <table width="100%">
                  <tr><td align="right">ARA TOPLAM:</td><td align="right"><b>${formatPara(toplamlar?.araToplam)} ₺</b></td></tr>
                  <tr><td align="right">İSKONTO:</td><td align="right"><b>-${formatPara(toplamlar?.iskonto)} ₺</b></td></tr>
                  <tr><td align="right">KDV TOPLAMI:</td><td align="right"><b>${formatPara(toplamlar?.kdvToplam)} ₺</b></td></tr>
                  <tr class="grand-row"><td align="right">ÖDENECEK TUTAR:</td><td align="right"><b>${formatPara(toplamlar?.genelToplam)} ₺</b></td></tr>
                </table>
              </td>
            </tr>
          </table>

          <div style="text-align:center; font-size: 11px; color:#888; margin-top:30px;">
             ${notlar ? `<p style="color:#D32F2F; font-weight:bold;"><i>${notlar}</i></p>` : ''}
             Bizi tercih ettiğiniz için teşekkür ederiz.<br>Değişen parçalar 6 ay garantilidir.
          </div>

        </body>
      </html>
    `;

    // 🚨 Dosya ismindeki garip karakterleri (/, \, vs) temizledik ki kaydederken patlamasın
    const dosyaAdi = `Fatura_${belgeNo.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    
    // 🚨 Legacy üzerinden sorunsuz çekiyoruz
    const dosyaYolu = (FileSystem.documentDirectory || FileSystem.cacheDirectory || "") + dosyaAdi;

    await FileSystem.writeAsStringAsync(dosyaYolu, wordIcerik, {
      encoding: 'utf8' // 🚨 Manuel utf8 betonlandı
    });

    await Sharing.shareAsync(dosyaYolu, {
      dialogTitle: 'Word Olarak Paylaş',
      mimeType: 'application/msword', 
      UTI: 'com.microsoft.word.doc'
    });

  } catch (error) {
    Alert.alert("Hata", "Word belgesi oluşturulurken bir sorun çıktı.");
    console.error("Word Motoru Hatası:", error);
  }
};

// ---------------------------------------------------------
// 3. MAİL MOTORU 🚀 (PDF EKLENTİLİ)
// ---------------------------------------------------------
export const mailCiktiAl = async (gelenVeri: any = {}) => {
  const firma = gelenVeri.firma || {
    unvan: "KALANDAR YAZILIM", adres: "Ege Mah. 210 Sok. No: 12 İç Kapı No: 1 Altıeylül / Balıkesir",
    vergiDairesi: "Kurtdereli VD", vergiNo: "1234567890", telefon: "0555 123 45 67",
    iban1Banka: "Ziraat Bankası", iban1: "TR00 0000 0000 0000 0000 0000 00",
    iban2Banka: "Garanti BBVA", iban2: "TR99 9999 9999 9999 9999 9999 99"
  };
  const musteri = gelenVeri.musteri || { adi: "Bilinmiyor", adres: "-", telefon: "-", vergiNo: "" };
  const tarih = gelenVeri.tarih || new Date().toLocaleDateString('tr-TR');
  const cihaz = gelenVeri.cihaz || { markaModel: "Bilinmiyor", seriNo: "Barkodsuz" };
  const belgeNo = gelenVeri.belgeNo || `KY-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
  const kalemler: any[] = gelenVeri.kalemler || [];
  const toplamlar = gelenVeri.toplamlar || { araToplam: 0, iskonto: 0, kdvToplam: 0, genelToplam: 0 };
  const notlar = gelenVeri.notlar || ""; 

  try {
    // 1. Önce PDF faturayı aynı şablonla görünmez şekilde oluşturuyoruz
    const kalemlerHTML = kalemler.map((kalem: any, index: number) => `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${kalem.ad}</td>
        <td class="center">${kalem.miktar || 1}</td>
        <td class="center">${formatPara(kalem.fiyat)} ₺</td>
        <td class="center">%${kalem.kdv || 20}</td>
        <td class="right"><b>${formatPara(kalem.toplam)} ₺</b></td>
      </tr>
    `).join('');

    const htmlIcerik = `
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Roboto', 'Segoe UI', Arial, sans-serif; text-rendering: optimizeLegibility; margin: 0; padding: 40px; color: #1a1a1a; font-size: 13px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; border-bottom: 2px solid #D32F2F; padding-bottom: 20px;}
            .header-table td { vertical-align: bottom; }
            .brand-title { font-size: 38px; font-weight: 900; letter-spacing: -1px; margin: 0; color: #1a1a1a; }
            .brand-title span { color: #D32F2F; }
            .invoice-title { font-size: 22px; font-weight: 900; color: #D32F2F; text-align: right; letter-spacing: 1px;}
            .doc-info { text-align: right; font-size: 12px; color: #666; margin-top: 8px; font-weight: bold;}
            .doc-info span { color: #1a1a1a; margin-left: 5px;}
            .info-container { width: 100%; margin-bottom: 40px; border-collapse: collapse; }
            .info-container td { vertical-align: top; width: 31%; background-color: #f9f9f9; padding: 18px; border-radius: 10px; border-top: 4px solid #D32F2F; }
            .info-container td.spacer { width: 3.5%; background: transparent; border: none; padding: 0; }
            .box-title { font-size: 11px; font-weight: 900; color: #888; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;}
            .box-content { font-size: 13px; line-height: 1.6; color: #333; }
            .box-content strong { color: #1a1a1a; }
            .item-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .item-table th { background-color: #1a1a1a; color: white; padding: 14px 10px; font-size: 12px; text-align: left; font-weight: bold; }
            .item-table th.center { text-align: center; }
            .item-table th.right { text-align: right; }
            .item-table td { padding: 14px 10px; border-bottom: 1px solid #eaeaea; font-size: 13px; color: #333;}
            .item-table td.center { text-align: center; }
            .item-table td.right { text-align: right; }
            .totals-container { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .totals-table { width: 300px; border-collapse: collapse; margin-left: auto; }
            .totals-table td { padding: 8px 0; font-size: 14px; color: #555; text-align: right; }
            .totals-table td.val { width: 130px; font-weight: bold; color: #1a1a1a; }
            .grand-row td { border-top: 2px solid #D32F2F; padding-top: 15px; margin-top: 5px; font-size: 18px; font-weight: 900; color: #D32F2F; }
            .grand-row td.val { color: #D32F2F; }
            .bank-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #eee; }
            .bank-strip { width: 100%; background-color: #f9f9f9; padding: 15px; border-radius: 10px; border-left: 5px solid #1a1a1a; font-size: 11px; color: #333; }
            .bank-row { display: flex; justify-content: flex-start; align-items: center; margin-bottom: 5px; }
            .bank-row b { color: #1a1a1a; margin-right: 10px; width: 100px; display: inline-block; }
            .bank-row span { letter-spacing: 0.5px; }
            .footer { margin-top: 20px; text-align: center; font-size: 11px; color: #888; line-height: 1.5;}
            .notlar { font-size: 11px; color: #D32F2F; font-weight: bold; margin-bottom: 10px; font-style: italic; text-align: center; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 50%; padding-bottom: 15px;">
                <h1 class="brand-title"><span>${firma.unvan.split(' ')[0]}</span> ${firma.unvan.substring(firma.unvan.indexOf(' ') + 1)}</h1>
              </td>
              <td style="width: 50%; padding-bottom: 15px;">
                <div class="invoice-title">TEKNİK SERVİS VE SATIŞ BELGESİ</div>
                <div class="doc-info">BELGE NO: <span>${belgeNo}</span></div>
                <div class="doc-info">TARİH: <span>${tarih}</span></div>
              </td>
            </tr>
          </table>
          <table class="info-container">
            <tr>
              <td>
                <div class="box-title">FİRMA BİLGİLERİ</div>
                <div class="box-content">
                  <strong>Adres:</strong> ${firma.adres}<br><strong>Vergi:</strong> ${firma.vergiDairesi} / ${firma.vergiNo}<br><strong>Tel:</strong> ${firma.telefon}
                </div>
              </td>
              <td class="spacer"></td>
              <td>
                <div class="box-title">MÜŞTERİ BİLGİLERİ</div>
                <div class="box-content">
                  <strong>SAYIN:</strong> ${musteri.adi}<br><strong>Adres:</strong> ${musteri.adres || 'Belirtilmemiş'}<br><strong>GSM:</strong> ${musteri.telefon || '-'}<br>${musteri.vergiNo ? `<strong>Vergi No:</strong> ${musteri.vergiNo}` : ''}
                </div>
              </td>
              <td class="spacer"></td>
              <td>
                <div class="box-title">CİHAZ BİLGİSİ</div>
                <div class="box-content">
                  <strong>Ürün:</strong> ${cihaz.markaModel}<br><strong>Seri / Barkod:</strong> ${cihaz.seriNo}
                </div>
              </td>
            </tr>
          </table>
          <table class="item-table">
            <thead>
              <tr><th width="5%" class="center">NO</th><th width="40%">HİZMET / ÜRÜN ADI</th><th width="10%" class="center">MİKTAR</th><th width="15%" class="center">BİRİM FİYAT</th><th width="10%" class="center">KDV</th><th width="20%" class="right">TOPLAM</th></tr>
            </thead>
            <tbody>${kalemlerHTML}</tbody>
          </table>
          <table class="totals-container">
            <tr>
              <td>
                <table class="totals-table">
                  <tr><td>ARA TOPLAM:</td><td class="val">${formatPara(toplamlar?.araToplam)} ₺</td></tr>
                  <tr><td>İSKONTO:</td><td class="val">-${formatPara(toplamlar?.iskonto)} ₺</td></tr>
                  <tr><td>KDV TOPLAMI:</td><td class="val">${formatPara(toplamlar?.kdvToplam)} ₺</td></tr>
                  <tr class="grand-row"><td>ÖDENECEK TUTAR:</td><td class="val">${formatPara(toplamlar?.genelToplam)} ₺</td></tr>
                </table>
              </td>
            </tr>
          </table>
          <div class="bank-footer">
            ${notlar ? `<div class="notlar">${notlar}</div>` : ''}
            <div class="bank-strip">
              <div style="font-weight: 900; font-size: 10px; color: #888; margin-bottom: 10px; text-transform: uppercase;">Banka Hesap Bilgilerimiz</div>
              <div class="bank-row"><b>${firma.iban1Banka}:</b> <span>${firma.iban1}</span></div>
              <div class="bank-row"><b>${firma.iban2Banka}:</b> <span>${firma.iban2}</span></div>
            </div>
            <div class="footer">Bizi tercih ettiğiniz için teşekkür ederiz. Değişen parçalar 6 ay garantilidir.</div>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlIcerik });

    // 2. Cihazda Mail uygulaması açık mı, ayarlı mı diye soruyoruz
    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (!isAvailable) {
      Alert.alert("Hata", "Cihazınızda e-posta göndermek için kurulu bir uygulama (Gmail, Outlook vb.) bulunamadı.");
      return;
    }

    // 3. Postayı hazırlayıp önüne sunuyoruz
    await MailComposer.composeAsync({
      subject: `Teknik Servis Belgesi / Fatura - ${belgeNo}`,
      body: `Sayın ${musteri.adi},\n\nServisimizde işlem gören ${cihaz.markaModel} cihazınız ile ilgili teknik servis formunuz / faturanız ektedir.\n\nBizi tercih ettiğiniz için teşekkür ederiz.\n\nİyi günler dileriz.\n\n${firma.unvan}`,
      attachments: [uri], // 🚨 AZ ÖNCE ARKA PLANDA OLUŞAN PDF FATURA BURAYA ZIMBALANIYOR
    });

  } catch (error) {
    Alert.alert("Hata", "Mail ekranı açılırken bir sorun çıktı.");
    console.error(error);
  }
};