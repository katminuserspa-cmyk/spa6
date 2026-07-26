/**
 * ENTERPRISE SAAS DASHBOARD MODULE
 * Advanced Data Visualization & Theme-Adaptive Analytics
 */

let chartInstances = {};
let currentTabData = null;

export async function render(container) {
  container.innerHTML = `
        <style>
            .dash-wrap { font-family: 'Inter', system-ui, sans-serif; color: var(--color-text-primary); }
            .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 28px; }
            .kpi-card { background: var(--color-bg-card); border: 1px solid var(--color-border-card); padding: 22px 24px; border-radius: 16px; backdrop-filter: blur(12px); transition: transform 0.2s, border-color 0.2s, box-shadow 0.3s; position:relative; overflow:hidden; }
            .kpi-card:hover { transform: translateY(-3px); border-color: var(--color-primary); box-shadow: var(--shadow-card); }
            .kpi-card::before { content:''; display:block; height:3px; position:absolute; top:0; left:0; right:0; background: linear-gradient(90deg, var(--color-primary), var(--color-info)); border-radius:2px; }
            .kpi-label { color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
            .kpi-value { font-size: 1.85rem; font-weight: 800; color: var(--color-text-primary); line-height: 1.1; margin-top:4px; }
            .chart-box { background: var(--color-bg-card); border: 1px solid var(--color-border-card); padding: 24px; border-radius: 16px; margin-bottom: 24px; transition: background 0.3s, border-color 0.3s; box-shadow: var(--shadow-sm); }
            .chart-box h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 20px; color: var(--color-text-heading); display:flex; align-items:center; gap:10px; }
            .tab-btn { padding: 10px 18px; border: 1px solid var(--color-border-card); background: var(--color-bg-card); color: var(--color-text-muted); border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: 0.2s; white-space: nowrap; display:inline-flex; align-items:center; gap:8px; }
            .tab-btn:hover { color: var(--color-text-primary); background: var(--color-bg-card-hover); border-color: var(--color-border); }
            .tab-btn.active { background: var(--color-primary); color: #ffffff; border-color: var(--color-primary); box-shadow: var(--shadow-primary); }
            .ledger-wrap { background: var(--color-bg-card); border: 1px solid var(--color-border-card); padding: 24px; border-radius: 16px; transition: background 0.3s, border-color 0.3s; box-shadow: var(--shadow-sm); }
            .data-table { width: 100%; border-collapse: collapse; }
            .data-table th { background: var(--color-bg-table-header); color: var(--color-text-heading); font-size: 0.75rem; padding: 14px 16px; text-align: left; text-transform: uppercase; letter-spacing: 0.06em; position: sticky; top: 0; font-weight:700; }
            .data-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border-subtle); font-size: 0.88rem; color: var(--color-text-secondary); }
            .data-table tbody tr:hover { background: var(--color-bg-table-hover); }
            .f-select { background: var(--color-bg-input); border: 1px solid var(--color-border-input); color: var(--color-text-primary); padding: 9px 14px; border-radius: 8px; font-size: 0.85rem; outline: none; min-width: 130px; transition: border-color 0.3s, background 0.3s; }
            .f-select:focus { border-color: var(--color-primary); }
            .btn-apply { background: var(--color-primary); color: #fff; padding: 9px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 0.85rem; display:flex; align-items:center; gap:6px; transition: background 0.2s; }
            .btn-apply:hover { background: var(--color-primary-dark); }
            .btn-export { background: var(--color-bg-input); border: 1px solid var(--color-border-input); color: var(--color-text-primary); padding: 9px 16px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; font-weight:600; }
            .btn-export:hover { border-color: var(--color-primary); color: var(--color-primary); }
            .no-data { text-align:center; padding: 60px 20px; color: var(--color-text-muted); font-size: 0.9rem; }
            .status-ok { background: rgba(34,197,94,0.12); color: #22c55e; font-weight: 700; padding:4px 10px; border-radius:6px; font-size:0.75rem; }
            .status-warn { background: rgba(245,158,11,0.12); color: #f59e0b; font-weight: 700; padding:4px 10px; border-radius:6px; font-size:0.75rem; }
            .status-bad { background: rgba(239,68,68,0.12); color: #ef4444; font-weight: 700; padding:4px 10px; border-radius:6px; font-size:0.75rem; }
        </style>

        <div class="dash-wrap">
            <!-- Filter Toolbar -->
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4 p-3 rounded shadow-sm w-100" style="background:var(--color-bg-card); border:1px solid var(--color-border-card);">
                <div class="d-flex flex-wrap align-items-center gap-3 flex-grow-1">
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold text-heading me-1" style="font-size:0.88rem; white-space: nowrap;"><i class="fas fa-filter text-primary me-1"></i> Date Range:</span>
                    <input type="date" id="dashStart" class="f-select">
                    <span style="color:var(--color-text-muted)">→</span>
                    <input type="date" id="dashEnd" class="f-select">
                  </div>
                  <div class="d-flex align-items-center gap-2 flex-grow-1 flex-wrap">
                    <select id="filterStaff" class="f-select flex-grow-1"><option value="">All Staff</option></select>
                    <select id="filterService" class="f-select flex-grow-1"><option value="">All Services</option></select>
                    <select id="filterBranch" class="f-select flex-grow-1"><option value="">All Branches</option></select>
                  </div>
                </div>

                <div class="d-flex flex-wrap align-items-center gap-2 justify-content-start justify-content-lg-end w-100 w-lg-auto">
                    <div class="btn-group" role="group">
                        <button class="btn-export" data-range="7">7D</button>
                        <button class="btn-export" data-range="30">30D</button>
                        <button class="btn-export" data-range="90">90D</button>
                    </div>
                    <button class="btn-apply flex-grow-1 flex-sm-grow-0 justify-content-center" id="applyFilters"><i class="fas fa-sync-alt"></i> Apply Filters</button>
                    <button class="btn-export flex-grow-1 flex-sm-grow-0 justify-content-center" id="exportBtn"><i class="fas fa-file-export"></i> Export CSV</button>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="d-flex gap-2 mb-4 overflow-auto pb-1" style="scrollbar-width:thin;">
                <button class="tab-btn active" data-tab="revenue"><i class="fas fa-coins text-warning"></i> Revenue</button>
                <button class="tab-btn" data-tab="bookings"><i class="fas fa-calendar-check text-info"></i> Bookings</button>
                <button class="tab-btn" data-tab="customers"><i class="fas fa-users text-success"></i> Customers</button>
                <button class="tab-btn" data-tab="staff"><i class="fas fa-user-friends text-primary"></i> Staff</button>
                <button class="tab-btn" data-tab="memberships"><i class="fas fa-id-card text-danger"></i> Memberships</button>
                <button class="tab-btn" data-tab="profit"><i class="fas fa-chart-line text-success"></i> Profit & Margin</button>
                <button class="tab-btn" data-tab="services"><i class="fas fa-concierge-bell text-warning"></i> Services</button>
                <button class="tab-btn" data-tab="forecast"><i class="fas fa-brain text-info"></i> AI Forecast</button>
            </div>

            <!-- KPI Row -->
            <div class="kpi-grid" id="kpiRow"></div>

            <!-- Charts Grid -->
            <div class="row mb-4">
                <div class="col-lg-8">
                    <div class="chart-box" style="height:410px">
                        <h3 id="mainChartTitle"><i class="fas fa-chart-area" style="color:var(--color-primary)"></i> Trend Analytics</h3>
                        <div style="height:320px; position:relative"><canvas id="mainChart"></canvas><div id="mainNoData" class="no-data d-none">No data available for this date range</div></div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="chart-box" style="height:410px">
                        <h3 id="sideChartTitle"><i class="fas fa-chart-pie" style="color:var(--color-info)"></i> Breakdown</h3>
                        <div style="height:320px; position:relative"><canvas id="sideChart"></canvas><div id="sideNoData" class="no-data d-none">No distribution data available</div></div>
                    </div>
                </div>
            </div>

            <!-- Analytics Ledger Table -->
            <div class="ledger-wrap">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                    <h3 id="tableTitle" class="m-0" style="font-size:1rem; font-weight:700; color:var(--color-text-heading)">
                        <i class="fas fa-table text-primary me-2"></i> Analytics Ledger
                    </h3>
                    <div class="d-flex align-items-center gap-2">
                      <i class="fas fa-search text-muted"></i>
                      <input type="text" id="tableSearch" placeholder="Search table..." class="f-select" style="width:220px">
                    </div>
                </div>
                <div style="max-height:480px; overflow-y:auto; border-radius:10px; border:1px solid var(--color-border-card)">
                    <table class="data-table"><thead id="tableHead"></thead><tbody id="tableBody"></tbody></table>
                </div>
            </div>
        </div>
    `;

  // Date range defaults
  const today = new Date().toISOString().split('T')[0];
  const d30 = new Date(Date.now() - 30 * 864e5).toISOString().split('T')[0];
  document.getElementById('dashStart').value = d30;
  document.getElementById('dashEnd').value = today;

  await loadFilters();
  setupEvents();
  await loadDashboard('revenue');

  window.removeEventListener('themeChanged', handleDashboardThemeChange);
  window.addEventListener('themeChanged', handleDashboardThemeChange);
}

