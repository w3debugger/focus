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
const CONFIG_KEY = 'configs';
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
const MODE_CHECKBOX = '.mode-checkbox';
const SHOW_MORE = '.task-list-showMore';

// Selectors
const clockText = document.querySelector(CLOCK_TEXT);
const taskListText = document.querySelector(TASK_LIST);
const addTaskButton = document.querySelector(ADD_TASK);
const modeCheckbox = document.querySelector(MODE_CHECKBOX);
const inputFieldText = document.querySelector(INPUT_FIELD);
const removeLogsButton = document.querySelector(REMOVE_LOGS);

const taskHTML = (id, text, started, timeHTML = [], overallTime) => {
  return `
    <div class="task-list-item" data-list-id="${id}">
      <div class="task-list-itemContent">
        <div class="task-list-itemTitle">${text}</div>
        <div class="task-list-itemOverallTime">${overallTime || 'Time has not started yet'}</div>

        <ol class="task-list-itemLogs" data-task="${id}">${timeHTML}</ol>
      </div>

      <div class="task-list-itemAction">
        <a class="remove-logs" href="#" data-log-id="${id}">
          <svg width="20" height="30" viewBox="0 0 432.6 486.4">
            <path d="M110.1,486.4a72.3,72.3,0,0,1-72.2-72.2V97H13.5a13.5,13.5,0,0,1,0-27H114.7V53.5A53.561,53.561,0,0,1,168.2,0h96.2a53.56,53.56,0,0,1,53.5,53.5V70H419.1a13.5,13.5,0,0,1,0,27H394.7V414.2a72.3,72.3,0,0,1-72.2,72.2ZM64.9,414.2a45.281,45.281,0,0,0,45.2,45.2H322.5a45.281,45.281,0,0,0,45.2-45.2h.1V97H64.9ZM141.7,53.5V70H290.9V53.5A26.545,26.545,0,0,0,264.4,27H168.2A26.546,26.546,0,0,0,141.7,53.5Zm61.1,343.9V158.9a13.5,13.5,0,0,1,27,0V397.5a13.5,13.5,0,1,1-27-.1Zm88.1-14.8V173.7a13.5,13.5,0,0,1,27,0V382.6a13.5,13.5,0,1,1-27,0Zm-176.2,0V173.7a13.5,13.5,0,0,1,27,0V382.6a13.5,13.5,0,0,1-27,0Z" />
          </svg>
        </a>

        <button class="${START_BUTTON.replace('.', '')} ${started ? 'pause' : ''}" data-item-id="${id}">Start</button>
      </div>

      <a class="task-list-showMore" href="#" data-toggle-id="${id}">
        <i class="dots"></i>
        <i class="dots"></i>
        <i class="dots"></i>
      </a>
    </div>`;
};

class Focus {
  getConfig() {
    return this.storage.getItem(CONFIG_KEY, {});
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

    return `${hours + (days * 24)}h ${minutes}m ${seconds}s`;
  }

  sumTimes(taskId) {
    const timeList = this.getTimes();

    if (!timeList[taskId] && !timeList[taskId]) {
      return;
    }

    const starts = timeList[taskId].map(time => time.start);
    const ends = timeList[taskId].filter(time => time.end).map(time => time.end);

    if (starts.length !== ends.length) {
      ends[starts.length - 1] = starts[starts.length - 1];
    }

    const sumStarts = starts.reduce((a, b) => a + b, 0);
    const sumEnds = ends.reduce((a, b) => a + b, 0);

    return this.calcTimeDiff(sumStarts, sumEnds);
  }

