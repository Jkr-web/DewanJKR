# Panduan Ujian - Portal Pengurusan Dewan

## Langkah-langkah Ujian Data Collection

### 1. Bersihkan Data Lama (Opsional)
Buka konsol browser (F12) dan jalankan:
```javascript
localStorage.removeItem('dewanData');
location.reload();
```

### 2. Log In
- **Username:** admin
- **Password:** admin123
- Klik "Log Masuk"

### 3. Tambah Kategori (Opsional)
- Pergi ke "Senarai Peralatan"
- Klik "Tambah Kategori"
- Isikan nama kategori (contoh: "Perabot")
- Klik "Hantar"

### 4. Tambah Peralatan (Opsional)
- Masih di halaman "Senarai Peralatan"
- Klik "Tambah Peralatan"
- Isikan maklumat peralatan
- Pilih kategori
- Klik "Hantar"

### 5. **UJIAN UTAMA: Tambah Permohonan**
- Pergi ke halaman "Senarai Permohonan"
- Klik "Tambah Permohonan"
- Isikan form dengan data:
  - **Nama Pemohon:** Ahmad Bin Ali
  - **Email:** ahmad@example.com
  - **No. Telefon:** 01234567890
  - **Cawangan:** Kota Belud
  - **Jenis Permohonan:** Pilih "Dewan" atau "Peralatan"
  - **Item:** Pilih item yang relevan
  - **Tarikh Mula Pinjam:** Tanggal hari ini
  - **Tarikh Pulang:** Tanggal esok hari
  - **Tujuan:** Acara sambutan
  - Klik "Hantar Permohonan"

### 6. Verifikasi Data
Selepas klik "Hantar Permohonan":
- ✅ Mesej kejayaan harus muncul
- ✅ Senarai Permohonan harus auto-refresh
- ✅ Data baru harus terlihat dalam jadual
- ✅ Kolom yang tertampil:
  - Pemohon
  - Email
  - No. Telefon
  - Cawangan
  - Item
  - Tarikh Pinjam
  - Tarikh Pulang
  - Status
  - Tindakan

### 7. Ujian Filter Tarikh (Opsional)
- Tetapkan "Tarikh Mula" dan "Tarikh Akhir"
- Klik "Filter"
- Verifikasi hanya data dalam julat menunjukkan
- Klik "Reset" untuk menunjukkan semua data

### 8. Ujian Tindakan
- Klik butang "Urus" di baris data
- Ubah Status (contoh: "Dalam Proses" → "Selesai")
- Tambah catatan admin (opsional)
- Klik "Hantar Perubahan"
- Verifikasi status berubah di jadual

## Apa yang Harus Berfungsi Selepas Fix:

1. ✅ Data automatik disimpan ke localStorage saat form dihantar
2. ✅ Jadual automatik di-refresh dengan data baru
3. ✅ Filter tarikh bekerja dengan betul
4. ✅ Kolom menunjukkan data dengan format yang betul
5. ✅ Tombol tindakan (Selesai, Urus, Padam) berfungsi

## Debug Information

Jika ada masalah, buka konsol browser (F12) dan cari:
- "🔄 DataStore Notify: refreshing UI" - Menunjukkan data sedang di-refresh
- "✅ renderPermohonan" - Data sedang dirender ke jadual
- "❌ Error messages" - Jika ada masalah

## Perubahan Teknikal yang Dibuat

1. **Perbaiki Filter IDs** - Sesuaikan dengan HTML yang sebenarnya
2. **Tambah Safety Checks** - Cegah crash jika elemen DOM tidak ada
3. **Perbaiki Null Checks** - Render functions sekarang lebih robust

Semua perubahan dirancang untuk memastikan data dari form automatik muncul di jadual "SENARAI PERMOHONAN".
