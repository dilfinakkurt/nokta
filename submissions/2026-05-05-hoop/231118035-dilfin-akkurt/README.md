Track: A

# Nokta — Final Hoop: Closing the Loop
**Öğrenci:** Dilfin Akkurt · `231118035`  
**Seçilen Track:** **Track A** — Voice Viz Akıcılığı + Lipsync Senkronu  
**Hoop:** 2026-05-05 (Final Hafta)

---

## 🔗 Tüm Proje Linkleri

- 🎬 **3 dk Demo Video:** [https://www.youtube.com/watch?v=QYAwrjcg3MU](https://www.youtube.com/watch?v=QYAwrjcg3MU)
- 📱 **APK Dosyası:** [app-release.apk](./app-release.apk) (Proje klasöründedir)
- 🤖 **GitHub Pull Request:** [https://github.com/seyyah/nokta/pull/321](https://github.com/seyyah/nokta/pull/321)
- 🌐 **Canlı Demo (HTML):** `python -m http.server 9000` komutuyla `localhost:9000/demo.html` adresinden çalıştırılabilir.

---

## 🎯 Ne Yaptım? (3 Katman)

### Katman 1 — 🎙️ Ses Görselleştirici + Avatar Lipsync
- `expo-av` mikrofon girişi → RMS/FFT → Web Audio API
- **OpenAI Voice Mode** estetiğinde 3 katmanlı neon halka animasyonu
- Sessizlikte solar, konuşunca canlanır (**<200ms latency**)
- `avaturn.me`'den üretilmiş kendi yüz modeli (`avatar.glb`) → Three.js morph-target lipsync
- Konuşma **hem kullanıcı sesine hem TTS'e** senkron: avatar raporları kendi sesiyle okur

### Katman 2 — 🛠️ Forge Ratchet Döngüsü
- 3 sesli dikte audit raporu (`Rapor 3, 4, 5`)
- **≥2 başarılı + ≥1 rollback** cycle — her biri ≈20 dakikalık kutu
- Raporlar `FORGE.md`'ye zaman damgalı olarak kayıt edildi

### Katman 3 — 📞 WebRTC Uzman Köprüsü
- Cycle 5'te 2 ardışık FAIL → agent otomatik `STUCK` tespit etti
- Uygulama içi "Uzmana Bağlan" butonu → **Jitsi Meet** açıldı
- Ekran paylaşımı + ses + video: 62 saniyelik uzman görüşmesi
- Görüşme özeti + çözüm → `BRIDGE.md`'de

---

## 📁 Yeni Dosyalar (Bu Hafta)

| Dosya | Açıklama |
|---|---|
| `avatar.glb` | Avaturn.me'den üretilen kişisel 3D yüz modeli |
| `demo.html` | Standalone browser demo (Three.js + Web Audio API) |
| `FORGE.md` | 6 cycle ledger, 20dk kutu, STUCK+Rollback dahil |
| `BRIDGE.md` | Jitsi WebRTC uzman köprüsü görüşme raporu |
| `PERSONAS.md` | Sistemdeki 4 persona tanımı |
| `app/App.tsx` | Avatar sekmesi + Forge panel + Jitsi entegrasyonu |
| `app/avatarHTML.ts` | WebGL/Three.js avatar renderer (HTML string) |
| `app/assets/avatar-visualizer.html` | Standalone WebView görselleştirici |

---

## 🔧 Teknik Kararlar

1. **Three.js + WebGL (WebView içinde):** React Three Fiber yerine seçildi — Expo native build'de RN sürüm uyuşmazlıkları yaşanıyordu. WebView+HTML5 yaklaşımı %100 kararlı çalıştı.
2. **Web Speech API TTS:** API anahtarsız, tarayıcı yerleşik TTS — avatar Türkçe sesiyle raporları okuyor.
3. **Jitsi Meet:** Daily.co/LiveKit yerine seçildi — API anahtarı gerektirmez, ekran paylaşımı destekler.
4. **STUCK Heuristic:** `consec_fail_count >= 2` → agent otomatik köprü tetikler.
