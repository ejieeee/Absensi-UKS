/**
 * Portal Admin & Pembina (admin-attendance.js)
 * Khusus Halaman Admin (admin.html)
 * - Monitoring Presensi Latihan Kelas 10 & 11
 * - Kontrol Status Massal & Individual
 * - Pratinjau Tanda Tangan Digital Siswa
 */

let currentSessionLevel = '10'; // Default: Kelas 10
let currentSessionDate = new Date().toISOString().split('T')[0];
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
  initAutocompleteSearch();
  initBatchActions();
  loadSessionData();
}

// Inisialisasi Tanggal
function initDatePicker() {
  const dateInput = document.getElementById('attendanceDatePicker');
  if (!dateInput) return;

  dateInput.value = currentSessionDate;
  dateInput.addEventListener('change', (e) => {
    currentSessionDate = e.target.value;
    loadSessionData();
    showToast(`Memuat data tanggal ${formatIndoDate(currentSessionDate)}`);
  });
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
      loadSessionData();
      clearAutocomplete();
    });
  }

  if (tabK11) {
    tabK11.addEventListener('click', () => {
      if (currentSessionLevel === '11') return;
      currentSessionLevel = '11';
      tabK11.classList.add('active');
      tabK10.classList.remove('active');
      loadSessionData();
      clearAutocomplete();
    });
  }
}

// Muat Data Lembar Presensi
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
      ? 'Monitoring Presensi: Sesi Kelas 10 (Wira Mula)' 
      : 'Monitoring Presensi: Sesi Kelas 11 (Wira Madya)';
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

