import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const pdfCiktiAl = async (gelenVeri: any = {}) => {
  const firma = gelenVeri.firma || {
    unvan: "KALANDAR YAZILIM",
    adres: "Ege Mah. 210 Sok. No: 12 İç Kapı No: 1 Altıeylül / Balıkesir",
    vergiDairesi: "Kurtdereli VD",
    vergiNo: "1234567890",
    telefon: "0555 123 45 67",
    iban1Banka: "Ziraat Bankası",
    iban1: "TR00 0000 0000 0000 0000 0000 00",
    iban2Banka: "Garanti BBVA",
    iban2: "TR99 9999 9999 9999 9999 9999 99"
  };
  const musteri = gelenVeri.musteri || { adi: "Bilinmiyor", adres: "-", telefon: "-" };
  const cihaz = gelenVeri.cihaz || { markaModel: "Bilinmiyor", seriNo: "Barkodsuz" };
  const belgeNo = gelenVeri.belgeNo || `KY-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
  const kalemler: any[] = gelenVeri.kalemler || [];
  const toplamlar = gelenVeri.toplamlar || { araToplam: 0, iskonto: 0, kdvToplam: 0, genelToplam: 0 };

  try {
    const kalemlerHTML = kalemler.map((kalem: any, index: number) => `
      <tr>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; font-size: 14px;">${index + 1}</td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; font-size: 14px;">${kalem.ad}</td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; font-size: 14px;">${kalem.miktar || 1}</td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; font-size: 14px;">${parseFloat(kalem.fiyat || 0).toFixed(2)} ₺</td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; font-size: 14px;">%${kalem.kdv || 20}</td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd; font-size: 14px;"><b>${parseFloat(kalem.toplam || 0).toFixed(2)} ₺</b></td>
      </tr>
    `).join('');

    const htmlIcerik = `
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 20px; color: #1a1a1a; }
            .top-bar { background-color: #D32F2F; color: white; padding: 10px; font-weight: bold; font-size: 20px; text-align: center; border-radius: 8px 8px 0 0; text-transform: uppercase; letter-spacing: 2px;}
            .company-name { font-size: 32px; font-weight: 900; color: #1a1a1a; letter-spacing: -1px; margin: 0;}
            .company-name span { color: #D32F2F; }
            .doc-box { background-color: #1a1a1a; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 12px; display: inline-block; margin-left: 5px;}
            
            .info-box { border: 2px solid #1a1a1a; border-radius: 12px; overflow: hidden; height: 100%; }
            .info-title { background-color: #f4f4f4; text-align: center; padding: 6px; font-weight: bold; border-bottom: 2px solid #1a1a1a; font-size: 11px;}
            .info-content { padding: 10px; font-size: 12px; line-height: 1.5; }
            
            .item-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #1a1a1a; border-radius: 12px; overflow: hidden; }
            .item-table th { background-color: #D32F2F; color: white; padding: 10px; font-size: 13px; border-bottom: 2px solid #1a1a1a; border-right: 1px solid #fff;}
            .item-table th:last-child { border-right: none; }
            
            .bank-box { border: 2px solid #1a1a1a; border-radius: 12px; overflow: hidden; height: 100%;}
            .bank-title { background-color: #1a1a1a; color: white; text-align: center; padding: 6px; font-weight: bold; font-size: 12px;}
            .bank-content { padding: 10px; font-size: 12px; line-height: 1.6; }
            
            .totals-box { background-color: #D32F2F; border-radius: 12px; color: white; padding: 15px; height: 100%; box-sizing: border-box;}
            .total-row { padding-bottom: 8px; font-size: 14px; font-weight: bold; width: 100%; clear: both;}
            .total-row span:first-child { float: left; }
            .total-row span:last-child { float: right; }
            .total-row.grand { border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; font-size: 20px; margin-bottom: 0; margin-top: 10px;}
            
            .footer { margin-top: 30px; text-align: center; font-size: 12px; font-weight: bold; color: #555; }
          </style>
        </head>
        <body>
          <div class="top-bar">Teknik Servis ve Satış Belgesi</div>

          <table style="width: 100%; margin-top: 15px; margin-bottom: 15px; border: none;">
            <tr>
              <td style="width: 50%; text-align: left; border: none;">
                <div class="company-name"><span>${firma.unvan.split(' ')[0]}</span> ${firma.unvan.substring(firma.unvan.indexOf(' ') + 1)}</div>
              </td>
              <td style="width: 50%; text-align: right; border: none;">
                <div class="doc-box">BELGE NO: ${belgeNo}</div>
                <div class="doc-box">TARİH: ${new Date().toLocaleDateString('tr-TR')}</div>
              </td>
            </tr>
          </table>

          <table style="width: 100%; margin-bottom: 20px; border: none;">
            <tr>
              <td style="width: 32%; vertical-align: top; padding: 0; border: none;">
                <div class="info-box">
                  <div class="info-title">FİRMA BİLGİLERİMİZ</div>
                  <div class="info-content">
                    <strong>Adres:</strong> ${firma.adres}<br>
                    <strong>Vergi:</strong> ${firma.vergiDairesi} / ${firma.vergiNo}<br>
                    <strong>Tel:</strong> ${firma.telefon}
                  </div>
                </div>
              </td>
              <td style="width: 2%; border: none;"></td>
              <td style="width: 32%; vertical-align: top; padding: 0; border: none;">
                <div class="info-box">
                  <div class="info-title">MÜŞTERİ BİLGİLERİ</div>
                  <div class="info-content">
                    <strong>SAYIN:</strong> ${musteri.adi}<br>
                    <strong>Adres:</strong> ${musteri.adres || 'Belirtilmemiş'}<br>
                    <strong>GSM:</strong> ${musteri.telefon || '-'}
                  </div>
                </div>
              </td>
              <td style="width: 2%; border: none;"></td>
              <td style="width: 32%; vertical-align: top; padding: 0; border: none;">
                <div class="info-box">
                  <div class="info-title">ÜRÜN / CİHAZ BİLGİSİ</div>
                  <div class="info-content">
                    <strong>Ürün:</strong> ${cihaz.markaModel}<br>
                    <strong>Seri / Barkod No:</strong> ${cihaz.seriNo}
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <table class="item-table">
            <thead>
              <tr>
                <th width="5%">NO</th>
                <th width="40%">HİZMET / ÜRÜN ADI</th>
                <th width="10%">MİKTAR</th>
                <th width="15%">BİRİM FİYAT</th>
                <th width="10%">KDV</th>
                <th width="20%">TOPLAM</th>
              </tr>
            </thead>
            <tbody>${kalemlerHTML}</tbody>
          </table>

          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 55%; vertical-align: top; padding: 0; border: none;">
                <div class="bank-box">
                  <div class="bank-title">BANKA HESAP BİLGİLERİMİZ</div>
                  <div class="bank-content">
                    <strong>${firma.iban1Banka}:</strong> ${firma.iban1}<br>
                    <strong>${firma.iban2Banka}:</strong> ${firma.iban2}
                  </div>
                </div>
              </td>
              <td style="width: 5%; border: none;"></td>
              <td style="width: 40%; vertical-align: top; padding: 0; border: none;">
                <div class="totals-box">
                  <div class="total-row"><span>ARA TOPLAM:</span> <span>${parseFloat(toplamlar?.araToplam || 0).toFixed(2)} ₺</span></div><div style="clear: both;"></div>
                  <div class="total-row"><span>İSKONTO:</span> <span>-${parseFloat(toplamlar?.iskonto || 0).toFixed(2)} ₺</span></div><div style="clear: both;"></div>
                  <div class="total-row"><span>KDV TOPLAMI:</span> <span>${parseFloat(toplamlar?.kdvToplam || 0).toFixed(2)} ₺</span></div><div style="clear: both;"></div>
                  <div class="total-row grand"><span>ÖDENECEK:</span> <span>${parseFloat(toplamlar?.genelToplam || 0).toFixed(2)} ₺</span></div><div style="clear: both;"></div>
                </div>
              </td>
            </tr>
          </table>

          <div class="footer">Bizi tercih ettiğiniz için teşekkür ederiz.<br>Değişen parçalar 6 ay garantilidir.</div>
        </body>
      </html>
    `;

    // Sadece PDF üretir ve telefonun paylaşım ekranını açar
    const { uri } = await Print.printToFileAsync({ html: htmlIcerik });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Faturayı Görüntüle' });

  } catch (error) {
    Alert.alert("Hata", "PDF oluşturulurken bir sorun çıktı.");
    console.error(error);
  }
};