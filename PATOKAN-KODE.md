# PATOKAN KODE - TCS Mascot

Dokumen ini = "kamus kode" maskot. Semua file di folder ini dibuat dari aturan yang sama.
Kalau mau bikin animasi / pose baru, pakai angka dan potongan kode di sini supaya hasilnya tetap mirip referensi.

## 1. Dasar
- Canvas `viewBox="0 0 440 560"`, titik tengah badan `x = 220` (tampak depan).
- Sumber bentuk asli: `tcs-mascot-reference.svg` (tampak depan neutral = identik dengan file ini, `depan-normal.svg`).
- Warna: bulu `#FFFFFF #F1EFFF #CFC9FF`, lavender `#B9B3F5`, telinga `#2A2080 #120D38` + `#6D4CFF #A98CFF`,
  hoodie `#1F1B5C #120F33 #0E0C26`, biru aksen `#2B8CFF #5AA8FF`, mata `#0A0D3A #1D3FD0 #3B82FF`, pink `#FF6FAE #FF9EC7`.

## 2. Struktur bagian (id)
```
BAGIAN (id) tampak depan, dari belakang ke depan:
   #shadow  #tail  #hood-back  #legs  #body (+#logo-tcs)  #sleeves  #hands
   #ears  #head-tufts  #head  #ear-tufts  #face (#eye-left #eye-right #mouth)
BAGIAN (id) tampak samping / jalan, dari belakang ke depan:
   #shadow  #tail  #arm-far  #leg-far  #leg-near  #upper (isi: #hood-back #body
   #arm-near #ears #head-tufts #head #ear-tufts #face(#eye-near) )
```

## 3. Ekspresi = hanya wajah yang diganti
Yang berubah per ekspresi: **mata kiri, mata kanan, mulut, efek**. Hidung, tanda dahi, dan goresan pipi tetap.
Koordinat mata depan: kiri `cx=160`, kanan `cx=280`, `cy=208`. Mulut berpusat di `x=220`.
Di `tcs-mascot-kit-ekspresi.svg` ketujuh wajah ada dalam satu file (`#face-normal`, `#face-happy`, ...).

### normal
- Dipakai untuk: ekspresi DEFAULT: idle, jalan, dan semua pose dasar
- Mata: terbuka bulat penuh: elips luar 30x38, iris gradasi biru, pupil gelap 15x21, highlight putih besar (kiri atas) + kecil (kanan bawah), alis melengkung lembut
- Mulut: terbuka kecil pink + 2 taring + lidah pink (mulut default referensi)
- Efek: tidak ada

Mata kiri (`cx=160`):
```xml
<g>
      <ellipse cx="160" cy="208" rx="30" ry="38" fill="#0A0D3A"/>
      <ellipse cx="160" cy="216" rx="25" ry="31" fill="url(#eyeIris)"/>
      <ellipse cx="160" cy="210" rx="15" ry="21" fill="#06082A"/>
      <circle cx="151" cy="194" r="8.5" fill="#FFFFFF"/>
      <circle cx="172" cy="228" r="4" fill="#FFFFFF" opacity="0.85"/>
      <path d="M130 200 Q140 172 166 172 Q184 174 190 190" fill="none" stroke="#05061F" stroke-width="5" stroke-linecap="round"/>
    </g>
```
Mata kanan (`cx=280`):
```xml
<g>
      <ellipse cx="280" cy="208" rx="30" ry="38" fill="#0A0D3A"/>
      <ellipse cx="280" cy="216" rx="25" ry="31" fill="url(#eyeIris)"/>
      <ellipse cx="280" cy="210" rx="15" ry="21" fill="#06082A"/>
      <circle cx="271" cy="194" r="8.5" fill="#FFFFFF"/>
      <circle cx="292" cy="228" r="4" fill="#FFFFFF" opacity="0.85"/>
      <path d="M310 200 Q300 172 274 172 Q256 174 250 190" fill="none" stroke="#05061F" stroke-width="5" stroke-linecap="round"/>
    </g>
```
Mulut:
```xml
<g id="mouth">
      <path d="M194 250 Q220 245 246 250 Q244 282 220 286 Q196 282 194 250 Z" fill="#FF6FAE" stroke="#5A1F55" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="220" cy="274" rx="15" ry="8" fill="#FF9EC7"/>
      <path d="M199 251 L208 250.5 L203 261 Z" fill="#FFFFFF"/>
      <path d="M241 251 L232 250.5 L237 261 Z" fill="#FFFFFF"/>
    </g>
```
Efek: tidak ada.

