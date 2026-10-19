/*
  TASKFLOW — JavaScript learning project

  Main idea:
  1. `tasks` is our source of truth (the data).
  2. renderTasks() turns that data into visible HTML.
  3. Event listeners react to what the user does.
  4. saveTasks() persists the data in Local Storage.
*/

// ---------- 1. Select the HTML elements we need ----------
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const formMessage = document.getElementById("formMessage");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const visibleCount = document.getElementById("visibleCount");
const footerMessage = document.getElementById("footerMessage");
const todayLabel = document.getElementById("todayLabel");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

// ---------- 2. App state: our data lives here ----------
let activeFilter = "all";
let searchTerm = "";

// Load saved tasks when the page starts.
// JSON.parse converts the saved JSON text back into JavaScript data.
let tasks = loadTasks();

// Display today's date.
todayLabel.textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric"
}).format(new Date());

// ---------- 3. Persistence: Local Storage + JSON ----------
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem("taskflow-tasks");

    // No saved value? Start with an empty array.
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  // Local Storage stores strings, so convert the array to JSON text.
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

// ---------- 4. Add a task ----------
function addTask(title, priority) {
  const cleanedTitle = title.trim();

  // Guard clause: do not add an empty task.
  if (!cleanedTitle) {
    showMessage("Please enter a task first.", true);
    return;
  }

  // Each task is an object. Date.now() gives each task a simple unique ID.
  const newTask = {
    id: Date.now(),
    title: cleanedTitle,
    priority: priority,
    completed: false,
    createdAt: new Date().toISOString()
  };

  // Spread creates a new array with the new task at the end.
  tasks = [...tasks, newTask];

  saveTasks();
  renderTasks();
  taskForm.reset();
  priorityInput.value = "medium";
  taskInput.focus();
  showMessage("Task added successfully.");
}

// The `submit` event fires when the form is submitted.
// `event.preventDefault()` stops the browser from refreshing the page.
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value, priorityInput.value);
});

// ---------- 5. Update, delete, and clear tasks ----------
function toggleTask(taskId) {
  // map() creates a new array. Only the matching task gets a new object.
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  // filter() keeps every task except the one we want to remove.
  tasks = tasks.filter((task) => task.id !== taskId);

  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  const completedBefore = tasks.length;

  tasks = tasks.filter((task) => !task.completed);

  if (tasks.length === completedBefore) {
    showMessage("There are no completed tasks to clear.", true);
    return;
  }

  saveTasks();
  renderTasks();
  showMessage("Completed tasks cleared.");
}

clearCompletedBtn.addEventListener("click", clearCompletedTasks);

// ---------- 6. Search and filter ----------
searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    // Update which filter button looks active.
    filterButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    renderTasks();
  });
});

function getVisibleTasks() {
  // filter() returns a new array; it does not change the original tasks array.
  return tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "pending" && !task.completed) ||
      (activeFilter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });
}

// ---------- 7. Render: convert data into DOM elements ----------
function renderTasks() {
  const visibleTasks = getVisibleTasks();

  // Remove the old visible list before rebuilding it from the current data.
  taskList.replaceChildren();

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const main = document.createElement("div");
    main.className = "task-main";

    const title = document.createElement("span");
    title.className = "task-title";

    // textContent treats user input as text instead of interpreting it as HTML.
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = `${task.priority} priority`;

    const createdDate = document.createElement("span");
    createdDate.textContent = `Added ${formatDate(task.createdAt)}`;

    meta.append(priority, createdDate);
    main.append(title, meta);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, main, deleteButton);
    taskList.append(item);
  });

  updateStats();

  // Show the empty state when the current view has no results.
  emptyState.hidden = visibleTasks.length > 0;
  visibleCount.textContent = visibleTasks.length;

  if (tasks.length === 0) {
    footerMessage.textContent = "You're ready to make progress.";
  } else {
    const remaining = tasks.filter((task) => !task.completed).length;
    footerMessage.textContent =
      remaining === 0
        ? "Everything is complete. Great work!"
        : `${remaining} task${remaining === 1 ? "" : "s"} left to do.`;
  }
}

function updateStats() {
  // filter() builds temporary arrays; length tells us how many match.
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;

  totalCount.textContent = tasks.length;
  pendingCount.textContent = pending;
  completedCount.textContent = completed;
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(isoDate));
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "var(--red)" : "var(--green)";

  // setTimeout is asynchronous: this callback runs after 2.5 seconds.
  window.setTimeout(() => {
    formMessage.textContent = "";
  }, 2500);
}

// ---------- 8. Initial render ----------
// This runs once when script.js is loaded.
renderTasks();
