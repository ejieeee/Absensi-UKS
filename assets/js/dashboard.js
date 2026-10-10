/**
 * Dashboard Logic for PMR Wira SMKN 7 Samarinda
 * Handles Chart.js initialization, live feeds, quick actions, and data binding.
 */

let attendanceChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DATA === 'undefined') {
    console.error('PMR_DATA not loaded');
    return;
  }

  initDashboardStats();
  initAttendanceChart('weekly');
  initChartFilterControls();
  renderUpcomingActivities();
  renderRecentAttendanceLogs();
  initQuickAttendanceModal();
});

// Bind Summary Numbers to Stat Cards
function initDashboardStats() {
  const stats = PMR_DATA.summaryCounts;

  const totalEl = document.getElementById('statTotalMembers');
  const presentEl = document.getElementById('statPresentToday');
  const absentEl = document.getElementById('statAbsentToday');
  const upcomingEl = document.getElementById('statUpcomingActs');

  if (totalEl) totalEl.textContent = stats.totalRegistered;
  if (presentEl) presentEl.textContent = stats.presentToday;
  if (absentEl) absentEl.textContent = stats.absentToday;
  if (upcomingEl) upcomingEl.textContent = stats.upcomingActivities;
}

// Chart.js Attendance Overview
function initAttendanceChart(type = 'weekly') {
  const ctx = document.getElementById('attendanceOverviewChart');
  if (!ctx) return;

  if (attendanceChartInstance) {
    attendanceChartInstance.destroy();
  }

  let labels, hadirData, absentData;

  if (type === 'weekly') {
    labels = PMR_DATA.weeklyStats.days;
    hadirData = PMR_DATA.weeklyStats.presentCount;
    // calculate non-present
    absentData = PMR_DATA.weeklyStats.permissionCount.map((p, idx) => {
      return p + PMR_DATA.weeklyStats.sickCount[idx] + PMR_DATA.weeklyStats.absentCount[idx];
    });
  } else {
    labels = PMR_DATA.monthlyTrends.labels;
    // Map percentages to member count equivalent for visual consistency
    hadirData = PMR_DATA.monthlyTrends.attendancePercentages.map(pct => Math.round((pct / 100) * 48));
    absentData = hadirData.map(h => 48 - h);
  }

  attendanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Hadir (Siswa)',
          data: hadirData,
          backgroundColor: '#dc2626',
          borderRadius: 6,
          barPercentage: 0.55,
          categoryPercentage: 0.65
        },
        {
          label: 'Izin / Sakit / Alpa',
          data: absentData,
          backgroundColor: '#e2e8f0',
          borderRadius: 6,
          barPercentage: 0.55,
          categoryPercentage: 0.65
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 11,
              weight: '600'
            },
            color: '#475569'
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 12,
            weight: '700'
          },
          bodyFont: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 12
          },
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 11,
              weight: '600'
            },
            color: '#64748b'
          }
        },
        y: {
          beginAtZero: true,
          max: 50,
          grid: {
            color: '#f1f5f9'
          },
          ticks: {
            stepSize: 10,
            font: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 11
            },
            color: '#94a3b8'
          }
        }
      }
    }
  });
}

// Chart Weekly/Monthly Toggle Switch
function initChartFilterControls() {
  const pills = document.querySelectorAll('[data-chart-filter]');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filterType = pill.getAttribute('data-chart-filter');
      initAttendanceChart(filterType);
    });
  });
}

