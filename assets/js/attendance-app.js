/**
 * Presensi Latihan PMR Secara Individu (attendance-app.js)
 * PMR Wira SMKN 7 Samarinda (Sesi Kelas 10 & 11)
 * 
 * Alur Kerja Presensi Mandiri:
 * 1. Pilih Sesi (Kelas 10 / 11)
 * 2. Ketik nama di autocomplete search -> klik nama siswa
 * 3. Pilih status: Hadir / Izin / Sakit
 * 4. Bubuhkan Tanda Tangan Digital pada Canvas
 * 5. Kirim Presensi -> Bukti tiket sukses & tercatat di database
 */

let currentSessionLevel = '10'; // Default: Kelas 10
let currentSessionDate = new Date().toISOString().split('T')[0];
let selectedStudent = null;
let signaturePadInstance = null;
let currentSheetData = [];

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DB === 'undefined') {
    console.error('PMR_DB database layer is required');
    return;
  }

  initApp();
});

function initApp() {
  initDatePicker();
  initSessionTabs();
  initSignaturePad();
  initAutocompleteSearch();
  initStatusChoiceRadios();
  initIndividualSubmitForm();
  loadSessionData();
}

// 1. Inisialisasi Tanggal
function initDatePicker() {
  const dateInput = document.getElementById('attendanceDatePicker');
  if (!dateInput) return;

  dateInput.value = currentSessionDate;
  dateInput.addEventListener('change', (e) => {
    currentSessionDate = e.target.value;
    loadSessionData();
    resetIndividualForm();
    showToast(`Tanggal diubah ke: ${formatIndoDate(currentSessionDate)}`);
  });
}

// 2. Inisialisasi Tab Sesi (Kelas 10 vs 11)
function initSessionTabs() {
  const tabK10 = document.getElementById('tabSessionK10');
  const tabK11 = document.getElementById('tabSessionK11');

  if (tabK10) {
    tabK10.addEventListener('click', () => {
      if (currentSessionLevel === '10') return;
      currentSessionLevel = '10';
      tabK10.classList.add('active');
      tabK11.classList.remove('active');
      loadSessionData();
      resetIndividualForm();
    });
  }

  if (tabK11) {
    tabK11.addEventListener('click', () => {
      if (currentSessionLevel === '11') return;
      currentSessionLevel = '11';
      tabK11.classList.add('active');
      tabK10.classList.remove('active');
      loadSessionData();
      resetIndividualForm();
    });
  }
}

// 3. Inisialisasi Canvas Tanda Tangan Digital
function initSignaturePad() {
  const canvas = document.getElementById('signatureCanvas');
  const btnClear = document.getElementById('btnClearSignature');

  if (canvas && typeof DigitalSignaturePad !== 'undefined') {
    signaturePadInstance = new DigitalSignaturePad(canvas);
  }

  if (btnClear && signaturePadInstance) {
    btnClear.addEventListener('click', () => {
      signaturePadInstance.clear();
      showToast('Kanvas tanda tangan telah dibersihkan.');
    });
  }
}

// 4. Inisialisasi Autocomplete Pencarian Nama Siswa
function initAutocompleteSearch() {
  const input = document.getElementById('autocompleteSearchInput');
  const dropdown = document.getElementById('autocompleteDropdown');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (!input || !dropdown) return;

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    if (clearBtn) {
      clearBtn.style.display = query.length > 0 ? 'block' : 'none';
    }

    if (query.length === 0) {
      dropdown.classList.remove('show');
      dropdown.innerHTML = '';
      return;
    }

    // Cari dari database lokal
    let results = PMR_DB.searchMembers(query, currentSessionLevel);
    const otherLevel = currentSessionLevel === '10' ? '11' : '10';
    const otherResults = results.length === 0 ? PMR_DB.searchMembers(query, otherLevel) : [];

    renderAutocompleteDropdown(results, otherResults, query);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      dropdown.classList.remove('show');
      input.focus();
    });
  }

  // Tutup jika klik luar
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

