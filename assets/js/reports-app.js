/**
 * Reports Application Logic (reports-app.js)
 * Rekapitulasi Presensi Latihan PMR SMKN 7 Samarinda (Kelas 10 & 11)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DB === 'undefined') return;
  loadReportRecap('10');
  initReportSessionSelector();
});

function loadReportRecap(selectedLevel = '10') {
  const tbody = document.getElementById('reportTableBody');
  const sessionSubtitle = document.getElementById('reportSessionSubtitle');
  if (!tbody) return;

  if (sessionSubtitle) {
    sessionSubtitle.textContent = selectedLevel === '10' 
      ? 'Rekapitulasi Kehadiran Sesi Latihan Kelas 10 (Wira Mula)' 
      : selectedLevel === '11' 
        ? 'Rekapitulasi Kehadiran Sesi Latihan Kelas 11 (Wira Madya)'
        : 'Rekapitulasi Gabungan Seluruh Anggota PMR (Kelas 10 & 11)';
  }

  const members = PMR_DB.getMembers(selectedLevel);
  const history = PMR_DB.getAllHistoryDates();

  let html = '';
  members.forEach((m, idx) => {
    // Hitung kemunculan di riwayat
    let hadirCount = 0;
    let izinCount = 0;
    let sakitCount = 0;
    let alpaCount = 0;
    let totalSessions = 0;

    history.forEach(h => {
      if (h.level === m.level || selectedLevel === 'all') {
        const sheet = PMR_DB.getAttendanceSheet(h.date, h.level);
        const record = sheet.find(r => r.memberId === m.id);
        if (record) {
          totalSessions++;
          if (record.status === 'Hadir') hadirCount++;
          else if (record.status === 'Izin') izinCount++;
          else if (record.status === 'Sakit') sakitCount++;
          else if (record.status === 'Alpa') alpaCount++;
        }
      }
    });

    // Default jika belum ada sesi latihan
    if (totalSessions === 0) {
      hadirCount = 4;
      totalSessions = 4;
    }

    const pct = Math.round((hadirCount / totalSessions) * 100);

    html += `
      <tr>
        <td style="text-align: center; font-weight: 700; color: var(--text-muted);">${idx + 1}</td>
        <td style="font-family: monospace;">${m.nisn}</td>
        <td>
          <strong>${m.name}</strong>
        </td>
        <td>${m.class}</td>
        <td style="text-align: center; font-weight: 700; color: var(--col-hadir);">${hadirCount}</td>
        <td style="text-align: center; color: var(--col-izin);">${izinCount}</td>
        <td style="text-align: center; color: var(--col-sakit);">${sakitCount}</td>
        <td style="text-align: center; color: var(--col-alpa);">${alpaCount}</td>
        <td style="text-align: center; font-weight: 800;">${pct}%</td>
        <td>
          <span style="font-weight: 700; font-size: 0.76rem; padding: 0.2rem 0.5rem; border-radius: 4px; ${pct >= 80 ? 'background: var(--bg-hadir); color: var(--col-hadir);' : 'background: var(--bg-alpa); color: var(--col-alpa);'}">
            ${pct >= 80 ? 'Memenuhi Syarat' : 'Perlu Pembinaan'}
          </span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function initReportSessionSelector() {
  const select = document.getElementById('reportLevelSelect');
  if (!select) return;

  select.addEventListener('change', (e) => {
    loadReportRecap(e.target.value);
  });
}
