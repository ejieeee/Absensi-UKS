/**
 * Mock Data for PMR Wira SMKN 7 Samarinda Attendance System
 * Realistic datasets reflecting Indonesian Vocational High School (SMK) PMR Unit
 * Timezone: WITA (Waktu Indonesia Tengah / UTC+8)
 */

const PMR_DATA = {
  organization: {
    name: "PMR Wira SMKN 7 Samarinda",
    school: "SMK Negeri 7 Samarinda",
    address: "Jl. Aminah Syukur No. 82, Samarinda, Kalimantan Timur",
    unit: "Unit PMR Wira 07-SMD",
    academicYear: "2026/2027",
    advisors: [
      { name: "Drs. H. Bambang Sudarsono, M.Pd", role: "Pembina Utama PMR", nip: "19780512 200501 1 008" },
      { name: "Siti Rahmawati, S.Kep., Ners", role: "Pembina Teknis Kesehatan & UKS", nip: "19880315 201102 2 004" }
    ],
    leader: { name: "Muhammad Farhan Alfiansyah", class: "XII RPL 1", role: "Ketua PMR Wira" }
  },

  members: [
    { id: "PMR-001", nisn: "0078129011", name: "Muhammad Farhan Alfiansyah", gender: "L", class: "XII RPL 1", division: "Inti / Pimpinan", role: "Ketua PMR Wira", bloodType: "O+", status: "Aktif", attendanceRate: 98, phone: "0812-5341-9801" },
    { id: "PMR-002", nisn: "0079234102", name: "Annisa Nur Fadillah", gender: "P", class: "XII DKV 1", division: "Inti / Pimpinan", role: "Wakil Ketua", bloodType: "A+", status: "Aktif", attendanceRate: 95, phone: "0821-4822-1102" },
    { id: "PMR-003", nisn: "0081239845", name: "Dinda Ayu Lestari", gender: "P", class: "XI RPL 2", division: "Kesekretariatan", role: "Sekretaris I", bloodType: "B+", status: "Aktif", attendanceRate: 96, phone: "0852-4411-9923" },
    { id: "PMR-004", nisn: "0082390144", name: "Rizky Aditya Pratama", gender: "L", class: "XI TKJ 1", division: "Kebendaharaan", role: "Bendahara I", bloodType: "O+", status: "Aktif", attendanceRate: 92, phone: "0813-5002-3490" },
    { id: "PMR-005", nisn: "0083419087", name: "Siti Nurul Hidayah", gender: "P", class: "XI AKL 1", division: "Piket UKS", role: "Koord. Piket UKS", bloodType: "AB+", status: "Aktif", attendanceRate: 97, phone: "0822-5531-8840" },
    { id: "PMR-006", nisn: "0077812039", name: "Bagus Setiawan Putra", gender: "L", class: "XII TKJ 2", division: "Pertolongan Pertama", role: "Koord. Pertolongan Pertama", bloodType: "B+", status: "Aktif", attendanceRate: 94, phone: "0853-4902-1198" },
    { id: "PMR-007", nisn: "0084561234", name: "Tiara Melani Putri", gender: "P", class: "XI DKV 2", division: "Tandu & Evakuasi", role: "Koord. Tandu & Evakuasi", bloodType: "A+", status: "Aktif", attendanceRate: 91, phone: "0812-5100-7734" },
    { id: "PMR-008", nisn: "0091238841", name: "Achmad Dhani Saputra", gender: "L", class: "X RPL 1", division: "Pertolongan Pertama", role: "Anggota", bloodType: "O+", status: "Aktif", attendanceRate: 88, phone: "0821-9922-3341" },
    { id: "PMR-009", nisn: "0092347712", name: "Zahra Aulia Rahmadhani", gender: "P", class: "X RPL 2", division: "Piket UKS", role: "Anggota", bloodType: "B+", status: "Aktif", attendanceRate: 95, phone: "0851-2299-4411" },
    { id: "PMR-0010", nisn: "0085671190", name: "Dimas Arya Ramadhan", gender: "L", class: "XI RPL 1", division: "Dapur Umum & Logistik", role: "Koord. Logistik", bloodType: "O-", status: "Aktif", attendanceRate: 89, phone: "0813-4412-8877" },
    { id: "PMR-0011", nisn: "0093456723", name: "Fathir Maulana Ihsan", gender: "L", class: "X TKJ 1", division: "Tandu & Evakuasi", role: "Anggota", bloodType: "A+", status: "Aktif", attendanceRate: 86, phone: "0822-7711-4455" },
    { id: "PMR-0012", nisn: "0086789012", name: "Khadijah Al-Zahra", gender: "P", class: "XI AKL 2", division: "Kesekretariatan", role: "Sekretaris II", bloodType: "AB-", status: "Aktif", attendanceRate: 94, phone: "0812-3344-5566" },
    { id: "PMR-0013", nisn: "0094567891", name: "Naufal Hadi Wijaya", gender: "L", class: "X DKV 1", division: "Pertolongan Pertama", role: "Anggota", bloodType: "B+", status: "Aktif", attendanceRate: 92, phone: "0852-8899-1122" },
    { id: "PMR-0014", nisn: "0087890123", name: "Salwa Nabila Firdaus", gender: "P", class: "XI RPL 1", division: "Piket UKS", role: "Anggota", bloodType: "O+", status: "Aktif", attendanceRate: 96, phone: "0813-7766-5544" },
    { id: "PMR-0015", nisn: "0078901234", name: "Eko Prasetyo Utomo", gender: "L", class: "XII TKJ 1", division: "Tandu & Evakuasi", role: "Anggota Senior", bloodType: "A+", status: "Aktif", attendanceRate: 87, phone: "0821-6655-4433" },
    { id: "PMR-0016", nisn: "0095678902", name: "Keisha Aurellia Maharani", gender: "P", class: "X DKV 2", division: "Humas & Dokumentasi", role: "Anggota", bloodType: "O+", status: "Aktif", attendanceRate: 90, phone: "0851-4433-2211" },
    { id: "PMR-0017", nisn: "0088901235", name: "Gilang Ramadhan", gender: "L", class: "XI TKJ 2", division: "Pertolongan Pertama", role: "Anggota", bloodType: "B+", status: "Aktif", attendanceRate: 93, phone: "0812-9988-7766" },
    { id: "PMR-0018", nisn: "0096789013", name: "Cinta Laura Safitri", gender: "P", class: "X AKL 1", division: "Piket UKS", role: "Anggota", bloodType: "A+", status: "Aktif", attendanceRate: 94, phone: "0853-1122-3344" },
    { id: "PMR-0019", nisn: "0089012346", name: "Bayu Aji Pamungkas", gender: "L", class: "XI RPL 2", division: "Dapur Umum & Logistik", role: "Anggota", bloodType: "O+", status: "Aktif", attendanceRate: 85, phone: "0813-2233-4455" },
    { id: "PMR-0020", nisn: "0097890124", name: "Mutia Dewi Kusuma", gender: "P", class: "X RPL 1", division: "Pertolongan Pertama", role: "Anggota", bloodType: "AB+", status: "Aktif", attendanceRate: 89, phone: "0822-3344-5566" },
    { id: "PMR-0021", nisn: "0079012347", name: "Rendra Kurniawan", gender: "L", class: "XII DKV 1", division: "Humas & Dokumentasi", role: "Koord. Humas", bloodType: "B+", status: "Aktif", attendanceRate: 93, phone: "0852-5566-7788" },
    { id: "PMR-0022", nisn: "0098901235", name: "Adinda Putri Rahayu", gender: "P", class: "X TKJ 2", division: "Tandu & Evakuasi", role: "Anggota", bloodType: "O+", status: "Aktif", attendanceRate: 91, phone: "0812-7788-9900" },
    { id: "PMR-0023", nisn: "0080123458", name: "Fajar Siddiq", gender: "L", class: "XI AKL 1", division: "Kebendaharaan", role: "Bendahara II", bloodType: "A+", status: "Aktif", attendanceRate: 95, phone: "0821-8899-0011" },
    { id: "PMR-0024", nisn: "0099012346", name: "Salsabila Firdausi", gender: "P", class: "X DKV 1", division: "Piket UKS", role: "Anggota", bloodType: "B+", status: "Aktif", attendanceRate: 88, phone: "0853-9900-1122" }
  ],

  activities: [
    {
      id: "ACT-01",
      title: "Piket UKS Shift Pagi",
      type: "piket",
      category: "Piket UKS",
      date: "2026-10-09",
      time: "07.00 - 11.30 WITA",
      location: "Ruang UKS Utama (Gedung B Lt. 1)",
      dutyOfficers: ["Siti Nurul Hidayah", "Zahra Aulia Rahmadhani", "Achmad Dhani Saputra"],
      status: "Selesai",
      description: "Pelayanan pertolongan pertama harian, pencatatan log kunjungan siswa yang sakit atau pusing pasca upacara/olahraga.",
      patientsHandled: 4
    },
    {
      id: "ACT-02",
      title: "Piket UKS Shift Siang",
      type: "piket",
      category: "Piket UKS",
      date: "2026-10-09",
      time: "11.30 - 15.30 WITA",
      location: "Ruang UKS Utama (Gedung B Lt. 1)",
      dutyOfficers: ["Salwa Nabila Firdaus", "Cinta Laura Safitri", "Dimas Arya Ramadhan"],
      status: "Berlangsung",
      description: "Monitoring fasilitas ruang isolasi, sterilisasi kotak P3K kelas, dan kesiapan tabung oksigen UKS.",
      patientsHandled: 2
    },
    {
      id: "ACT-03",
      title: "Latihan Rutin: Simulasi Tandu & Balut Bidai",
      type: "latihan",
      category: "Latihan Rutin",
      date: "2026-10-10",
      time: "15.30 - 17.30 WITA",
      location: "Lapangan Upacara SMKN 7 Samarinda",
      dutyOfficers: ["Tiara Melani Putri", "Bagus Setiawan Putra", "Muhammad Farhan Alfiansyah"],
      status: "Mendatang",
      description: "Materi evakuasi korban fraktur tungkai bawah, perakitan tandu darurat bambu dalam tempo 2 menit, dan simulasi penanganan cedera olahraga.",
      participantsExpected: 36
    },
    {
      id: "ACT-04",
      title: "Pemeriksaan Berkala Kotak P3K Bengkel & Lab",
      type: "inspeksi",
      category: "Kesehatan Sekolah",
      date: "2026-10-12",
      time: "13.00 - 15.00 WITA",
      location: "Lab RPL, Bengkel TKJ, Studio DKV",
      dutyOfficers: ["Siti Nurul Hidayah", "Rizky Aditya Pratama"],
      status: "Mendatang",
      description: "Pemeriksaan tanggal kedaluwarsa antiseptik povidone iodine, plester cepat, kain mitella, dan kasa steril di seluruh laboratorium kejuruan.",
      participantsExpected: 8
    },
    {
      id: "ACT-05",
      title: "Aksi Donor Darah Sukarela PMR x PMI Samarinda",
      type: "sosial",
      category: "Bakti Sosial",
      date: "2026-10-17",
      time: "08.00 - 14.00 WITA",
      location: "Aula SMKN 7 Samarinda",
      dutyOfficers: ["Muhammad Farhan Alfiansyah", "Annisa Nur Fadillah", "Dinda Ayu Lestari"],
      status: "Mendatang",
      description: "Kolaborasi bersama PMI Cabang Kota Samarinda untuk dewan guru, staf TU, dan siswa tingkat Wira yang telah berusia 17 tahun ke atas.",
      participantsExpected: 100
    }
  ],

  recentAttendanceLogs: [
    { id: "LOG-101", memberId: "PMR-005", name: "Siti Nurul Hidayah", class: "XI AKL 1", time: "07.02 WITA", session: "Piket UKS Pagi", status: "Hadir", method: "NFC / Kartu Anggota", note: "Tepat waktu, seragam PDH lengkap" },
    { id: "LOG-102", memberId: "PMR-009", name: "Zahra Aulia Rahmadhani", class: "X RPL 2", time: "07.10 WITA", session: "Piket UKS Pagi", status: "Hadir", method: "QR Code Scan", note: "Tepat waktu" },
    { id: "LOG-103", memberId: "PMR-008", name: "Achmad Dhani Saputra", class: "X RPL 1", time: "07.15 WITA", session: "Piket UKS Pagi", status: "Hadir", method: "Manual Petugas", note: "Tepat waktu" },
    { id: "LOG-104", memberId: "PMR-014", name: "Salwa Nabila Firdaus", class: "XI RPL 1", time: "11.25 WITA", session: "Piket UKS Siang", status: "Hadir", method: "NFC / Kartu Anggota", note: "Serah terima shift pagi lancar" },
    { id: "LOG-105", memberId: "PMR-018", name: "Cinta Laura Safitri", class: "X AKL 1", time: "11.28 WITA", session: "Piket UKS Siang", status: "Hadir", method: "QR Code Scan", note: "Siap bertugas" },
    { id: "LOG-106", memberId: "PMR-010", name: "Dimas Arya Ramadhan", class: "XI RPL 1", time: "11.35 WITA", session: "Piket UKS Siang", status: "Hadir", method: "Manual Petugas", note: "Izin selesai jam pelajaran terakhir" },
    { id: "LOG-107", memberId: "PMR-004", name: "Rizky Aditya Pratama", class: "XI TKJ 1", time: "12.05 WITA", session: "Briefing Bendahara", status: "Hadir", method: "QR Code Scan", note: "Laporan kas pekanan" },
    { id: "LOG-108", memberId: "PMR-007", name: "Tiara Melani Putri", class: "XI DKV 2", time: "13.10 WITA", session: "Koordinasi Tandu", status: "Izin", method: "Surat / WhatsApp", note: "Izin persiapan lomba LKS DKV" },
    { id: "LOG-109", memberId: "PMR-011", name: "Fathir Maulana Ihsan", class: "X TKJ 1", time: "13.40 WITA", session: "Piket UKS Cadangan", status: "Sakit", method: "Surat Dokter", note: "Demam berdarah / istirahat rawat jalan" },
    { id: "LOG-110", memberId: "PMR-015", name: "Eko Prasetyo Utomo", class: "XII TKJ 1", time: "14.15 WITA", session: "Latihan Persiapan", status: "Alpa", method: "Sistem Otomatis", note: "Tanpa konfirmasi keterangan" }
  ],

  weeklyStats: {
    days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
    presentCount: [42, 44, 41, 45, 38],
    permissionCount: [3, 2, 4, 1, 2],
    sickCount: [2, 1, 2, 2, 2],
    absentCount: [1, 1, 1, 0, 1]
  },

  monthlyTrends: {
    labels: ["Mei", "Juni", "Juli", "Agustus", "September", "Oktober"],
    attendancePercentages: [92.4, 94.1, 91.8, 95.3, 93.6, 94.8],
    dutyHoursTotal: [142, 160, 138, 184, 176, 110]
  },

  summaryCounts: {
    totalRegistered: 48,
    activeMembers: 46,
    presentToday: 38,
    absentToday: 4, // 2 sakit, 1 izin, 1 alpa
    dutyShiftsActive: 2,
    upcomingActivities: 3
  }
};

// Make accessible to all page scripts
window.PMR_DATA = PMR_DATA;