function renderAutocompleteDropdown(results, otherResults, query) {
  const dropdown = document.getElementById('autocompleteDropdown');
  if (!dropdown) return;

  if (results.length === 0 && otherResults.length === 0) {
    dropdown.innerHTML = `
      <div style="padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        <i class="bi bi-search" style="font-size: 1.5rem; display: block; margin-bottom: 0.35rem;"></i>
        Nama "<strong>${escapeHtml(query)}</strong>" tidak ditemukan di database.
      </div>
    `;
    dropdown.classList.add('show');
    return;
  }

  let html = `
    <div class="autocomplete-dropdown-header">
      <span>Hasil Pencarian Database (${results.length > 0 ? 'Sesi Aktif' : 'Ditemukan di Sesi Lain'})</span>
      <span>Klik nama Anda untuk mengisi presensi</span>
    </div>
  `;

  results.forEach(m => {
    const currentRecord = currentSheetData.find(item => item.memberId === m.id);
    const curStatus = currentRecord ? currentRecord.status : 'Belum';
    const statusColor = curStatus === 'Hadir' ? 'var(--col-hadir)' : curStatus === 'Izin' ? 'var(--col-izin)' : curStatus === 'Sakit' ? 'var(--col-sakit)' : '#64748b';

    html += `
      <div class="autocomplete-item" onclick="chooseStudentForAttendance(${m.id})">
        <div class="item-person-info">
          <div class="item-name-text">${highlightMatch(m.name, query)}</div>
          <div class="item-meta-sub">${m.class} &bull; NISN: ${m.nisn}</div>
        </div>
        <div>
          <span style="font-size: 0.76rem; font-weight: 700; color: ${statusColor};">
            ${curStatus === 'Belum' ? 'Belum Presensi' : `Sudah: ${curStatus}`}
          </span>
        </div>
      </div>
    `;
  });

  if (results.length === 0 && otherResults.length > 0) {
    otherResults.forEach(m => {
      const targetSesi = m.level === '10' ? 'Sesi Kelas 10' : 'Sesi Kelas 11';
      html += `
        <div class="autocomplete-item" onclick="switchSessionAndChoose(${m.level}, ${m.id})">
          <div class="item-person-info">
            <div class="item-name-text">${highlightMatch(m.name, query)}</div>
            <div class="item-meta-sub" style="color: #dc2626;">Terdaftar di <strong>${targetSesi}</strong> (${m.class})</div>
          </div>
          <div style="font-size: 0.74rem; font-weight: 700; color: #2563eb;">
            Pindah Sesi & Isi &rarr;
          </div>
        </div>
      `;
    });
  }

  dropdown.innerHTML = html;
  dropdown.classList.add('show');
}

// 5. Pilih Siswa untuk Mengisi Presensi Individu
function chooseStudentForAttendance(memberId) {
  const member = PMR_DB.getMembers(currentSessionLevel).find(m => m.id === memberId);
  if (!member) return;

  selectedStudent = member;

  // Tutup dropdown dan kosongkan search
  const input = document.getElementById('autocompleteSearchInput');
  const dropdown = document.getElementById('autocompleteDropdown');
  if (input) input.value = '';
  if (dropdown) dropdown.classList.remove('show');

  // Tampilkan Card Konfirmasi Siswa
  const banner = document.getElementById('studentSelectedBanner');
  const avatarEl = document.getElementById('studentSelectedAvatar');
  const nameEl = document.getElementById('studentSelectedName');
  const metaEl = document.getElementById('studentSelectedMeta');
  const formWrap = document.getElementById('individualFormWrap');

  if (banner && avatarEl && nameEl && metaEl && formWrap) {
    const initials = member.name.split(' ').map(n => n[0]).slice(0, 2).join('');
    avatarEl.textContent = initials;
    nameEl.textContent = member.name;
    metaEl.textContent = `${member.class} • NISN: ${member.nisn} • ${member.level === '10' ? 'Kelas 10 (Wira Mula)' : 'Kelas 11 (Wira Madya)'}`;
    
    banner.style.display = 'flex';
    formWrap.style.display = 'flex';
    const placeholder = document.getElementById('individualPlaceholder');
    if (placeholder) placeholder.style.display = 'none';

    // Cek jika siswa sudah absen sebelumnya hari ini
    const existing = currentSheetData.find(item => item.memberId === member.id);
    if (existing && existing.status !== 'Belum') {
      showToast(`Info: Anda tercatat status ${existing.status} (${existing.time}). Anda dapat memperbaruinya jika perlu.`);
    }

    // Scroll mulus ke form individu
    banner.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Sesuaikan dimensi canvas sekarang karena kontainer sudah tampil
    if (signaturePadInstance) {
      signaturePadInstance.initCanvas();
      signaturePadInstance.clear();
      // Jika siswa sudah punya tanda tangan sebelumnya, load
      if (existing && existing.signature) {
        const img = new Image();
        img.onload = () => {
          signaturePadInstance.ctx.drawImage(img, 0, 0, signaturePadInstance.canvas.width / (window.devicePixelRatio || 1), signaturePadInstance.canvas.height / (window.devicePixelRatio || 1));
          signaturePadInstance.hasDrawn = true;
        };
        img.src = existing.signature;
      }
    }
  }
}

