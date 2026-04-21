import { useState, useEffect } from 'react';
import api from '../api';

const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(142,5,44,0.5); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(142,5,44,0.8); }
`;

export default function Yetkilendirme() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);



// 🚨 MÜDÜRÜN KURALI 1: İlk açılışta her şey AÇIK (true) gelsin. 
  // Sistem "Kapalı" komutunu görene kadar kimseyi dükkandan kovmasın!
  const [yetkiler, setYetkiler] = useState({
    banko_mali_islem: true,
    banko_envanter_islem: true,
    banko_cikti_islem: true
  });

  useEffect(() => {
    fetchYetkiler();
  }, []);

  const fetchYetkiler = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/settings');
      if (res.data && res.data.success && res.data.data) {
        const dbData: any = {};
        res.data.data.forEach((item: any) => {
           dbData[item.key_name] = item.value_text;
        });

        // 🚨 MÜDÜRÜN KURALI 2: "Kesin olarak KAPALI (false/0) değilse, AÇIKTIR!"
        const isAcik = (key: string) => {
            const val = dbData[key];
            if (val === undefined || val === null || val === '') return true; // DB'de henüz ayar yoksa AÇIK kalsın
            const strVal = String(val).trim().toLowerCase();
            return strVal !== 'false' && strVal !== '0'; // Sadece veritabanı bas bas "false" diye bağırırsa kapat!
        };

        setYetkiler({
          banko_mali_islem: isAcik('banko_mali_islem'),
          banko_envanter_islem: isAcik('banko_envanter_islem'),
          banko_cikti_islem: isAcik('banko_cikti_islem')
        });
      }
    } catch (error) {
      console.error("Yetkiler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };



/*


  // 🚨 SADECE BANKO PERSONELİ İÇİN ŞALTERLER
  const [yetkiler, setYetkiler] = useState({
    banko_mali_islem: false,
    banko_envanter_islem: false,
    banko_cikti_islem: false
  });

  useEffect(() => {
    fetchYetkiler();
  }, []);





const fetchYetkiler = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/settings');
      if (res.data && res.data.success && res.data.data) {
        const dbData: any = {};
        res.data.data.forEach((item: any) => {
           dbData[item.key_name] = item.value_text;
        });

        // 🚨 MÜDÜRÜN ZIRHLI ÇEVİRMENİ: Gelen veri ne olursa olsun (1, 'true', 'TRUE', vs.) doğru anlar!
        // Eğer veritabanında henüz kayıt yoksa (ilk kurulum), şalterler varsayılan olarak AÇIK (true) gelsin.
        const parseYetki = (val: any) => {
            if (val === undefined || val === null) return true; // Mobilde açık çalışıyorsa webde de açık gelmeli
            const strVal = String(val).trim().toLowerCase();
            return strVal === 'true' || strVal === '1';
        };

        setYetkiler({
          banko_mali_islem: parseYetki(dbData.banko_mali_islem),
          banko_envanter_islem: parseYetki(dbData.banko_envanter_islem),
          banko_cikti_islem: parseYetki(dbData.banko_cikti_islem)
        });
      }
    } catch (error) {
      console.error("Yetkiler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };






  const fetchYetkiler = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/settings');
      if (res.data && res.data.success && res.data.data) {
        // Gelen array verisini objeye çeviriyoruz
        const dbData: any = {};
        res.data.data.forEach((item: any) => {
           dbData[item.key_name] = item.value_text;
        });

        setYetkiler({
          banko_mali_islem: dbData.banko_mali_islem === 'true',
          banko_envanter_islem: dbData.banko_envanter_islem === 'true',
          banko_cikti_islem: dbData.banko_cikti_islem === 'true'
        });
      }
    } catch (error) {
      console.error("Yetkiler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };
*/





  const handleToggle = (key: keyof typeof yetkiler) => {
    setYetkiler(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleKaydet = async () => {
    setSaving(true);
    try {
      // Veritabanına yazarken string'e çeviriyoruz
      const payload = {
        banko_mali_islem: String(yetkiler.banko_mali_islem),
        banko_envanter_islem: String(yetkiler.banko_envanter_islem),
        banko_cikti_islem: String(yetkiler.banko_cikti_islem)
      };

      const res = await api.post('/api/settings/update', payload);
      if (res.data.success) {
        alert("✅ Banko yetkileri başarıyla kaydedildi! Mobil cihazlarda yetkiler anında devreye girecektir.");
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("Yetkiler kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };





  // Özel Tasarım Şalter (Toggle) Komponenti
  // 🚨 p-5 -> p-4 yapıldı, ikonlar ve buton boyutları bir tık küçültüldü
  const ToggleSwitch = ({ checked, onChange, label, desc, icon }: { checked: boolean, onChange: () => void, label: string, desc: string, icon: string }) => (
    <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-xl hover:bg-white/5 transition-all shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner transition-colors ${checked ? 'bg-[#8E052C]/20 text-[#8E052C]' : 'bg-white/5 text-gray-500'}`}>
          {icon}
        </div>
        <div className="flex flex-col pr-4">
          <span className={`text-sm font-black uppercase tracking-widest ${checked ? 'text-white' : 'text-gray-500'}`}>{label}</span>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{desc}</span>
        </div>
      </div>
      <button 
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 shadow-inner border border-white/5 ${checked ? 'bg-[#8E052C]' : 'bg-[#0F0F12]'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-md ${checked ? 'translate-x-7' : 'translate-x-1'}`}></div>
      </button>
    </div>
  );

 











  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500 font-black uppercase tracking-widest animate-pulse">Yetkiler Taranıyor...</div>;
  }

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4">
        
        <div className="bg-[#1A1A1E] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full">
          


        {/* BAŞLIK */}
          {/* 🚨 p-6 -> p-4 yapıldı */}
          <div className="bg-black/40 p-4 border-b border-white/5 flex items-center justify-between relative overflow-hidden shrink-0">
            <div className="absolute top-[-50%] right-[-5%] w-40 h-40 bg-sky-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <span className="text-sky-500 text-2xl">🛡️</span> MOBİL ERİŞİM VE YETKİLENDİRME
              </h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">
                Banko personelinin mobil cihazlarda hangi menüleri ve özellikleri görebileceğini yönetin.
              </p>
            </div>
          </div>

          {/* İÇERİK ALANI */}
          {/* 🚨 p-8 -> p-4 ve gap-6 -> gap-4 yapıldı */}
          <div className="p-4 flex flex-col items-center overflow-y-auto nuke-scrollbar">
            
            <div className="w-full max-w-2xl flex flex-col gap-4">
              
              {/* 🚨 mb-4 -> mb-2 ve pb-6 -> pb-4 yapıldı */}
              <div className="flex items-center gap-4 mb-2 border-b border-white/10 pb-4">
                <div className="w-14 h-14 bg-sky-500/20 text-sky-500 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(14,165,233,0.3)]">👨‍💼</div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest text-lg">Banko Personeli</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Kayıt, Müşteri Karşılama ve Ön Muhasebe</p>
                </div>
              </div>

              {/* ŞALTERLER */}
              <ToggleSwitch 
                checked={yetkiler.banko_mali_islem} 
                onChange={() => handleToggle('banko_mali_islem')} 
                label="Mali İşlemler Menüsü" 
                desc="Açık olursa, kasayı, para giriş/çıkışlarını ve mali dökümleri görebilir." 
                icon="💰"
              />
              
              <ToggleSwitch 
                checked={yetkiler.banko_envanter_islem} 
                onChange={() => handleToggle('banko_envanter_islem')} 
                label="Envanter İşlemleri Menüsü" 
                desc="Açık olursa, depo stoklarını, malzeme ekleme/çıkarma ekranlarını görebilir." 
                icon="📦"
              />
              
              <ToggleSwitch 
                checked={yetkiler.banko_cikti_islem} 
                onChange={() => handleToggle('banko_cikti_islem')} 
                label="Çıktı İşlemleri Menüsü" 
                desc="Açık olursa, PDF çıktı, fatura yazdırma ve mail gönderme işlemlerini yapabilir." 
                icon="🖨️"
              />

              {/* 🚨 mt-4 -> mt-2 ve p-4 -> p-3 yapıldı */}
              <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center leading-relaxed">
                  <span className="text-[#8E052C] font-black">Not:</span> Bu şalterlerden herhangi birini kapattığınızda, o menüye ait düğmeler mobil uygulamada anında gizlenir (perde iner). 
                  <br/>Uzman/Usta personeli ise yalnızca kendi iş kayıtlarını görür, mali ekranlara varsayılan olarak erişemez.
                </p>
              </div>

            </div>

          </div>

          {/* KAYDET BUTONU */}
          {/* 🚨 p-6 -> p-4 ve py-3 -> py-2.5 yapıldı */}
          <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end shrink-0">
            <button 
              onClick={handleKaydet} 
              disabled={saving} 
              className="bg-[#8E052C] hover:bg-[#8E052C]/80 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(142,5,44,0.4)] disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Kaydediliyor...' : <><span>🔐</span> YETKİLERİ GÜNCELLE</>}
            </button>
          </div>













        </div>
      </div>
    </>
  );
}