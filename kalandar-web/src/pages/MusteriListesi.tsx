import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MusteriListesi() {
  const [liste, setListe] = useState<any[]>([]);
  const [arama, setArama] = useState('');
  const [seciliMusteri, setSeciliMusteri] = useState<any>(null);

  const API_URL = "http://localhost:3000"; 

  // 1. LİSTEYİ GETİRME MOTORU
  const verileriGetir = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [resCust, resFirm] = await Promise.all([
        axios.get(`${API_URL}/api/customers`, { headers }),
        axios.get(`${API_URL}/api/firm/all`, { headers })
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

  // 2. SİLME İNFAZ MEKANİZMASI (DÜZELTİLDİ)
  const silmeIslemi = async (id: number, tip: string) => {
    if (window.confirm("Bu kayıt ve tüm geçmişi sonsuza kadar silinecek. Emin misin müdür?")) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const rota = tip === 'B' ? `${API_URL}/api/customers/${id}` : `${API_URL}/api/firm/${id}`;
        
        await axios.delete(rota, { headers });
        verileriGetir(); // Listeyi tazele
      } catch (err: any) {
        alert("Silme hatası: " + (err.response?.data?.message || err.message));
      }
    }
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

      {/* TABLO: Fontlar text-[13px] ve font-semibold yapıldı */}
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

      {/* DÜZENLEME MODALI: EKRANIN TEPESİNE ÇİVİLENDİ (items-start pt-20) */}
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
                  <input type="text" defaultValue={seciliMusteri.isim} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Yetkili Şahıs</label>
                  <input type="text" defaultValue={seciliMusteri.yetkili} disabled={seciliMusteri.tip === 'B'} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none disabled:opacity-20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Telefon</label>
                  <input type="text" defaultValue={seciliMusteri.tel} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Faks</label>
                  <input type="text" defaultValue={seciliMusteri.fks} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">E-Posta</label>
                  <input type="text" defaultValue={seciliMusteri.mail} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none focus:border-[#8E052C]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Vergi No</label>
                  <input type="text" defaultValue={seciliMusteri.vno} disabled={seciliMusteri.tip === 'B'} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold outline-none disabled:opacity-20" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">Adres Bilgisi</label>
                <textarea defaultValue={seciliMusteri.adr} className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm text-white font-semibold h-28 focus:border-[#8E052C] resize-none outline-none"></textarea>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-black/40 flex justify-end items-center gap-8">
              <button onClick={() => setSeciliMusteri(null)} className="text-gray-400 font-black uppercase text-xs hover:text-white transition-all">VAZGEÇ</button>
              <button className="bg-[#8E052C] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase shadow-lg shadow-red-950/30">KAYDET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}