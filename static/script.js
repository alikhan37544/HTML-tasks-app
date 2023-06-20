document.addEventListener("DOMContentLoaded", function() {
    const taskList = document.getElementById("task-list");
    const addTaskForm = document.getElementById("add-task-form");
    const taskInput = document.getElementById("task-input");
    const taskHistoryList = document.getElementById("task-history-list");

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
            const completed = target.checked;
            updateTaskStatus(taskId, completed);
        }
    });

    window.addEventListener("load", function() {
        loadCurrentTasks();
        loadTaskHistory();
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
        formData.append("completed", completed ? 1 : 0);
        // ... rest of the code
        
        fetch('/update_task', {
            method: 'POST',
            body: formData
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function createTaskElement(taskId, taskText, completed) {
        const taskItem = document.createElement("li");
        taskItem.classList.add("task");
        taskItem.dataset.taskId = taskId;
    
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = completed;
    
        const taskTextElement = document.createElement("span");
        taskTextElement.textContent = taskText;
    
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskTextElement);
    
        if (completed) {
            taskItem.classList.add("strikethrough");
        }
    
        return taskItem;
    }
    

    function loadCurrentTasks() {
        fetch('/tasks')
            .then(response => response.json())
            .then(data => {
                data.forEach(task => {
                    const newTask = createTaskElement(task.id, task.task_text, task.completed);
                    taskList.appendChild(newTask);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    

    function loadTaskHistory() {
        fetch('/task_history')
            .then(response => response.json())
            .then(data => {
                data.forEach(task => {
                    const taskItem = document.createElement("li");
                    taskItem.textContent = task.task_text;
                    taskHistoryList.appendChild(taskItem);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});
