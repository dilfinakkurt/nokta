# PERSONAS.md - Nokta Ekosistemi Karakter Tanımlamaları

Nokta projesinin son fazında kurulan "Halkayı Kapatma" (Closing the Loop) yapısında rol oynayan dört temel aktör/persona aşağıda detaylandırılmıştır.

---

### 1. 👤 Geliştirici Persona (Dilfin Akkurt - Kullanıcı)
- **Rolü:** Sistem yöneticisi ve test kullanıcısı.
- **Karakter Özellikleri:** Uygulamadaki hataları (UI/UX, performans, derleme sorunları vb.) sesli olarak dikte ederek `<AuditWidget />` raporlarına kaydeder. Otonom agent'ın çalışmasını tetikler ve sistem kilitlendiğinde WebRTC köprüsünü açarak uzmanla doğrudan iletişime geçer.
- **Hedefi:** Uygulamadaki tüm hataların otonom veya hibrit (uzman desteğiyle) şekilde tamir edilmesini sağlamak.

---

### 2. 🤖 Otonom Kodlama Ajanı Persona (Forge Agent / Antigravity)
- **Rolü:** Arka planda çalışan otonom yazılım onarım motoru.
- **Karakter Özellikleri:** Detaylı audit raporlarını okur, hata kaynağını tespit eder (`[LOCATE]`), olası çözümleri hipotezleştirir (`[HYPOTHESIZE]`), kod üzerinde değişiklik yapar (`[REPAIR]`) ve testleri koşturur (`[TEST]`).
- **Özel Davranışı (Ratchet & Stuck):** Eğer yaptığı bir onarım testleri geçemezse değişiklikleri geri alır (`[ROLLBACK]`). Eğer bir hata üzerinde üst üste 2 kez başarısız olursa (FAIL), kendi sınırını kabul eder, sistemi kilitler (`STUCK`) ve insan müdahalesi talep eder.

---

### 3. 🎙️ Konuşan Avatar Persona (Dilfin 3D Digital Twin)
- **Rolü:** Ses-tepkisel sanal maskot ve uygulamanın dijital yüzü.
- **Karakter Özellikleri:** Geliştiricinin kendi yüz fotoğrafından Avaturn.me üzerinde üretilmiş 3D modeldir. Statik bir büst olmak yerine, mikrofondan gelen sesin RMS/genlik dalgalanmalarına göre anlık olarak dudaklarını hareket ettirir (viseme/lipsync) ve göz/kafa takibiyle ekrana canlılık katar.
- **Görevi:** AI asistanının ve dikte modülünün kullanıcıyla kurduğu bağı güçlendirmek, ses dalgaları eşliğinde konuşan bir arayüz sunmak.

---

### 4. 📞 Teknik Uzman Persona (Human Expert)
- **Rolü:** Kriz anlarında devreye giren üst düzey danışman (WebRTC Köprüsü).
- **Karakter Özellikleri:** Agent'ın çözemediği karmaşık derleyici, dependency ve kütüphane çakışması hatalarında WebRTC (Jitsi Meet) üzerinden çağrılır.
- **Görevi:** Geliştiricinin ekran paylaşımını inceleyerek sorunu teşhis etmek, otonom agent'ın kilitlendiği kod satırlarını düzeltecek direktifleri vermek.
