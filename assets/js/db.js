/**
 * Database Layer & State Management (db.js)
 * Khusus Sistem Presensi Latihan PMR Wira SMKN 7 Samarinda
 * Sesi: Kelas 10 (Wira Mula) & Kelas 11 (Wira Madya)
 * 
 * Mendukung penyimpanan lokal (LocalStorage) yang dinamis
 * dan siap dihubungkan langsung ke PHP & MySQL.
 */

const PMR_DB = (function() {
  const STORAGE_KEY_MEMBERS = 'pmr_db_members_v2';
  const STORAGE_KEY_ATTENDANCE = 'pmr_db_attendance_v2';

  // Seed Data Awal jika LocalStorage belum ada data
  const defaultMembers = [
    // === ANGGOTA KELAS 10 (Wira Mula) ===
    { id: 101, nisn: "0091238841", name: "Achmad Dhani Saputra", gender: "L", class: "X RPL 1", level: "10", phone: "0821-9922-3341", status: "Aktif" },
    { id: 102, nisn: "0092347712", name: "Zahra Aulia Rahmadhani", gender: "P", class: "X RPL 2", level: "10", phone: "0851-2299-4411", status: "Aktif" },
    { id: 103, nisn: "0093456723", name: "Fathir Maulana Ihsan", gender: "L", class: "X TKJ 1", level: "10", phone: "0822-7711-4455", status: "Aktif" },
    { id: 104, nisn: "0094567891", name: "Naufal Hadi Wijaya", gender: "L", class: "X DKV 1", level: "10", phone: "0852-8899-1122", status: "Aktif" },
    { id: 105, nisn: "0095678902", name: "Keisha Aurellia Maharani", gender: "P", class: "X DKV 2", level: "10", phone: "0851-4433-2211", status: "Aktif" },
    { id: 106, nisn: "0096789013", name: "Cinta Laura Safitri", gender: "P", class: "X AKL 1", level: "10", phone: "0853-1122-3344", status: "Aktif" },
    { id: 107, nisn: "0097890124", name: "Mutia Dewi Kusuma", gender: "P", class: "X RPL 1", level: "10", phone: "0822-3344-5566", status: "Aktif" },
    { id: 108, nisn: "0098901235", name: "Adinda Putri Rahayu", gender: "P", class: "X TKJ 2", level: "10", phone: "0812-7788-9900", status: "Aktif" },
    { id: 109, nisn: "0099012346", name: "Salsabila Firdausi", gender: "P", class: "X DKV 1", level: "10", phone: "0853-9900-1122", status: "Aktif" },
    { id: 110, nisn: "0099123457", name: "Rian Hidayatulloh", gender: "L", class: "X TKJ 1", level: "10", phone: "0823-1199-0022", status: "Aktif" },
    { id: 111, nisn: "0099234568", name: "Nabila Syahrani", gender: "P", class: "X AKL 2", level: "10", phone: "0813-8877-6655", status: "Aktif" },
    { id: 112, nisn: "0099345679", name: "Bima Arya Sena", gender: "L", class: "X RPL 2", level: "10", phone: "0852-6655-4433", status: "Aktif" },

    // === ANGGOTA KELAS 11 (Wira Madya) ===
    { id: 201, nisn: "0081239845", name: "Dinda Ayu Lestari", gender: "P", class: "XI RPL 2", level: "11", phone: "0852-4411-9923", status: "Aktif" },
    { id: 202, nisn: "0082390144", name: "Rizky Aditya Pratama", gender: "L", class: "XI TKJ 1", level: "11", phone: "0813-5002-3490", status: "Aktif" },
    { id: 203, nisn: "0083419087", name: "Siti Nurul Hidayah", gender: "P", class: "XI AKL 1", level: "11", phone: "0822-5531-8840", status: "Aktif" },
    { id: 204, nisn: "0084561234", name: "Tiara Melani Putri", gender: "P", class: "XI DKV 2", level: "11", phone: "0812-5100-7734", status: "Aktif" },
    { id: 205, nisn: "0085671190", name: "Dimas Arya Ramadhan", gender: "L", class: "XI RPL 1", level: "11", phone: "0813-4412-8877", status: "Aktif" },
    { id: 206, nisn: "0086789012", name: "Khadijah Al-Zahra", gender: "P", class: "XI AKL 2", level: "11", phone: "0812-3344-5566", status: "Aktif" },
    { id: 207, nisn: "0087890123", name: "Salwa Nabila Firdaus", gender: "P", class: "XI RPL 1", level: "11", phone: "0813-7766-5544", status: "Aktif" },
    { id: 208, nisn: "0088901235", name: "Gilang Ramadhan", gender: "L", class: "XI TKJ 2", level: "11", phone: "0812-9988-7766", status: "Aktif" },
    { id: 209, nisn: "0089012346", name: "Bayu Aji Pamungkas", gender: "L", class: "XI RPL 2", level: "11", phone: "0813-2233-4455", status: "Aktif" },
    { id: 210, nisn: "0080123458", name: "Fajar Siddiq Maulana", gender: "L", class: "XI AKL 1", level: "11", phone: "0821-8899-0011", status: "Aktif" },
    { id: 211, nisn: "0080234569", name: "Rara Anindita", gender: "P", class: "XI DKV 1", level: "11", phone: "0852-1122-8899", status: "Aktif" },
    { id: 212, nisn: "0080345670", name: "Aldi Wahyu Pratama", gender: "L", class: "XI TKJ 1", level: "11", phone: "0812-4433-2211", status: "Aktif" }
  ];

  // Inisialisasi Data jika kosong
  function initData() {
    if (!localStorage.getItem(STORAGE_KEY_MEMBERS)) {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(defaultMembers));
    }
    if (!localStorage.getItem(STORAGE_KEY_ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify({}));
    }
  }

  initData();

  // Ambil Semua Anggota
  function getMembers(level = null) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY_MEMBERS) || '[]');
    if (!level || level === 'all') return list;
    return list.filter(m => m.level === String(level));
  }

  // Tambah Anggota Baru
  function addMember(member) {
    const list = getMembers();
    const newId = Date.now();
    const newMember = {
      id: newId,
      nisn: member.nisn || `009${Math.floor(1000000 + Math.random() * 9000000)}`,
      name: member.name.trim(),
      gender: member.gender || 'L',
      class: member.class || (member.level === '10' ? 'X RPL 1' : 'XI RPL 1'),
      level: String(member.level),
      phone: member.phone || '-',
      status: 'Aktif'
    };
    list.push(newMember);
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(list));
    return newMember;
  }

  // Cari Anggota dengan Autocomplete (Mencocokkan nama / NISN dari beberapa huruf awal)
  function searchMembers(keyword, level = null) {
    if (!keyword || keyword.trim().length === 0) return [];
    const q = keyword.toLowerCase().trim();
    const list = getMembers(level);
    return list.filter(m => {
      return m.name.toLowerCase().includes(q) || m.nisn.includes(q) || m.class.toLowerCase().includes(q);
    });
  }

  // Ambil data presensi untuk tanggal dan sesi tertentu
  // Format key: "YYYY-MM-DD_level" contoh: "2026-10-09_10"
  function getAttendanceSheet(date, level) {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || '{}');
    const key = `${date}_${level}`;
    const members = getMembers(level);

    if (store[key]) {
      // Pastikan semua anggota pada sesi ada di catatan
      const records = store[key];
      return members.map(m => {
        const found = records.find(r => r.memberId === m.id);
        return {
          memberId: m.id,
          name: m.name,
          nisn: m.nisn,
          class: m.class,
          level: m.level,
          status: found ? found.status : 'Belum', // Hadir, Izin, Sakit, Alpa, Belum
          time: found ? found.time : '-',
          note: found ? found.note : '',
          signature: found && found.signature ? found.signature : null
        };
      });
    }

    // Default jika belum pernah diabsen pada tanggal tersebut
    return members.map(m => ({
      memberId: m.id,
      name: m.name,
      nisn: m.nisn,
      class: m.class,
      level: m.level,
      status: 'Belum',
      time: '-',
      note: '',
      signature: null
    }));
  }

  // Simpan data presensi sesi keseluruhan
  function saveAttendanceSheet(date, level, records) {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || '{}');
    const key = `${date}_${level}`;
    store[key] = records;
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(store));
    return true;
  }

  // Simpan Presensi Individu (Mandiri oleh Siswa)
  function saveIndividualAttendance(date, level, memberId, status, time, note = '', signature = null) {
    const sheet = getAttendanceSheet(date, level);
    const target = sheet.find(m => m.memberId === memberId);
    if (!target) return null;

    target.status = status;
    target.time = time;
    target.note = note;
    if (signature) {
      target.signature = signature;
    }

    saveAttendanceSheet(date, level, sheet);
    return target;
  }

  // Ambil riwayat semua tanggal yang pernah melakukan presensi
  function getAllHistoryDates() {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || '{}');
    const keys = Object.keys(store);
    const result = [];

    keys.forEach(key => {
      const parts = key.split('_');
      const date = parts[0];
      const level = parts[1];
      const records = store[key];
      const hadir = records.filter(r => r.status === 'Hadir').length;
      const izin = records.filter(r => r.status === 'Izin').length;
      const sakit = records.filter(r => r.status === 'Sakit').length;
      const alpa = records.filter(r => r.status === 'Alpa').length;
      const total = records.length;

      result.push({
        key,
        date,
        level,
        levelName: level === '10' ? 'Sesi Kelas 10 (Wira Mula)' : 'Sesi Kelas 11 (Wira Madya)',
        total,
        hadir,
        izin,
        sakit,
        alpa,
        persentase: total > 0 ? Math.round((hadir / total) * 100) : 0
      });
    });

    // Urutkan dari tanggal terbaru
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }

  // Seed default history untuk demonstrasi awal jika riwayat masih kosong
  function seedDefaultHistoryIfEmpty() {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || '{}');
    if (Object.keys(store).length === 0) {
      const today = new Date().toISOString().split('T')[0];
      
      // Seed Kelas 10 Hari ini
      const k10 = getMembers('10').map((m, idx) => ({
        memberId: m.id,
        name: m.name,
        nisn: m.nisn,
        class: m.class,
        level: m.level,
        status: idx === 3 ? 'Izin' : idx === 6 ? 'Sakit' : 'Hadir',
        time: idx === 3 || idx === 6 ? '-' : '15.30 WITA',
        note: idx === 3 ? 'Izin tugas praktek' : idx === 6 ? 'Demam' : 'Tepat waktu'
      }));
      store[`${today}_10`] = k10;

      // Seed Kelas 11 Hari ini
      const k11 = getMembers('11').map((m, idx) => ({
        memberId: m.id,
        name: m.name,
        nisn: m.nisn,
        class: m.class,
        level: m.level,
        status: idx === 4 ? 'Izin' : idx === 8 ? 'Alpa' : 'Hadir',
        time: idx === 4 || idx === 8 ? '-' : '16.00 WITA',
        note: idx === 4 ? 'Ekskul silat' : idx === 8 ? 'Tanpa keterangan' : 'Tepat waktu'
      }));
      store[`${today}_11`] = k11;

      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(store));
    }
  }

  seedDefaultHistoryIfEmpty();

  return {
    getMembers,
    addMember,
    searchMembers,
    getAttendanceSheet,
    saveAttendanceSheet,
    saveIndividualAttendance,
    getAllHistoryDates
  };
})();

// Make accessible to all scripts
window.PMR_DB = PMR_DB;
