class LocalStorage {
  setItem(key, value){
    const stringifyValue = JSON.stringify(value);
    localStorage.setItem(key, stringifyValue);
  }

  getItem(key, defaultValue) {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
  }

  removeItem(key) {
    return localStorage.removeItem(key);
  }
}

// Storage keys
const TASK_LIST_KEY = 'task:list';
const TASK_TIMES_KEY = 'task:times';

// DOM selectors
const ADD_TASK = '.add-task';
const TASK_LIST = '.task-list';
const TASK_TIME = '.task-time';
const CLOCK_TEXT = '.clock-text';
const REMOVE_LOGS = '.remove-logs';
const STOP_BUTTON = '.stop-button';
const START_BUTTON = '.start-timer';
const INPUT_FIELD = '.add-task-input';

// Selectors
const clockText = document.querySelector(CLOCK_TEXT);
const taskListText = document.querySelector(TASK_LIST);
const inputFieldText = document.querySelector(INPUT_FIELD);

const taskHTML = ( id, text, started, timeHTML = [] ) => {
  return `<div class="task-list-item">
    <div class="task-list-itemContent">
      <div class="task-list-itemTitle">${text}</div>

      <div class="task-list-itemLogs" data-task="${id}">${timeHTML}</div>
    </div>

    <div class="task-list-itemAction">
      <button class="${START_BUTTON.replace('.', '')} ${started ? 'pause' : ''}" data-item-id="${id}">Start</button>
    </div>
  </div>`;
}

class Focus {
  removeLogs() {
    if (confirm('Are you sure you want to delete?')) {
      this.storage.removeItem(TASK_LIST_KEY);
      this.storage.removeItem(TASK_TIMES_KEY);
      this.displayTaskList();
    }
    return;
  }

  calcTimeDiff(start, end) {
    // get total seconds between the times
    let totalSeconds = Math.abs(end - start) / 1000;

    // calculate (and subtract) whole days
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds -= days * 86400;

    // calculate (and subtract) whole hours
    const hours = Math.floor(totalSeconds / 3600) % 24;
    totalSeconds -= hours * 3600;

    // calculate (and subtract) whole minutes
    const minutes = Math.floor(totalSeconds / 60) % 60;
    totalSeconds -= minutes * 60;

    // calculate remaining secons
    const seconds = Math.floor(totalSeconds % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  getTasks() {
    return this.storage.getItem(TASK_LIST_KEY, []);
  }

  getTimes(taskId = null) {
    const allTimes = this.storage.getItem(TASK_TIMES_KEY, {});

    if (!taskId) {
      return allTimes;
    }

    return allTimes[taskId] || [];
  }

  updateTimeHTML(taskId) {
    const timeList = this.getTimes();
    const dataItem = document.querySelector(`[data-task="${taskId}"]`);
    const timeHTML = (timeList[taskId] || []).map(({ start, end }) => `
        <div class="task-list-itemLog">
          ${this.showClock(start)} ${end ? `- ${this.showClock(end)}` : ''} ${end ? `--- ${this.calcTimeDiff(start, end)}` : ''}
        </div>
      `).join('');

    dataItem.innerHTML = timeHTML;
  }

  showClock(time) {
    const now = time ? new Date(time) : new Date();
    const hours = `${now.getHours()}`.padStart(2, 0);
    const minutes = `${now.getMinutes()}`.padStart(2, 0);
    const seconds = `${now.getSeconds()}`.padStart(2, 0);

    if (time) {
      return `${hours}:${minutes}:${seconds}`;
    }

    clockText.textContent = `${hours}:${minutes}:${seconds}`;
  }

  addTask(taskText) {
    let taskList = this.storage.getItem(TASK_LIST_KEY, []);

    taskList = [
      ...taskList,
      {
        id: new Date().getTime(),
        text: taskText,
        started: false,
      }
    ];

    this.storage.setItem(TASK_LIST_KEY, taskList);
  }

  displayTask() {
    const taskList = this.getTasks();
    const { id, text } = taskList[taskList.length - 1];

    taskListText.insertAdjacentHTML('beforeend', taskHTML(id, text));
  }

  displayTaskList() {
    const taskList = this.getTasks();
    const timeList = this.getTimes();

    taskListText.innerHTML = taskList.map(({ id, text, started }) => {
      const timeHTML = (timeList[id] || []).map(({ start, end }) => `
        <div class="task-list-itemLog">
          ${this.showClock(start)} ${end ? `- ${this.showClock(end)}` : ''} ${end ? `--- ${this.calcTimeDiff(start, end)}` : ''}
        </div>
      `).join('');

      return taskHTML(id, text, started, timeHTML);
    }).join('');
  }

  startTimer(taskId) {
    const taskList = this.getTasks();
    const allTimes = this.getTimes();
    let enrichTaskList = [];

    allTimes[taskId] = allTimes[taskId] || [];
    const timesWithoutEnd = allTimes[taskId].filter(time => !time.end).length !== 0;

    if (timesWithoutEnd) {
      const selectTime = allTimes[taskId].length - 1;
      allTimes[taskId][selectTime].end = new Date().getTime();
      document.querySelector(`[data-item-id="${taskId}"]`).classList.remove('pause');
      enrichTaskList = taskList.map(task => {
        task.started = false;
        return task;
      });
    } else {
      document.querySelector(`[data-item-id="${taskId}"]`).classList.add('pause');
      allTimes[taskId].push({ start: new Date().getTime(), started: true, });
      enrichTaskList = taskList.map(task => {
        task.started = true;
        return task;
      });
    }

    this.storage.setItem(TASK_LIST_KEY, enrichTaskList);
    this.storage.setItem(TASK_TIMES_KEY, allTimes);
  }

  bindUI() {
    // Event bindings for the UI
    document.querySelector(ADD_TASK).addEventListener('submit', (e) => {
      e.preventDefault();

      const taskText = inputFieldText.value;

      this.addTask(taskText);
      this.displayTask();

      inputFieldText.value = '';
    });

    // Binding for displaying current time
    setInterval(this.showClock, 1000);
    this.displayTaskList();

    // Add log
    document.addEventListener('click', (e) => {
      if (e.target.dataset && e.target.dataset.itemId) {
        const taskId = parseInt(e.target.dataset.itemId);
        this.startTimer(taskId);
        this.updateTimeHTML(taskId);
      }
    });

    // Delete log
    document.querySelector(REMOVE_LOGS).addEventListener('click', (e) => {
      e.preventDefault();
      this.removeLogs();
    });
  }

  init({ storage }) {
    this.storage = storage;
    this.bindUI()
    this.showClock();
  }
}

const storage = new LocalStorage();
const focus = new Focus();

focus.init({
  storage
});
