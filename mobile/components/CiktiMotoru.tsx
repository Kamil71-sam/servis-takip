import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

// 🚨 MÜDÜRÜN DİNAMİK MOTORU: Kalandar Yazılım Ayarları ve "Göster/Paylaş" Şalteri
export const pdfCiktiAl = async ({
  islem = "paylas", // YENİ: Motorun ne yapacağını belirten şalter
  firma = {
    unvan: "KALANDAR YAZILIM",
    adres: "Ege Mah. 210 Sok. No: 12 İç Kapı No: 1 Altıeylül / Balıkesir",
    vergiDairesi: "Kurtdereli VD",
    vergiNo: "1234567890",
    telefon: "0555 123 45 67",
    iban1Banka: "Ziraat Bankası",
    iban1: "TR00 0000 0000 0000 0000 0000 00",
    iban2Banka: "Garanti BBVA",
    iban2: "TR99 9999 9999 9999 9999 9999 99"
  },
  musteri = {
    adi: "Kemal Müdür",
    adres: "Bursa / Merkez",
    telefon: "0500 000 0000"
  },
  belgeNo = `KY-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
  kalemler = [
    { ad: "Anakart Entegre Değişimi", miktar: 1, fiyat: 15000, kdv: 20, toplam: 18000 },
    { ad: "Genel Bakım ve Temizlik", miktar: 1, fiyat: 1000, kdv: 20, toplam: 1200 }
  ],
  toplamlar = {
    araToplam: 16000,
    iskonto: 0,
    kdvToplam: 3200,
    genelToplam: 19200
  }
} = {}) => {

  try {
    const kalemlerHTML = kalemler.map((kalem, index) => `
      <tr>
        <td>${index + 1}</td>
        <td style="text-align: left;">${kalem.ad}</td>
        <td>${kalem.miktar}</td>
        <td>${kalem.fiyat.toFixed(2)} ₺</td>
        <td>%${kalem.kdv}</td>
        <td><b>${kalem.toplam.toFixed(2)} ₺</b></td>
      </tr>
    `).join('');

    const htmlIcerik = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 40px; color: #1a1a1a; }
            .top-bar { background-color: #D32F2F; color: white; padding: 10px 20px; font-weight: bold; font-size: 22px; text-align: center; border-radius: 8px 8px 0 0; text-transform: uppercase; letter-spacing: 2px;}
            .header-area { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; margin-bottom: 20px;}
            .company-name { font-size: 36px; font-weight: 900; color: #1a1a1a; letter-spacing: -1px;}
            .company-name span { color: #D32F2F; }
            .doc-info { display: flex; gap: 10px; }
            .doc-box { background-color: #1a1a1a; color: white; padding: 8px 15px; border-radius: 6px; font-weight: bold; font-size: 14px;}
            .info-container { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-box { width: 48%; border: 2px solid #1a1a1a; border-radius: 12px; overflow: hidden; }
            .info-title { background-color: #f4f4f4; text-align: center; padding: 8px; font-weight: bold; border-bottom: 2px solid #1a1a1a; }
            .info-content { padding: 15px; font-size: 14px; line-height: 1.6; }
            .info-content strong { color: #D32F2F; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #1a1a1a; border-radius: 12px; overflow: hidden; }
            th { background-color: #D32F2F; color: white; padding: 12px; font-size: 14px; border-bottom: 2px solid #1a1a1a; border-right: 1px solid #fff;}
            th:last-child { border-right: none; }
            td { padding: 12px; text-align: center; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; font-size: 14px; }
            td:last-child { border-right: none; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .bottom-container { display: flex; justify-content: space-between; align-items: flex-start; }
            .bank-box { width: 55%; border: 2px solid #1a1a1a; border-radius: 12px; overflow: hidden; }
            .bank-title { background-color: #1a1a1a; color: white; text-align: center; padding: 8px; font-weight: bold; }
            .bank-content { padding: 15px; font-size: 13px; line-height: 1.8; }
            .totals-box { width: 40%; background-color: #D32F2F; border-radius: 12px; color: white; padding: 15px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; font-weight: bold; }
            .total-row.grand { border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; font-size: 24px; margin-bottom: 0; }
            .footer { margin-top: 40px; text-align: center; font-size: 13px; font-weight: bold; color: #555; }
          </style>
        </head>
        <body>
          
          <div class="top-bar">Teknik Servis ve Satış Belgesi</div>

          <div class="header-area">
            <div class="company-name"><span>${firma.unvan.split(' ')[0]}</span> ${firma.unvan.substring(firma.unvan.indexOf(' ') + 1)}</div>
            <div class="doc-info">
              <div class="doc-box">BELGE NO: ${belgeNo}</div>
              <div class="doc-box">TARİH: ${new Date().toLocaleDateString('tr-TR')}</div>
            </div>
          </div>

          <div class="info-container">
            <div class="info-box">
              <div class="info-title">FİRMA BİLGİLERİMİZ</div>
              <div class="info-content">
                <strong>Adres:</strong> ${firma.adres}<br>
                <strong>Vergi Dairesi:</strong> ${firma.vergiDairesi} / ${firma.vergiNo}<br>
                <strong>İletişim:</strong> ${firma.telefon}
              </div>
            </div>
            
            <div class="info-box">
              <div class="info-title">MÜŞTERİ BİLGİLERİ</div>
              <div class="info-content">
                <strong>SAYIN:</strong> ${musteri.adi}<br>
                <strong>Adres:</strong> ${musteri.adres}<br>
                <strong>GSM:</strong> ${musteri.telefon}
              </div>
            </div>
          </div>

          <table>
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
            <tbody>
              ${kalemlerHTML}
            </tbody>
          </table>

          <div class="bottom-container">
            <div class="bank-box">
              <div class="bank-title">BANKA HESAP BİLGİLERİMİZ</div>
              <div class="bank-content">
                <strong>${firma.iban1Banka}:</strong> ${firma.iban1}<br>
                <strong>${firma.iban2Banka}:</strong> ${firma.iban2}
              </div>
            </div>

            <div class="totals-box">
              <div class="total-row"><span>ARA TOPLAM:</span> <span>${toplamlar.araToplam.toFixed(2)} ₺</span></div>
              <div class="total-row"><span>İSKONTO:</span> <span>-${toplamlar.iskonto.toFixed(2)} ₺</span></div>
              <div class="total-row"><span>KDV TOPLAMI:</span> <span>${toplamlar.kdvToplam.toFixed(2)} ₺</span></div>
              <div class="total-row grand"><span>ÖDENECEK:</span> <span>${toplamlar.genelToplam.toFixed(2)} ₺</span></div>
            </div>
          </div>

          <div class="footer">
            Bizi tercih ettiğiniz için teşekkür ederiz.<br>
            Değişen parçalar 6 ay garantilidir.
          </div>

        </body>
      </html>
    `;

    // 🚨 ŞALTER BURADA DEVREYE GİRİYOR
    if (islem === "goster") {
      // Sadece Ekranda A4 Olarak Gösterir
      await Print.printAsync({ html: htmlIcerik });
    } else {
      // PDF Dosyası Oluşturur ve Paylaşım Seçeneklerini Açar
      const { uri } = await Print.printToFileAsync({ html: htmlIcerik });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }

  } catch (error) {
    Alert.alert("Hata", "PDF oluşturulurken bir sorun çıktı.");
    console.error(error);
  }
};