function handleDashboardThemeChange() {
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'revenue';
  if (currentTabData) {
    renderCharts(activeTab, currentTabData);
  }
}

async function loadFilters() {
  try {
    const r = await fetch('/api/dashboard/filters', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!r.ok) return;
    const d = await r.json();
    const ss = document.getElementById('filterStaff');
    const sv = document.getElementById('filterService');
    const sb = document.getElementById('filterBranch');
    (d.staff || []).forEach(s => ss.innerHTML += `<option value="${s.id}">${s.name}</option>`);
    (d.services || []).forEach(s => sv.innerHTML += `<option value="${s.id}">${s.name}</option>`);
    (d.branches || []).forEach(b => sb.innerHTML += `<option value="${b.id}">${b.name}</option>`);
  } catch (e) { console.warn('Filter load skipped:', e.message); }
}

function setupEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadDashboard(btn.dataset.tab);
    };
  });
  document.getElementById('applyFilters').onclick = () => {
    const t = document.querySelector('.tab-btn.active')?.dataset.tab || 'revenue';
    loadDashboard(t);
  };
  document.querySelectorAll('[data-range]').forEach(btn => {
    btn.onclick = () => {
      const days = parseInt(btn.dataset.range);
      document.getElementById('dashStart').value = new Date(Date.now() - days * 864e5).toISOString().split('T')[0];
      document.getElementById('applyFilters').click();
    };
  });
  document.getElementById('tableSearch').oninput = e => {
    const v = e.target.value.toLowerCase();
    document.querySelectorAll('#tableBody tr').forEach(tr => {
      tr.style.display = tr.innerText.toLowerCase().includes(v) ? '' : 'none';
    });
  };
  document.getElementById('exportBtn').onclick = exportCSV;
}

