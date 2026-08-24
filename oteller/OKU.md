# pixelform — örnek siteler vitrini

`otel-1` … `otel-6` klasörlerindeki 6 sitenin tamamını tek bir sayfada, yatay
akan bir vitrin olarak gösterir. Ortadaki site **%100** ölçekte ve **canlıdır**
(içinde aşağı kaydırılır, menüleri, formları çalışır); sağdan gelen ve sola
giden siteler **%70** ölçeğe iner, daha küçülmez.

## Nasıl çalıştırılır

`index.html` dosyasını çift tıklamak yerine küçük bir yerel sunucu kullan —
iframe'ler tarayıcıların `file://` kısıtları yüzünden bazen boş kalır.

```bash
python -m http.server 5510
```

Sonra tarayıcıda: `http://localhost:5510`

Node tarafını tercih edersen:

```bash
npx serve -l 5510 .
```

## Yayına alma

Klasörün tamamını (bu 3 dosya + 6 otel klasörü) herhangi bir statik hosting'e
yükle: Netlify, Vercel, GitHub Pages, cPanel… Yapılandırma gerekmez, tüm yollar
görecelidir.

## Kullanım

| Hareket | Sonuç |
|---|---|
| Yatay kaydırma / parmakla sürükleme | Siteler arasında geçiş |
| Fare tekerleği (kart dışında) | Sonraki / önceki site |
| Ortadaki sitenin üzerinde kaydırma | O sitenin **kendi içinde** gezinme |
| Yandaki bir karta tıklama | O siteyi ortaya getirir |
| `←` `→` `1`–`6` `Home` `End` | Klavye ile geçiş |
| Üstteki **Masaüstü / Mobil** | Siteleri 1440px veya 390px genişlikte gösterir |
| Kart üstündeki ↗ | Siteyi yeni sekmede tam ekran açar |
| Adres çubuğundaki `#3` | Doğrudan 3. site ile açılır (sunumda link vermek için) |

## Mobil performans

- Aynı anda yalnızca **aktif site ve komşuları** belleğe yüklenir (telefonda 3,
  masaüstünde 5). Uzaklaşan siteler boşaltılır, yaklaşınca yeniden yüklenir.
- Ölçek hesabı her karede tek bir `scrollLeft` okumasıyla yapılır; hiç
  `getBoundingClientRect` çağrılmaz, dolayısıyla layout tetiklenmez.
- Kaydırma tarayıcının kendi `scroll-snap` motoruyla yapılır, JS ile taklit
  edilmez. Yalnızca `transform` ve `opacity` değişir — ikisi de GPU üzerinde.
- Telefonda kartlar siteyi 390px genişlikte, yani gerçek mobil düzeninde çizer.

## Yeni örnek eklemek

`script.js` içindeki `SITES` dizisine bir satır ekle, başka hiçbir yeri
değiştirmeye gerek yok — kart, nokta, sayaç ve yükleme mantığı otomatik oluşur:

```js
{
  file: "otel-7/index.html",
  name: "Yeni Tasarım",
  desc: "Tek cümlelik açıklama.",
  url: "kumsalotel.com/yeni",
  color: "#7cc4ff"        // kartın yükleme rengi + arka plan ışıması
}
```

## Ayarlar

`script.js` en üstte:

- `MIN_SCALE = 0.70` → kenardaki sitelerin ölçeği
- `LOGICAL` → sitelerin hangi genişlikte çizileceği (masaüstü 1440, mobil 390)
- `ASPECT` → kart en–boy oranı
