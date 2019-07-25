
const clockDOM = document.querySelector('.clock');

function clock() {
  const now = new Date();
  const hours = `${now.getHours()}`.padStart(2, 0);
  const minutes = `${now.getMinutes()}`.padStart(2, 0);
  const seconds = `${now.getSeconds()}`.padStart(2, 0);

  clockDOM.textContent = `${hours}:${minutes}:${seconds}`;
}

clock();

setInterval(clock, 1000);


if (!localStorage.getItem('taskList')) {
  localStorage.setItem('taskList', JSON.stringify([]));
}

function createTaskListDOM() {
  const tasks = JSON.parse(localStorage.getItem('taskList'));

  tasks.forEach(function(item) {
    const div = document.createElement('div');
    div.classList = 'taskList-item';

    const text = document.createTextNode(item.name);

    div.appendChild(text);
    document.querySelector('.taskList').appendChild(div);
  });
}

document.querySelector('.addTaskList').addEventListener('submit', (e) => {
  e.preventDefault();

  const tasks = JSON.parse(localStorage.getItem('taskList'));
  const name = document.querySelector('.addTaskList-input').value;
  const created = Date.now();

  const pushTask = [
    ...tasks,
    { name, created }
  ];

  localStorage.setItem('taskList', JSON.stringify(pushTask));

  createTaskListDOM();
});