// Render Tabel Presensi Admin
function renderAttendanceTable() {
  const tbody = document.getElementById('attendanceTableBody');
  if (!tbody) return;

  if (currentSheetData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Tidak ada data anggota di sesi ini. Tambahkan anggota di menu Data Anggota.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  currentSheetData.forEach((item, index) => {
    // Tanda Tangan Thumbnail
    let sigCell = '<span style="color: #cbd5e1; font-size: 0.76rem;">Belum TTD</span>';
    if (item.signature) {
      sigCell = `
        <div class="signature-thumb-box" onclick="previewLargeSignature('${escapeHtml(item.name)}', '${item.signature}')" title="Klik untuk memperbesar tanda tangan">
          <img src="${item.signature}" alt="TTD" class="signature-thumb-img">
        </div>
      `;
    }

    html += `
      <tr id="row-member-${item.memberId}">
        <td style="font-weight: 700; color: var(--text-muted); width: 40px; text-align: center;">${index + 1}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">${item.name}</div>
        </td>
        <td>
          <span style="font-weight: 700; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
            ${item.class}
          </span>
        </td>
        <td>
          <div class="status-btn-group">
            <button type="button" class="btn-status-toggle ${item.status === 'Hadir' ? 'active-hadir' : ''}" onclick="setMemberStatus(${item.memberId}, 'Hadir')">Hadir</button>
            <button type="button" class="btn-status-toggle ${item.status === 'Izin' ? 'active-izin' : ''}" onclick="setMemberStatus(${item.memberId}, 'Izin')">Izin</button>
            <button type="button" class="btn-status-toggle ${item.status === 'Sakit' ? 'active-sakit' : ''}" onclick="setMemberStatus(${item.memberId}, 'Sakit')">Sakit</button>
            <button type="button" class="btn-status-toggle ${item.status === 'Alpa' ? 'active-alpa' : ''}" onclick="setMemberStatus(${item.memberId}, 'Alpa')">Alpa</button>
          </div>
        </td>
        <td>
          <span style="font-family: monospace; font-size: 0.82rem; color: var(--text-muted);">${item.time}</span>
        </td>
        <td>${sigCell}</td>
        <td>
          <input type="text" 
                 value="${item.note || ''}" 
                 placeholder="Catatan..." 
                 onchange="updateMemberNote(${item.memberId}, this.value)"
                 style="padding: 0.35rem 0.6rem; border: 1px solid var(--border-app); border-radius: 6px; font-size: 0.82rem; width: 100%; max-width: 180px;">
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Set Status Kehadiran Siswa
function setMemberStatus(memberId, status) {
  const target = currentSheetData.find(m => m.memberId === memberId);
  if (!target) return;

  target.status = status;
  if (status === 'Hadir') {
    const now = new Date();
    target.time = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')} WITA`;
    if (!target.note) target.note = 'Tepat waktu';
  } else {
    target.time = '-';
  }

  const row = document.getElementById(`row-member-${memberId}`);
  if (row) {
    const buttons = row.querySelectorAll('.btn-status-toggle');
    buttons.forEach(btn => {
      btn.classList.remove('active-hadir', 'active-izin', 'active-sakit', 'active-alpa');
    });
    if (status === 'Hadir') buttons[0].classList.add('active-hadir');
    if (status === 'Izin') buttons[1].classList.add('active-izin');
    if (status === 'Sakit') buttons[2].classList.add('active-sakit');
    if (status === 'Alpa') buttons[3].classList.add('active-alpa');

    const timeCell = row.querySelector('td:nth-child(5) span');
    if (timeCell) timeCell.textContent = target.time;
  }

  updateSummaryMetrics();
  PMR_DB.saveAttendanceSheet(currentSessionDate, currentSessionLevel, currentSheetData);
}

function updateMemberNote(memberId, noteVal) {
  const target = currentSheetData.find(m => m.memberId === memberId);
  if (target) {
    target.note = noteVal;
    PMR_DB.saveAttendanceSheet(currentSessionDate, currentSessionLevel, currentSheetData);
  }
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

// Autocomplete Search Cepat untuk Admin
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

function clearAutocomplete() {
  const input = document.getElementById('autocompleteSearchInput');
  const dropdown = document.getElementById('autocompleteDropdown');
  const clearBtn = document.getElementById('clearSearchBtn');
  if (input) input.value = '';
  if (dropdown) dropdown.classList.remove('show');
  if (clearBtn) clearBtn.style.display = 'none';
}

function renderAutocompleteDropdown(results, otherResults, query) {
  const dropdown = document.getElementById('autocompleteDropdown');
  if (!dropdown) return;

  if (results.length === 0 && otherResults.length === 0) {
    dropdown.innerHTML = `
      <div style="padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        <i class="bi bi-search" style="font-size: 1.5rem; display: block; margin-bottom: 0.35rem;"></i>
        Tidak ada anggota ditemukan dengan nama "<strong>${escapeHtml(query)}</strong>"
      </div>
    `;
    dropdown.classList.add('show');
    return;
  }

  let html = `
    <div class="autocomplete-dropdown-header">
      <span>Hasil Pencarian Database</span>
      <span>Klik nama / status untuk aksi cepat</span>
    </div>
  `;

  results.forEach(m => {
    const currentRecord = currentSheetData.find(item => item.memberId === m.id);
    const curStatus = currentRecord ? currentRecord.status : 'Belum';

    html += `
      <div class="autocomplete-item" onclick="selectFromAutocomplete(${m.id}, 'Hadir')">
        <div class="item-person-info">
          <div class="item-name-text">${highlightMatch(m.name, query)}</div>
          <div class="item-meta-sub">${m.class} &bull; Status: <strong>${curStatus}</strong></div>
        </div>
        <div class="item-quick-actions" onclick="event.stopPropagation()">
          <button type="button" class="btn-mini-status btn-mini-hadir" onclick="selectFromAutocomplete(${m.id}, 'Hadir')">Hadir</button>
          <button type="button" class="btn-mini-status btn-mini-izin" onclick="selectFromAutocomplete(${m.id}, 'Izin')">Izin</button>
          <button type="button" class="btn-mini-status btn-mini-sakit" onclick="selectFromAutocomplete(${m.id}, 'Sakit')">Sakit</button>
          <button type="button" class="btn-mini-status btn-mini-alpa" onclick="selectFromAutocomplete(${m.id}, 'Alpa')">Alpa</button>
        </div>
      </div>
    `;
  });

  if (results.length === 0 && otherResults.length > 0) {
    otherResults.forEach(m => {
      const targetSesi = m.level === '10' ? 'Sesi Kelas 10' : 'Sesi Kelas 11';
      html += `
        <div class="autocomplete-item" onclick="switchToSessionAndMark(${m.level}, ${m.id})">
          <div class="item-person-info">
            <div class="item-name-text">${highlightMatch(m.name, query)}</div>
            <div class="item-meta-sub" style="color: #dc2626;">Terdaftar di <strong>${targetSesi}</strong> (${m.class})</div>
          </div>
          <div class="item-quick-actions">
            <span style="font-size: 0.72rem; color: #2563eb; font-weight: 700;">Pindah Sesi &rarr;</span>
          </div>
        </div>
      `;
    });
  }

  dropdown.innerHTML = html;
  dropdown.classList.add('show');
}

function selectFromAutocomplete(memberId, status = 'Hadir') {
  setMemberStatus(memberId, status);
  const target = currentSheetData.find(m => m.memberId === memberId);
  const memberName = target ? target.name : 'Anggota';

  const row = document.getElementById(`row-member-${memberId}`);
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.add('row-highlight');
    setTimeout(() => { row.classList.remove('row-highlight'); }, 1800);
  }

  clearAutocomplete();
  showToast(`✓ ${memberName} (${target ? target.class : ''}) ditandai ${status}!`);
}

function switchToSessionAndMark(targetLevel, memberId) {
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
  selectFromAutocomplete(memberId, 'Hadir');
}

// Aksi Masal Admin
function initBatchActions() {
  const btnMarkAll = document.getElementById('btnMarkAllPresent');
  const btnReset = document.getElementById('btnResetSession');
  const btnSave = document.getElementById('btnSaveSession');

  if (btnMarkAll) {
    btnMarkAll.addEventListener('click', () => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')} WITA`;

      currentSheetData.forEach(item => {
        if (item.status === 'Belum' || item.status === 'Alpa') {
          item.status = 'Hadir';
          item.time = timeStr;
          item.note = 'Presensi massal admin';
        }
      });

      renderAttendanceTable();
      updateSummaryMetrics();
      PMR_DB.saveAttendanceSheet(currentSessionDate, currentSessionLevel, currentSheetData);
      showToast('✓ Seluruh siswa pada sesi ini telah ditandai Hadir!');
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (!confirm('Yakin ingin mereset status presensi sesi ini?')) return;
      currentSheetData.forEach(item => {
        item.status = 'Belum';
        item.time = '-';
        item.note = '';
      });
      renderAttendanceTable();
      updateSummaryMetrics();
      PMR_DB.saveAttendanceSheet(currentSessionDate, currentSessionLevel, currentSheetData);
      showToast('Status presensi sesi ini berhasil direset.');
    });
  }

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      PMR_DB.saveAttendanceSheet(currentSessionDate, currentSessionLevel, currentSheetData);
      showToast('✓ Data presensi sesi latihan berhasil disimpan ke database!');
    });
  }
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
window.setMemberStatus = setMemberStatus;
window.updateMemberNote = updateMemberNote;
window.selectFromAutocomplete = selectFromAutocomplete;
window.switchToSessionAndMark = switchToSessionAndMark;
window.previewLargeSignature = previewLargeSignature;
window.closeSigPreviewModal = closeSigPreviewModal;
window.showToast = showToast;
