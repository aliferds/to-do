// file: scripts.js

function toggleLightDarkMode() {
    const lightElements = document.querySelectorAll(".light");
    const modeToggle = document.getElementById("mode-toggle");
    const body = document.body;

    lightElements.forEach((element) => {
        element.classList.toggle("dark");
    });
    body.classList.toggle("dark");

    if (modeToggle) {
        modeToggle.classList.toggle("dark-mode");
    }

    // Atualiza o texto do botão
    if (modeToggle) {
        if (body.classList.contains("dark")) {
            modeToggle.textContent = "Light Mode";
        } else {
            modeToggle.textContent = "Dark Mode";
        }
    }

    if (body.classList.contains("dark")) {
        localStorage.setItem("mode", "dark");
    } else {
        localStorage.setItem("mode", "light");
    }
}

function applySavedLightDarkMode() {
    const savedMode = localStorage.getItem("mode");
    const body = document.body;
    const modeToggle = document.getElementById("mode-toggle");
    const lightElements = document.querySelectorAll(".light");

    if (savedMode === "dark") {
        body.classList.add("dark");
        if (modeToggle) {
            modeToggle.classList.add("dark-mode");
            modeToggle.textContent = "Light Mode"; // Define texto inicial
        }
        lightElements.forEach((element) => {
            if (!element.classList.contains("dark")) {
                element.classList.add("dark");
            }
        });
    } else {
        body.classList.remove("dark");
        if (modeToggle) {
            modeToggle.classList.remove("dark-mode");
            modeToggle.textContent = "Dark Mode"; // Define texto inicial
        }
        lightElements.forEach((element) => {
            if (element.classList.contains("dark")) {
                element.classList.remove("dark");
            }
        });
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("to-do:tasklist")) || []
    },
    set(tasklist){
        localStorage.setItem("to-do:tasklist", JSON.stringify(tasklist))
    }
}

const Task = {
    all: Storage.get(),

    add(task) {
        const newTask = {
            description: task.description,
            completed: false
        };
        Task.all.push(task)

        App.reload()
    },
    remove(index) {
        Task.all.splice(index , 1)

        App.reload()
    },
    toggle(index) {
        Task.all[index].completed = !Task.all[index].completed

        App.reload()
    }
}

const DOM = {
    tasksContainer: document.querySelector('#task-table'),

    addTask(task, index) {
        const li = document.createElement('li');
        li.classList.add('todo__item');
        li.dataset.index = index; // Armazena o índice para fácil remoção/toggle

        li.innerHTML = DOM.taskHTML(task, index);

        if (document.body.classList.contains('dark')) {
            li.classList.add('dark');
        }

        if (task.completed) {
            li.classList.add('completed');
            li.querySelector('input[type="checkbox"]').checked = true;
        }

        DOM.tasksContainer.append(li);
    },

    taskHTML(task, index) {
        const html = `
            <div class="todo__itemContent">
                <input type="checkbox" id="task-${index}" name="task-${index}" ${task.completed ? 'checked' : ''}>
                <label for="task-${index}">${task.description}</label>
                <button class="todo__itemDelete" data-index="${index}">X</button>
            </div>
        `;
        return html;
    },

    clearTasks() {
        DOM.tasksContainer.innerHTML = "";
    },
}

const App = {
    init() {
        DOM.clearTasks();
        Task.all.forEach(function(task, index) {
            DOM.addTask(task, index)
        })

        Storage.set(Task.all)
    },
    reload() {
        App.init()
    },
}

document.addEventListener("DOMContentLoaded", () => {
    applySavedLightDarkMode();
    const toggleButton = document.getElementById("mode-toggle");
    if (toggleButton) {
        toggleButton.addEventListener("click", toggleLightDarkMode);
    }

    const taskInput = document.getElementById('task-input');
    const addIcon = document.querySelector('.todo__addIcon');

    if (addIcon) {
        addIcon.addEventListener('click', () => {
            const description = taskInput.value.trim();
            if (description) {
                Task.add({ description: description });
                taskInput.value = '';
            }
        });

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const description = taskInput.value.trim();
                if (description) {
                    Task.add({ description: description });
                    taskInput.value = '';
                }
            }
        });
    }

    DOM.tasksContainer.addEventListener('click', (event) => {
        // Checa se o elemento clicado é um botão de exclusão de tarefa
        if (event.target.classList.contains('todo__itemDelete')) {
            const index = event.target.dataset.index;
            Task.remove(index);
        }
        // Checa se o elemento clicado é uma checkbox de tarefa
        else if (event.target.type === 'checkbox' && event.target.id.startsWith('task-')) {
            const index = event.target.id.split('-')[1];
            Task.toggle(index);
        }
    });

    App.init();
});