const taskNameInput = document.querySelector("#task-name");
const startDateInput = document.querySelector("#start-date");
const endDateInput = document.querySelector("#end-date");
const responsibleInput = document.querySelector("#responsible");
const addBtn = document.querySelector(".btn-add");
const ul = document.querySelector("ul");
const empty = document.querySelector(".empty");

document.addEventListener("DOMContentLoaded", loadTasks);

addBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const taskName = taskNameInput.value;
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  const responsible = responsibleInput.value;

  if (taskName !== "" && startDate !== "" && endDate !== "" && responsible !== "") {
    if (new Date(endDate) >= new Date(startDate)) {
      const task = {
        taskName,
        startDate,
        endDate,
        responsible,
        completed: false
      };

      addTask(task);
      clearInputs();
      empty.style.display = "none";
    } else {
      alert("La fecha de fin no puede ser menor que la fecha de inicio.");
    }
  } else {
    alert("Por favor, complete todos los campos.");
  }
});

function clearInputs() {
  taskNameInput.value = "";
  startDateInput.value = "";
  endDateInput.value = "";
  responsibleInput.value = "";
}

function addTask(task) {
  const li = document.createElement("li");
  const p = document.createElement("p");
  p.textContent = `${task.taskName} (fecha inicio: ${formatDate(task.startDate)}, fecha fin: ${formatDate(task.endDate)}, Responsable: ${task.responsible})`;

  const now = new Date();
  const endDate = new Date(task.endDate);

  if (task.completed) {
    p.classList.add("completed");
  } else if (now > endDate) {
    p.classList.add("expired");
  } else {
    p.classList.add("pending");
  }

  li.appendChild(p);
  li.appendChild(addResolveBtn(task));
  li.appendChild(addDeleteBtn());
  ul.appendChild(li);

  saveTasks();
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function addResolveBtn(task) {
  const resolveBtn = document.createElement("button");
  resolveBtn.textContent = task.completed ? "Desmarcar" : "Completado";
  resolveBtn.className = task.completed ? "btn-unmark" : "btn-mark";

  resolveBtn.addEventListener("click", (e) => {
    const item = e.target.parentElement;
    const p = item.querySelector("p");

    const now = new Date();
    const endDate = new Date(task.endDate);

    if (!task.completed && now <= endDate) {
      task.completed = true;
      p.classList.remove("expired", "pending");
      p.classList.add("completed");
      resolveBtn.textContent = "Desmarcar";
      resolveBtn.className = "btn-unmark";
    } else if (task.completed) {
      task.completed = false;
      p.classList.remove("completed");
      if (now > endDate) {
        p.classList.add("expired");
      } else {
        p.classList.add("pending");
      }
      resolveBtn.textContent = "Marcar";
      resolveBtn.className = "btn-mark";
    } else {
      alert("La tarea ha expirado y no puede ser marcada como resuelta.");
    }

    saveTasks();
  });

  return resolveBtn;
}

function addDeleteBtn() {
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  deleteBtn.className = "btn-delete";

  deleteBtn.addEventListener("click", (e) => {
    const item = e.target.parentElement;
    ul.removeChild(item);

    const items = document.querySelectorAll("li");

    if (items.length === 0) {
      empty.style.display = "block";
    }

    saveTasks();
  });

  return deleteBtn;
}

function saveTasks() {
  const tasks = [];
  const items = ul.querySelectorAll("li");

  items.forEach(item => {
    const p = item.querySelector("p");
    const taskText = p.textContent;
    const regex = /(.*) \(fecha inicio: (.*), fecha fin: (.*), Responsable: (.*)\)/;
    const match = taskText.match(regex);

    if (match) {
      const [_, taskName, startDate, endDate, responsible] = match;
      const completed = p.classList.contains("completed");

      const task = {
        taskName,
        startDate: formatDateForStorage(startDate),
        endDate: formatDateForStorage(endDate),
        responsible,
        completed
      };

      tasks.push(task);
    }
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatDateForStorage(date) {
  const [day, month, year] = date.split('-');
  return `${year}-${month}-${day}`;
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks'));

  if (tasks) {
    tasks.forEach(task => {
      addTask(task);
    });
  }

  if (tasks && tasks.length > 0) {
    empty.style.display = "none";
  }
}