### happy
- Dipakai untuk: senang / berhasil / selesai
- Mata: kedua mata menutup jadi busur ke atas, garis tebal 7px: M(cx-27) 216 Q cx 170 (cx+27) 216
- Mulut: terbuka lebar, 2 taring lebih besar, lidah pink besar
- Efek: 4 garis kuning kecil di kiri-kanan atas kepala

Mata kiri (`cx=160`):
```xml
<path d="M133 216 Q160 170 187 216" fill="none" stroke="#05061F" stroke-width="7" stroke-linecap="round"/>
```
Mata kanan (`cx=280`):
```xml
<path d="M253 216 Q280 170 307 216" fill="none" stroke="#05061F" stroke-width="7" stroke-linecap="round"/>
```
Mulut:
```xml
<g id="mouth">
      <path d="M188 246 Q220 240 252 246 Q254 292 220 298 Q186 292 188 246 Z" fill="#FF6FAE" stroke="#5A1F55" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="220" cy="284" rx="19" ry="9.5" fill="#FF9EC7"/>
      <path d="M193 247 L206 246.5 L199 260 Z" fill="#FFFFFF"/>
      <path d="M247 247 L234 246.5 L241 260 Z" fill="#FFFFFF"/>
    </g>
```
Efek:
```xml
<g stroke="#FFC93C" stroke-width="5" stroke-linecap="round" fill="none"><path d="M40 120 L58 134"/><path d="M32 150 L56 152"/><path d="M400 120 L382 134"/><path d="M408 150 L384 152"/></g>
```

### wink
- Dipakai untuk: ngedip / godain / "oke!"
- Mata: mata KIRI terbuka normal; mata KANAN menutup jadi busur ke atas (sama seperti happy)
- Mulut: sama seperti normal
- Efek: 2 garis biru di kanan atas kepala

Mata kiri (`cx=160`):
```xml
<g>
      <ellipse cx="160" cy="208" rx="30" ry="38" fill="#0A0D3A"/>
      <ellipse cx="160" cy="216" rx="25" ry="31" fill="url(#eyeIris)"/>
      <ellipse cx="160" cy="210" rx="15" ry="21" fill="#06082A"/>
      <circle cx="151" cy="194" r="8.5" fill="#FFFFFF"/>
      <circle cx="172" cy="228" r="4" fill="#FFFFFF" opacity="0.85"/>
      <path d="M130 200 Q140 172 166 172 Q184 174 190 190" fill="none" stroke="#05061F" stroke-width="5" stroke-linecap="round"/>
    </g>
```
Mata kanan (`cx=280`):
```xml
<path d="M253 216 Q280 170 307 216" fill="none" stroke="#05061F" stroke-width="7" stroke-linecap="round"/>
```
Mulut:
```xml
<g id="mouth">
      <path d="M194 250 Q220 245 246 250 Q244 282 220 286 Q196 282 194 250 Z" fill="#FF6FAE" stroke="#5A1F55" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="220" cy="274" rx="15" ry="8" fill="#FF9EC7"/>
      <path d="M199 251 L208 250.5 L203 261 Z" fill="#FFFFFF"/>
      <path d="M241 251 L232 250.5 L237 261 Z" fill="#FFFFFF"/>
    </g>
```
Efek:
```xml
<g stroke="#3B82FF" stroke-width="5" stroke-linecap="round" fill="none"><path d="M394 118 L412 108"/><path d="M396 142 L420 140"/></g>
```