// Render Upcoming Activities List
function renderUpcomingActivities() {
  const container = document.getElementById('upcomingActivitiesList');
  if (!container) return;

  const activities = PMR_DATA.activities.slice(0, 3);
  let html = '';

  activities.forEach(act => {
    let catClass = 'category-piket';
    if (act.type === 'latihan') catClass = 'category-latihan';
    if (act.type === 'sosial') catClass = 'category-sosial';

    const officers = act.dutyOfficers.join(', ');

    html += `
      <div class="activity-item">
        <div class="activity-item-header">
          <span class="activity-badge-category ${catClass}">${act.category}</span>
          <span class="badge ${act.status === 'Berlangsung' ? 'badge-hadir' : 'badge-neutral'}">
            ${act.status === 'Berlangsung' ? '<span class="status-dot"></span> Berlangsung' : act.status}
          </span>
        </div>
        <div class="activity-item-title">${act.title}</div>
        <div class="activity-meta-row">
          <div class="activity-meta-item">
            <i class="bi bi-clock"></i>
            <span>${act.time}</span>
          </div>
          <div class="activity-meta-item">
            <i class="bi bi-geo-alt"></i>
            <span>${act.location}</span>
          </div>
        </div>
        <div class="activity-assigned-avatars">
          <i class="bi bi-person-badge"></i>
          <span>Petugas: <strong class="officer-names-tag">${officers}</strong></span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Render Recent Attendance Feed
function renderRecentAttendanceLogs() {
  const tbody = document.getElementById('recentAttendanceTbody');
  if (!tbody) return;

  const logs = PMR_DATA.recentAttendanceLogs.slice(0, 6);
  let html = '';

  logs.forEach(log => {
    const initials = log.name.split(' ').map(n => n[0]).slice(0, 2).join('');
    let badgeClass = 'badge-hadir';
    if (log.status === 'Izin') badgeClass = 'badge-izin';
    if (log.status === 'Sakit') badgeClass = 'badge-sakit';
    if (log.status === 'Alpa') badgeClass = 'badge-alpa';

    html += `
      <tr>
        <td>
          <div class="recent-table-meta-user">
            <div class="user-mini-avatar">${initials}</div>
            <div class="user-text-wrap">
              <span class="user-name-cell">${log.name}</span>
              <span class="user-sub-cell">${log.class} &bull; ${log.memberId}</span>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 600; color: var(--text-main);">${log.session}</span>
        </td>
        <td>
          <span style="font-family: monospace; font-size: 0.8rem; color: var(--text-secondary);">${log.time}</span>
        </td>
        <td>
          <span class="badge ${badgeClass}">${log.status}</span>
        </td>
        <td>
          <span style="font-size: 0.76rem; color: var(--text-muted);">${log.method}</span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Interactive Quick Attendance Recording Modal
function initQuickAttendanceModal() {
  const form = document.getElementById('quickAttendanceForm');
  const selectMember = document.getElementById('quickMemberSelect');

  if (selectMember && PMR_DATA.members) {
    let opts = '<option value="">-- Pilih Anggota PMR --</option>';
    PMR_DATA.members.forEach(m => {
      opts += `<option value="${m.id}">${m.name} (${m.class})</option>`;
    });
    selectMember.innerHTML = opts;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const memberId = selectMember.value;
      const status = form.querySelector('input[name="quickStatus"]:checked')?.value || 'Hadir';
      const notes = document.getElementById('quickNotes')?.value || 'Dicatat via Dashboard';

      if (!memberId) {
        showToast('Peringatan', 'Silakan pilih anggota PMR terlebih dahulu!', 'warning');
        return;
      }

      const member = PMR_DATA.members.find(m => m.id === memberId);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')} WITA`;

      // Prepend to recent logs
      PMR_DATA.recentAttendanceLogs.unshift({
        id: `LOG-${Date.now().toString().slice(-4)}`,
        memberId: member.id,
        name: member.name,
        class: member.class,
        time: timeStr,
        session: "Presensi Lapangan",
        status: status,
        method: "Manual Admin",
        note: notes
      });

      // Update counters
      if (status === 'Hadir') {
        PMR_DATA.summaryCounts.presentToday++;
      } else {
        PMR_DATA.summaryCounts.absentToday++;
      }
      initDashboardStats();
      renderRecentAttendanceLogs();

      closeModal('quickAttendanceModal');
      form.reset();
      showToast('Presensi Berhasil', `Presensi untuk ${member.name} (${status}) berhasil disimpan.`, 'success');
    });
  }
}
