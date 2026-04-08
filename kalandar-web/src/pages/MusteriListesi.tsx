import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MusteriListesi() {
  const [liste, setListe] = useState<any[]>([]);
  const [arama, setArama] = useState('');
  const [seciliMusteri, setSeciliMusteri] = useState<any>(null);

  const verileriGetir = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [resCust, resFirm] = await Promise.all([
        axios.get('http://localhost:3000/api/customers', { headers }),
        axios.get('http://localhost:3000/api/firm/all', { headers })
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

  const filtrelenmis = liste.filter(m => 
    m.isim.toLowerCase().includes(arama.toLowerCase()) || m.tel?.includes(arama)
  );

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-2xl relative">
      
      {/* ÜST BAR */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Müşteri & Firma Rehberi</h2>
        </div>
        <input 
          type="text" placeholder="İsim veya Telefon ara..." 
          className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white w-96 focus:border-[#8E052C] outline-none font-semibold"
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      {/* TABLO */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0F0F12] z-10">
            <tr className="border-b border-white/20 text-white text-[11px] font-black uppercase tracking-widest">
              <th className="p-5 w-24 text-center">TİP</th>
              <th className="p-5">İSİM / ÜNVAN</th>
              <th className="p-5">YETKİLİ</th>
              <th className="p-5">İLETİŞİM (TEL/FAKS)</th>
              <th className="p-5">VERGİ NO / E-POSTA</th>
              <th className="p-5">TEBLİGAT ADRESİ</th>
              <th className="p-5 text-right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtrelenmis.map((m, index) => (
              <tr key={index} className="hover:bg-white/[0.05] transition-all group">
                <td className="p-5 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${m.tip === 'B' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'}`}>
                    {m.tip === 'B' ? 'ŞAHIS' : 'FİRMA'}
                  </span>
                </td>
                <td className="p-5 font-semibold text-white text-[15px] uppercase tracking-tight">{m.isim}</td>
                <td className="p-5 text-gray-200 font-semibold text-sm">{m.yetkili}</td>
                <td className="p-5 text-sm font-semibold">
                  <div className="text-white text-[14px]">{m.tel}</div>
                  <div className="text-[#8E052C] text-[12px]">F: {m.fks}</div>
                </td>
                <td className="p-5 text-sm font-semibold">
                  <div className="text-yellow-500 text-[14px]">{m.vno}</div>
                  <div className="text-gray-300 lowercase text-[12px]">{m.mail}</div>
                </td>
                <td className="p-5 text-sm font-semibold text-gray-300 leading-snug max-w-sm">
                  {m.adr}
                </td>
                <td className="p-5 text-right">
                  <button onClick={() => setSeciliMusteri(m)} className="p-3 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all">✏️</button>
                  <button className="p-3 text-red-500 hover:bg-red-500/20 rounded-xl transition-all">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DÜZENLEME MODALI: SABİT VE ÜSTTE */}
      {seciliMusteri && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#0F0F12] border-2 border-[#8E052C]/30 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-8 border-b border-white/5 bg-[#8E052C]/10">
              <h2 className="font-black text-white uppercase text-2xl tracking-tighter">
                KAYDI DÜZELT: <span className="text-[#8E052C]">{seciliMusteri.isim}</span>
              </h2>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">İsim / Ünvan</label>
                  <input type="text" defaultValue={seciliMusteri.isim} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-base text-white font-semibold outline-none focus:border-[#8E052C]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Yetkili Şahıs</label>
                  <input type="text" defaultValue={seciliMusteri.yetkili} disabled={seciliMusteri.tip === 'B'} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-base text-white font-semibold outline-none disabled:opacity-30" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Telefon</label>
                  <input type="text" defaultValue={seciliMusteri.tel} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-base text-white font-semibold outline-none focus:border-[#8E052C]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Faks</label>
                  <input type="text" defaultValue={seciliMusteri.fks} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-base text-white font-semibold outline-none focus:border-[#8E052C]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">E-Posta</label>
                  <input type="text" defaultValue={seciliMusteri.mail} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-base text-white font-semibold outline-none focus:border-[#8E052C]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Vergi No</label>
                  <input type="text" defaultValue={seciliMusteri.vno} disabled={seciliMusteri.tip === 'B'} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-base text-white font-semibold outline-none disabled:opacity-30" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Adres Bilgisi</label>
                <textarea defaultValue={seciliMusteri.adr} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-base text-white font-semibold h-28 focus:border-[#8E052C] resize-none outline-none"></textarea>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-black/40 flex justify-end items-center gap-8">
              <button onClick={() => setSeciliMusteri(null)} className="text-gray-400 font-black uppercase text-sm hover:text-white transition-colors">VAZGEÇ</button>
              <button className="bg-[#8E052C] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase shadow-[0_0_20px_rgba(142,5,44,0.4)]">DEĞİŞİKLİKLERİ KAYDET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}