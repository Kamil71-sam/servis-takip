import { useEffect, useState } from 'react';
import logo from './assets/logo.png';
import api from './api'; 

// 🚀 SAYFA İTHALATLARI
import BireyselMusteriKaydi from './pages/BireyselMusteriKaydi';
import FirmaKaydi from './pages/FirmaKaydi';
import MusteriListesi from './pages/MusteriListesi';
import YeniServisKaydi from './pages/YeniServisKaydi'; 
import ServisKayitlari from './pages/ServisKayitlari'; 
import TamamlananIsler from './pages/TamamlananIsler';
import YeniRandevu from './pages/YeniRandevu'; 
import RandevuTakvimi from './pages/RandevuTakvimi'; 
import TamamlananRandevular from './pages/TamamlananRandevular';
import StokDurumu from './pages/StokDurumu';
import MalzemeGirisi from './pages/MalzemeGirisi';
import YedekParcaTakibi from './pages/YedekParcaTakibi';



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

export default function Dashboard({ onLogout }: any) {
  const [acikMenu, setAcikMenu] = useState(''); 
  const [aktifSayfa, setAktifSayfa] = useState('Dashboard');

  const [dashboardData, setDashboardData] = useState({
    toplam_is: 0,
    aktif_randevu: 0,
    aktif_servis: 0,
    tamamlanan_is: 0,
    gunluk_ciro: 0,
    yarin_aranacak_randevu: 0,
    son_islemler: [] as any[],
    son_randevular: [] as any[]
  });
  
  const [loading, setLoading] = useState(true);
  
  // 🚨 MÜDÜRÜN GERÇEK RADARI: Sunucu durumunu tutar
  const [isOnline, setIsOnline] = useState(true);

  // 15 Saniyede bir sunucunun nabzını ölçen motor
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.get('/services/all'); 
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false); // Fiş çekilirse anında yakalar!
      }
    };
    
    checkConnection(); // İlk girişte bir kere yokla
    const interval = setInterval(checkConnection, 15000); 
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    if (aktifSayfa !== 'Dashboard') return;
    setLoading(true);
    try {
      
      const resActive = await api.get('/services/all').catch(() => null);
      const resRandevu = await api.get('/api/appointments/liste/aktif').catch(() => null);
      const resArchive = await api.get('/services/tamamlanan').catch(() => null);

      if (resActive || resRandevu || resArchive) setIsOnline(true);

      let servisListesi = Array.isArray(resActive?.data) ? resActive.data : [];
      let randevuListesi = [];
      
      if (resRandevu?.data) {
        const hamListe = Array.isArray(resRandevu.data.data) ? resRandevu.data.data : (Array.isArray(resRandevu.data) ? resRandevu.data : []);
        
        randevuListesi = hamListe.filter((r: any) => {
           const durum = (getVal(r, ['durum', 'status']) || 'Beklemede').toLowerCase();
           return durum === 'beklemede' || durum === 'mali onay bekliyor';
        });
      }

      let toplamCiro = 0;
      let tamamlananSayisi = 0;
      if (resArchive && resArchive.data) {
        tamamlananSayisi = resArchive.data.length;
        const bugun = new Date().toLocaleDateString('tr-TR');
        resArchive.data.forEach((is: any) => {
           const isBitisTarihi = is.updated_at ? new Date(is.updated_at).toLocaleDateString('tr-TR') : '';
           if (isBitisTarihi === bugun && is.offer_price) {
             toplamCiro += parseFloat(is.offer_price);
           }
        });
      }

      const bugunTarih = new Date();
      bugunTarih.setHours(0, 0, 0, 0);
      let yarinSayisi = 0;
      randevuListesi.forEach((r: any) => {
        const trh = getVal(r, ['randevu tarihi', 'appointment_date', 'tarih']);
        if (trh) {
           const d = new Date(trh);
           d.setHours(0,0,0,0);
           const farkGun = Math.ceil((d.getTime() - bugunTarih.getTime()) / (1000 * 60 * 60 * 24));
           if (farkGun === 1) yarinSayisi++;
        }
      });

      setDashboardData({
        toplam_is: servisListesi.length + tamamlananSayisi,
        aktif_randevu: randevuListesi.length, 
        aktif_servis: servisListesi.length,
        tamamlanan_is: tamamlananSayisi,
        gunluk_ciro: toplamCiro,
        yarin_aranacak_randevu: yarinSayisi, 
        son_islemler: servisListesi.slice(0, 4),
        son_randevular: randevuListesi.slice(0, 4) 
      });

    } catch (error) {
      console.error("Dashboard verileri çekilemedi:", error);
      setIsOnline(false); // Hata verirse kırmızıya dön
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [aktifSayfa]);

  const menuGecis = (menuAdi: string) => {
    setAcikMenu(acikMenu === menuAdi ? '' : menuAdi);
  };

  const toplamAktif = dashboardData.aktif_servis + dashboardData.aktif_randevu;
  const randevuYuzde = toplamAktif > 0 ? Math.round((dashboardData.aktif_randevu / toplamAktif) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0F0F12] overflow-x-auto selection:bg-[#8E052C] selection:text-white text-white font-sans">
      <div className="w-full min-w-[1100px] min-h-screen flex transition-all duration-500">
        
        {/* ---------------- SOL MENÜ (Sidebar) ---------------- */}
        <div className="w-[280px] border-r border-white/5 bg-black/40 backdrop-blur-md p-6 flex flex-col shrink-0 relative overflow-hidden">
          <div className="absolute top-[-5%] left-[-10%] w-40 h-40 bg-[#8E052C]/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <img src={logo} alt="Kalandar Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(142,5,44,0.6)]" />
            <h2 className="text-2xl font-black tracking-tighter uppercase">KALANDAR</h2>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide relative z-10 pb-4">
            <button 
              onClick={() => setAktifSayfa('Dashboard')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-black transition-all duration-300 text-left uppercase tracking-widest ${
                aktifSayfa === 'Dashboard' 
                ? 'bg-[#8E052C]/20 border-l-4 border-[#8E052C] text-[#8E052C] shadow-[0_0_15px_rgba(142,5,44,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <span className="text-lg">🏠</span> Ana Sayfa
            </button>

            {[
              { isim: 'Müşteri İşlemleri', ikon: '👥', altMenuler: ['Bireysel Müşteri Kaydı', 'Firma Kaydı', 'Müşteri Listesi'] },
              { isim: 'Servis İşlemleri', ikon: '🛠️', altMenuler: ['Yeni Servis Kaydı', 'Servis Kayıtları', 'Tamamlanan İşler'] },
              { isim: 'Randevu İşlemleri', ikon: '📅', altMenuler: ['Yeni Randevu', 'Randevu Kayıtları', 'Tamamlanan Randevular'] }, 
              { isim: 'Envanter İşlemleri', ikon: '📦', altMenuler: ['Stok Durumu', 'Malzeme Girişi', 'Yedek Parça Takibi'] },
              { isim: 'Mali İşlemler', ikon: '💳', altMenuler: ['Faturalar', 'Tahsilatlar', 'Cari Hesaplar'] },
              { isim: 'Çıktı İşlemleri', ikon: '🖨️', altMenuler: ['Servis Fişi Yazdır', 'Barkod Oluştur'] },
            ].map((menu) => (
              
                            
              <div key={menu.isim} className="flex flex-col">
                <button 
                  onClick={() => menuGecis(menu.isim)}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 group border ${acikMenu === menu.isim ? 'bg-[#8E052C]/10 border-[#8E052C]/30 shadow-[0_0_15px_rgba(142,5,44,0.1)]' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg transition-transform duration-300 ${acikMenu === menu.isim ? 'scale-110' : 'group-hover:scale-110'}`}>{menu.ikon}</span>
                    
                    
                    <span className={`font-black uppercase tracking-wide text-[11px] whitespace-nowrap transition-colors ${
                        acikMenu === menu.isim ? 'text-[#8E052C]' : 'text-gray-400 group-hover:text-white'
                      }`}>
                        {menu.isim}
                      </span>


                  

                  </div>
                  <span className={`text-xs text-gray-500 transition-transform duration-300 ${acikMenu === menu.isim ? 'rotate-180 text-[#8E052C]' : ''}`}>▼</span>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${acikMenu === menu.isim ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-1 pl-11 pr-2 border-l-2 border-[#8E052C]/20 ml-5">
                    {menu.altMenuler.map((altItem, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          if(altItem === 'Bireysel Müşteri Kaydı') setAktifSayfa('BireyselMusteriKaydi');
                          if(altItem === 'Firma Kaydı') setAktifSayfa('FirmaKaydi');
                          if(altItem === 'Müşteri Listesi') setAktifSayfa('MusteriListesi');
                          if(altItem === 'Yeni Servis Kaydı') setAktifSayfa('YeniServisKaydi'); 
                          if(altItem === 'Servis Kayıtları') setAktifSayfa('ServisKayitlari'); 
                          if(altItem === 'Tamamlanan İşler') setAktifSayfa('TamamlananIsler');
                          if(altItem === 'Yeni Randevu') setAktifSayfa('YeniRandevu');
                          if(altItem === 'Randevu Takvimi') setAktifSayfa('RandevuTakvimi'); 
                          if(altItem === 'Randevu Kayıtları') setAktifSayfa('RandevuTakvimi');
                          if(altItem === 'Tamamlanan Randevular') setAktifSayfa('TamamlananRandevular');
                          if(altItem === 'Stok Durumu') setAktifSayfa('StokDurumu'); 
                          if(altItem === 'Malzeme Girişi') setAktifSayfa('MalzemeGirisi');
                          if(altItem === 'Yedek Parça Takibi') setAktifSayfa('YedekParcaTakibi');
                        }}
                        className={`text-left py-2 px-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 group ${
                          (aktifSayfa === 'BireyselMusteriKaydi' && altItem === 'Bireysel Müşteri Kaydı') || 
                          (aktifSayfa === 'FirmaKaydi' && altItem === 'Firma Kaydı') ||
                          (aktifSayfa === 'MusteriListesi' && altItem === 'Müşteri Listesi') ||
                          (aktifSayfa === 'YeniServisKaydi' && altItem === 'Yeni Servis Kaydı') ||
                          (aktifSayfa === 'ServisKayitlari' && altItem === 'Servis Kayıtları') ||
                          (aktifSayfa === 'TamamlananIsler' && altItem === 'Tamamlanan İşler') ||
                          (aktifSayfa === 'YeniRandevu' && altItem === 'Yeni Randevu') ||
                          (aktifSayfa === 'RandevuTakvimi' && altItem === 'Randevu Takvimi')  ||  
                          (aktifSayfa === 'TamamlananRandevular' && altItem === 'Tamamlanan Randevular') ||
                          (aktifSayfa === 'StokDurumu' && altItem === 'Stok Durumu') 
                          || (aktifSayfa === 'MalzemeGirisi' && altItem === 'Malzeme Girişi')
                          || (aktifSayfa === 'YedekParcaTakibi' && altItem === 'Yedek Parça Takibi')
                          ? 'text-white bg-[#8E052C]/20 border border-[#8E052C]/30'
                          : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          (aktifSayfa === altItem.replace(/ /g, '')) ? 'bg-[#8E052C]' : 'bg-gray-700 group-hover:bg-[#8E052C]'
                        }`}></div>
                        {altItem}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-white/5 pt-6 flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8E052C] to-black rounded-full flex items-center justify-center font-black ring-2 ring-[#8E052C]/30 shadow-[0_0_10px_rgba(142,5,44,0.4)] text-white">K</div>
            <div className="truncate">
              <div className="text-sm font-black text-white uppercase tracking-widest truncate">Kemal Müdür</div>
              <div className="text-[10px] text-[#8E052C] uppercase font-black tracking-widest mt-0.5">Patron</div>
            </div>
          </div>
        </div>

        {/* ---------------- ORTA BÖLÜM: DİNAMİK ALAN ---------------- */}
        <div className="flex-1 p-8 flex flex-col gap-6 relative min-w-0">
          
          <div className="flex justify-between items-center z-10 border-b border-white/5 pb-4 mb-2">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
                {aktifSayfa === 'Dashboard' ? <><span className="text-[#8E052C]">🚀</span> Kontrol Merkezi</> : 
                 aktifSayfa === 'MusteriListesi' ? <><span className="text-sky-500">👥</span> Müşteri Rehberi</> : 
                 aktifSayfa === 'YeniServisKaydi' ? <><span className="text-orange-500">📝</span> Servis Girişi</> :
                 aktifSayfa === 'ServisKayitlari' ? <><span className="text-[#8E052C]">🛠️</span> Aktif Kayıtlar</> : 
                 aktifSayfa === 'TamamlananIsler' ? <><span className="text-green-500">✅</span> Tamamlanan İşler</> : 
                 aktifSayfa === 'YeniRandevu' ? <><span className="text-purple-500">📅</span> Yeni Randevu</> : 
                 aktifSayfa === 'StokDurumu' ? <><span className="text-yellow-500">📦</span> Stok Durumu</> : 'Yedek Parça İşlemleri'}
              </h1>
              <p className="text-gray-500 text-xs mt-1.5 font-black uppercase tracking-widest">
                {aktifSayfa === 'Dashboard' ? 'Sistem Canlı ve Devrede' : 
                 aktifSayfa === 'MusteriListesi' ? 'Tüm cari kayıtlar burada listeleniyor.' : 
                 aktifSayfa === 'YeniServisKaydi' ? 'Yeni Atölye Form Alanı' :
                 aktifSayfa === 'ServisKayitlari' ? 'Bekleyen ve işlemdeki cihazlar.' : 
                 aktifSayfa === 'TamamlananIsler' ? 'Teslim ve iptal edilen işlerin arşivi.' : 
                 aktifSayfa === 'YeniRandevu' ? 'Saha randevu kayıt formu.' : 
                 aktifSayfa === 'StokDurumu' ? 'Depodaki malzeme ve güncel stok durumu.' : 'Kayıt Takip Listesi'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={onLogout} className="bg-[#8E052C]/10 hover:bg-[#8E052C] text-[#8E052C] hover:text-white border border-[#8E052C]/50 px-5 py-2.5 rounded-xl text-xs uppercase font-black tracking-widest transition-all shadow-[0_0_15px_rgba(142,5,44,0.2)]">
                Çıkış Yap
              </button>
            </div>
          </div>

          {/* DİNAMİK EKRAN MOTORU */}
          {aktifSayfa === 'Dashboard' ? (
            loading ? (
              <div className="flex items-center justify-center flex-1 text-gray-500 font-black uppercase tracking-widest text-sm">Vitrin Hazırlanıyor...</div>
            ) : (
              <>
                {/* DASHBOARD KARTLARI */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-black/50 border border-white/5 p-6 rounded-[2rem] group hover:border-[#8E052C]/50 transition-all cursor-default shadow-lg">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="text-lg">📊</span> Toplam İş
                    </div>
                    <div className="text-4xl font-black group-hover:text-[#8E052C] transition-colors text-white">{dashboardData.toplam_is}</div>
                  </div>
                  
                  <div className="bg-[#8E052C]/10 border border-[#8E052C]/30 p-6 rounded-[2rem] shadow-[0_0_20px_rgba(142,5,44,0.1)] cursor-default relative overflow-hidden group">
                    <div className="absolute right-[-10px] bottom-[-10px] text-6xl opacity-10 group-hover:scale-110 transition-transform">📅</div>
                    <div className="text-[#8E052C] text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      Yarınki Randevular
                    </div>
                    <div className="text-4xl font-black text-white">{dashboardData.yarin_aranacak_randevu}</div>
                  </div>

                  <div className="bg-black/50 border border-white/5 p-6 rounded-[2rem] cursor-default hover:border-green-500/30 transition-all group shadow-lg">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="text-lg grayscale group-hover:grayscale-0 transition-all">✅</span> Tamamlanan
                    </div>
                    <div className="text-4xl font-black text-green-500">{dashboardData.tamamlanan_is}</div>
                  </div>

                  <div className="bg-black/50 border border-white/5 p-6 rounded-[2rem] cursor-default hover:border-yellow-500/30 transition-all group shadow-lg">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="text-lg grayscale group-hover:grayscale-0 transition-all">💰</span> Günlük Kasa (Ciro)
                    </div>
                    <div className="text-3xl font-black text-yellow-500">
                      {dashboardData.gunluk_ciro.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                    </div>
                  </div>
                </div>

                {/* GRAFİKLER VE LİSTELER */}
                <div className="grid grid-cols-5 gap-6 flex-1 min-h-[350px]">
                  




                  {/* SİMİT GRAFİĞİ */}
                  <div className="col-span-2 bg-black/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 left-0 w-40 h-40 bg-[#8E052C]/10 blur-3xl rounded-full pointer-events-none"></div>
                     <div className="flex justify-between items-center mb-6 shrink-0 z-10">
                        <h3 className="font-black text-xl text-white uppercase tracking-tighter">İş Yükü Dağılımı</h3>
                     </div>
                     <div className="flex-1 flex items-center justify-center z-10">
                        <div 
                          className="w-56 h-56 rounded-full relative flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                          style={{ background: `conic-gradient(#8E052C 0% ${randevuYuzde}%, #27272A ${randevuYuzde}% 100%)` }}
                        >
                           <div className="absolute inset-[60px] bg-[#0F0F12] rounded-full border border-white/5 flex flex-col items-center justify-center shadow-inner">
                              <div className="text-5xl font-black text-white">{toplamAktif}</div>
                              <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Aktif İşlem</div>
                              <div className="flex gap-3 mt-4">
                                 <div className="flex items-center gap-1.5">
                                   <div className="w-2.5 h-2.5 rounded-full bg-[#8E052C] shadow-[0_0_8px_#8E052C]"></div>
                                   <span className="text-[9px] text-gray-300 font-bold uppercase">{dashboardData.aktif_randevu} Randevu</span>
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                   <div className="w-2.5 h-2.5 rounded-full bg-[#27272A] border border-gray-600"></div>
                                   <span className="text-[9px] text-gray-300 font-bold uppercase">{dashboardData.aktif_servis} Servis</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* SON İŞLEMLER */}
                  <div className="col-span-3 bg-[#1A1A1E] border border-white/5 p-6 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
                    <h3 className="font-black text-lg mb-6 text-white uppercase tracking-tighter flex items-center justify-center gap-2 border-b border-white/5 pb-4">
                      <span>⚡</span> Son Kayıtlar
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
                      {/* SOL: SERVİS KAYITLARI */}
                      <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide border-r border-white/5">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 sticky top-0 bg-[#1A1A1E] z-10">Servis Kayıtları</h4>
                        {dashboardData.son_islemler.length > 0 ? (
                          dashboardData.son_islemler.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-black/40 border border-white/5 p-3.5 rounded-xl hover:bg-white/5 transition-all">
                              <div className="min-w-0 flex-1 pr-4">
                                <div className="text-xs font-black truncate text-white uppercase tracking-widest mb-1">{item.musteri_adi || 'İsimsiz'}</div>
                                <div className="text-[10px] text-gray-500 font-bold truncate">#{item.plaka} - {item.cihaz_tipi || 'Cihaz Belirtilmedi'}</div>
                              </div>
                              <div className="text-[9px] px-2 py-1 rounded bg-white/5 border border-white/10 font-black uppercase tracking-widest text-gray-300 whitespace-nowrap">
                                {item.durum || 'Yeni Kayıt'}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-[10px] text-gray-500 font-black uppercase tracking-widest py-10">Servis Kaydı Yok</div>
                        )}
                      </div>

                      {/* SAĞ: RANDEVU KAYITLARI */}
                      <div className="flex flex-col gap-3 overflow-y-auto pl-2 pr-2 scrollbar-hide">
                         <h4 className="text-[10px] font-black text-[#8E052C] uppercase tracking-widest mb-2 sticky top-0 bg-[#1A1A1E] z-10">Randevu Kayıtları</h4>
                         {dashboardData.son_randevular.length > 0 ? (
                          dashboardData.son_randevular.map((item: any, i: number) => {
                            const musteriIsmi = getVal(item, ['müşteri adı', 'musteri adi', 'musteri_adi', 'name', 'customer_name', 'firma_adi']) || 'İsimsiz';
                            const kayitNo = getVal(item, ['kayıt no', 'kayit no', 'servis_no', 'kayit_no']) || 'Belirsiz';
                            const rTarih = getVal(item, ['randevu tarihi', 'appointment_date', 'tarih']);
                            const formatliTarih = rTarih ? new Date(rTarih).toLocaleDateString('tr-TR') : 'Tarih Yok';
                            const durum = getVal(item, ['durum', 'status']) || 'Beklemede';

                            return (
                              <div key={i} className="flex items-center justify-between bg-[#8E052C]/5 border border-[#8E052C]/20 p-3.5 rounded-xl hover:bg-[#8E052C]/10 transition-all">
                                <div className="min-w-0 flex-1 pr-4">
                                  <div className="text-xs font-black truncate text-white uppercase tracking-widest mb-1">{musteriIsmi}</div>
                                  <div className="text-[10px] text-gray-400 font-bold truncate">#{kayitNo} - {formatliTarih}</div>
                                </div>
                                <div className="text-[9px] px-2 py-1 rounded bg-[#8E052C]/20 border border-[#8E052C]/30 font-black uppercase tracking-widest text-white whitespace-nowrap">
                                  {durum}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-center text-[10px] text-gray-500 font-black uppercase tracking-widest py-10">Randevu Kaydı Yok</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )

          ) : aktifSayfa === 'BireyselMusteriKaydi' ? (
            <BireyselMusteriKaydi onClose={() => setAktifSayfa('Dashboard')} />
          ) : aktifSayfa === 'FirmaKaydi' ? (
            <FirmaKaydi onClose={() => setAktifSayfa('Dashboard')} />
          ) : aktifSayfa === 'MusteriListesi' ? (
            <MusteriListesi />
          ) : aktifSayfa === 'YeniServisKaydi' ? (
            <YeniServisKaydi /> 
          ) : aktifSayfa === 'ServisKayitlari' ? (
            <ServisKayitlari /> 
          ) : aktifSayfa === 'TamamlananIsler' ? (
            <TamamlananIsler /> 
          ) : aktifSayfa === 'YeniRandevu' ? (
            <YeniRandevu /> 
          ) : aktifSayfa === 'RandevuTakvimi' ? (
            <RandevuTakvimi /> 
          ) : aktifSayfa === 'TamamlananRandevular' ? ( 
            <TamamlananRandevular /> 
          ) : aktifSayfa === 'StokDurumu' ? ( 
            <StokDurumu /> 
          ) : aktifSayfa === 'MalzemeGirisi' ? ( 
            <MalzemeGirisi />
          ) : aktifSayfa === 'YedekParcaTakibi' ? ( 
            <YedekParcaTakibi />  

          ) : null}

        </div>

        {/* ---------------- SAĞ BÖLÜM: MOBİL DURUM ---------------- */}
        <div className="w-72 border-l border-white/5 bg-black/40 backdrop-blur-md p-6 flex flex-col shrink-0 relative overflow-hidden">
           <div className="absolute top-[-5%] right-[-5%] w-32 h-32 bg-[#8E052C]/10 blur-3xl rounded-full pointer-events-none"></div>

           <h3 className="text-lg font-black mb-8 text-white border-b border-white/10 pb-4 flex items-center gap-3 tracking-wide uppercase">
             <div className="w-8 h-8 bg-[#8E052C]/20 rounded-lg flex items-center justify-center text-[#8E052C] shadow-[0_0_10px_rgba(142,5,44,0.2)]">📱</div>
             Hızlı Erişim
           </h3>
           
           <div className="flex flex-col gap-4 relative z-10">
             <button 
               onClick={() => setAktifSayfa('YeniServisKaydi')}
               className="bg-black/50 hover:bg-[#8E052C]/10 border border-white/5 hover:border-[#8E052C]/50 p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 text-left group relative overflow-hidden shadow-lg">
                 <div className="absolute left-0 top-0 w-1 h-full bg-[#8E052C] opacity-0 group-hover:opacity-100 transition-all"></div>
                 <div className="w-10 h-10 bg-white/5 group-hover:bg-[#8E052C]/20 rounded-xl flex items-center justify-center text-xl transition-all duration-300 shadow-inner">📝</div>
                 <div>
                    <div className="font-black text-sm text-white group-hover:text-[#8E052C] transition-colors uppercase tracking-widest mb-1">Yeni Servis</div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Atölye formu</div>
                 </div>
             </button>

             <button 
               onClick={() => setAktifSayfa('YeniRandevu')}
               className="bg-black/50 hover:bg-[#8E052C]/10 border border-white/5 hover:border-[#8E052C]/50 p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 text-left group relative overflow-hidden shadow-lg">
                 <div className="absolute left-0 top-0 w-1 h-full bg-[#8E052C] opacity-0 group-hover:opacity-100 transition-all"></div>
                 <div className="w-10 h-10 bg-white/5 group-hover:bg-[#8E052C]/20 rounded-xl flex items-center justify-center text-xl transition-all duration-300 shadow-inner">📅</div>
                 <div>
                    <div className="font-black text-sm text-white group-hover:text-[#8E052C] transition-colors uppercase tracking-widest mb-1">Yeni Randevu</div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Saha formu</div>
                 </div>
             </button>
           </div>

           {/* 🚨 GERÇEK ZAMANLI SİSTEM DURUM RADARI */}
           <div className={`mt-auto bg-black/40 border rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-2xl transition-colors duration-500 ${isOnline ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <div className={`absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full blur-xl pointer-events-none transition-colors duration-500 ${isOnline ? 'bg-green-500/10' : 'bg-red-500/10'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-500 ${isOnline ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className={`w-3 h-3 rounded-full animate-pulse transition-colors duration-500 ${isOnline ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.9)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]'}`}></div>
              </div>
              <div className="relative z-10">
                <div className={`text-[11px] font-black tracking-widest uppercase mb-1 ${isOnline ? 'text-white' : 'text-red-500'}`}>
                  {isOnline ? 'Sistem Aktif' : 'BAĞLANTI KOPTU'}
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-widest ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  {isOnline ? 'Bağlantı Sağlam' : 'Sunucuya Ulaşılamıyor'}
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}