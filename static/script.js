document.addEventListener("DOMContentLoaded", function() {
    const taskList = document.getElementById("task-list");
    const addTaskForm = document.getElementById("add-task-form");
    const taskInput = document.getElementById("task-input");

    addTaskForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText !== "") {
            addTask(taskText);
            taskInput.value = "";
        }
    });

    taskList.addEventListener("click", function(event) {
        const target = event.target;
        if (target.matches(".task input[type='checkbox']")) {
            const taskId = target.parentNode.dataset.taskId;
            updateTaskStatus(taskId, target.checked);
        }
    });

    function addTask(taskText) {
        const formData = new FormData();
        formData.append("task", taskText);
        fetch('/tasks', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const taskId = data.taskId;
            const newTask = createTaskElement(taskId, taskText);
            taskList.appendChild(newTask);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function updateTaskStatus(taskId, completed) {
        const formData = new FormData();
        formData.append("taskId", taskId);
        formData.append("completed", completed);
        fetch('/update_task', {
            method: 'POST',
            body: formData
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function createTaskElement(taskId, taskText) {
        const taskItem = document.createElement("li");
        taskItem.classList.add("task");
        taskItem.dataset.taskId = taskId;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        const taskTextElement = document.createElement("span");
        taskTextElement.textContent = taskText;
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskTextElement);
        return taskItem;
    }
});
