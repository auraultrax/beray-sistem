# Atatürk Ortaokulu — Okul Yönetim Platformu

GitHub Pages + Firebase Firestore tabanlı PWA başlangıcı.

## İçerik
- Öğretmen girişi: kayıtlı öğretmen adını seç → özel öğretmen paneli
- Yönetici: doğrudan yönetim paneli
- 5–8. sınıf, A–M şubeleri
- Her 52 şube için 30 ayrı öğrenci (1.560 benzersiz örnek kayıt)
- Yoklama: Var/Yok, toplu Var/Yok, Firestore kayıt
- Öğretmen silme
- Otomatik/yeniden karıştırılabilir ders programı motoru için başlangıç akışı
- Dashboard, devamsızlık, rapor/CSV, duyurular, ayarlar
- PWA manifest + service worker

## GitHub Pages
Dosyaları repo köküne koyun ve Settings → Pages üzerinden `main` / root yayınlayın. HTTPS altında Chrome'da uygulama kurulabilir.

## Güvenlik uyarısı
`firestore.rules` içindeki `if true` kuralları yalnızca geliştirme içindir. Öğrenci ve öğretmen verisi içeren gerçek kullanımda Authentication ve rol tabanlı Firestore Rules kurulmadan canlıya çıkmayın.
