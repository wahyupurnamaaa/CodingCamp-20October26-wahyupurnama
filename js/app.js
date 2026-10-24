/* =====================================================
   LIFE DASHBOARD — app.js
   ===================================================== */
'use strict';

/* ── Constants ── */
const STORAGE_KEY = 'lifeDashboard.v1';

/* ─────────────────────────────────────────────────────
   STORAGE
   ───────────────────────────────────────────────────── */

/** Returns a deep clone of the default data shape. */
function defaultData() {
  return {
    tasks: [],
    links: [],
    preferences: {
      name: '',
      theme: 'light',
      pomodoroMinutes: 25,
    },
  };
}

/** Load persisted data; falls back to defaults on any error. */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    // Merge to ensure all keys exist even if schema evolves
    const def = defaultData();
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : def.tasks,
      links: Array.isArray(parsed.links) ? parsed.links : def.links,
      preferences: {
        name:
          typeof parsed.preferences?.name === 'string'
            ? parsed.preferences.name
            : def.preferences.name,
        theme:
          parsed.preferences?.theme === 'dark' ? 'dark' : 'light',
        pomodoroMinutes:
          typeof parsed.preferences?.pomodoroMinutes === 'number' &&
          parsed.preferences.pomodoroMinutes >= 1
            ? parsed.preferences.pomodoroMinutes
            : def.preferences.pomodoroMinutes,
      },
    };
  } catch {
    return defaultData();
  }
}

/** Persist current state to localStorage; silently catches errors. */
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — continue gracefully
  }
}

/* ─────────────────────────────────────────────────────
   STATE
   ───────────────────────────────────────────────────── */
const state = loadData();

/* Timer state (in-memory only; resets on reload) */
const timer = {
  remainingSeconds: state.preferences.pomodoroMinutes * 60,
  isRunning: false,
  endTime: 0,
  intervalId: null,
};

/* Edit modal state */
let editingTaskId = null;

/* ─────────────────────────────────────────────────────
   UTILITY HELPERS
   ───────────────────────────────────────────────────── */

/** Generates a simple unique ID. */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Validate a URL string: must parse with new URL() and protocol must be
 * http: or https:.
 */
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Format seconds as MM:SS (e.g. 1500 → "25:00"). */
function formatTime(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

/** Show an error message in a given element; auto-clear after 4 s. */
const errorTimers = {};
function showError(el, msg) {
  el.textContent = msg;
  clearTimeout(errorTimers[el.id]);
  errorTimers[el.id] = setTimeout(() => {
    el.textContent = '';
  }, 4000);
}
function clearError(el) {
  el.textContent = '';
}

/* ─────────────────────────────────────────────────────
   CLOCK & GREETING
   ───────────────────────────────────────────────────── */
const elClock    = document.getElementById('clock');
const elDateline = document.getElementById('dateline');
const elGreeting = document.getElementById('greeting');

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getGreetingWord(hour) {
  if (hour >= 5  && hour <= 10) return 'Good morning';
  if (hour >= 11 && hour <= 14) return 'Good afternoon';
  if (hour >= 15 && hour <= 17) return 'Good evening';
  return 'Good night';
}

function updateClock() {
  const now  = new Date();
  const h    = now.getHours();
  const m    = now.getMinutes();
  const s    = now.getSeconds();

  // Clock
  elClock.textContent =
    String(h).padStart(2, '0') + ':' +
    String(m).padStart(2, '0') + ':' +
    String(s).padStart(2, '0');

  // Date
  elDateline.textContent =
    DAYS[now.getDay()] + ', ' +
    now.getDate() + ' ' +
    MONTHS[now.getMonth()] + ' ' +
    now.getFullYear();

  // Greeting
  const word = getGreetingWord(h);
  const name = state.preferences.name.trim();
  elGreeting.textContent = name ? `${word}, ${name}!` : `${word}!`;
}

setInterval(updateClock, 1000);
updateClock();

/* ─────────────────────────────────────────────────────
   NAME INPUT
   ───────────────────────────────────────────────────── */
const inputName = document.getElementById('input-name');
inputName.value = state.preferences.name;

inputName.addEventListener('input', () => {
  state.preferences.name = inputName.value.trim();
  saveData();
  updateClock(); // refresh greeting immediately
});

/* ─────────────────────────────────────────────────────
   THEME
   ───────────────────────────────────────────────────── */
const htmlEl   = document.documentElement;
const btnTheme = document.getElementById('btn-theme');
const themeIcon = document.getElementById('theme-icon');

function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  btnTheme.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

applyTheme(state.preferences.theme);

btnTheme.addEventListener('click', () => {
  state.preferences.theme = state.preferences.theme === 'dark' ? 'light' : 'dark';
  applyTheme(state.preferences.theme);
  saveData();
});

/* ─────────────────────────────────────────────────────
   TO-DO LIST
   ───────────────────────────────────────────────────── */
const formTodo   = document.getElementById('form-todo');
const inputTodo  = document.getElementById('input-todo');
const todoList   = document.getElementById('todo-list');
const todoEmpty  = document.getElementById('todo-empty');
const todoError  = document.getElementById('todo-error');

/* Edit modal elements */
const editModal    = document.getElementById('edit-modal');
const editInput    = document.getElementById('edit-input');
const editError    = document.getElementById('edit-error');
const btnEditSave  = document.getElementById('btn-edit-save');
const btnEditCancel = document.getElementById('btn-edit-cancel');

function renderTodos() {
  todoList.innerHTML = '';

  if (state.tasks.length === 0) {
    todoEmpty.hidden = false;
    return;
  }
  todoEmpty.hidden = true;

  state.tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.completed ? ' done' : '');
    li.dataset.id = task.id;

    // Checkbox
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'todo-checkbox';
    cb.checked = task.completed;
    cb.setAttribute('aria-label', 'Mark task as ' + (task.completed ? 'incomplete' : 'complete'));
    cb.addEventListener('change', () => toggleTask(task.id));

    // Text span (user content rendered via textContent)
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = task.text;

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'btn btn-edit';
    btnEdit.setAttribute('aria-label', 'Edit task: ' + task.text);
    btnEdit.textContent = '✏️';
    btnEdit.addEventListener('click', () => openEditModal(task.id));

    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn btn-danger';
    btnDel.setAttribute('aria-label', 'Delete task: ' + task.text);
    btnDel.textContent = '🗑';
    btnDel.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(btnEdit);
    actions.appendChild(btnDel);

    li.appendChild(cb);
    li.appendChild(span);
    li.appendChild(actions);
    todoList.appendChild(li);
  });
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showError(todoError, 'Task name cannot be empty.');
    return false;
  }
  // Duplicate check (case-insensitive)
  const lower = trimmed.toLowerCase();
  if (state.tasks.some((t) => t.text.trim().toLowerCase() === lower)) {
    showError(todoError, 'A task with this name already exists.');
    return false;
  }
  clearError(todoError);
  state.tasks.push({ id: uid(), text: trimmed, completed: false });
  saveData();
  renderTodos();
  return true;
}

