# TCS Mascot 3D Studio

Tahap fondasi animasi maskot TCS. Versi ini hanya mengaktifkan sistem **Idle**.

## Prinsip teknis

- Model sumber `TCS_Mascot_3D.glb` dipertahankan apa adanya.
- Tidak membangun ulang skeleton, tidak memindahkan mesh, dan tidak membuat pivot anggota tubuh berdasarkan tebakan nama.
- Seluruh gerakan Idle diterapkan pada satu `THREE.Group` induk.
- Gerakan awal dibatasi pada bob vertikal kecil dan yaw halus agar semua mesh tetap menyatu.
- Gerakan dihitung menggunakan delta time dan berhenti saat tab browser tidak aktif.
- Fitur selain Idle belum diaktifkan pada fase ini.

## Menjalankan

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