  updateTimeHTML(taskId) {
    const timeList = this.getTimes();
    const dataItem = document.querySelector(`[data-task="${taskId}"]`);
    const timeHTML = (timeList[taskId] || []).map(({ start, end = new Date().getTime() }) => `
      <li class="task-list-itemLog">
        <div class="long">${new Date(start).toDateString()}</div>
        <div class="short">${this.showClock(start)} - ${this.showClock(end)}</div>
        <div class="diff">${this.calcTimeDiff(start, end)}</div>
      </li>
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
      const timeHTML = (timeList[id] || []).map(({ start, end = new Date().getTime() }) => {
        return `
          <li class="task-list-itemLog">
            <div class="long">${new Date(start).toDateString()}</div>
            <div class="short">${this.showClock(start)} - ${this.showClock(end)}</div>
            <div class="diff">${this.calcTimeDiff(start, end)}</div>
          </li>`;
      }).join('');

      const overallTime = this.sumTimes(id);

      return taskHTML(id, text, started, timeHTML, overallTime);
    }).join('');
  }

  startTimer(taskId) {
    const taskList = this.getTasks();
    const allTimes = this.getTimes();

    allTimes[taskId] = allTimes[taskId] || [];

    const timesWithoutEnd = allTimes[taskId].filter(time => !time.end).length !== 0;

    if (timesWithoutEnd) {
      const selectTime = allTimes[taskId].length - 1;
      allTimes[taskId][selectTime].end = new Date().getTime();
    } else {
      allTimes[taskId].push({ start: new Date().getTime(), started: true, });
    }

    const enrichTaskList = taskList.map(task => {
      if (taskId === task.id) {
        task.started = !timesWithoutEnd
      }

      return task;
    });

    this.storage.setItem(TASK_LIST_KEY, enrichTaskList);
    this.storage.setItem(TASK_TIMES_KEY, allTimes);
  }

  // remove
  removeLog() {
    if (confirm('Are you sure you want to delete all logs?')) {
      this.storage.removeItem(TASK_LIST_KEY);
      this.storage.removeItem(TASK_TIMES_KEY);
      this.displayTaskList();
    }
    return;
  }

  bindUI() {
    // Configurations
    const config = this.getConfig();

    // Set theme
    if (config.theme === 'dark') {
      modeCheckbox.checked = true;
    }
    document.body.classList = config.theme;

    // Binding for displaying current time
    setInterval(() => {
      this.displayTaskList();
      this.showClock();
    }, 1000);
    this.displayTaskList();

    // Event bindings for the UI
    addTaskButton.addEventListener('submit', (e) => {
      e.preventDefault();

      const taskText = inputFieldText.value;

      this.addTask(taskText);
      this.displayTask();

      inputFieldText.value = '';
    });

    // Delete log
    removeLogsButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.removeLog();
    });

    // Change theme
    modeCheckbox.addEventListener('change', (e) => {
      const config = this.getConfig();

      if (config.theme === 'dark') {
        document.body.classList = 'light';
        config.theme = 'light';
      } else {
        document.body.classList = 'dark';
        config.theme = 'dark';
      }

      this.storage.setItem(CONFIG_KEY, config);
    })

    document.addEventListener('click', (e) => {
      // start / add log
      if (e.target.dataset && e.target.dataset.itemId) {
        e.preventDefault();

        const taskId = parseInt(e.target.dataset.itemId);
        this.startTimer(taskId);
        this.updateTimeHTML(taskId);
      }

      // Delete single log
      if (e.target.dataset && e.target.dataset.logId) {
        e.preventDefault();

        if (confirm('Are you sure you want to delete this log?')) {
          const logId = parseInt(e.target.dataset.logId);

          const taskList = this.getTasks();
          const allTimes = this.getTimes();

          const enrichTaskList = taskList.filter(({ id }) => id !== logId);

          delete allTimes[logId];

          this.storage.setItem(TASK_LIST_KEY, enrichTaskList);
          this.storage.setItem(TASK_TIMES_KEY, allTimes);

          this.displayTaskList();
        }
      }

      // show / hide log
      if (e.target.dataset && e.target.dataset.toggleId) {
        e.preventDefault();

        const toggleId = parseInt(e.target.dataset.toggleId);
        const listId = document.querySelector(`[data-list-id="${toggleId}"]`);

        listId.classList.toggle('showMore');
      }
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
