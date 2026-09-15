# Yoklama Yönetim Sistemi

GitHub Pages üzerinde çalışacak PWA başlangıç sürümü.

## GitHub
1. Bu klasördeki tüm dosyaları GitHub repository'sinin köküne yükle.
2. **Settings → Pages → Deploy from branch → main / root** seç.
3. HTTPS adresini Chrome'da aç.
4. Chrome menüsünden **Yükle / Install app** seçeneğini kullan.

## Firebase
`firebase-config.js` senin verdiğin Firebase projesine bağlanır ve Firestore kullanır.

## Firestore koleksiyonları
- `teachers`
- `attendance`

## Önemli
`firestore.rules` içindeki `allow true` yalnızca ilk kurulum/test içindir. Gerçek okul verileri için Firebase Authentication ile yönetici ve öğretmen rollerine göre Security Rules yazılmalıdır.