async function loadDashboard(tab) {
  const start = document.getElementById('dashStart').value;
  const end = document.getElementById('dashEnd').value;
  const staff = document.getElementById('filterStaff').value;
  const service = document.getElementById('filterService').value;
  const branch = document.getElementById('filterBranch').value;

  const kpiRow = document.getElementById('kpiRow');
  kpiRow.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-text-muted)">
        <i class="fas fa-circle-notch fa-spin" style="font-size:1.5rem;color:var(--color-primary)"></i>
        <p class="mt-2 mb-0">Loading analytics parameters...</p></div>`;

  try {
    const url = `/api/dashboard/${tab}?startDate=${start}&endDate=${end}&staffId=${staff}&serviceId=${service}&branchId=${branch}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    const data = await r.json();

    if (!r.ok) {
      kpiRow.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-danger)">
                <i class="fas fa-exclamation-triangle me-2"></i> API Error: ${data.error || 'Failed to fetch dashboard data'}</div>`;
      return;
    }

    currentTabData = data;
    renderKPIs(tab, data);
    renderCharts(tab, data);
    renderTable(tab, data);
  } catch (err) {
    console.error('Dashboard load error:', err);
    kpiRow.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-danger)">
            <i class="fas fa-wifi me-2"></i> Connection error. Please verify network or server state.</div>`;
  }
}

// Safe number helper
const n = (v) => parseFloat(v) || 0;

