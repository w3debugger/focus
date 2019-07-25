
class LocalStorage {
  setItem(key, value){
    const stringifyValue = JSON.stringify(value);
    localStorage.setItem(key, stringifyValue);
  }

  getItem(key, defaultValue) {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
  }

  deleteItem(key) {
    return localStorage.deleteItem(key);
  }
}

// DOM Selectors
const INPUT_FIELD = '.add-task-input';
const CLOCK_TEXT = '.clock-text';
const ADD_TASK = '.add-task';
const TASK_LIST = '.task-list';
const START_BUTTON = 'start-timer';
const STOP_BUTTON = '.stop-button';

// Storage keys
const TASK_LIST_KEY = 'task:list';
const TASK_TIMES_KEY = 'task:times';

const clockText = document.querySelector(CLOCK_TEXT);
const taskListText = document.querySelector(TASK_LIST);

class Focus {
  showClock(time) {
    const now = new Date(time);
    const hours = `${now.getHours()}`.padStart(2, 0);
    const minutes = `${now.getMinutes()}`.padStart(2, 0);
    const seconds = `${now.getSeconds()}`.padStart(2, 0);

    return `${hours}:${minutes}:${seconds}`;
  }

  showMainClock() {
    const now = new Date();
    const hours = `${now.getHours()}`.padStart(2, 0);
    const minutes = `${now.getMinutes()}`.padStart(2, 0);
    const seconds = `${now.getSeconds()}`.padStart(2, 0);

    clockText.textContent = `${hours}:${minutes}:${seconds}`;
  }

  addTask(taskText) {
    let taskList = this.storage.getItem(TASK_LIST_KEY, []);

    taskList = [
      ...taskList,
      {
        id: new Date().getTime(),
        text: taskText,
      }
    ];

    this.storage.setItem(TASK_LIST_KEY, taskList);
  }

  getTasks() {
    return this.storage.getItem(TASK_LIST_KEY, []);
  }

  displayTaskList() {
    const taskList = this.getTasks();
    const timeList = this.getTimes();

    console.log(timeList);


    const logsHtml = [];
    const taskHtml = [];
    taskList.forEach(({ id, text, logs = [] }) => {
      const time = timeList[id] || [];
      if (time.length > 0) {
        time.forEach(({ start, end }) => {
          logsHtml.push(`<div class="taskList-itemLog">
            ${this.showClock(start)} - ${this.showClock(end)}
          </div>`);
        });
      }

      taskHtml.unshift(`
        <div class="taskList-item">
          <div class="taskList-itemContent" data-item-id="${id}">
            <div class="taskList-itemTitle">${text}</div>

            ${logsHtml.join(' ')}
          </div>

          <div class="taskList-itemAction">
            <button data-item-id="${id}" class="${START_BUTTON}">Start</button>
          </div>
        </div>`);
    });

    taskListText.innerHTML = `${taskHtml.join('')}`;
  }

  getTimes(taskId = null) {
    const allTimes = this.storage.getItem(TASK_TIMES_KEY, []);

    if (!taskId) {
      return allTimes;
    }

    return allTimes[taskId] || [];
  }

  startTimer(taskId) {
    const allTimes = this.getTimes();
    const logs = Object.keys(allTimes).length === 0 ? {} : allTimes;

    logs[taskId] = logs[taskId] || [];

    const timesWithoutEnd = logs[taskId].filter(time => !time.end);
    console.log(this.storage.setItem(TASK_TIMES_KEY, logs));


    if (timesWithoutEnd.length !== 0) {
      const selectTime = logs[taskId].length - 1;
      logs[taskId][selectTime].end = new Date().getTime();
      this.storage.setItem(TASK_TIMES_KEY, logs);
      return;
    }

    logs[taskId].push({
      start: new Date().getTime()
    })

    this.storage.setItem(TASK_TIMES_KEY, logs);


    // this.displayTaskList();
  }

  bindUI() {
    // Event bindings for the UI
    document.querySelector(ADD_TASK).addEventListener('submit', (e) => {
      e.preventDefault();

      const taskText = document.querySelector(INPUT_FIELD).value;

      this.addTask(taskText);
      this.displayTaskList();
    });

    // Binding for displaying current time
    setInterval(this.showMainClock, 1000);
    this.displayTaskList();

    // add log
    const startButton = document.getElementsByClassName(START_BUTTON);
    Array.from(startButton).forEach((element) => {
      element.addEventListener('click', (e) => {
        const taskId = parseInt(e.target.dataset.itemId);
        this.startTimer(taskId);
      });
    });
  }

  init({ storage }) {
    this.storage = storage;

    this.bindUI()
    this.showMainClock();
  }
}

const storage = new LocalStorage();
const focus = new Focus();

focus.init({
  storage
});
