/**
 * Presensi Mandiri Siswa (student-attendance.js)
 * Khusus Halaman Siswa (index.html)
 * - Tanpa NISN (hanya Nama & Kelas)
 * - Khusus Presensi Individu + Tanda Tangan Digital
 * - Bebas dari tabel admin
 */

let currentSessionLevel = '10'; // Default: Kelas 10
let currentSessionDate = new Date().toISOString().split('T')[0];
let selectedStudent = null;
let signaturePadInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DB === 'undefined') {
    console.error('PMR_DB database layer is required');
    return;
  }

  initApp();
});

function initApp() {
  initDateDisplay();
  initSessionTabs();
  initSignaturePad();
  initAutocompleteSearch();
  initStatusChoiceRadios();
  initIndividualSubmitForm();
  updateSessionInfo();
}

// Format Tanggal Hari Ini
function initDateDisplay() {
  const dateEl = document.getElementById('currentDateDisplay');
  if (dateEl) {
    dateEl.textContent = formatIndoDate(currentSessionDate);
  }
}

// Inisialisasi Tab Sesi (Kelas 10 vs 11)
function initSessionTabs() {
  const tabK10 = document.getElementById('tabSessionK10');
  const tabK11 = document.getElementById('tabSessionK11');

  if (tabK10) {
    tabK10.addEventListener('click', () => {
      if (currentSessionLevel === '10') return;
      currentSessionLevel = '10';
      tabK10.classList.add('active');
      tabK11.classList.remove('active');
      resetIndividualForm();
      updateSessionInfo();
    });
  }

  if (tabK11) {
    tabK11.addEventListener('click', () => {
      if (currentSessionLevel === '11') return;
      currentSessionLevel = '11';
      tabK11.classList.add('active');
      tabK10.classList.remove('active');
      resetIndividualForm();
      updateSessionInfo();
    });
  }
}

function updateSessionInfo() {
  const k10Count = PMR_DB.getMembers('10').length;
  const k11Count = PMR_DB.getMembers('11').length;
  const countTab10 = document.getElementById('tabCount10');
  const countTab11 = document.getElementById('tabCount11');
  if (countTab10) countTab10.textContent = `${k10Count} Siswa`;
  if (countTab11) countTab11.textContent = `${k11Count} Siswa`;
}

// Inisialisasi Canvas Tanda Tangan
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