function switchSessionAndChoose(targetLevel, memberId) {
  currentSessionLevel = String(targetLevel);
  const tabK10 = document.getElementById('tabSessionK10');
  const tabK11 = document.getElementById('tabSessionK11');

  if (targetLevel === '10' || targetLevel === 10) {
    tabK10.classList.add('active');
    tabK11.classList.remove('active');
  } else {
    tabK11.classList.add('active');
    tabK10.classList.remove('active');
  }

  loadSessionData();
  chooseStudentForAttendance(memberId);
}

// 6. Radio Pilihan Status (Hadir / Izin / Sakit)
function initStatusChoiceRadios() {
  const cards = document.querySelectorAll('.status-choice-card');
  const sigSection = document.getElementById('signatureSectionWrap');
  const noteSection = document.getElementById('noteSectionWrap');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected-hadir', 'selected-izin', 'selected-sakit'));
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;

      const statusVal = radio.value;
      if (statusVal === 'Hadir') {
        card.classList.add('selected-hadir');
        if (sigSection) sigSection.style.display = 'flex';
        if (noteSection) noteSection.style.display = 'none';
      } else if (statusVal === 'Izin') {
        card.classList.add('selected-izin');
        if (sigSection) sigSection.style.display = 'none';
        if (noteSection) noteSection.style.display = 'flex';
      } else if (statusVal === 'Sakit') {
        card.classList.add('selected-sakit');
        if (sigSection) sigSection.style.display = 'none';
        if (noteSection) noteSection.style.display = 'flex';
      }
    });
  });
}

// 7. Submit Presensi Individu
function initIndividualSubmitForm() {
  const form = document.getElementById('individualAttendanceForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      alert('Silakan pilih nama siswa terlebih dahulu melalui pencarian!');
      return;
    }

    const selectedRadio = form.querySelector('input[name="studentStatus"]:checked');
    const status = selectedRadio ? selectedRadio.value : 'Hadir';
    const note = document.getElementById('individualNoteInput') ? document.getElementById('individualNoteInput').value.trim() : '';

    let signatureBase64 = null;

    // Jika Hadir, validasi tanda tangan
    if (status === 'Hadir') {
      if (!signaturePadInstance || signaturePadInstance.isEmpty()) {
        alert('Tanda tangan wajib diisi jika hadir! Silakan goreskan tanda tangan Anda di kotak kanvas.');
        return;
      }
      signatureBase64 = signaturePadInstance.toDataURL();
    }

    // Waktu sekarang
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')} WITA`;

    // Simpan ke database
    PMR_DB.saveIndividualAttendance(
      currentSessionDate,
      currentSessionLevel,
      selectedStudent.id,
      status,
      timeStr,
      note || (status === 'Hadir' ? 'Hadir Latihan PMR' : ''),
      signatureBase64
    );

    // Tampilkan modal bukti tiket sukses
    showReceiptModal(selectedStudent, status, timeStr, note, signatureBase64);

    // Refresh tabel sesi
    loadSessionData();
  });
}

