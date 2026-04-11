import { useEffect, useState } from 'react';
import api from '../api'; // 🚨 MÜDÜR: Axios yerine kendi merkezimizi getirdik

export default function MusteriListesi() {
  const [liste, setListe] = useState<any[]>([]);
  const [arama, setArama] = useState('');
  const [seciliMusteri, setSeciliMusteri] = useState<any>(null);

  // 1. LİSTEYİ GETİRME MOTORU (Temizlendi)
  const verileriGetir = async () => {
    try {
      // 🚨 MÜDÜR: Token ve Headers yok, api.ts hallediyor!
      const [resCust, resFirm] = await Promise.all([
        api.get('/customers'),
        api.get('/firm/all')
      ]);

      const birlestirilmis = [
        ...resCust.data.map((c: any) => ({ 
          ...c, tip: 'B', isim: c.name, yetkili: '-', tel: c.phone, mail: c.email, vno: '-', fks: c.fax || '-', adr: c.address 
        })),
        ...resFirm.data.map((f: any) => ({ 
          ...f, tip: 'F', isim: f.firma_adi, yetkili: f.yetkili_ad_soyad, tel: f.telefon, mail: f.eposta, vno: f.vergi_no, fks: f.faks || '-', adr: f.adres 
        }))
      ];
      setListe(birlestirilmis.sort((a, b) => a.isim.localeCompare(b.isim)));
    } catch (err) { console.error("Liste hatası:", err); }
  };

  useEffect(() => { verileriGetir(); }, []);






  

// 2. SİLME İNFAZ MEKANİZMASI (Yalancı Backend'e Karşı Zırhlı)
  const silmeIslemi = async (id: number, tip: string) => {
    const uyariMesaji = "🚨 DİKKAT: SİLME İŞLEMİ KONTROLÜ\n\nSistem sadece hiç işlem görmemiş (taze) kayıtları silmenize izin verir.\nEğer bu kişinin sistemde geçmiş bir randevusu veya servis kaydı varsa, muhasebe ve arşiv bütünlüğünü korumak için SİLİNMEYECEKTİR.\n\nSilmeyi denemek istiyor musunuz?";

    if (window.confirm(uyariMesaji)) {
      try {
        const rota = tip === 'B' ? `/customers/${id}` : `/firm/${id}`;
        
        // Mermiyi ateşliyoruz
        const res = await api.delete(rota);
        
        // 🚨 MÜDÜRÜN ZIRHI: Backend bize "Tamam" dese bile paketin içine bakıyoruz!
        // Eğer pakette "success: false" veya "error" yazıyorsa bizi yiyordur, hemen hataya fırlatıyoruz!
        if (res.data && (res.data.success === false || res.data.error)) {
          throw new Error(res.data.message || res.data.error || "Backend silmeyi reddetti");
        }

        // Pakette gerçekten yalan yoksa burası çalışır
        alert("✅ Başarılı: Kayıt tertemiz silindi!");
        verileriGetir(); // Listeyi tazele
        
      } catch (err: any) {
        // 🚨 SİNSİ SUNUCU BURADA ENSELENDİ!
        alert("❌ SİLME REDDEDİLDİ!\n\nBu müşterinin sistemde geçmiş işlemleri (randevu, arıza, vb.) var! Arşivin ve kasanın bozulmaması için bu kaydı silemezsiniz.");
        console.error("Gerçek Hata Sebebi:", err);
      }
    }
  };











  








  // 🚨 MÜDÜR: YENİ GÜNCELLEME MOTORU EKLENDİ 🚨
  const kaydetIslemi = async () => {
    if (!seciliMusteri) return;

    try {
      // Bireysel ve Firma için farklı rotalara ve alanlara göre veri paketliyoruz
      if (seciliMusteri.tip === 'B') {
        await api.put(`/customers/${seciliMusteri.id}`, {
          name: seciliMusteri.isim,
          phone: seciliMusteri.tel,
          email: seciliMusteri.mail,
          fax: seciliMusteri.fks === '-' ? '' : seciliMusteri.fks,
          address: seciliMusteri.adr
        });
      } else {
        await api.put(`/firm/${seciliMusteri.id}`, {
          firma_adi: seciliMusteri.isim,
          yetkili_ad_soyad: seciliMusteri.yetkili,
          telefon: seciliMusteri.tel,
          eposta: seciliMusteri.mail,
          vergi_no: seciliMusteri.vno === '-' ? '' : seciliMusteri.vno,
          faks: seciliMusteri.fks === '-' ? '' : seciliMusteri.fks,
          adres: seciliMusteri.adr
        });
      }

      alert("Kayıt başarıyla güncellendi!");
      setSeciliMusteri(null); // Modalı Kapat
      verileriGetir(); // Listeyi Tazele
    } catch (err: any) {
      alert("Güncelleme hatası: " + (err.response?.data?.message || err.message));
    }
  };

  // GÜNCELLEME İÇİN MODAL İÇİ VERİ DEĞİŞTİRİCİ
  const handleGuncelle = (alan: string, deger: string) => {
    setSeciliMusteri({ ...seciliMusteri, [alan]: deger });
  };

  const filtrelenmis = liste.filter(m => 
    m.isim.toLowerCase().includes(arama.toLowerCase()) || m.tel?.includes(arama)
  );

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative">
      
      {/* ÜST BAR */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
        <h2 className="text-xl font-black text-white tracking-tighter uppercase">Müşteri & Firma Rehberi</h2>
        <input 
          type="text" placeholder="İsim veya Telefon ara..." 
          className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white w-80 focus:border-[#8E052C] outline-none font-semibold"
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      {/* TABLO */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0F0F12] z-10">
            <tr className="border-b border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
              <th className="p-4 w-20 text-center">TİP</th>
              <th className="p-4">İSİM / ÜNVAN</th>
              <th className="p-4">YETKİLİ</th>
              <th className="p-4">İLETİŞİM</th>
              <th className="p-4">VERGİ / E-POSTA</th>
              <th className="p-4">TEBLİGAT ADRESİ</th>
              <th className="p-4 text-right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtrelenmis.map((m, index) => (
              <tr key={index} className="hover:bg-white/[0.03] transition-all group text-[13px] font-semibold">
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-md text-[9px] font-black ${m.tip === 'B' ? 'bg-blue-600/20 text-blue-400' : 'bg-orange-600/20 text-orange-400'}`}>
                    {m.tip === 'B' ? 'ŞAHIS' : 'FİRMA'}
                  </span>
                </td>
                <td className="p-4 text-white uppercase tracking-tight">{m.isim}</td>
                <td className="p-4 text-gray-400">{m.yetkili}</td>
                <td className="p-4">
                  <div className="text-white">{m.tel}</div>
                  <div className="text-[#8E052C] text-[11px]">F: {m.fks}</div>
                </td>
                <td className="p-4 text-yellow-600">
                  <div>{m.vno}</div>
                  <div className="text-gray-500 lowercase text-[11px]">{m.mail}</div>
                </td>
                <td className="p-4 text-gray-400 leading-snug max-w-sm truncate" title={m.adr}>{m.adr}</td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => setSeciliMusteri(m)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">✏️</button>
                  <button onClick={() => silmeIslemi(m.id, m.tip)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DÜZENLEME MODALI */}
      {seciliMusteri && (
        <div className="fixed inset-0 z-[999999] flex justify-center items-start pt-20 bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0F0F12] border-2 border-[#8E052C]/30 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-up relative">
            <div className="p-8 border-b border-white/5 bg-[#8E052C]/10 flex justify-between items-center">
              <h3 className="font-black text-white uppercase text-2xl tracking-tighter">
                KAYDI DÜZELT: <span className="text-[#8E052C]">{seciliMusteri.isim}</span>
              </h3>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">İsim / Ünvan</label>
                  <input 
                    type="text" 
                    value={seciliMusteri.isim} 
                    onChange={(e) => handleGuncelle('isim', e.target.value)} 
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C]" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Yetkili Şahıs</label>
                  <input 
                    type="text" 
                    value={seciliMusteri.yetkili} 
                    onChange={(e) => handleGuncelle('yetkili', e.target.value)} 
                    disabled={seciliMusteri.tip === 'B'} 
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none disabled:opacity-20" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Telefon</label>
                  <input 
                    type="text" 
                    value={seciliMusteri.tel} 
                    onChange={(e) => handleGuncelle('tel', e.target.value)} 
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C]" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Faks</label>
                  <input 
                    type="text" 
                    value={seciliMusteri.fks} 
                    onChange={(e) => handleGuncelle('fks', e.target.value)} 
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">E-Posta</label>
                  <input 
                    type="text" 
                    value={seciliMusteri.mail} 
                    onChange={(e) => handleGuncelle('mail', e.target.value)} 
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C]" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Vergi No</label>
                  <input 
                    type="text" 
                    value={seciliMusteri.vno} 
                    onChange={(e) => handleGuncelle('vno', e.target.value)} 
                    disabled={seciliMusteri.tip === 'B'} 
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none disabled:opacity-20" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Adres Bilgisi</label>
                <textarea 
                  value={seciliMusteri.adr} 
                  onChange={(e) => handleGuncelle('adr', e.target.value)} 
                  className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold h-28 focus:border-[#8E052C] resize-none outline-none"
                ></textarea>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-black/40 flex justify-end items-center gap-8">
              <button onClick={() => setSeciliMusteri(null)} className="text-gray-400 font-black uppercase text-xs hover:text-white transition-all">VAZGEÇ</button>
              
              {/* 🚨 MÜDÜR: MOTOR BURAYA BAĞLANDI */}
              <button 
                onClick={kaydetIslemi} 
                className="bg-[#8E052C] hover:bg-[#A10632] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase shadow-lg shadow-red-950/30 transition-all active:scale-95"
              >
                KAYDET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}