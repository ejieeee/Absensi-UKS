<?php
/**
 * API BACKEND (PHP & MySQL) - PRESENSI LATIHAN PMR SMKN 7 SAMARINDA
 * Simpan file ini di folder htdocs/ bersama website ini jika menggunakan XAMPP/Laragon.
 * Database: db_pmr_smkn7 (Impor skema dari database.sql)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Konfigurasi Database MySQL
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'db_pmr_smkn7';

try {
    $pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Gagal koneksi ke database MySQL: ' . $e->getMessage()
    ]);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {

    // 1. Ambil Data Anggota (Filter Sesi: 10 / 11 / all)
    case 'get_members':
        $level = isset($_GET['level']) ? $_GET['level'] : 'all';
        if ($level === '10' || $level === '11') {
            $stmt = $pdo->prepare("SELECT * FROM tb_anggota WHERE tingkat = ? AND status = 'Aktif' ORDER BY nama_lengkap ASC");
            $stmt->execute([$level]);
        } else {
            $stmt = $pdo->query("SELECT * FROM tb_anggota WHERE status = 'Aktif' ORDER BY tingkat ASC, nama_lengkap ASC");
        }
        $data = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $data]);
        break;

    // 2. Fitur Pencarian Autocomplete dari Database (Cari beberapa huruf nama)
    case 'search_members':
        $q = isset($_GET['q']) ? trim($_GET['q']) : '';
        $level = isset($_GET['level']) ? $_GET['level'] : '';

        if (empty($q)) {
            echo json_encode(['status' => 'success', 'data' => []]);
            break;
        }

        $param = "%{$q}%";
        if ($level === '10' || $level === '11') {
            $stmt = $pdo->prepare("SELECT * FROM tb_anggota WHERE tingkat = ? AND (nama_lengkap LIKE ? OR nisn LIKE ? OR kelas LIKE ?) ORDER BY nama_lengkap ASC LIMIT 10");
            $stmt->execute([$level, $param, $param, $param]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM tb_anggota WHERE nama_lengkap LIKE ? OR nisn LIKE ? OR kelas LIKE ? ORDER BY nama_lengkap ASC LIMIT 10");
            $stmt->execute([$param, $param, $param]);
        }
        $data = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $data]);
        break;

    // 3. Ambil Lembar Presensi Sesi Latihan
    case 'get_attendance':
        $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
        $level = isset($_GET['level']) ? $_GET['level'] : '10';

        // Cek sesi
        $stmtSesi = $pdo->prepare("SELECT * FROM tb_sesi_latihan WHERE tanggal = ? AND tingkat_kelas = ?");
        $stmtSesi->execute([$date, $level]);
        $sesi = $stmtSesi->fetch();

        if ($sesi) {
            $stmtPresensi = $pdo->prepare("
                SELECT a.id AS memberId, a.nama_lengkap AS name, a.nisn, a.kelas, a.tingkat AS level,
                       COALESCE(p.status, 'Belum') AS status,
                       COALESCE(p.jam_absen, '-') AS time,
                       COALESCE(p.keterangan, '') AS note,
                       p.tanda_tangan AS signature
                FROM tb_anggota a
                LEFT JOIN tb_presensi p ON a.id = p.id_anggota AND p.id_sesi = ?
                WHERE a.tingkat = ? AND a.status = 'Aktif'
                ORDER BY a.nama_lengkap ASC
            ");
            $stmtPresensi->execute([$sesi['id_sesi'], $level]);
            $records = $stmtPresensi->fetchAll();
        } else {
            $stmtAnggota = $pdo->prepare("SELECT id AS memberId, nama_lengkap AS name, nisn, kelas, tingkat AS level, 'Belum' AS status, '-' AS time, '' AS note, NULL AS signature FROM tb_anggota WHERE tingkat = ? AND status = 'Aktif' ORDER BY nama_lengkap ASC");
            $stmtAnggota->execute([$level]);
            $records = $stmtAnggota->fetchAll();
        }

        echo json_encode(['status' => 'success', 'data' => $records]);
        break;

    // 4. Simpan Data Presensi Latihan ke Database
    case 'save_attendance':
        $raw = file_get_contents('php://input');
        $payload = json_decode($raw, true);

        if (!$payload || !isset($payload['date']) || !isset($payload['level']) || !isset($payload['records'])) {
            echo json_encode(['status' => 'error', 'message' => 'Parameter tidak lengkap']);
            exit;
        }

        $date = $payload['date'];
        $level = $payload['level'];
        $records = $payload['records'];

        // Dapatkan / buat sesi latihan
        $stmtSesi = $pdo->prepare("SELECT id_sesi FROM tb_sesi_latihan WHERE tanggal = ? AND tingkat_kelas = ?");
        $stmtSesi->execute([$date, $level]);
        $sesi = $stmtSesi->fetch();

        if (!$sesi) {
            $stmtInsertSesi = $pdo->prepare("INSERT INTO tb_sesi_latihan (tanggal, tingkat_kelas, materi_latihan) VALUES (?, ?, 'Latihan Rutin PMR')");
            $stmtInsertSesi->execute([$date, $level]);
            $id_sesi = $pdo->lastInsertId();
        } else {
            $id_sesi = $sesi['id_sesi'];
        }

        // Hapus presensi lama pada sesi ini lalu insert baru
        $pdo->prepare("DELETE FROM tb_presensi WHERE id_sesi = ?")->execute([$id_sesi]);

        $stmtInsert = $pdo->prepare("INSERT INTO tb_presensi (id_sesi, id_anggota, status, jam_absen, keterangan, tanda_tangan) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($records as $r) {
            $stmtInsert->execute([
                $id_sesi,
                $r['memberId'],
                $r['status'],
                $r['time'],
                isset($r['note']) ? $r['note'] : '',
                isset($r['signature']) ? $r['signature'] : null
            ]);
        }

        echo json_encode(['status' => 'success', 'message' => 'Data presensi berhasil disimpan ke database MySQL']);
        break;

    // 5. Tambah Anggota Baru
    case 'add_member':
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data || empty($data['name']) || empty($data['class']) || empty($data['level'])) {
            echo json_encode(['status' => 'error', 'message' => 'Nama, kelas, dan tingkat wajib diisi']);
            exit;
        }

        $nisn = !empty($data['nisn']) ? $data['nisn'] : '009' . rand(1000000, 9999999);
        $phone = !empty($data['phone']) ? $data['phone'] : '-';

        $stmt = $pdo->prepare("INSERT INTO tb_anggota (nisn, nama_lengkap, kelas, tingkat, no_telepon) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nisn, $data['name'], $data['class'], $data['level'], $phone]);

        echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId(), 'message' => 'Anggota berhasil ditambahkan']);
        break;

    default:
        echo json_encode([
            'status' => 'online',
            'message' => 'API Presensi Latihan PMR SMKN 7 Samarinda siap digunakan'
        ]);
        break;
}