// Tampilkan Bukti Sukses Presensi Individu
function showReceiptModal(student, status, time, note, signature) {
  const modal = document.getElementById('receiptSuccessModal');
  const nameEl = document.getElementById('receiptStudentName');
  const metaEl = document.getElementById('receiptStudentMeta');
  const timeEl = document.getElementById('receiptTime');
  const statusEl = document.getElementById('receiptStatusBadge');
  const sigContainer = document.getElementById('receiptSignatureBox');
  const sigImg = document.getElementById('receiptSignatureImg');

  if (nameEl) nameEl.textContent = student.name;
  if (metaEl) metaEl.textContent = `${student.class} • NISN: ${student.nisn}`;
  if (timeEl) timeEl.textContent = `${formatIndoDate(currentSessionDate)} pukul ${time}`;
  
  if (statusEl) {
    statusEl.textContent = status;
    statusEl.className = `btn-mini-status ${status === 'Hadir' ? 'btn-mini-hadir' : status === 'Izin' ? 'btn-mini-izin' : 'btn-mini-sakit'}`;
    statusEl.style.fontSize = '0.9rem';
    statusEl.style.padding = '0.35rem 1rem';
  }

  if (sigContainer && sigImg) {
    if (signature) {
      sigImg.src = signature;
      sigContainer.style.display = 'flex';
    } else {
      sigContainer.style.display = 'none';
    }
  }

  if (modal) modal.style.display = 'flex';
}

function closeReceiptAndReset() {
  const modal = document.getElementById('receiptSuccessModal');
  if (modal) modal.style.display = 'none';
  resetIndividualForm();
  showToast('Siap untuk siswa berikutnya!');
}

function resetIndividualForm() {
  selectedStudent = null;
  const banner = document.getElementById('studentSelectedBanner');
  const formWrap = document.getElementById('individualFormWrap');
  const placeholder = document.getElementById('individualPlaceholder');
  if (banner) banner.style.display = 'none';
  if (formWrap) formWrap.style.display = 'none';
  if (placeholder) placeholder.style.display = 'block';

  if (signaturePadInstance) {
    signaturePadInstance.clear();
  }

  const noteInput = document.getElementById('individualNoteInput');
  if (noteInput) noteInput.value = '';

  // Kembalikan status radio ke Hadir
  const radioHadir = document.getElementById('radioStatusHadir');
  if (radioHadir) {
    radioHadir.checked = true;
    const cards = document.querySelectorAll('.status-choice-card');
    cards.forEach(c => c.classList.remove('selected-hadir', 'selected-izin', 'selected-sakit'));
    const hadirCard = document.querySelector('.status-choice-card:first-child');
    if (hadirCard) hadirCard.classList.add('selected-hadir');
    const sigSection = document.getElementById('signatureSectionWrap');
    const noteSection = document.getElementById('noteSectionWrap');
    if (sigSection) sigSection.style.display = 'flex';
    if (noteSection) noteSection.style.display = 'none';
  }
}

// 8. Muat Data Lembar & Tabel Rekap Harian
function loadSessionData() {
  currentSheetData = PMR_DB.getAttendanceSheet(currentSessionDate, currentSessionLevel);
  renderAttendanceTable();
  updateSummaryMetrics();
  updateSessionHeaders();
}

function updateSessionHeaders() {
  const titleEl = document.getElementById('currentSessionTitle');
  const countBadgeEl = document.getElementById('currentSessionCountBadge');
  const total = currentSheetData.length;

  if (titleEl) {
    titleEl.textContent = currentSessionLevel === '10' 
      ? 'Daftar Presensi Latihan: Kelas 10 (Wira Mula)' 
      : 'Daftar Presensi Latihan: Kelas 11 (Wira Madya)';
  }

  if (countBadgeEl) {
    countBadgeEl.textContent = `${total} Anggota Terdaftar`;
  }

  const k10Count = PMR_DB.getMembers('10').length;
  const k11Count = PMR_DB.getMembers('11').length;
  const countTab10 = document.getElementById('tabCount10');
  const countTab11 = document.getElementById('tabCount11');
  if (countTab10) countTab10.textContent = `${k10Count} Anggota`;
  if (countTab11) countTab11.textContent = `${k11Count} Anggota`;
}