function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveData();
    renderTodos();
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveData();
  renderTodos();
}

/* Edit modal */
function openEditModal(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  editingTaskId = id;
  editInput.value = task.text;
  clearError(editError);
  editModal.hidden = false;
  editInput.focus();
  editInput.select();
}

function closeEditModal() {
  editModal.hidden = true;
  editingTaskId = null;
  clearError(editError);
}

function saveEdit() {
  const trimmed = editInput.value.trim();
  if (!trimmed) {
    showError(editError, 'Task name cannot be empty.');
    return;
  }
  // Duplicate check excluding self
  const lower = trimmed.toLowerCase();
  const duplicate = state.tasks.some(
    (t) => t.id !== editingTaskId && t.text.trim().toLowerCase() === lower
  );
  if (duplicate) {
    showError(editError, 'Another task with this name already exists.');
    return;
  }
  const task = state.tasks.find((t) => t.id === editingTaskId);
  if (task) {
    task.text = trimmed;
    saveData();
    renderTodos();
  }
  closeEditModal();
}

formTodo.addEventListener('submit', (e) => {
  e.preventDefault();
  if (addTask(inputTodo.value)) {
    inputTodo.value = '';
    inputTodo.focus();
  }
});

btnEditSave.addEventListener('click', saveEdit);
btnEditCancel.addEventListener('click', closeEditModal);

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.hidden) {
    closeEditModal();
  }
});

// Close modal when clicking on overlay background
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

// Save on Enter in edit input
editInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveEdit();
  }
});

/* Initial render */
renderTodos();

/* ─────────────────────────────────────────────────────
   FOCUS TIMER
   ───────────────────────────────────────────────────── */
const timerValue    = document.getElementById('timer-value');
const timerDoneMsg  = document.getElementById('timer-done-msg');
const btnStart      = document.getElementById('btn-start');
const btnStop       = document.getElementById('btn-stop');
const btnReset      = document.getElementById('btn-reset');
const formPomodoro  = document.getElementById('form-pomodoro');
const inputMinutes  = document.getElementById('input-minutes');
const pomodoroError = document.getElementById('pomodoro-error');

inputMinutes.value = state.preferences.pomodoroMinutes;

function renderTimer() {
  timerValue.textContent = formatTime(timer.remainingSeconds);
}

