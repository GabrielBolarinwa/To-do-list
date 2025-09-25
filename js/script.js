const tasks =
    document.getElementById("tasks") || document.createElement("section");
class Task {
    constructor(id, label, completed = false, dueDate = null) {
        this.id = id;
        this.label = label;
        this.completed = completed;
        this.dueDate = dueDate;
        this.editingTaskId = null;
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.count = 0;
        this.editing = false;
        this.filter = "all";
        this.loadTasksFromStorage();
    }

    saveTasksToStorage() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    loadTasksFromStorage() {
        const stored = localStorage.getItem("tasks");
        if (stored) {
            this.tasks = JSON.parse(stored);
            this.count =
                this.tasks.length > 0
                    ? Math.max(...this.tasks.map((t) => t.id)) + 1
                    : 0;
        }
    }

    addTask(label, dueDate = null) {
        const newTask = new Task(this.count, label, false, dueDate);
        this.tasks.push(newTask);
        this.count++;
        this.render();
        this.saveTasksToStorage();
        return newTask;
    }
    deleteTask(id) {
        this.tasks = this.tasks.filter((task) => task.id !== id);
        this.render();
        this.saveTasksToStorage();
    }
    editTask(id, newLabel) {
        const task = this.tasks.find((task) => task.id === id);
        if (task) {
            task.label = newLabel;
        }
        this.render();
        this.saveTasksToStorage();
    }
    toggleTask(id) {
        const task = this.tasks.find((task) => task.id === id);
        if (task) {
            task.completed = !task.completed;
        }
        this.render();
        this.saveTasksToStorage();
    }
    deleteTasks() {
        this.tasks = [];
        this.render();
        this.saveTasksToStorage();
    }
    displayAllTask() {
        this.filter = "all";
        this.render();
    }
    displayCompletedTasks() {
        this.filter = "completed";
        this.render();
    }
    displayPendingTasks() {
        this.filter = "pending";
        this.render();
    }
    getFilteredTasks() {
        if (this.filter === "completed") {
            return this.tasks.filter((task) => task.completed);
        } else if (this.filter === "pending") {
            return this.tasks.filter((task) => !task.completed);
        }
        return this.tasks;
    }
    render() {
        const tasks = document.getElementById("tasks");
        tasks.innerHTML = "";
        const filteredTasks = this.getFilteredTasks();
        if (filteredTasks.length === 0) {
            const noTasksMessage = document.createElement("p");
            noTasksMessage.textContent = "No tasks available.";
            tasks.appendChild(noTasksMessage);
            tasks.classList.add("no-tasks");
            return;
        }
        filteredTasks.forEach((task) => {
            let taskContainer = document.createElement("div");
            taskContainer.classList.add("task-container", "pending");
            taskContainer.id = task.id;
            let taskForm2 = document.createElement("div");
            taskForm2.classList.add("task-form2");
            let inputCheckbox = document.createElement("input");
            inputCheckbox.type = "checkbox";
            inputCheckbox.classList.add("task");
            inputCheckbox.id = `task-checkbox-${task.id}`;
            inputCheckbox.name = `task-checkbox-${task.id}`;
            inputCheckbox.addEventListener("change", () =>
                this.toggleTask(task.id),
            );
            let spanCheckmark = document.createElement("span");
            spanCheckmark.classList.add("checkmark");
            if (task.completed) {
                inputCheckbox.checked = true;
                spanCheckmark.innerHTML = "";
                spanCheckmark.classList.add("checked");
                let checkIcon = document.createElement("i");
                checkIcon.classList.add("fa-solid", "fa-check");
                spanCheckmark.appendChild(checkIcon);
            }
            let editableArea = document.createElement("span");
            if (this.editingTaskId === task.id) {
                const editInput = document.createElement("input");
                editInput.type = "text";
                editInput.value = task.label;
                editInput.classList.add("edit-input");
                const saveBtn = document.createElement("button");
                saveBtn.textContent = "Save";
                saveBtn.classList.add("task-buttons", "save-btn");
                saveBtn.onclick = () => {
                    this.editTask(task.id, editInput.value);
                    this.editingTaskId = null;
                    this.render();
                };
                editableArea.append(editInput, saveBtn);
            } else {
                let taskLabel = document.createElement("label");
                taskLabel.id = `task-label-${task.id}`;
                taskLabel.htmlFor = inputCheckbox.id;
                taskLabel.classList.add("task-label");
                taskLabel.textContent = task.label;
                editableArea.append(taskLabel);
            }
            taskForm2.append(inputCheckbox, spanCheckmark, editableArea);
            let taskControllers = document.createElement("div");
            taskControllers.classList.add("task-controllers");
            let taskButtonsDiv = document.createElement("div");
            taskButtonsDiv.classList.add("task-buttons-div");
            let datetimeSelection = document.createElement("input");
            datetimeSelection.type = "datetime-local";
            datetimeSelection.id = `datetimeSelection${task.id}`;
            datetimeSelection.placeholder = "Select Date of Completion";
            datetimeSelection.title = "Select Date of Completion";
            datetimeSelection.addEventListener("input", () => {
                task.dueDate = datetimeSelection.value;
            });
            inputCheckbox.addEventListener("change", () => {
                datetimeSelection.value = task.dueDate;
            });
            let deleteBtn = document.createElement("button");
            deleteBtn.classList.add("task-buttons", "delete-btn");
            deleteBtn.onclick = () => this.deleteTask(task.id);
            deleteBtn.textContent = "Delete Task";
            let editBtn = document.createElement("button");
            editBtn.classList.add("task-buttons", "edit-btn");
            editBtn.onclick = () => {
                this.editing = !this.editing;
                if (this.editing) {
                    const editInput = document.createElement("input");
                    editInput.type = "text";
                    editInput.value = task.label;
                    editInput.id = `edit-input-${task.id}`;
                    editInput.classList.add("edit-input");
                    const labelElem = document.getElementById(
                        `task-label-${task.id}`,
                    );
                    labelElem.replaceWith(editInput);
                    editBtn.textContent = "Save";
                } else {
                    const editInput = document.getElementById(
                        `edit-input-${task.id}`,
                    );
                    const newLabel = editInput.value.trim();
                    if (newLabel !== "") {
                        this.editTask(task.id, newLabel);
                    }
                    const newLabelElem = document.createElement("label");
                    newLabelElem.id = `task-label-${task.id}`;
                    newLabelElem.htmlFor = inputCheckbox.id;
                    newLabelElem.textContent = newLabel;
                    editInput.replaceWith(newLabelElem);
                    editBtn.textContent = "Edit Task";
                }
            };
            editBtn.textContent = "Edit Task";
            taskButtonsDiv.append(deleteBtn, editBtn);
            taskControllers.append(datetimeSelection, taskButtonsDiv);
            taskContainer.append(taskForm2, taskControllers);
            tasks.append(taskContainer);
        });
    }
}
const taskbox =
    document.getElementById("task-box") || document.createElement("input");
let taskInput;
taskbox.addEventListener("input", () => {
    taskInput = taskbox.value;
});
const categoryButtons = document.querySelectorAll(".category-buttons");
const taskManager = new TaskManager();
if (document.querySelector(".task-form-inner")) {
    document
        .querySelector(".task-form-inner")
        .addEventListener("submit", (e) => {
            e.preventDefault();
            if (
                taskInput === "" ||
                taskInput === undefined ||
                taskInput === null
            ) {
                alert("Please enter a Task in the input box below");
            } else {
                taskManager.addTask(taskInput);
                taskbox.value = "";
                taskInput = "";
            }
        });
}

function displayAllTask() {
    taskManager.displayAllTask();
}

function displayCompletedTasks() {
    taskManager.displayCompletedTasks();
}

function displayPendingTasks() {
    taskManager.displayPendingTasks();
}

function addSelectedClass(button) {
    categoryButtons.forEach((categoryButton) => {
        categoryButton.classList.remove("current-button");
    });
    button.classList.add("current-button");
}
taskManager.render();