### surprised
- Dipakai untuk: kaget / notifikasi / error ringan
- Mata: kedua mata membesar (elips 33x42), pupil mengecil jadi 11x16, alis naik 16px dari posisi normal
- Mulut: bulat kecil "o" (elips 11x15) dengan dalam pink muda
- Efek: 2 tanda seru ungu di kanan atas

Mata kiri (`cx=160`):
```xml
<g>
      <ellipse cx="160" cy="208" rx="33" ry="42" fill="#0A0D3A"/>
      <ellipse cx="160" cy="215" rx="28" ry="35" fill="url(#eyeIris)"/>
      <ellipse cx="160" cy="210" rx="11" ry="16" fill="#06082A"/>
      <circle cx="150" cy="192" r="9.5" fill="#FFFFFF"/>
      <circle cx="173" cy="230" r="4.5" fill="#FFFFFF" opacity="0.85"/>
      <path d="M130 184 Q140 156 166 156 Q184 158 190 174" fill="none" stroke="#05061F" stroke-width="5" stroke-linecap="round"/>
    </g>
```
Mata kanan (`cx=280`):
```xml
<g>
      <ellipse cx="280" cy="208" rx="33" ry="42" fill="#0A0D3A"/>
      <ellipse cx="280" cy="215" rx="28" ry="35" fill="url(#eyeIris)"/>
      <ellipse cx="280" cy="210" rx="11" ry="16" fill="#06082A"/>
      <circle cx="270" cy="192" r="9.5" fill="#FFFFFF"/>
      <circle cx="293" cy="230" r="4.5" fill="#FFFFFF" opacity="0.85"/>
      <path d="M310 184 Q300 156 274 156 Q256 158 250 174" fill="none" stroke="#05061F" stroke-width="5" stroke-linecap="round"/>
    </g>
```
Mulut:
```xml
<g id="mouth">
      <ellipse cx="220" cy="268" rx="11" ry="15" fill="#FF6FAE" stroke="#5A1F55" stroke-width="2.5"/>
      <ellipse cx="220" cy="274" rx="6" ry="7" fill="#FF9EC7"/>
    </g>
```
Efek:
```xml
<g fill="#B04BFF"><g transform="rotate(14 384 70)"><rect x="378" y="38" width="12" height="38" rx="6"/><circle cx="384" cy="92" r="6.5"/></g><g transform="rotate(14 412 84)"><rect x="407" y="56" width="10" height="30" rx="5"/><circle cx="412" cy="99" r="5.5"/></g></g>
```

### sleepy
- Dipakai untuk: tidur / idle lama / loading panjang
- Mata: kedua mata menutup jadi garis lengkung ke bawah (U), tebal 6px: M(cx-27) 204 Q cx 228 (cx+27) 204
- Mulut: garis kecil bergelombang (tanpa taring)
- Efek: huruf "Z" besar + "z" kecil warna biru di kanan atas

Mata kiri (`cx=160`):
```xml
<path d="M133 204 Q160 228 187 204" fill="none" stroke="#05061F" stroke-width="6" stroke-linecap="round"/>
```
Mata kanan (`cx=280`):
```xml
<path d="M253 204 Q280 228 307 204" fill="none" stroke="#05061F" stroke-width="6" stroke-linecap="round"/>
```
Mulut:
```xml
<g id="mouth">
      <path d="M205 259 Q212.5 266 220 259 Q227.5 266 235 259" fill="none" stroke="#5A1F55" stroke-width="3" stroke-linecap="round"/>
    </g>
```
Efek:
```xml
<g font-family="Arial, Helvetica, sans-serif" font-weight="800" font-style="italic" fill="#6D8CFF"><text x="372" y="84" font-size="40">Z</text><text x="406" y="48" font-size="26">z</text></g>
```