function renderKPIs(tab, data) {
  const row = document.getElementById('kpiRow');
  let kpis = [];

  if (tab === 'revenue') {
    const tbl = Array.isArray(data.table) ? data.table : [];
    const total = tbl.reduce((s, r) => s + n(r.net_amount), 0);
    kpis = [
      { label: 'Total Revenue', value: '₹' + total.toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-wallet', color: 'var(--color-primary)', bg: 'rgba(20,184,166,0.15)', badge: 'Gross Sales' },
      { label: 'Invoices Issued', value: tbl.length, icon: 'fas fa-file-invoice-dollar', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', badge: 'Total Billed' },
      { label: 'Avg Ticket Value', value: '₹' + (tbl.length ? total / tbl.length : 0).toFixed(0), icon: 'fas fa-chart-line', color: '#10b981', bg: 'rgba(16,185,129,0.15)', badge: 'Per Order' },
      { label: 'Tax Collected', value: '₹' + tbl.reduce((s, r) => s + n(r.tax), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-calculator', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', badge: 'GST / Taxes' }
    ];
  } else if (tab === 'bookings') {
    const tbl = Array.isArray(data.table) ? data.table : [];
    const completed = tbl.filter(r => r.status === 'completed').length;
    kpis = [
      { label: 'Total Booked', value: tbl.length, icon: 'fas fa-calendar-alt', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', badge: 'Appointments' },
      { label: 'Completed', value: completed, icon: 'fas fa-check-circle', color: '#10b981', bg: 'rgba(16,185,129,0.15)', badge: 'Serviced' },
      { label: 'Completion Rate', value: tbl.length ? ((completed / tbl.length) * 100).toFixed(1) + '%' : '0%', icon: 'fas fa-percentage', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', badge: 'Fulfillment' },
      { label: 'Total Value', value: '₹' + tbl.reduce((s, r) => s + n(r.amount), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-rupee-sign', color: 'var(--color-primary)', bg: 'rgba(20,184,166,0.15)', badge: 'Booking Sum' }
    ];
  } else if (tab === 'customers') {
    const tbl = Array.isArray(data.table) ? data.table : [];
    const churnRisk = tbl.filter(r => n(r.churn_score) > 60).length;
    const totalCLV = tbl.reduce((s, r) => s + n(r.clv), 0);
    kpis = [
      { label: 'Total Customers', value: tbl.length, icon: 'fas fa-users', color: 'var(--color-primary)', bg: 'rgba(20,184,166,0.15)', badge: 'Registered' },
      { label: 'At Churn Risk', value: churnRisk, icon: 'fas fa-user-slash', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', badge: '>60d Inactive' },
      { label: 'Total CLV', value: '₹' + totalCLV.toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-crown', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', badge: 'Lifetime Val' },
      { label: 'Avg Spend / Client', value: '₹' + (tbl.length ? totalCLV / tbl.length : 0).toFixed(0), icon: 'fas fa-user-tag', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', badge: 'Average' }
    ];
  } else if (tab === 'staff') {
    const tbl = Array.isArray(data.table) ? data.table : [];
    const totalRev = tbl.reduce((s, r) => s + n(r.revenue), 0);
    const avgProd = tbl.length ? tbl.reduce((s, r) => s + n(r.productivity), 0) / tbl.length : 0;
    kpis = [
      { label: 'Active Staff', value: tbl.length, icon: 'fas fa-user-tie', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', badge: 'Therapists' },
      { label: 'Total Revenue', value: '₹' + totalRev.toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-coins', color: 'var(--color-primary)', bg: 'rgba(20,184,166,0.15)', badge: 'Staff Generated' },
      { label: 'Avg Productivity', value: avgProd.toFixed(1) + '%', icon: 'fas fa-tachometer-alt', color: '#10b981', bg: 'rgba(16,185,129,0.15)', badge: 'Utilization' },
      { label: 'Top Performer', value: tbl[0]?.staff_name || 'N/A', icon: 'fas fa-trophy', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', badge: 'Rank #1' }
    ];
  } else if (tab === 'memberships') {
    const tbl = Array.isArray(data.table) ? data.table : [];
    const active = tbl.filter(r => r.status === 'active').length;
    const expiring = tbl.filter(r => {
      const diff = (new Date(r.expiry_date) - Date.now()) / 864e5;
      return diff > 0 && diff <= 7;
    }).length;
    kpis = [
      { label: 'Total Members', value: tbl.length, icon: 'fas fa-id-card', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', badge: 'Total Enrolled' },
      { label: 'Active Plans', value: active, icon: 'fas fa-id-badge', color: '#10b981', bg: 'rgba(16,185,129,0.15)', badge: 'Subscribed' },
      { label: 'Expiring (7 Days)', value: expiring, icon: 'fas fa-exclamation-triangle', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', badge: 'Renew Needed' },
      { label: 'MRR', value: '₹' + tbl.filter(r => r.status === 'active').reduce((s, r) => s + n(r.revenue), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-sync', color: 'var(--color-primary)', bg: 'rgba(20,184,166,0.15)', badge: 'Recurring' }
    ];
  } else if (tab === 'profit') {
    const tbl = Array.isArray(data.table) ? data.table : [];
    const rev = tbl.reduce((s, r) => s + n(r.total_revenue), 0);
    const exp = tbl.reduce((s, r) => s + n(r.total_expense), 0);
    const profit = rev - exp;
    kpis = [
      { label: 'Total Revenue', value: '₹' + rev.toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-arrow-up', color: '#10b981', bg: 'rgba(16,185,129,0.15)', badge: 'Income' },
      { label: 'Total Expense', value: '₹' + exp.toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-arrow-down', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', badge: 'Outflow' },
      { label: 'Net Profit', value: '₹' + profit.toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-chart-line', color: profit >= 0 ? '#10b981' : '#ef4444', bg: profit >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', badge: 'Net Gain' },
      { label: 'Profit Margin', value: rev > 0 ? ((profit / rev) * 100).toFixed(1) + '%' : '0%', icon: 'fas fa-percentage', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', badge: 'Margin %' }
    ];
  } else if (tab === 'services') {
    const tbl = Array.isArray(data.table) ? data.table : [];
    const totalRev = tbl.reduce((s, r) => s + n(r.revenue), 0);
    kpis = [
      { label: 'Catalog Services', value: tbl.length, icon: 'fas fa-concierge-bell', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', badge: 'Active Menu' },
      { label: 'Service Revenue', value: '₹' + totalRev.toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-coins', color: 'var(--color-primary)', bg: 'rgba(20,184,166,0.15)', badge: 'Total Sales' },
      { label: 'Top Service', value: tbl[0]?.service_name || 'N/A', icon: 'fas fa-star', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', badge: '#1 Popular' },
      { label: 'Avg Duration', value: tbl.length ? (tbl.reduce((s, r) => s + n(r.duration), 0) / tbl.length).toFixed(0) + 'm' : '0m', icon: 'fas fa-clock', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', badge: 'Duration' }
    ];
  } else if (tab === 'forecast') {
    const fc = Array.isArray(data.forecast) ? data.forecast : [];
    const tbl = Array.isArray(data.table) ? data.table : [];
    const totalFc = fc.reduce((s, r) => s + n(r.predicted_revenue), 0);
    const highChurn = tbl.filter(r => n(r.churn_probability) >= 0.8).length;
    kpis = [
      { label: '30-Day Forecast', value: '₹' + totalFc.toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: 'fas fa-brain', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', badge: 'AI Projected' },
      { label: 'Daily Avg Pred.', value: '₹' + (fc.length ? totalFc / fc.length : 0).toFixed(0), icon: 'fas fa-calendar-day', color: '#10b981', bg: 'rgba(16,185,129,0.15)', badge: 'Expected/Day' },
      { label: 'High Churn Risk', value: highChurn, icon: 'fas fa-user-slash', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', badge: 'Action Needed' },
      { label: 'Model Confidence', value: '91%', icon: 'fas fa-shield-alt', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', badge: 'R² Accuracy' }
    ];
  }

  row.style.gridTemplateColumns = `repeat(${kpis.length}, 1fr)`;
  row.innerHTML = kpis.map(k => `
        <div class="kpi-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="kpi-label">${k.label}</div>
                <div style="width:38px; height:38px; border-radius:10px; background:${k.bg}; color:${k.color}; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">
                    <i class="${k.icon}"></i>
                </div>
            </div>
            <div class="d-flex align-items-baseline justify-content-between">
                <div class="kpi-value">${k.value}</div>
                <span class="badge" style="background:var(--color-bg-card-hover); color:var(--color-text-secondary); border:1px solid var(--color-border-card); font-size:0.7rem;">${k.badge}</span>
            </div>
        </div>
    `).join('');
}

function renderCharts(tab, data) {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch (e) { } });
  chartInstances = {};

  const mainCtx = document.getElementById('mainChart');
  const sideCtx = document.getElementById('sideChart');
  const mainND = document.getElementById('mainNoData');
  const sideND = document.getElementById('sideNoData');

  if (!mainCtx || !sideCtx) return;

  mainND.classList.add('d-none'); mainCtx.style.display = '';
  sideND.classList.add('d-none'); sideCtx.style.display = '';

  const isLight = document.body.classList.contains('light-mode');
  const textColor = isLight ? '#000000' : '#94a3b8';
  const gridColor = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.06)';

  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: textColor, font: { family: 'Inter', size: 11, weight: '600' }, padding: 16 }
      },
      tooltip: {
        backgroundColor: isLight ? '#ffffff' : '#0f2e2c',
        titleColor: isLight ? '#000000' : '#ecfdf5',
        bodyColor: isLight ? '#0f172a' : '#99f6e4',
        borderColor: isLight ? '#000000' : '#134e4a',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter', size: 11 }, maxTicksLimit: 12 }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
      }
    }
  };
  const noScales = { ...baseOpts, scales: {} };

  const COLORS = ['#14b8a6', '#06b6d4', '#10b981', '#f59e0b', '#7c3aed', '#ef4444', '#3b82f6', '#ec4899'];

  const showNoData = (el, canvas) => { el.classList.remove('d-none'); canvas.style.display = 'none'; };

  if (tab === 'revenue') {
    const trend = Array.isArray(data.dailyTrend) ? data.dailyTrend : [];
    const split = Array.isArray(data.paymentSplit) ? data.paymentSplit : [];
    if (!trend.length) { showNoData(mainND, mainCtx); }
    else {
      const ctx = mainCtx.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(20,184,166,0.35)');
      gradient.addColorStop(1, 'rgba(20,184,166,0.01)');

      chartInstances.main = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trend.map(d => d.x),
          datasets: [{
            label: 'Revenue (₹)',
            data: trend.map(d => n(d.y)),
            borderColor: '#14b8a6',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            backgroundColor: gradient,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: baseOpts
      });
    }
    if (!split.length) { showNoData(sideND, sideCtx); }
    else {
      chartInstances.side = new Chart(sideCtx.getContext('2d'), {
        type: 'doughnut',
        data: { labels: split.map(d => d.label || 'Other'), datasets: [{ data: split.map(d => n(d.value)), backgroundColor: COLORS }] },
        options: { ...noScales, cutout: '70%' }
      });
    }
  } else if (tab === 'bookings') {
    const trend = Array.isArray(data.trend) ? data.trend : [];
    const status = Array.isArray(data.status) ? data.status : [];
    if (!trend.length) showNoData(mainND, mainCtx);
    else chartInstances.main = new Chart(mainCtx.getContext('2d'), { type: 'bar', data: { labels: trend.map(d => d.x), datasets: [{ label: 'Bookings', data: trend.map(d => n(d.y)), backgroundColor: '#06b6d4', borderRadius: 6 }] }, options: baseOpts });
    if (!status.length) showNoData(sideND, sideCtx);
    else chartInstances.side = new Chart(sideCtx.getContext('2d'), { type: 'pie', data: { labels: status.map(d => d.label), datasets: [{ data: status.map(d => n(d.value)), backgroundColor: COLORS }] }, options: noScales });
  } else if (tab === 'customers') {
    const top = Array.isArray(data.topCustomers) ? data.topCustomers : [];
    const nvr = Array.isArray(data.newVsRepeat) ? data.newVsRepeat : [];
    if (!top.length) showNoData(mainND, mainCtx);
    else chartInstances.main = new Chart(mainCtx.getContext('2d'), { type: 'bar', data: { labels: top.map(d => d.x), datasets: [{ label: 'Spend (₹)', data: top.map(d => n(d.y)), backgroundColor: '#7c3aed', borderRadius: 6 }] }, options: baseOpts });
    if (!nvr.length) showNoData(sideND, sideCtx);
    else chartInstances.side = new Chart(sideCtx.getContext('2d'), { type: 'doughnut', data: { labels: nvr.map(d => d.label), datasets: [{ data: nvr.map(d => n(d.value)), backgroundColor: ['#06b6d4', '#10b981'] }] }, options: { ...noScales, cutout: '70%' } });
  } else if (tab === 'staff') {
    const trend = Array.isArray(data.trend) ? data.trend : [];
    const rev = Array.isArray(data.rev) ? data.rev : [];
    if (!trend.length) showNoData(mainND, mainCtx);
    else {
      const ctx = mainCtx.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(16,185,129,0.35)');
      gradient.addColorStop(1, 'rgba(16,185,129,0.01)');
      chartInstances.main = new Chart(ctx, { type: 'line', data: { labels: trend.map(d => d.x), datasets: [{ label: 'Daily Revenue (₹)', data: trend.map(d => n(d.y)), borderColor: '#10b981', borderWidth: 3, backgroundColor: gradient, fill: true, tension: 0.4 }] }, options: baseOpts });
    }
    if (!rev.length) showNoData(sideND, sideCtx);
    else chartInstances.side = new Chart(sideCtx.getContext('2d'), { type: 'bar', data: { labels: rev.map(d => d.x), datasets: [{ label: 'Revenue (₹)', data: rev.map(d => n(d.y)), backgroundColor: '#14b8a6', borderRadius: 6 }] }, options: baseOpts });
  } else if (tab === 'memberships') {
    const status = Array.isArray(data.status) ? data.status : [];
    if (!status.length) { showNoData(mainND, mainCtx); showNoData(sideND, sideCtx); }
    else {
      chartInstances.main = new Chart(mainCtx.getContext('2d'), { type: 'bar', data: { labels: status.map(d => d.label), datasets: [{ label: 'Count', data: status.map(d => n(d.value)), backgroundColor: COLORS, borderRadius: 6 }] }, options: baseOpts });
      chartInstances.side = new Chart(sideCtx.getContext('2d'), { type: 'doughnut', data: { labels: status.map(d => d.label), datasets: [{ data: status.map(d => n(d.value)), backgroundColor: COLORS }] }, options: { ...noScales, cutout: '70%' } });
    }
  } else if (tab === 'profit') {
    const monthly = Array.isArray(data.monthly) ? data.monthly : [];
    const expenses = Array.isArray(data.expenses) ? data.expenses : [];
    const split = Array.isArray(data.expenseSplit) ? data.expenseSplit : [];
    if (!monthly.length) showNoData(mainND, mainCtx);
    else {
      const expMap = {};
      expenses.forEach(e => { expMap[e.month] = n(e.expense); });
      chartInstances.main = new Chart(mainCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: monthly.map(d => d.month), datasets: [
            { label: 'Revenue', data: monthly.map(d => n(d.revenue)), backgroundColor: '#10b981', borderRadius: 6 },
            { label: 'Expense', data: monthly.map(d => expMap[d.month] || 0), backgroundColor: '#ef4444', borderRadius: 6 }
          ]
        },
        options: baseOpts
      });
    }
    if (!split.length) showNoData(sideND, sideCtx);
    else chartInstances.side = new Chart(sideCtx.getContext('2d'), { type: 'pie', data: { labels: split.map(d => d.label), datasets: [{ data: split.map(d => n(d.value)), backgroundColor: COLORS }] }, options: noScales });
  } else if (tab === 'services') {
    const rev = Array.isArray(data.rev) ? data.rev : [];
    const pop = Array.isArray(data.pop) ? data.pop : [];
    if (!rev.length) showNoData(mainND, mainCtx);
    else chartInstances.main = new Chart(mainCtx.getContext('2d'), { type: 'bar', data: { labels: rev.map(d => d.x), datasets: [{ label: 'Revenue (₹)', data: rev.map(d => n(d.y)), backgroundColor: '#7c3aed', borderRadius: 6 }] }, options: baseOpts });
    if (!pop.length) showNoData(sideND, sideCtx);
    else chartInstances.side = new Chart(sideCtx.getContext('2d'), { type: 'bar', data: { labels: pop.map(d => d.x), datasets: [{ label: 'Bookings', data: pop.map(d => n(d.y)), backgroundColor: '#06b6d4', borderRadius: 6 }] }, options: { ...baseOpts, indexAxis: 'y' } });
  } else if (tab === 'forecast') {
    const fc = Array.isArray(data.forecast) ? data.forecast : [];
    if (!fc.length) showNoData(mainND, mainCtx);
    else {
      const ctx = mainCtx.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(6,182,212,0.35)');
      gradient.addColorStop(1, 'rgba(6,182,212,0.01)');
      chartInstances.main = new Chart(ctx, {
        type: 'line',
        data: { labels: fc.map(d => d.date), datasets: [{ label: 'Predicted Revenue (₹)', data: fc.map(d => n(d.predicted_revenue)), borderColor: '#06b6d4', borderWidth: 3, borderDash: [6, 4], fill: true, backgroundColor: gradient, tension: 0.4 }] },
        options: baseOpts
      });
    }
    chartInstances.side = new Chart(sideCtx.getContext('2d'), { type: 'doughnut', data: { labels: ['Certainty', 'Variance'], datasets: [{ data: [91, 9], backgroundColor: ['#10b981', '#f59e0b'] }] }, options: { ...noScales, cutout: '78%' } });
  }
}

function renderTable(tab, data) {
  const head = document.getElementById('tableHead');
  const body = document.getElementById('tableBody');
  const title = document.getElementById('tableTitle');

  if (!head || !body || !title) return;

  const tbl = Array.isArray(data.table) ? data.table : [];
  title.innerHTML = `<i class="fas fa-table text-primary me-2"></i> ${tab.charAt(0).toUpperCase() + tab.slice(1)} Ledger Analytics`;

  if (!tbl.length) {
    head.innerHTML = '';
    body.innerHTML = '<tr><td colspan="15" class="no-data">No records found for the selected filter parameters.</td></tr>';
    return;
  }

  const cols = Object.keys(tbl[0]);
  head.innerHTML = `<tr>${cols.map(c => `<th>${c.replace(/_/g, ' ')}</th>`).join('')}</tr>`;

  const moneyKeys = ['amount', 'price', 'revenue', 'spend', 'clv', 'net_amount', 'tax', 'discount', 'gross_amount', 'total_revenue', 'total_expense', 'net_profit', 'predicted_revenue'];
  const pctKeys = ['probability', 'productivity', 'margin'];

  body.innerHTML = tbl.map(row => `<tr>${cols.map(col => {
    let v = row[col];
    if (v === null || v === undefined) return '<td>—</td>';
    if (moneyKeys.some(k => col.includes(k))) return `<td class="fw-bold" style="color:var(--color-text-primary);">₹${n(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>`;
    if (pctKeys.some(k => col.includes(k))) return `<td class="fw-bold" style="color:var(--color-primary);">${(n(v) * (n(v) <= 1 ? 100 : 1)).toFixed(1)}%</td>`;
    if (col === 'status') {
      const cls = ['completed', 'active', 'paid'].includes(String(v).toLowerCase()) ? 'status-ok' : ['pending', 'unpaid'].includes(String(v).toLowerCase()) ? 'status-warn' : 'status-bad';
      return `<td><span class="${cls}">● ${v}</span></td>`;
    }
    return `<td>${v}</td>`;
  }).join('')}</tr>`).join('');
}

function exportCSV() {
  const tbl = currentTabData?.table;
  if (!Array.isArray(tbl) || !tbl.length) { 
    if (window.utils?.showToast) utils.showToast('No data available to export', 'info'); 
    return; 
  }
  const cols = Object.keys(tbl[0]);
  const csv = [cols.join(','), ...tbl.map(r => cols.map(c => `"${r[c] ?? ''}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  a.download = `salon_${document.querySelector('.tab-btn.active')?.dataset.tab || 'analytics'}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}