function renderAttendanceTable() {
  const tbody = document.getElementById('attendanceTableBody');
  if (!tbody) return;

  if (currentSheetData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Tidak ada data anggota di sesi ini.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  currentSheetData.forEach((item, index) => {
    let statusBadge = '<span style="color: #94a3b8; font-weight: 700; font-size: 0.8rem;">Belum Absen</span>';
    if (item.status === 'Hadir') statusBadge = '<span class="btn-mini-status btn-mini-hadir">Hadir</span>';
    if (item.status === 'Izin') statusBadge = '<span class="btn-mini-status btn-mini-izin">Izin</span>';
    if (item.status === 'Sakit') statusBadge = '<span class="btn-mini-status btn-mini-sakit">Sakit</span>';
    if (item.status === 'Alpa') statusBadge = '<span class="btn-mini-status btn-mini-alpa">Alpa</span>';

    // Kolom Tanda Tangan
    let sigCell = '<span style="color: #cbd5e1; font-size: 0.76rem;">-</span>';
    if (item.signature) {
      sigCell = `
        <div class="signature-thumb-box" onclick="previewLargeSignature('${escapeHtml(item.name)}', '${item.signature}')" title="Klik untuk memperbesar tanda tangan">
          <img src="${item.signature}" alt="Tanda Tangan" class="signature-thumb-img">
        </div>
      `;
    }

    html += `
      <tr id="row-member-${item.memberId}">
        <td style="font-weight: 700; color: var(--text-muted); width: 40px; text-align: center;">${index + 1}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">${item.name}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted); font-family: monospace;">NISN: ${item.nisn}</div>
        </td>
        <td>
          <span style="font-weight: 700; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
            ${item.class}
          </span>
        </td>
        <td>${statusBadge}</td>
        <td style="font-family: monospace; font-size: 0.82rem; color: var(--text-muted);">${item.time}</td>
        <td>${sigCell}</td>
        <td style="text-align: right;">
          <button type="button" class="btn-app btn-app-outline" style="padding: 0.25rem 0.65rem; font-size: 0.76rem;" onclick="chooseStudentForAttendance(${item.memberId})">
            <i class="bi bi-pencil-square"></i> Isi / Edit
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function updateSummaryMetrics() {
  const total = currentSheetData.length;
  const hadir = currentSheetData.filter(m => m.status === 'Hadir').length;
  const izin = currentSheetData.filter(m => m.status === 'Izin').length;
  const sakit = currentSheetData.filter(m => m.status === 'Sakit').length;
  const alpa = currentSheetData.filter(m => m.status === 'Alpa').length;
  const belum = currentSheetData.filter(m => m.status === 'Belum').length;

  const countTotalEl = document.getElementById('countTotal');
  const countHadirEl = document.getElementById('countHadir');
  const countIzinEl = document.getElementById('countIzin');
  const countSakitEl = document.getElementById('countSakit');
  const countAlpaEl = document.getElementById('countAlpa');
  const countBelumEl = document.getElementById('countBelum');

  if (countTotalEl) countTotalEl.textContent = total;
  if (countHadirEl) countHadirEl.textContent = hadir;
  if (countIzinEl) countIzinEl.textContent = izin;
  if (countSakitEl) countSakitEl.textContent = sakit;
  if (countAlpaEl) countAlpaEl.textContent = alpa;
  if (countBelumEl) countBelumEl.textContent = belum;
}

// Pratinjau Tanda Tangan Besar
function previewLargeSignature(name, signatureData) {
  const modal = document.getElementById('sigPreviewModal');
  const titleEl = document.getElementById('sigPreviewTitle');
  const imgEl = document.getElementById('sigPreviewImg');

  if (titleEl) titleEl.textContent = `Tanda Tangan: ${name}`;
  if (imgEl) imgEl.src = signatureData;
  if (modal) modal.style.display = 'flex';
}

function closeSigPreviewModal() {
  const modal = document.getElementById('sigPreviewModal');
  if (modal) modal.style.display = 'none';
}

// Utility
function highlightMatch(text, query) {
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatIndoDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = parseInt(parts[2], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parts[0];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d} ${months[m]} ${y}`;
}

function showToast(message) {
  let toast = document.getElementById('appToastMsg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToastMsg';
    toast.className = 'toast-msg-box';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="bi bi-check-circle-fill" style="color: #4ade80;"></i> <span>${message}</span>`;
  toast.style.display = 'flex';

  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Global binds
window.chooseStudentForAttendance = chooseStudentForAttendance;
window.switchSessionAndChoose = switchSessionAndChoose;
window.closeReceiptAndReset = closeReceiptAndReset;
window.resetIndividualForm = resetIndividualForm;
window.previewLargeSignature = previewLargeSignature;
window.closeSigPreviewModal = closeSigPreviewModal;
window.showToast = showToast;