### angry
- Dipakai untuk: marah / error berat / peringatan
- Mata: mata terpotong garis alis miring ke dalam (clipPath poligon), pupil mengecil 12x18, alis tebal 7px
- Mulut: terbuka dengan 2 taring + lidah kecil, bentuk lebih lebar-datar
- Efek: tanda urat merah (4 lengkung) di dahi kanan

Mata kiri (`cx=160`):
```xml
<g>
      <clipPath id="clipL160"><polygon points="120,172 200,208 200,262 120,262"/></clipPath>
      <g clip-path="url(#clipL160)">
        <ellipse cx="160" cy="210" rx="30" ry="38" fill="#0A0D3A"/>
        <ellipse cx="160" cy="218" rx="25" ry="31" fill="url(#eyeIris)"/>
        <ellipse cx="160" cy="216" rx="12" ry="18" fill="#06082A"/>
        <circle cx="153" cy="206" r="6.5" fill="#FFFFFF"/>
        <circle cx="171" cy="230" r="3.5" fill="#FFFFFF" opacity="0.85"/>
      </g>
      <path d="M126 176 Q160 184 192 206" fill="none" stroke="#05061F" stroke-width="7" stroke-linecap="round"/>
    </g>
```
Mata kanan (`cx=280`):
```xml
<g>
      <clipPath id="clipR280"><polygon points="320,172 240,208 240,262 320,262"/></clipPath>
      <g clip-path="url(#clipR280)">
        <ellipse cx="280" cy="210" rx="30" ry="38" fill="#0A0D3A"/>
        <ellipse cx="280" cy="218" rx="25" ry="31" fill="url(#eyeIris)"/>
        <ellipse cx="280" cy="216" rx="12" ry="18" fill="#06082A"/>
        <circle cx="273" cy="206" r="6.5" fill="#FFFFFF"/>
        <circle cx="291" cy="230" r="3.5" fill="#FFFFFF" opacity="0.85"/>
      </g>
      <path d="M314 176 Q280 184 248 206" fill="none" stroke="#05061F" stroke-width="7" stroke-linecap="round"/>
    </g>
```
Mulut:
```xml
<g id="mouth">
      <path d="M194 262 Q220 250 246 262 Q242 286 220 288 Q198 286 194 262 Z" fill="#FF6FAE" stroke="#5A1F55" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M200 262 L209 260 L205 271 Z" fill="#FFFFFF"/>
      <path d="M240 262 L231 260 L235 271 Z" fill="#FFFFFF"/>
      <ellipse cx="220" cy="279" rx="11" ry="5" fill="#FF9EC7"/>
    </g>
```
Efek:
```xml
<g stroke="#FF3B4A" stroke-width="5" stroke-linecap="round" fill="none" transform="translate(338 128)"><path d="M-17 -17 Q-5 -12 -3 -1"/><path d="M17 -17 Q5 -12 3 -1"/><path d="M-17 17 Q-5 12 -3 1"/><path d="M17 17 Q5 12 3 1"/></g>
```

### sad
- Dipakai untuk: sedih / gagal / kosong
- Mata: mata besar berkaca (highlight besar r=11, pupil normal), alis naik ke arah dalam
- Mulut: cemberut kecil terbuka (bentuk "w" terbalik)
- Efek: 2 tetes air mata biru di bawah tiap mata

