# EVAL.md - Golden Scenarios (Ratchet Disiplini)

Bu dosya, agent'ın başarıyla uyguladığı ve otonomi döngüsü (Track C) kapsamında sistemi ileriye taşıyan davranışları (golden scenarios) listeler. Amaç, ulaşılan kalitenin altına düşmemek (ratchet) ve başarılı senaryoları kalıcı kılmaktır.

1. **Cycle 1 (Başarılı Fix):** Audit raporu ile tespit edilen "eksik ana buton" senaryosu. Agent eksik olan `<Button>` component'ini UI'a ekledi ve doğru konumlandırdı. (Ratchet kilitlendi: Ana buton artık her cycle'da korunacak).
2. **Cycle 2 (Başarılı Styling):** Profil sayfasında yetersiz kalan padding değerlerinin güncellenmesi. Metinlerin okunabilirliği artırıldı. (Ratchet kilitlendi: Padding değerleri minimum `16px` olacak).
3. **Cycle 4 (Başarılı Özellik Ekleme):** Kullanıcının "Burada renkler çok silik, daha koyu olmalı" raporu doğrultusunda metin renklerinin zıtlığı (contrast) artırıldı.
