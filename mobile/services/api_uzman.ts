// mobile/services/api_uzman.ts
import { API_URL, fetchWithAuth } from './api'; // MÜDÜR: Akıllı postacıyı (fetchWithAuth) da içeri aldık

export const getUzmanDashboardData = async (email: string) => {
    try {
        const response = await fetchWithAuth(`${API_URL}/uzman/dashboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return await response.json();
    } catch (error) {
        console.error("Dashboard API hatası:", error);
        return { success: false };
    }
};

export const getUzmanTumIsler = async (email: string) => {
    try {
        const response = await fetchWithAuth(`${API_URL}/uzman/tum-isler`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return await response.json();
    } catch (error) {
        console.error("Tüm İşler API hatası:", error);
        return { success: false };
    }
};

/**
 * MÜDÜR: YENİ EKLENEN FONKSİYON
 * Servis durumunu, fiyatını ve notunu günceller.
 * Arka planda tarihçe kaydı oluşturur.
 */
export const updateServiceProcess = async (updateData: {
    id: number;
    status: string;
    old_status: string;
    changed_by: string;
    offer_price?: number;
    expert_note?: string;
}) => {
    try {
        const response = await fetchWithAuth(`${API_URL}/uzman/servis-guncelle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });
        return await response.json();
    } catch (error) {
        console.error("Servis güncelleme hatası:", error);
        return { success: false, error: "Bağlantı hatası oluştu" };
    }
};