Mata kiri (`cx=160`):
```xml
<g>
      <ellipse cx="160" cy="211" rx="30" ry="38" fill="#0A0D3A"/>
      <ellipse cx="160" cy="219" rx="25" ry="31" fill="url(#eyeIris)"/>
      <ellipse cx="160" cy="214" rx="15" ry="21" fill="#06082A"/>
      <circle cx="152" cy="198" r="11" fill="#FFFFFF"/>
      <circle cx="171" cy="231" r="5.5" fill="#FFFFFF" opacity="0.9"/>
      <path d="M130 200 Q152 186 188 164" fill="none" stroke="#05061F" stroke-width="5" stroke-linecap="round"/>
      <path d="M146 246 Q138 262 146 270 Q154 262 146 246 Z" fill="#7DB8FF"/>
      <path d="M174 252 Q168 264 174 270 Q180 264 174 252 Z" fill="#7DB8FF" opacity="0.85"/>
    </g>
```
Mata kanan (`cx=280`):
```xml
<g>
      <ellipse cx="280" cy="211" rx="30" ry="38" fill="#0A0D3A"/>
      <ellipse cx="280" cy="219" rx="25" ry="31" fill="url(#eyeIris)"/>
      <ellipse cx="280" cy="214" rx="15" ry="21" fill="#06082A"/>
      <circle cx="272" cy="198" r="11" fill="#FFFFFF"/>
      <circle cx="291" cy="231" r="5.5" fill="#FFFFFF" opacity="0.9"/>
      <path d="M310 200 Q288 186 252 164" fill="none" stroke="#05061F" stroke-width="5" stroke-linecap="round"/>
      <path d="M266 246 Q258 262 266 270 Q274 262 266 246 Z" fill="#7DB8FF"/>
      <path d="M294 252 Q288 264 294 270 Q300 264 294 252 Z" fill="#7DB8FF" opacity="0.85"/>
    </g>
```
Mulut:
```xml
<g id="mouth">
      <path d="M204 277 Q212 262 220 267 Q228 262 236 277 Q220 270 204 277 Z" fill="#FF6FAE" stroke="#5A1F55" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
```
Efek: tidak ada.

## 4. Tampak samping
Hanya 1 mata (mata dekat). Kode mata depan dipakai ulang lalu dipipihkan:
```xml
<g id="eye-near" transform="translate(272 0) scale(.78 1) translate(-280 0)"> ...kode mata kanan... </g>
<g transform="translate(336 0) scale(.7 1) translate(-220 0)"> ...hidung... </g>
<g transform="translate(309 0) scale(.55 1) translate(-220 0)"> ...mulut... </g>
```
Tampak kiri: bungkus seluruh adegan dengan `<g transform="translate(440 0) scale(-1 1)">`.
Logo TCS dibalik lagi: `translate(524 0) scale(-1 1)` supaya tulisan tidak terbalik.

## 5. Animasi jalan
```
TITIK PUTAR ANIMASI JALAN (koordinat canvas 440x560, satuan derajat):
   #leg-near  rotate +22 <-> -22   pivot (222,456)
   #leg-far   kebalikan leg-near   pivot (234,456)
   #arm-near  kebalikan leg-near, amplitudo 26    pivot (222,350)
   #arm-far   kebalikan arm-near   pivot (222,350)
   #tail      rotate +3 <-> -3     pivot (180,430)
   #upper     naik-turun 0 -> -5px -> 0, 2x per siklus (periode = setengah siklus)
   Siklus 1 langkah penuh = 0.9 detik, easing spline .37 0 .63 1 (halus di ujung ayunan)
```
Contoh kode SMIL (kaki dekat):
```xml
<g id="leg-near">
  <animateTransform attributeName="transform" type="rotate"
    values="22 222 456;-22 222 456;22 222 456" dur="0.9s" repeatCount="indefinite"
    calcMode="spline" keyTimes="0;0.5;1" keySplines=".37 0 .63 1;.37 0 .63 1"/>
  ...bentuk kaki...
</g>
```
Untuk sprite/frame: pakai folder `frame-jalan-*` (8 frame, sudut = amplitudo x cos(2*pi*frame/8),
naik-turun badan = -5 x (1 - cos(2*theta)) / 2).

## 6. Aturan bentuk (jangan dilanggar)
- Tidak ada kuku / cakar. Tangan dan kaki bulat halus.
- Bulu = gumpalan lancip (tuft), bukan helai.
- Mulut terbuka pink dengan 2 taring kecil di atas (kecuali sleepy).
- Telinga: luar navy gelap, dalam ungu gradasi, tinggi, lancip.
- Logo TCS di dada selalu ada, swoosh biru melengkung di kanan teks.
