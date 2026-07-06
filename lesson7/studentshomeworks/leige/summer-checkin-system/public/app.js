// ==================== Supabase REST API 配置 ====================
const DB_URL = 'https://vivlgvwtxqdytjnpojln.supabase.co/rest/v1';
const DB_KEY = 'sb_publishable_kEXfWYwpz-azFUJoflRLhA_DpbXWzvS';
const HEADERS = {
  'apikey': DB_KEY,
  'Authorization': 'Bearer ' + DB_KEY,
  'Content-Type': 'application/json'
};

async function dbGet(path) {
  const res = await fetch(DB_URL + path, { headers: HEADERS });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function dbPost(path, body) {
  const res = await fetch(DB_URL + path, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function dbPatch(path, body) {
  const res = await fetch(DB_URL + path, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
}

async function dbDelete(path) {
  const res = await fetch(DB_URL + path, {
    method: 'DELETE',
    headers: HEADERS
  });
  if (!res.ok) throw new Error(await res.text());
}

// ==================== 工具函数 ====================

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const wd = weekdays[d.getDay()];
  return `${month}月${day}日 星期${wd}`;
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 2500);
}

function getCategoryBadge(cat) {
  const colors = {
    '拼音': '#E74C3C', '识字': '#E67E22', '数学': '#2980B9',
    '阅读': '#27AE60', '英语': '#8E44AD', '运动': '#16A085',
    '写字': '#2C3E50', '生活习惯': '#D35400', '其他': '#7F8C8D'
  };
  const color = colors[cat] || '#7F8C8D';
  return `<span style="background:${color}11;color:${color};font-size:12px;padding:1px 8px;border-radius:10px;">${cat}</span>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ==================== 页面导航 ====================

let currentPage = 'dashboard';

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');

  switch (page) {
    case 'dashboard': loadDashboard(); break;
    case 'checkin': loadTodayCheckin(); break;
    case 'tasks': loadTasks(); break;
    case 'history': loadHistory(); break;
    case 'stats': loadStats(); break;
  }
}

document.getElementById('nav').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-btn');
  if (!btn) return;
  navigateTo(btn.dataset.page);
});

// ==================== 首页仪表盘 ====================

async function loadDashboard() {
  try {
    const tasks = await dbGet('/tasks?select=*&is_active=eq.true');
    const todayCheckins = await dbGet('/checkins?select=*&checkin_date=eq.' + getToday());
    const allCheckins = await dbGet('/checkins?select=*');

    const activeTasks = tasks || [];
    const todayList = todayCheckins || [];
    const all = allCheckins || [];

    const today = new Date();
    document.getElementById('statDate').textContent = formatDate(getToday());

    const summerEnd = new Date(today.getFullYear(), 7, 31);
    if (today > summerEnd) summerEnd.setFullYear(summerEnd.getFullYear() + 1);
    const daysLeft = Math.ceil((summerEnd - today) / (1000 * 60 * 60 * 24));
    document.getElementById('statCountdown').textContent = `${daysLeft} 天`;

    const todayTotal = activeTasks.length;
    const todayDone = todayList.filter(c => c.is_done).length;
    const todayRate = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

    const dateSet = new Set();
    all.forEach(c => { if (c.is_done) dateSet.add(c.checkin_date); });
    const sortedDates = Array.from(dateSet).sort().reverse();
    let streak = 0;
    const checkDate = new Date(getToday());
    for (const d of sortedDates) {
      if (d === checkDate.toISOString().split('T')[0]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }

    const totalDone = all.filter(c => c.is_done).length;

    document.getElementById('statTodayTotal').textContent = `${todayTotal} 项`;
    document.getElementById('statTodayDone').textContent = `${todayDone} 项`;
    document.getElementById('statTodayRate').textContent = `${todayRate}%`;
    document.getElementById('statStreak').textContent = `${streak} 天`;
    document.getElementById('statTotalDone').textContent = `${totalDone} 次`;
    document.getElementById('statTotalDays').textContent = `${dateSet.size} 天`;
  } catch (err) {
    console.error('加载仪表盘失败:', err);
    showToast('加载仪表盘失败: ' + err.message, 'error');
  }
}

// ==================== 今日打卡 ====================

async function loadTodayCheckin() {
  try {
    document.getElementById('checkinDate').textContent = formatDate(getToday());

    const tasks = await dbGet('/tasks?select=*&is_active=eq.true&order=created_at');
    const checkins = await dbGet('/checkins?select=*&checkin_date=eq.' + getToday());

    const checkinMap = {};
    (checkins || []).forEach(c => { checkinMap[c.task_id] = c; });

    const list = document.getElementById('checkinList');

    if (!tasks || tasks.length === 0) {
      list.innerHTML = '<p class="empty-hint">暂无可打卡任务，请先在任务管理中启用任务</p>';
      return;
    }

    list.innerHTML = tasks.map(task => {
      const c = checkinMap[task.id];
      const isDone = c ? c.is_done : false;
      const note = c ? (c.note || '') : '';
      return `
        <div class="checkin-item ${isDone ? 'done' : ''}" data-task-id="${task.id}">
          <button class="checkin-toggle ${isDone ? 'done' : ''}"
                  onclick="toggleCheckin(${task.id}, this)" title="点击切换完成状态">
            ${isDone ? '✓' : ''}
          </button>
          <div class="checkin-info">
            <div class="checkin-title">${escapeHtml(task.title)}</div>
            ${getCategoryBadge(task.category)}
            ${task.description ? `<div style="font-size:12px;color:#999;margin-top:2px;">${escapeHtml(task.description)}</div>` : ''}
          </div>
          <input type="text" class="checkin-note" placeholder="备注（可选）"
                 value="${escapeHtml(note)}">
        </div>
      `;
    }).join('');

    list.insertAdjacentHTML('beforeend', `
      <div style="text-align:center;">
        <button class="btn-save-checkin" onclick="saveAllCheckins()">💾 保存打卡记录</button>
      </div>
    `);
  } catch (err) {
    console.error('加载今日打卡失败:', err);
    showToast('加载失败: ' + err.message, 'error');
  }
}

function toggleCheckin(taskId, btn) {
  const item = btn.closest('.checkin-item');
  const isCurrentlyDone = btn.classList.contains('done');

  if (isCurrentlyDone) {
    btn.classList.remove('done');
    btn.textContent = '';
    item.classList.remove('done');
  } else {
    btn.classList.add('done');
    btn.textContent = '✓';
    item.classList.add('done');
  }
}

async function saveAllCheckins() {
  try {
    const items = document.querySelectorAll('.checkin-item');
    const upserts = [];

    items.forEach(item => {
      const taskId = parseInt(item.dataset.taskId);
      const isDone = item.querySelector('.checkin-toggle').classList.contains('done');
      const note = item.querySelector('.checkin-note').value;
      upserts.push({ task_id: taskId, checkin_date: getToday(), is_done: isDone, note: note });
    });

    for (const item of upserts) {
      const res = await fetch(DB_URL + '/checkins?on_conflict=task_id,checkin_date', {
        method: 'POST',
        headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error(await res.text());
    }
    showToast('打卡记录已保存！');
  } catch (err) {
    console.error('保存打卡失败:', err);
    showToast('保存失败: ' + err.message, 'error');
  }
}

// ==================== 任务管理 ====================

async function loadTasks() {
  try {
    const category = document.getElementById('taskFilterCategory').value;
    const catParam = category ? '&category=eq.' + encodeURIComponent(category) : '';
    const tasks = await dbGet('/tasks?select=*&order=created_at' + catParam);
    const list = document.getElementById('taskList');

    if (!tasks || tasks.length === 0) {
      list.innerHTML = '<p class="empty-hint">暂无任务，点击右上角按钮添加</p>';
      return;
    }

    list.innerHTML = tasks.map(task => `
      <div class="task-item ${task.is_active ? '' : 'inactive'}">
        <div class="task-info">
          <div class="task-name">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            ${getCategoryBadge(task.category)}
            <span>${task.is_active ? '已启用' : '已停用'}</span>
            ${task.description ? `<span>${escapeHtml(task.description)}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-secondary btn-sm" onclick="editTask(${task.id})">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">删除</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('加载任务失败:', err);
    showToast('加载失败: ' + err.message, 'error');
  }
}

function showTaskForm(task = null) {
  const modal = document.getElementById('taskFormModal');
  document.getElementById('taskFormTitle').textContent = task ? '编辑任务' : '新增任务';
  document.getElementById('taskId').value = task ? task.id : '';
  document.getElementById('taskTitle').value = task ? task.title : '';
  document.getElementById('taskCategory').value = task ? task.category : '拼音';
  document.getElementById('taskDesc').value = task ? (task.description || '') : '';
  document.getElementById('taskActive').checked = task ? task.is_active : true;
  modal.style.display = 'flex';
}

function hideTaskForm() {
  document.getElementById('taskFormModal').style.display = 'none';
}

async function saveTask(e) {
  e.preventDefault();
  const id = document.getElementById('taskId').value;
  const data = {
    title: document.getElementById('taskTitle').value.trim(),
    category: document.getElementById('taskCategory').value,
    description: document.getElementById('taskDesc').value,
    is_active: document.getElementById('taskActive').checked
  };

  try {
    if (id) {
      await dbPatch('/tasks?id=eq.' + id, data);
      showToast('任务已更新');
    } else {
      await dbPost('/tasks', data);
      showToast('任务已创建');
    }
    hideTaskForm();
    loadTasks();
  } catch (err) {
    showToast('保存失败: ' + err.message, 'error');
  }
}

async function editTask(id) {
  const data = await dbGet('/tasks?select=*&id=eq.' + id);
  if (data && data[0]) showTaskForm(data[0]);
}

async function deleteTask(id) {
  if (!confirm('确定要删除这个任务吗？相关的打卡记录也会被删除。')) return;
  try {
    await dbDelete('/tasks?id=eq.' + id);
    showToast('任务已删除');
    loadTasks();
  } catch (err) {
    showToast('删除失败: ' + err.message, 'error');
  }
}

document.getElementById('taskFormModal').addEventListener('click', function(e) {
  if (e.target === this) hideTaskForm();
});

// ==================== 历史记录 ====================

let historyPage = 1;

async function loadHistory(page = 1) {
  try {
    historyPage = page;
    const limit = 30;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const res = await fetch(DB_URL + '/checkins?select=*,tasks(title,category)&order=checkin_date.desc,created_at.desc', {
      headers: { ...HEADERS, 'Range': from + '-' + to, 'Prefer': 'count=exact' }
    });
    if (!res.ok) throw new Error(await res.text());
    const contentRange = res.headers.get('content-range');
    const total = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    const checkins = await res.json();

    const list = document.getElementById('historyList');

    if (!checkins || checkins.length === 0) {
      list.innerHTML = '<p class="empty-hint">暂无打卡记录</p>';
      document.getElementById('historyPagination').innerHTML = '';
      return;
    }

    const grouped = {};
    checkins.forEach(c => {
      const date = c.checkin_date;
      if (!grouped[date]) {
        grouped[date] = { date, checkins: [], doneCount: 0, totalCount: 0 };
      }
      grouped[date].checkins.push(c);
      grouped[date].totalCount++;
      if (c.is_done) grouped[date].doneCount++;
    });

    const days = Object.values(grouped);

    list.innerHTML = days.map(day => {
      const rate = day.totalCount > 0 ? Math.round((day.doneCount / day.totalCount) * 100) : 0;
      const rateClass = rate >= 80 ? 'good' : rate >= 50 ? 'medium' : 'low';
      return `
        <div class="history-day">
          <div class="history-day-header">
            <span class="history-date">📅 ${formatDate(day.date)}</span>
            <span class="history-rate ${rateClass}">完成率 ${rate}% (${day.doneCount}/${day.totalCount})</span>
          </div>
          <div class="history-items">
            ${day.checkins.map(c => `
              <div class="history-item">
                <span class="history-dot ${c.is_done ? 'done' : 'undone'}"></span>
                <span class="history-task-title">
                  ${c.tasks ? escapeHtml(c.tasks.title) : '任务已删除'}
                  ${c.tasks ? getCategoryBadge(c.tasks.category) : ''}
                </span>
                ${c.is_done ? '<span style="color:#52C41A;font-size:12px;">✓</span>' : '<span style="color:#ccc;font-size:12px;">✗</span>'}
                ${c.note ? `<span class="history-note">${escapeHtml(c.note)}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    const totalPages = Math.ceil((total || 0) / limit);
    const pag = document.getElementById('historyPagination');
    pag.innerHTML = `
      <button ${page <= 1 ? 'disabled' : ''} onclick="loadHistory(${page - 1})">上一页</button>
      <span style="padding:6px 12px;font-size:13px;">第 ${page} 页 / 共 ${totalPages || 1} 页</span>
      <button ${page >= totalPages ? 'disabled' : ''} onclick="loadHistory(${page + 1})">下一页</button>
    `;
  } catch (err) {
    console.error('加载历史记录失败:', err);
    showToast('加载失败: ' + err.message, 'error');
  }
}

// ==================== 统计分析 ====================

async function loadStats() {
  try {
    const tasks = await dbGet('/tasks?select=*&is_active=eq.true');
    const all = await dbGet('/checkins?select=*');
    const todayList = await dbGet('/checkins?select=*&checkin_date=eq.' + getToday());

    const activeTasks = tasks || [];
    const allCheckins = all || [];
    const todayCheckins = todayList || [];

    const todayDone = todayCheckins.filter(c => c.is_done).length;

    const totalDone = allCheckins.filter(c => c.is_done).length;

    const dateSet = new Set();
    allCheckins.forEach(c => { if (c.is_done) dateSet.add(c.checkin_date); });
    const sortedDates = Array.from(dateSet).sort().reverse();
    let streak = 0;
    const checkDate = new Date(getToday());
    for (const d of sortedDates) {
      if (d === checkDate.toISOString().split('T')[0]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const start = sevenDaysAgo.toISOString().split('T')[0];
    const recent = allCheckins.filter(c => c.checkin_date >= start);
    const recentDone = recent.filter(c => c.is_done).length;
    const recentRate = recent.length > 0 ? Math.round((recentDone / recent.length) * 100) : 0;

    const taskMap = {};
    activeTasks.forEach(t => { taskMap[t.id] = t; });
    const catCount = {};
    allCheckins.forEach(c => {
      if (!c.is_done) return;
      const task = taskMap[c.task_id];
      const cat = task ? task.category : '未知';
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    const byCategory = Object.entries(catCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const dayCount = {};
    allCheckins.forEach(c => {
      if (!c.is_done) return;
      dayCount[c.checkin_date] = (dayCount[c.checkin_date] || 0) + 1;
    });
    let bestDay = null, bestCount = 0;
    Object.entries(dayCount).forEach(([date, count]) => {
      if (count > bestCount) { bestCount = count; bestDay = date; }
    });

    document.getElementById('statsTotalTasks').textContent = `${activeTasks.length} 项`;
    document.getElementById('statsTotalDone').textContent = `${totalDone} 次`;
    document.getElementById('statsRecentRate').textContent = `${recentRate}%`;
    document.getElementById('statsStreak').textContent = `${streak} 天`;
    document.getElementById('statsTotalDays').textContent = `${dateSet.size} 天`;

    if (bestDay) {
      document.getElementById('statsBestDay').innerHTML = `
        <div>${formatDate(bestDay)}</div>
        <div class="stat-sub">完成 ${bestCount} 项</div>`;
    } else {
      document.getElementById('statsBestDay').textContent = '暂无';
    }

    const tbody = document.getElementById('categoryTableBody');
    tbody.innerHTML = byCategory.length === 0
      ? '<tr><td colspan="2" style="text-align:center;color:#999;">暂无数据</td></tr>'
      : byCategory.map(item => `
          <tr>
            <td>${item.category}</td>
            <td class="count-cell">${item.count} 次</td>
          </tr>`).join('');
  } catch (err) {
    console.error('加载统计失败:', err);
    showToast('加载失败: ' + err.message, 'error');
  }
}

// ==================== 初始化 ====================
navigateTo('dashboard');
