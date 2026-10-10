/**
 * Reports & Summary Logic (reports.js)
 * PMR Wira SMKN 7 Samarinda
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DATA === 'undefined') return;

  renderRecapTable();
  initReportFilters();
  initReportCharts();
});

function renderRecapTable(filterPeriod = 'oktober', filterClass = 'all') {
  const tbody = document.getElementById('reportRecapTbody');
  if (!tbody) return;

  let members = PMR_DATA.members;
  if (filterClass !== 'all') {
    members = members.filter(m => m.class.startsWith(filterClass));
  }

  let html = '';
  members.forEach((m, idx) => {
    // Generate realistic distribution of H, I, S, A
    let h = 18;
    let i = 1;
    let s = 1;
    let a = 0;

    if (m.attendanceRate >= 95) {
      h = 19; i = 1; s = 0; a = 0;
    } else if (m.attendanceRate < 90) {
      h = 16; i = 1; s = 2; a = 1;
    }

    const totalDays = h + i + s + a;
    const pct = Math.round((h / totalDays) * 100);

    html += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-family: monospace;">${m.nisn}</td>
        <td>
          <strong>${m.name}</strong>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${m.role}</div>
        </td>
        <td>${m.class}</td>
        <td style="text-align: center; font-weight: 700; color: #16a34a;">${h}</td>
        <td style="text-align: center; color: #2563eb;">${i}</td>
        <td style="text-align: center; color: #d97706;">${s}</td>
        <td style="text-align: center; color: #dc2626;">${a}</td>
        <td style="text-align: center; font-weight: 800;">${pct}%</td>
        <td>
          <span class="badge ${pct >= 85 ? 'badge-hadir' : 'badge-sakit'}">
            ${pct >= 85 ? 'Memenuhi Syarat' : 'Perlu Pembinaan'}
          </span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function initReportFilters() {
  const periodSelect = document.getElementById('reportPeriodSelect');
  const classSelect = document.getElementById('reportClassSelect');

  function apply() {
    const period = periodSelect ? periodSelect.value : 'oktober';
    const classVal = classSelect ? classSelect.value : 'all';
    renderRecapTable(period, classVal);
  }

  if (periodSelect) periodSelect.addEventListener('change', apply);
  if (classSelect) classSelect.addEventListener('change', apply);
}

function initReportCharts() {
  const ctx = document.getElementById('classComparisonChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['X RPL', 'X TKJ', 'X DKV', 'XI RPL', 'XI TKJ', 'XI AKL', 'XII RPL', 'XII TKJ'],
      datasets: [{
        label: 'Tingkat Kehadiran Rata-rata (%)',
        data: [91, 89, 93, 96, 94, 95, 98, 92],
        backgroundColor: '#dc2626',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 80,
          max: 100,
          ticks: { stepSize: 5 }
        }
      }
    }
  });
}