function setTimerButtonStates() {
  btnStart.disabled = timer.isRunning || timer.remainingSeconds === 0;
  btnStop.disabled  = !timer.isRunning;
}

function onTimerComplete() {
  timer.isRunning = false;
  timer.remainingSeconds = 0;
  clearInterval(timer.intervalId);
  timer.intervalId = null;
  renderTimer();
  timerDoneMsg.hidden = false;
  setTimerButtonStates();
}

function timerTick() {
  const now = Date.now();
  const remaining = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
  timer.remainingSeconds = remaining;
  renderTimer();
  if (remaining <= 0) {
    onTimerComplete();
  }
}

btnStart.addEventListener('click', () => {
  if (timer.isRunning || timer.remainingSeconds === 0) return;
  // Guard: do not start a duplicate interval
  if (timer.intervalId !== null) return;

  timerDoneMsg.hidden = true;
  timer.isRunning = true;
  timer.endTime = Date.now() + timer.remainingSeconds * 1000;
  timer.intervalId = setInterval(timerTick, 500); // 500ms for smooth display
  setTimerButtonStates();
});

btnStop.addEventListener('click', () => {
  if (!timer.isRunning) return;
  timer.remainingSeconds = Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000));
  timer.isRunning = false;
  clearInterval(timer.intervalId);
  timer.intervalId = null;
  renderTimer();
  setTimerButtonStates();
});

btnReset.addEventListener('click', () => {
  // Stop any running interval
  if (timer.intervalId !== null) {
    clearInterval(timer.intervalId);
    timer.intervalId = null;
  }
  timer.isRunning = false;
  timer.remainingSeconds = state.preferences.pomodoroMinutes * 60;
  timer.endTime = 0;
  timerDoneMsg.hidden = true;
  renderTimer();
  setTimerButtonStates();
  btnStart.disabled = false;
});

formPomodoro.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = parseInt(inputMinutes.value, 10);
  if (!Number.isInteger(val) || val < 1 || val > 180) {
    showError(pomodoroError, 'Please enter a number between 1 and 180.');
    return;
  }
  clearError(pomodoroError);

  // Stop timer if running
  if (timer.intervalId !== null) {
    clearInterval(timer.intervalId);
    timer.intervalId = null;
  }
  timer.isRunning = false;
  timer.remainingSeconds = val * 60;
  timer.endTime = 0;
  timerDoneMsg.hidden = true;

  state.preferences.pomodoroMinutes = val;
  saveData();
  renderTimer();
  setTimerButtonStates();
  btnStart.disabled = false;
});

/* Initial render */
renderTimer();
setTimerButtonStates();

/* ─────────────────────────────────────────────────────
   QUICK LINKS
   ───────────────────────────────────────────────────── */
const formLink    = document.getElementById('form-link');
const inputLinkName = document.getElementById('input-link-name');
const inputLinkUrl  = document.getElementById('input-link-url');
const linksList   = document.getElementById('links-list');
const linksEmpty  = document.getElementById('links-empty');
const linkError   = document.getElementById('link-error');

function renderLinks() {
  linksList.innerHTML = '';

  if (state.links.length === 0) {
    linksEmpty.hidden = false;
    return;
  }
  linksEmpty.hidden = true;

  state.links.forEach((link) => {
    const li = document.createElement('li');
    li.className = 'link-item';

    const a = document.createElement('a');
    a.className = 'link-anchor';
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = link.label; // user content via textContent

    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn btn-danger';
    btnDel.setAttribute('aria-label', 'Delete link: ' + link.label);
    btnDel.textContent = '🗑';
    btnDel.addEventListener('click', () => deleteLink(link.id));

    li.appendChild(a);
    li.appendChild(btnDel);
    linksList.appendChild(li);
  });
}

function addLink(label, url) {
  const trimLabel = label.trim();
  const trimUrl   = url.trim();

  if (!trimLabel) {
    showError(linkError, 'Link label cannot be empty.');
    return false;
  }
  if (!trimUrl) {
    showError(linkError, 'URL cannot be empty.');
    return false;
  }
  if (!isValidUrl(trimUrl)) {
    showError(linkError, 'Please enter a valid URL starting with http:// or https://');
    return false;
  }
  clearError(linkError);
  state.links.push({ id: uid(), label: trimLabel, url: trimUrl });
  saveData();
  renderLinks();
  return true;
}

function deleteLink(id) {
  state.links = state.links.filter((l) => l.id !== id);
  saveData();
  renderLinks();
}

formLink.addEventListener('submit', (e) => {
  e.preventDefault();
  if (addLink(inputLinkName.value, inputLinkUrl.value)) {
    inputLinkName.value = '';
    inputLinkUrl.value  = '';
    inputLinkName.focus();
  }
});

/* Initial render */
renderLinks();
