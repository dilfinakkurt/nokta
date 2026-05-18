# Nokta Audit Forge - IDEA.md

## Müşteri-Geliştirici Use Case'i

Audit raporları genellikle yazılım geliştiricilere hataları (bug) bildirmek için kullanılır. Ancak, `Nokta Audit Widget` ile müşteri aynı zamanda bir geliştirici rolünü üstlenebilir.

Bu projede tespit edilen use case şu şekildedir:  
Müşteri (kullanıcı), uygulamayı deneyimlerken sadece hataları değil, **"Burada X olsa daha güzel olurdu"** diyerek direkt geliştirme ve feature taleplerini de uygulamanın ekranı üzerinden işaretleyerek iletebilir. Böylece, raporlar sadece "hata ayıklama" (debugging) aracı olmaktan çıkıp, otonom agent'ın doğrudan üzerinde çalışıp yeni özellikler geliştirebileceği **canlı bir tasarım/geliştirme kanalı** haline gelmektedir.

Bu süreç, agent'ın `FORGE.md` ve `EVAL.md` üzerinden ratchet sistemiyle öğrenerek otonom kalmasını destekler.
