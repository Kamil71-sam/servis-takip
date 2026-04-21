import { useState, useEffect } from 'react';
import api from '../api';

const scrollbarStyle = `
  .nuke-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
  .nuke-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb { background: rgba(142,5,44,0.5); border-radius: 10px; }
  .nuke-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(142,5,44,0.8); }
`;

export default function FirmaAyarlari() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Veritabanındaki anahtarlar (key_name) ve değerleri
  const [ayarlar, setAyarlar] = useState({
    firma_adi: '',
    firma_adres: '',
    firma_vergi: '',
    firma_telefon: '',
    firma_eposta: '',
    firma_web: '',
    fatura_alt_bilgi: 'Bizi tercih ettiğiniz için teşekkür ederiz. Değişen parçalar 6 ay garantilidir.',
    // 🚨 HUSO: MÜDÜR AYARLARI EKLENDİ 🚨
    mudur_adi: '',
    mudur_unvani: ''
  });

  useEffect(() => {
    fetchAyarlar();
  }, []);



  const fetchAyarlar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/settings');
      if (res.data && res.data.success && res.data.data) {
        // Gelen verileri state'e yedir (Backend OBJ gönderdiği için direkt alıyoruz)
        setAyarlar(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (error) {
      console.error("Ayarlar çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };




 




  const handleDegeisim = (key: string, value: string) => {
    setAyarlar(prev => ({ ...prev, [key]: value }));
  };

  const handleKaydet = async () => {
    setSaving(true);
    try {
      const res = await api.post('/api/settings/update', ayarlar);
      if (res.data.success) {
        alert("✅ Bilgiler başarıyla güncellendi!\nMenüdeki isminizin değişmesi için sayfayı yenileyiniz (F5).");
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500 font-black uppercase tracking-widest animate-pulse">Ayarlar Yükleniyor...</div>;
  }

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4">
        






<div className="bg-[#1A1A1E] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* 🚨 p-6 -> p-4 yapıldı */}
          <div className="bg-black/40 p-4 border-b border-white/5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-5%] w-40 h-40 bg-[#8E052C]/20 blur-3xl rounded-full pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <span className="text-[#8E052C] text-2xl">🏢</span> KURUMSAL KİMLİK AYARLARI
              </h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">
                Fatura, servis fişi ve tüm resmi evraklarda yer alacak bilgilerinizi buradan yönetebilirsiniz.
              </p>
            </div>
          </div>

          {/* 🚨 p-8 -> p-6 ve gap-8 -> gap-6 yapıldı */}
          <div className="p-6 grid grid-cols-2 gap-6 overflow-y-auto nuke-scrollbar">


        
            


        {/* SOL KOLON (Firma Bilgileri) */}
            {/* 🚨 gap-5 -> gap-4 yapıldı */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Firma / İşletme Adı (*)</label>
                {/* 🚨 py-3 -> py-2.5 yapıldı */}
                <input type="text" value={ayarlar.firma_adi || ''} onChange={(e) => handleDegeisim('firma_adi', e.target.value)} placeholder="Örn: Kalandar Yazılım ve Bilişim" className="w-full bg-[#0F0F12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-bold focus:border-[#8E052C] transition-all shadow-inner" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tam Adres (*)</label>
                {/* 🚨 rows={3} -> rows={2} ve py-3 -> py-2.5 yapıldı */}
                <textarea value={ayarlar.firma_adres || ''} onChange={(e) => handleDegeisim('firma_adres', e.target.value)} rows={2} placeholder="Örn: Merkez Mah. Cumhuriyet Cad. No:1 Gölcük / Kocaeli" className="w-full bg-[#0F0F12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-bold focus:border-[#8E052C] transition-all shadow-inner resize-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vergi Dairesi ve Vergi No</label>
                <input type="text" value={ayarlar.firma_vergi || ''} onChange={(e) => handleDegeisim('firma_vergi', e.target.value)} placeholder="Örn: Kurtdereli VD / 12345678901" className="w-full bg-[#0F0F12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-bold focus:border-[#8E052C] transition-all shadow-inner" />
              </div>
            </div>

            {/* SAĞ KOLON (İletişim & Profil Bilgileri) */}
            {/* 🚨 gap-5 -> gap-4 yapıldı */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">İletişim Numarası (*)</label>
                <input type="text" value={ayarlar.firma_telefon || ''} onChange={(e) => handleDegeisim('firma_telefon', e.target.value)} placeholder="Örn: 0555 123 45 67" className="w-full bg-[#0F0F12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-bold focus:border-[#8E052C] transition-all shadow-inner" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-Posta Adresi</label>
                <input type="text" value={ayarlar.firma_eposta || ''} onChange={(e) => handleDegeisim('firma_eposta', e.target.value)} placeholder="Örn: info@kalandar.com" className="w-full bg-[#0F0F12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-bold focus:border-[#8E052C] transition-all shadow-inner" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Web Sitesi</label>
                <input type="text" value={ayarlar.firma_web || ''} onChange={(e) => handleDegeisim('firma_web', e.target.value)} placeholder="Örn: www.kalandar.com" className="w-full bg-[#0F0F12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-bold focus:border-[#8E052C] transition-all shadow-inner" />
              </div>
            </div>

            {/* 🚨 HUSO: SİSTEM YÖNETİCİSİ (MÜDÜR) AYARLARI 🚨 */}
            {/* 🚨 mt-2 pt-6 -> mt-0 pt-4 yapıldı */}
            <div className="col-span-2 mt-0 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">👨‍💻</span>
                  <div>
                    <h3 className="text-[#8E052C] text-sm font-black uppercase tracking-widest">Sistem Yöneticisi Bilgileri</h3>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Sol menünün alt kısmında görünecek olan profil isim ve unvanınız.</p>
                  </div>
                </div>
                
                {/* 🚨 gap-8 -> gap-6 yapıldı */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adınız Soyadınız</label>
                        <input type="text" value={ayarlar.mudur_adi || ''} onChange={(e) => handleDegeisim('mudur_adi', e.target.value)} placeholder="Örn: KEMAL MÜDÜR" className="w-full bg-black/50 border border-[#8E052C]/30 focus:border-[#8E052C] rounded-xl px-4 py-2.5 text-sm text-white outline-none font-bold transition-all shadow-inner" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unvanınız</label>
                        <input type="text" value={ayarlar.mudur_unvani || ''} onChange={(e) => handleDegeisim('mudur_unvani', e.target.value)} placeholder="Örn: PATRON" className="w-full bg-black/50 border border-[#8E052C]/30 focus:border-[#8E052C] rounded-xl px-4 py-2.5 text-sm text-white outline-none font-bold transition-all shadow-inner" />
                    </div>
                </div>
            </div>

            {/* ALT BİLGİ ALANI */}
            {/* 🚨 pt-6 -> pt-4 yapıldı */}
            <div className="col-span-2 flex flex-col gap-1 mt-0 border-t border-white/5 pt-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                <span>Matbu Evrak Alt Bilgi / Yasal Uyarı</span>
                <span className="text-[8px] text-gray-500 font-bold">Cihaz teslim fişi ve faturaların en altında görünür.</span>
              </label>
              <textarea value={ayarlar.fatura_alt_bilgi || ''} onChange={(e) => handleDegeisim('fatura_alt_bilgi', e.target.value)} rows={2} placeholder="Örn: Bizi tercih ettiğiniz için teşekkür ederiz. Değişen parçalar 6 ay garantilidir." className="w-full bg-[#0F0F12] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 outline-none font-medium focus:border-[#8E052C] transition-all shadow-inner resize-none" />
            </div>

          </div>

          {/* 🚨 p-6 -> p-4 yapıldı */}
          <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end">
            <button onClick={handleKaydet} disabled={saving} className="bg-[#8E052C] hover:bg-[#8E052C]/80 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(142,5,44,0.4)] disabled:opacity-50 flex items-center gap-2">
              {saving ? 'Kaydediliyor...' : <><span>💾</span> AYARLARI KAYDET</>}
            </button>
          </div>

        </div>







            









      </div>
    </>
  );
}