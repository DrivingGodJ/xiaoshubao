(function () {
  'use strict';

  const STORE_KEY = 'xiaoshubao_v1';
  const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const DEFAULT_ITEMS = [
    { id: 'hw', name: '作业本', icon: '📒' },
    { id: 'book', name: '课本', icon: '📚' },
    { id: 'pen', name: '铅笔盒', icon: '✏️' },
    { id: 'cup', name: '水杯', icon: '🥤' },
    { id: 'rope', name: '跳绳', icon: '🪢' },
    { id: 'shoe', name: '运动鞋', icon: '👟' },
    { id: 'paint', name: '水彩笔', icon: '🎨' },
    { id: 'paper', name: '画纸', icon: '🖍️' },
    { id: 'red', name: '红领巾', icon: '🧣' },
    { id: 'umbrella', name: '雨伞', icon: '☂️' },
    { id: 'goggles', name: '游泳镜', icon: '🥽' },
    { id: 'food', name: '加餐', icon: '🍎' }
  ];

  const DEFAULT_SCHEDULE = {
    '1': [
      { id: 'c1', name: '语文', items: ['hw', 'book', 'pen', 'red'] },
      { id: 'c2', name: '数学', items: ['hw', 'book', 'pen'] },
      { id: 'c3', name: '体育', items: ['rope', 'shoe', 'cup'] }
    ],
    '2': [
      { id: 'c1', name: '英语', items: ['hw', 'book', 'pen'] },
      { id: 'c2', name: '科学', items: ['book', 'pen'] }
    ],
    '3': [
      { id: 'c1', name: '语文', items: ['hw', 'book', 'pen', 'red'] },
      { id: 'c2', name: '美术', items: ['paint', 'paper', 'pen'] }
    ],
    '4': [
      { id: 'c1', name: '数学', items: ['hw', 'book', 'pen'] },
      { id: 'c2', name: '信息', items: ['book'] }
    ],
    '5': [
      { id: 'c1', name: '语文', items: ['hw', 'book', 'pen', 'red'] },
      { id: 'c2', name: '体育', items: ['rope', 'shoe', 'cup'] },
      { id: 'c3', name: '班会', items: ['red'] }
    ],
    '6': [],
    '7': []
  };

  // ---------- 状态 ----------
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        s.items = s.items && s.items.length ? s.items : clone(DEFAULT_ITEMS);
        s.schedule = s.schedule || clone(DEFAULT_SCHEDULE);
        s.records = s.records || {};
        return s;
      }
    } catch (e) { /* ignore */ }
    return {
      items: clone(DEFAULT_ITEMS),
      schedule: clone(DEFAULT_SCHEDULE),
      records: {},
      streak: 0,
      lastCheckDate: null,
      manualToday: null
    };
  }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ---------- 工具 ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function dateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function todayIndex() {
    if (state.manualToday) return parseInt(state.manualToday, 10);
    const d = new Date().getDay(); // 0=Sun
    return d === 0 ? 7 : d;
  }
  function todayKey() {
    return state.manualToday ? ('manual-' + state.manualToday) : dateStr(new Date());
  }
  function getItem(id) { return state.items.find(i => i.id === id); }
  function todayCheckItems() {
    const idx = todayIndex();
    const courses = state.schedule[String(idx)] || [];
    const list = [];
    const seen = new Set();
    courses.forEach(c => (c.items || []).forEach(id => {
      const k = c.id + ':' + id;
      if (!seen.has(k) && getItem(id)) {
        seen.add(k);
        list.push({ key: k, courseName: c.name, item: getItem(id) });
      }
    }));
    return list;
  }

  // ---------- 视图切换 ----------
  function switchView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById('view-' + name);
    if (el) el.classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
    if (name === 'today') renderToday();
    if (name === 'schedule') renderSchedule();
    if (name === 'items') renderItems();
    if (name === 'achv') renderAchv();
  }

  // ---------- 今日页 ----------
  function renderToday() {
    const idx = todayIndex();
    document.getElementById('today-day').textContent = DAYS[idx - 1];
    const d = new Date();
    document.getElementById('today-date').textContent =
      state.manualToday ? '（演示模式）' : `${d.getMonth() + 1}月${d.getDate()}日`;

    const key = todayKey();
    const rec = state.records[key] || { checked: [] };
    const items = todayCheckItems();
    const list = document.getElementById('today-list');
    const empty = document.getElementById('today-empty');
    const btn = document.getElementById('complete-btn');

    if (items.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      empty.textContent = '今天课表里还没有安排～去「课表」页添加课程和要带的东西吧！';
      btn.style.display = 'none';
      document.querySelector('.progress-wrap').style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    btn.style.display = 'block';
    document.querySelector('.progress-wrap').style.display = 'block';

    list.innerHTML = items.map(it => {
      const done = rec.checked.includes(it.key);
      return `<div class="check-item ${done ? 'done' : ''}" data-id="${it.key}">
        <span class="ci-icon">${it.item.icon}</span>
        <div class="ci-main">
          <span class="ci-name">${escapeHtml(it.item.name)}</span>
          <span class="ci-course">${escapeHtml(it.courseName)}</span>
        </div>
        <span class="ci-check">${done ? '✅' : '⬜'}</span>
      </div>`;
    }).join('');
    updateProgress();
  }

  function updateProgress() {
    const key = todayKey();
    const rec = state.records[key] || { checked: [] };
    const items = todayCheckItems();
    const done = items.filter(it => rec.checked.includes(it.key)).length;
    const total = items.length;
    const pct = total ? Math.round(done / total * 100) : 0;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').textContent =
      `${done} / ${total}` + (pct === 100 ? ' · 全部带齐！🎉' : '');
  }

  function toggleItem(id) {
    const key = todayKey();
    if (!state.records[key]) state.records[key] = { checked: [] };
    const arr = state.records[key].checked;
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1); else arr.push(id);
    save();
    renderToday();
  }

  function completeCheck() {
    const key = todayKey();
    const items = todayCheckItems();
    const rec = state.records[key] || { checked: [] };
    const allDone = items.length > 0 && items.every(it => rec.checked.includes(it.key));
    if (state.records[key] && state.records[key].completed) {
      toast('今天已经检查过啦 ✅');
      return;
    }
    state.records[key] = Object.assign({}, rec, { completed: true, allDone: allDone, at: Date.now() });
    const todayS = dateStr(new Date());
    if (allDone) {
      const yest = new Date(); yest.setDate(yest.getDate() - 1);
      const yestS = dateStr(yest);
      if (state.lastCheckDate === yestS) state.streak = (state.streak || 0) + 1;
      else if (state.lastCheckDate !== todayS) state.streak = 1;
      state.lastCheckDate = todayS;
    } else {
      state.streak = 0;
      state.lastCheckDate = todayS;
    }
    save();
    renderToday();
    renderAchv();
    toast(allDone ? `🎒 全部带齐，出发吧！连击 ${state.streak} 天` : '还差几样，明天加油！');
  }

  // ---------- 课表页 ----------
  function renderSchedule() {
    const wrap = document.getElementById('schedule-list');
    wrap.innerHTML = DAYS.map((dn, i) => {
      const idx = i + 1;
      const courses = state.schedule[String(idx)] || [];
      const courseHtml = courses.map(c => {
        const tags = (c.items || []).map(id => {
          const it = getItem(id);
          return it ? `<span class="tag">${it.icon}${escapeHtml(it.name)}</span>` : '';
        }).join('');
        return `<div class="course">
          <div class="course-top">
            <span class="course-name">${escapeHtml(c.name)}</span>
            <button class="del" data-del-course="${idx}:${c.id}">✕</button>
          </div>
          <div class="tags">${tags || '<span class="muted">（未关联物品）</span>'}</div>
        </div>`;
      }).join('');
      return `<div class="day-block">
        <div class="day-title">${dn}</div>
        ${courseHtml}
        <button class="add-course" data-add-course="${idx}">＋ 添加课程</button>
      </div>`;
    }).join('');
  }

  function delCourse(day, cid) {
    const arr = state.schedule[String(day)];
    const i = arr.findIndex(c => c.id === cid);
    if (i >= 0) arr.splice(i, 1);
    save();
    renderSchedule();
  }

  // ---------- 物品页 ----------
  function renderItems() {
    const grid = document.getElementById('item-grid');
    grid.innerHTML = state.items.map(it =>
      `<div class="item-chip"><span>${it.icon}</span>${escapeHtml(it.name)}<button data-del-item="${it.id}">✕</button></div>`
    ).join('');
  }
  function addItem() {
    const inp = document.getElementById('new-item-name');
    const name = inp.value.trim();
    if (!name) { toast('先输入物品名'); return; }
    state.items.push({ id: 'it' + Date.now(), name: name, icon: '📦' });
    inp.value = '';
    save();
    renderItems();
  }
  function delItem(id) {
    state.items = state.items.filter(it => it.id !== id);
    Object.keys(state.schedule).forEach(d => {
      state.schedule[d].forEach(c => { c.items = (c.items || []).filter(x => x !== id); });
    });
    save();
    renderItems();
    renderSchedule();
  }

  // ---------- 成就页 ----------
  function renderAchv() {
    document.getElementById('streak-num').textContent = state.streak || 0;
    const recs = Object.values(state.records).filter(r => r.completed);
    const all = recs.filter(r => r.allDone).length;
    document.getElementById('stat-total').textContent = recs.length;
    document.getElementById('stat-all').textContent = all;
    const medals = [
      { need: 3, icon: '🥉', name: '坚持 3 天' },
      { need: 7, icon: '🥈', name: '一周全勤' },
      { need: 30, icon: '🥇', name: '月度达人' }
    ];
    document.getElementById('medal-wall').innerHTML = medals.map(m => {
      const got = (state.streak || 0) >= m.need;
      return `<div class="medal ${got ? 'got' : 'no'}"><div class="medal-icon">${m.icon}</div><div>${m.name}</div></div>`;
    }).join('');
  }

  // ---------- 设置页 ----------
  function clearData() {
    if (!confirm('确定清空所有课表、物品和记录？此操作不可恢复。')) return;
    state = {
      items: clone(DEFAULT_ITEMS),
      schedule: clone(DEFAULT_SCHEDULE),
      records: {},
      streak: 0,
      lastCheckDate: null,
      manualToday: null
    };
    save();
    document.getElementById('manual-today').value = '';
    renderToday(); renderSchedule(); renderItems(); renderAchv();
    toast('已清空，恢复到初始状态');
  }

  // ---------- Modal（添加课程） ----------
  let modalState = { day: null, items: new Set() };
  function openCourseModal(day) {
    modalState.day = day;
    modalState.items = new Set();
    document.getElementById('modal-title').textContent = '添加课程（' + DAYS[day - 1] + '）';
    document.getElementById('modal-input').value = '';
    const box = document.getElementById('modal-items');
    box.innerHTML = state.items.map(it =>
      `<span class="mchip" data-mitem="${it.id}">${it.icon} ${escapeHtml(it.name)}</span>`
    ).join('');
    document.getElementById('modal').classList.remove('hidden');
  }
  function closeModal() { document.getElementById('modal').classList.add('hidden'); }
  function confirmCourseModal() {
    const name = document.getElementById('modal-input').value.trim();
    if (!name) { toast('请输入课程名'); return; }
    const day = modalState.day;
    const items = [...modalState.items];
    state.schedule[String(day)].push({ id: 'c' + Date.now(), name: name, items: items });
    save();
    renderSchedule();
    closeModal();
  }

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  // ---------- 事件绑定 ----------
  document.addEventListener('click', function (e) {
    const tv = e.target.closest('[data-view]');
    if (tv) { switchView(tv.dataset.view); return; }
    const ci = e.target.closest('.check-item');
    if (ci) { toggleItem(ci.dataset.id); return; }
    const dc = e.target.closest('[data-del-course]');
    if (dc) { const p = dc.dataset.delCourse.split(':'); delCourse(p[0], p[1]); return; }
    const ac = e.target.closest('[data-add-course]');
    if (ac) { openCourseModal(parseInt(ac.dataset.addCourse, 10)); return; }
    const di = e.target.closest('[data-del-item]');
    if (di) { delItem(di.dataset.delItem); return; }
  });

  document.getElementById('complete-btn').addEventListener('click', completeCheck);
  document.getElementById('add-item-btn').addEventListener('click', addItem);
  document.getElementById('new-item-name').addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });
  document.getElementById('manual-today').addEventListener('change', e => {
    state.manualToday = e.target.value || null; save(); renderToday();
  });
  document.getElementById('clear-btn').addEventListener('click', clearData);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-ok').addEventListener('click', confirmCourseModal);
  document.getElementById('modal-items').addEventListener('click', e => {
    const c = e.target.closest('[data-mitem]');
    if (!c) return;
    const id = c.dataset.mitem;
    if (modalState.items.has(id)) { modalState.items.delete(id); c.classList.remove('sel'); }
    else { modalState.items.add(id); c.classList.add('sel'); }
  });

  // 演示模式 URL 参数：index.html?demo=mon|tue|wed|thu|fri|sat|sun
  (function demoHook(){
    const p = new URLSearchParams(location.search);
    const map = { mon:1, tue:2, wed:3, thu:4, fri:5, sat:6, sun:7 };
    if (p.has('demo')) {
      const v = map[p.get('demo')];
      if (v) { state.manualToday = String(v); save(); }
    }
  })();

  // ---------- 初始化 ----------
  document.getElementById('manual-today').value = state.manualToday || '';
  renderToday();
  renderSchedule();
  renderItems();
  renderAchv();
})();