// Inisialisasi Autocomplete Search (Pencarian Nama Tanpa NISN)
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

    // Cari dari database
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
        Nama "<strong>${escapeHtml(query)}</strong>" tidak ditemukan.
      </div>
    `;
    dropdown.classList.add('show');
    return;
  }

  let html = `
    <div class="autocomplete-dropdown-header">
      <span>Hasil Pencarian Anggota (${results.length > 0 ? 'Sesi Aktif' : 'Ditemukan di Sesi Lain'})</span>
      <span>Klik nama Anda untuk mengisi presensi</span>
    </div>
  `;

  // Tampilkan hasil TANPA NISN (hanya Nama & Kelas)
  results.forEach(m => {
    html += `
      <div class="autocomplete-item" onclick="chooseStudentForAttendance(${m.id})">
        <div class="item-person-info">
          <div class="item-name-text">${highlightMatch(m.name, query)}</div>
          <div class="item-meta-sub" style="font-weight: 600; color: #2563eb;">${m.class}</div>
        </div>
        <div>
          <span class="btn-app btn-app-primary" style="padding: 0.25rem 0.65rem; font-size: 0.76rem;">
            Pilih & Absen &rarr;
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
            Pindah Sesi & Absen &rarr;
          </div>
        </div>
      `;
    });
  }

  dropdown.innerHTML = html;
  dropdown.classList.add('show');
}

// Pilih Siswa untuk Mengisi Presensi Individu
function chooseStudentForAttendance(memberId) {
  const member = PMR_DB.getMembers(currentSessionLevel).find(m => m.id === memberId);
  if (!member) return;

  selectedStudent = member;

  // Tutup dropdown dan bersihkan search
  const input = document.getElementById('autocompleteSearchInput');
  const dropdown = document.getElementById('autocompleteDropdown');
  if (input) input.value = '';
  if (dropdown) dropdown.classList.remove('show');

  // Tampilkan Card Konfirmasi Siswa (TANPA NISN)
  const banner = document.getElementById('studentSelectedBanner');
  const avatarEl = document.getElementById('studentSelectedAvatar');
  const nameEl = document.getElementById('studentSelectedName');
  const metaEl = document.getElementById('studentSelectedMeta');
  const formWrap = document.getElementById('individualFormWrap');
  const placeholder = document.getElementById('individualPlaceholder');

  if (banner && avatarEl && nameEl && metaEl && formWrap) {
    const initials = member.name.split(' ').map(n => n[0]).slice(0, 2).join('');
    avatarEl.textContent = initials;
    nameEl.textContent = member.name;
    // TANPA NISN - hanya Nama & Kelas
    metaEl.textContent = `Kelas: ${member.class} • ${member.level === '10' ? 'Kelas 10 (Wira Mula)' : 'Kelas 11 (Wira Madya)'}`;

    banner.style.display = 'flex';
    formWrap.style.display = 'flex';
    if (placeholder) placeholder.style.display = 'none';

    // Cek jika siswa sudah pernah presensi hari ini
    const sheet = PMR_DB.getAttendanceSheet(currentSessionDate, currentSessionLevel);
    const existing = sheet.find(item => item.memberId === member.id);
    if (existing && existing.status !== 'Belum') {
      showToast(`Info: Anda sudah mengisi presensi hari ini dengan status ${existing.status} (${existing.time}).`);
    }

    // Scroll mulus ke formulir
    banner.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Sesuaikan kanvas tanda tangan
    if (signaturePadInstance) {
      signaturePadInstance.initCanvas();
      signaturePadInstance.clear();
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

  chooseStudentForAttendance(memberId);
}

// Radio Pilihan Status Kehadiran (Hadir / Izin / Sakit)
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

// Kirim Presensi Individu
function initIndividualSubmitForm() {
  const form = document.getElementById('individualAttendanceForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      alert('Silakan cari dan pilih nama Anda terlebih dahulu!');
      return;
    }

    const selectedRadio = form.querySelector('input[name="studentStatus"]:checked');
    const status = selectedRadio ? selectedRadio.value : 'Hadir';
    const note = document.getElementById('individualNoteInput') ? document.getElementById('individualNoteInput').value.trim() : '';

    let signatureBase64 = null;

    if (status === 'Hadir') {
      if (!signaturePadInstance || signaturePadInstance.isEmpty()) {
        alert('Tanda tangan wajib diisi jika hadir! Silakan tanda tangan di kotak kanvas menggunakan jari atau mouse.');
        return;
      }
      signatureBase64 = signaturePadInstance.toDataURL();
    }

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

    // Tampilkan Tiket Bukti Sukses Presensi Individu (TANPA NISN)
    showReceiptModal(selectedStudent, status, timeStr, note, signatureBase64);
  });
}

// Tampilkan Bukti Sukses Presensi Individu (TANPA NISN)
function showReceiptModal(student, status, time, note, signature) {
  const modal = document.getElementById('receiptSuccessModal');
  const nameEl = document.getElementById('receiptStudentName');
  const metaEl = document.getElementById('receiptStudentMeta');
  const timeEl = document.getElementById('receiptTime');
  const statusEl = document.getElementById('receiptStatusBadge');
  const sigContainer = document.getElementById('receiptSignatureBox');
  const sigImg = document.getElementById('receiptSignatureImg');

  if (nameEl) nameEl.textContent = student.name;
  // TANPA NISN
  if (metaEl) metaEl.textContent = `Kelas: ${student.class} • ${student.level === '10' ? 'Kelas 10 (Wira Mula)' : 'Kelas 11 (Wira Madya)'}`;
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
  showToast('✓ Presensi berhasil disimpan! Siap untuk siswa berikutnya.');
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
window.showToast = showToast;
