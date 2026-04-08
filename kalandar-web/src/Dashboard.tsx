import { useState } from 'react';
import logo from './assets/logo.png';
// YENİ SAYFALARIMIZIN İTHALATI (Bireysel, Firma ve artık LİSTE)
import BireyselMusteriKaydi from './pages/BireyselMusteriKaydi';
import FirmaKaydi from './pages/FirmaKaydi';
import MusteriListesi from './pages/MusteriListesi';

export default function Dashboard({ onLogout }: any) {
  const [acikMenu, setAcikMenu] = useState('Müşteri İşlemleri');
  const [aktifSayfa, setAktifSayfa] = useState('Dashboard');

  const menuGecis = (menuAdi: string) => {
    setAcikMenu(acikMenu === menuAdi ? '' : menuAdi);
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] overflow-x-auto selection:bg-[#8E052C] selection:text-white text-white font-sans">
      <div className="w-full min-w-[1100px] min-h-screen flex transition-all duration-500">
        
        {/* SOL MENÜ (Sidebar) */}
        <div className="w-[280px] border-r border-white/5 bg-black/40 backdrop-blur-md p-6 flex flex-col shrink-0 relative overflow-hidden">
          <div className="absolute top-[-5%] left-[-10%] w-40 h-40 bg-[#8E052C]/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <img src={logo} alt="Kalandar Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(142,5,44,0.6)]" />
            <h2 className="text-2xl font-black tracking-tighter uppercase">KALANDAR</h2>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide relative z-10 pb-4">
            <button 
              onClick={() => setAktifSayfa('Dashboard')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all duration-300 text-left ${
                aktifSayfa === 'Dashboard' 
                ? 'bg-[#8E052C]/20 border-l-4 border-[#8E052C] text-[#8E052C] shadow-[0_0_15px_rgba(142,5,44,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <span className="text-lg">🏠</span> Ana Sayfa
            </button>

            {[
              { isim: 'Müşteri İşlemleri', ikon: '👥', altMenuler: ['Bireysel Müşteri Kaydı', 'Firma Kaydı', 'Müşteri Listesi'] },
              { isim: 'Servis İşlemleri', ikon: '🛠️', altMenuler: ['Yeni Servis Formu', 'Bekleyen İşler', 'Tamamlanan İşler'] },
              { isim: 'Randevu İşlemleri', ikon: '📅', altMenuler: ['Yeni Randevu', 'Randevu Takvimi'] },
              { isim: 'Envanter İşlemleri', ikon: '📦', altMenuler: ['Stok Durumu', 'Malzeme Girişi', 'Depo Sayımı'] },
              { isim: 'Mali İşlemler', ikon: '💳', altMenuler: ['Faturalar', 'Tahsilatlar', 'Cari Hesaplar'] },
              { isim: 'Çıktı İşlemleri', ikon: '🖨️', altMenuler: ['Servis Fişi Yazdır', 'Barkod Oluştur'] },
            ].map((menu) => (
              <div key={menu.isim} className="flex flex-col">
                <button 
                  onClick={() => menuGecis(menu.isim)}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 group border ${acikMenu === menu.isim ? 'bg-[#8E052C]/10 border-[#8E052C]/30 shadow-[0_0_15px_rgba(142,5,44,0.1)]' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg transition-transform duration-300 ${acikMenu === menu.isim ? 'scale-110' : 'group-hover:scale-110'}`}>{menu.ikon}</span>
                    <span className={`font-bold text-sm transition-colors ${acikMenu === menu.isim ? 'text-[#8E052C]' : 'text-gray-400 group-hover:text-white'}`}>
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
                          if(altItem === 'Müşteri Listesi') setAktifSayfa('MusteriListesi'); // LİSTE TETİĞİ
                        }}
                        className={`text-left py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-2 group ${
                          (aktifSayfa === 'BireyselMusteriKaydi' && altItem === 'Bireysel Müşteri Kaydı') || 
                          (aktifSayfa === 'FirmaKaydi' && altItem === 'Firma Kaydı') ||
                          (aktifSayfa === 'MusteriListesi' && altItem === 'Müşteri Listesi')
                          ? 'text-white bg-[#8E052C]/20 font-bold'
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
            <div className="w-10 h-10 bg-gradient-to-br from-[#8E052C] to-black rounded-full flex items-center justify-center font-bold ring-2 ring-[#8E052C]/30 shadow-[0_0_10px_rgba(142,5,44,0.4)] text-white">K</div>
            <div className="truncate">
              <div className="text-sm font-bold text-white truncate">Kemal Müdür</div>
              <div className="text-[10px] text-[#8E052C] uppercase font-black tracking-widest">Patron</div>
            </div>
          </div>
        </div>

        {/* ORTA BÖLÜM: DİNAMİK ALAN */}
        <div className="flex-1 p-8 flex flex-col gap-6 relative min-w-0">
          
          <div className="flex justify-between items-center z-10">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                {aktifSayfa === 'Dashboard' ? 'Komuta Merkezi' : 
                 aktifSayfa === 'MusteriListesi' ? 'Müşteri Rehberi' : 'Müşteri İşlemleri'}
              </h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">
                {aktifSayfa === 'Dashboard' ? 'Sistem jilet gibi çalışıyor müdür.' : 
                 aktifSayfa === 'MusteriListesi' ? 'Tüm cari kayıtlar burada listeleniyor.' : 'Yeni kayıt girişi yapılıyor.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={onLogout} className="bg-[#8E052C]/10 hover:bg-[#8E052C] text-[#8E052C] hover:text-white border border-[#8E052C]/50 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(142,5,44,0.2)]">
                Çıkış Yap
              </button>
            </div>
          </div>

          {/* DİNAMİK EKRAN MOTORU */}
          {aktifSayfa === 'Dashboard' ? (
            <>
              {/* DASHBOARD KARTLARI */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl group hover:border-[#8E052C]/50 transition-all cursor-default">
                  <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Toplam İş</div>
                  <div className="text-4xl font-black group-hover:text-[#8E052C] transition-colors text-white">245</div>
                </div>
                <div className="bg-white/5 border border-[#8E052C]/30 p-5 rounded-3xl shadow-lg shadow-red-900/5 cursor-default">
                  <div className="text-[#8E052C] text-[10px] font-bold uppercase tracking-widest mb-1">Aktif Randevu</div>
                  <div className="text-4xl font-black text-white">87</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl cursor-default">
                  <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tamamlanan</div>
                  <div className="text-4xl font-black text-green-500">124</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl cursor-default">
                  <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Günlük Ciro</div>
                  <div className="text-4xl font-black text-yellow-500">₺14.2k</div>
                </div>
              </div>

              {/* DASHBOARD GRAFİKLERİ */}
              <div className="grid grid-cols-5 gap-6 flex-1 min-h-[350px]">
                <div className="col-span-3 bg-black/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E052C]/10 blur-3xl rounded-full"></div>
                   <div className="flex justify-between items-center mb-6 shrink-0">
                      <h3 className="font-bold text-xl text-white">Hizmet/Cihaz Dağılımı</h3>
                      <select className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none">
                        <option>Hizmet Türü</option>
                      </select>
                   </div>
                   <div className="flex-1 flex items-center justify-center">
                      <div className="w-56 h-56 rounded-full border-[20px] border-white/5 relative flex items-center justify-center">
                         <div className="absolute inset-[-20px] border-[20px] border-[#8E052C] rounded-full [clip-path:polygon(50%_50%,100%_0,100%_100%,35%_100%)] drop-shadow-[0_0_20px_rgba(142,5,44,0.6)] animate-pulse"></div>
                         <div className="text-center z-10">
                            <div className="text-4xl font-black text-white">%68</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Klima/Kombi</div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="col-span-2 bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col overflow-hidden">
                  <h3 className="font-bold text-lg mb-6 text-white">Son İşlemler</h3>
                  <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[250px] scrollbar-hide">
                    {[
                      { user: "Ahmet Y.", task: "Kombi Bakımı", status: "Tamamlandı", color: "text-green-500" },
                      { user: "Mehmet K.", task: "Klima Montaj", status: "Beklemede", color: "text-yellow-500" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="min-w-0">
                          <div className="text-sm font-bold truncate text-white">{item.user}</div>
                          <div className="text-[10px] text-gray-500">{item.task}</div>
                        </div>
                        <div className={`text-[10px] font-black uppercase tracking-tighter ${item.color}`}>{item.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>

          ) : aktifSayfa === 'BireyselMusteriKaydi' ? (
            <BireyselMusteriKaydi onClose={() => setAktifSayfa('Dashboard')} />
          ) : aktifSayfa === 'FirmaKaydi' ? (
            <FirmaKaydi onClose={() => setAktifSayfa('Dashboard')} />
          ) : aktifSayfa === 'MusteriListesi' ? (
            // LİSTE SAYFAMIZ BURADA PATLIYOR
            <MusteriListesi />
          ) : null}
        </div>

        {/* SAĞ BÖLÜM: MOBİL DURUM */}
        <div className="w-72 border-l border-white/5 bg-black/40 backdrop-blur-md p-6 flex flex-col shrink-0 relative overflow-hidden">
           <div className="absolute top-[-5%] right-[-5%] w-32 h-32 bg-[#8E052C]/10 blur-3xl rounded-full pointer-events-none"></div>

           <h3 className="text-lg font-black mb-8 text-white border-b border-white/10 pb-4 flex items-center gap-3 tracking-wide">
             <div className="w-8 h-8 bg-[#8E052C]/20 rounded-lg flex items-center justify-center text-[#8E052C] shadow-[0_0_10px_rgba(142,5,44,0.2)]">📱</div>
             Mobil İşlem
           </h3>
           
           <div className="flex flex-col gap-4 relative z-10">
              <button className="bg-black/50 hover:bg-[#8E052C]/10 border border-white/5 hover:border-[#8E052C]/50 p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 text-left group relative overflow-hidden">
                 <div className="absolute left-0 top-0 w-1 h-full bg-[#8E052C] opacity-0 group-hover:opacity-100 transition-all"></div>
                 <div className="w-10 h-10 bg-white/5 group-hover:bg-[#8E052C]/20 rounded-xl flex items-center justify-center text-xl transition-all duration-300 shadow-inner">📝</div>
                 <div>
                    <div className="font-bold text-sm text-white group-hover:text-[#8E052C] transition-colors">Yeni Kayıt Aç</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Hızlı servis formu</div>
                 </div>
              </button>
           </div>

           <div className="mt-auto bg-black/40 border border-green-500/20 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 bg-green-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center shrink-0 border border-green-500/30">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.9)]"></div>
              </div>
              <div className="relative z-10">
                <div className="text-xs font-black text-white tracking-wide">Cihazlar Senkronize</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Son ping: 2 sn önce</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}